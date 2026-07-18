import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, History, CheckCircle, Loader2, WifiOff,
  Wifi, Users, Eye, Edit3, Download, MoreVertical, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Editor from '../components/Editor';
import CollaboratorsList from '../components/CollaboratorsList';
import ActivityLog from '../components/ActivityLog';
import ShareModal from '../components/ShareModal';
import HistoryModal from '../components/HistoryModal';
import useAutoSave from '../hooks/useAutoSave';
import { documentService } from '../services/documentService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
};

const DocumentPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('viewer');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.IDLE);
  const [activeUsers, setActiveUsers] = useState([]);
  const [activityEvents, setActivityEvents] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);

  const typingTimer = useRef(null);
  const isSocketUpdate = useRef(false);
  const savedStatusTimer = useRef(null);

  const isEditable = permission === 'owner' || permission === 'editor';

  // ── Fetch document ─────────────────────────────────────────────
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await documentService.getById(id);
        setDocument(data.document);
        setContent(data.document.content || '');
        setTitle(data.document.title || '');
        setPermission(data.permission);
        setWordCount(data.document.wordCount || 0);
        setCharCount(data.document.characterCount || 0);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load document');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  // ── Socket setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !id || loading) return;

    socket.emit('join-document', { documentId: id });

    socket.on('load-document', ({ content: serverContent, title: serverTitle }) => {
      isSocketUpdate.current = true;
      setContent(serverContent);
      setTitle(serverTitle);
      setTimeout(() => { isSocketUpdate.current = false; }, 100);
    });

    socket.on('receive-changes', ({ content: newContent }) => {
      isSocketUpdate.current = true;
      setContent(newContent);
      setTimeout(() => { isSocketUpdate.current = false; }, 100);
    });

    socket.on('title-updated', ({ title: newTitle }) => {
      setTitle(newTitle);
    });

    socket.on('active-users', (users) => {
      setActiveUsers(users.filter((u) => u.userId?.toString() !== user._id?.toString()));
    });

    socket.on('user-joined', ({ user: joinedUser, activeUsers: users }) => {
      setActiveUsers(users.filter((u) => u.userId?.toString() !== user._id?.toString()));
      addActivity({ type: 'joined', name: joinedUser.name, timestamp: new Date() });
      toast(`${joinedUser.name} joined the document`, { icon: '👋', duration: 2500 });
    });

    socket.on('user-left', ({ name, activeUsers: users }) => {
      setActiveUsers(users.filter((u) => u.userId?.toString() !== user._id?.toString()));
      addActivity({ type: 'left', name, timestamp: new Date() });
    });

    socket.on('user-typing', ({ userId, name, isTyping }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.find((u) => u.userId === userId) ? prev : [...prev, { userId, name }];
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    });

    socket.on('document-saved', ({ savedAt }) => {
      setSaveStatus(SAVE_STATUS.SAVED);
      addActivity({ type: 'saved', timestamp: savedAt });
      if (savedStatusTimer.current) clearTimeout(savedStatusTimer.current);
      savedStatusTimer.current = setTimeout(() => setSaveStatus(SAVE_STATUS.IDLE), 3000);
    });

    socket.on('error', ({ message }) => {
      toast.error(message);
    });

    return () => {
      socket.emit('leave-document', { documentId: id });
      socket.off('load-document');
      socket.off('receive-changes');
      socket.off('title-updated');
      socket.off('active-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('user-typing');
      socket.off('document-saved');
      socket.off('error');
    };
  }, [socket, id, loading, user._id]);

  const addActivity = (event) => {
    setActivityEvents((prev) => [...prev.slice(-49), event]);
  };

  // ── Content change handler ─────────────────────────────────────
  const handleContentChange = useCallback((html, stats) => {
    if (isSocketUpdate.current) return;
    setContent(html);
    if (stats) {
      setWordCount(stats.words);
      setCharCount(stats.characters);
    }

    // Broadcast to other users
    socket?.emit('send-changes', { documentId: id, content: html });

    // Typing indicator
    socket?.emit('typing', { documentId: id, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing', { documentId: id, isTyping: false });
    }, 1500);
  }, [socket, id]);

  // ── Title change handler ───────────────────────────────────────
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    socket?.emit('title-change', { documentId: id, title: newTitle });
  };

  // ── Auto-save ──────────────────────────────────────────────────
  const { forceSave } = useAutoSave({
    documentId: id,
    content,
    title,
    wordCount,
    characterCount: charCount,
    enabled: isEditable,
    onSaving: () => {
      setSaveStatus(SAVE_STATUS.SAVING);
      // Also save via socket
      socket?.emit('save-document', { documentId: id, content, title, wordCount, characterCount: charCount });
    },
    onSaved: () => {
      setSaveStatus(SAVE_STATUS.SAVED);
      addActivity({ type: 'saved', timestamp: new Date() });
      if (savedStatusTimer.current) clearTimeout(savedStatusTimer.current);
      savedStatusTimer.current = setTimeout(() => setSaveStatus(SAVE_STATUS.IDLE), 3000);
    },
  });

  // ── Export PDF ─────────────────────────────────────────────────
  const handleExportPDF = async () => {
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const element = window.document.querySelector('.ProseMirror');
      if (!element) {
        toast.error('No content to export');
        return;
      }
      html2pdf()
        .set({
          margin: [10, 15, 10, 15],
          filename: `${title || 'document'}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
      toast.success('PDF exported!');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const SaveStatusIndicator = () => {
    if (saveStatus === SAVE_STATUS.SAVING) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Loader2 size={12} className="animate-spin text-primary-500" />
          Saving...
        </span>
      );
    }
    if (saveStatus === SAVE_STATUS.SAVED) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-500">
          <CheckCircle size={12} />
          Saved
        </span>
      );
    }
    if (document?.updatedAt) {
      return (
        <span className="text-xs text-slate-400">
          Last edited {formatDate(document.updatedAt)}
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 shrink-0 z-20">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-ghost p-2 rounded-xl"
          title="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
              className="text-lg font-semibold bg-transparent border-b-2 border-primary-500 outline-none text-slate-900 dark:text-slate-100 w-full max-w-md"
            />
          ) : (
            <button
              onClick={() => isEditable && setEditingTitle(true)}
              className={`text-left group ${isEditable ? 'hover:text-primary-600 dark:hover:text-primary-400 cursor-text' : 'cursor-default'}`}
              title={isEditable ? 'Click to rename' : ''}
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate max-w-sm">
                {title || 'Untitled Document'}
              </h1>
            </button>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 shrink-0">
          <SaveStatusIndicator />

          {/* Permission badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isEditable
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {isEditable ? <Edit3 size={11} /> : <Eye size={11} />}
            {permission}
          </div>

          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            connected
              ? 'text-emerald-500'
              : 'text-red-400'
          }`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Active users avatars */}
          {activeUsers.length > 0 && (
            <div className="flex -space-x-2 items-center">
              {activeUsers.slice(0, 4).map((u, i) => (
                <div
                  key={u.socketId || i}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-950"
                  style={{ backgroundColor: u.color }}
                  title={u.name}
                >
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold ring-2 ring-white dark:ring-slate-950">
                  +{activeUsers.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {isEditable && (
              <button
                onClick={() => forceSave()}
                className="btn-ghost px-3 py-2 text-xs font-semibold"
                title="Force save (Ctrl+S)"
              >
                Save
              </button>
            )}
            <button
              onClick={() => setShowShare(true)}
              className="btn-primary py-2 px-3"
              title="Share document"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline text-sm">Share</span>
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="btn-secondary py-2 px-3"
              title="Version history"
            >
              <History size={15} />
            </button>
            <button
              onClick={handleExportPDF}
              className="btn-secondary py-2 px-3"
              title="Export as PDF"
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`btn-ghost p-2 ${rightSidebarOpen ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''}`}
              title="Toggle sidebar"
            >
              <Users size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800 px-6 py-1.5 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
            {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 overflow-hidden p-4">
          <Editor
            content={content}
            onChange={handleContentChange}
            editable={isEditable}
            placeholder="Start writing your document..."
          />
        </div>

        {/* Right sidebar */}
        {rightSidebarOpen && (
          <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 space-y-4 shrink-0 animate-slide-in">
            <CollaboratorsList activeUsers={activeUsers} connected={connected} />
            <ActivityLog events={activityEvents} />

            {/* Document info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Document Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Words</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Characters</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{charCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Owner</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {document?.owner?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Last edited</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(document?.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Your role</span>
                  <span className={`font-semibold capitalize ${
                    isEditable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}>{permission}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showShare && document && (
        <ShareModal
          document={document}
          onClose={() => setShowShare(false)}
          onUpdate={(updated) => setDocument(updated)}
        />
      )}
      {showHistory && (
        <HistoryModal
          documentId={id}
          onClose={() => setShowHistory(false)}
          onRestore={(updated) => {
            setContent(updated.content);
            setTitle(updated.title);
            setDocument(updated);
            addActivity({ type: 'restored', timestamp: new Date() });
          }}
        />
      )}
    </div>
  );
};

export default DocumentPage;
