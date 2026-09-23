import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, History, CheckCircle2, Loader2, WifiOff,
  Wifi, Users, Eye, Edit3, Download, MoreHorizontal, X, PenLine
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
  IDLE:   'idle',
  SAVING: 'saving',
  SAVED:  'saved',
  ERROR:  'error',
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const typingTimer      = useRef(null);
  const isSocketUpdate   = useRef(false);
  const savedStatusTimer = useRef(null);
  const moreMenuRef      = useRef(null);

  const isEditable = permission === 'owner' || permission === 'editor';

  // ── Fetch document ─────────────────────────────────────────────────────────
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

  // ── Socket setup ───────────────────────────────────────────────────────────
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

    socket.on('title-updated', ({ title: newTitle }) => setTitle(newTitle));

    socket.on('active-users', (users) => {
      setActiveUsers(users.filter((u) => u.userId?.toString() !== user._id?.toString()));
    });

    socket.on('user-joined', ({ user: joinedUser, activeUsers: users }) => {
      setActiveUsers(users.filter((u) => u.userId?.toString() !== user._id?.toString()));
      addActivity({ type: 'joined', name: joinedUser.name, timestamp: new Date() });
      toast(`${joinedUser.name} joined`, { icon: '👋', duration: 2000 });
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
        }
        return prev.filter((u) => u.userId !== userId);
      });
    });

    socket.on('document-saved', ({ savedAt }) => {
      setSaveStatus(SAVE_STATUS.SAVED);
      addActivity({ type: 'saved', timestamp: savedAt });
      if (savedStatusTimer.current) clearTimeout(savedStatusTimer.current);
      savedStatusTimer.current = setTimeout(() => setSaveStatus(SAVE_STATUS.IDLE), 4000);
    });

    socket.on('error', ({ message }) => toast.error(message));

    return () => {
      socket.emit('leave-document', { documentId: id });
      ['load-document','receive-changes','title-updated','active-users',
       'user-joined','user-left','user-typing','document-saved','error'].forEach((e) => socket.off(e));
    };
  }, [socket, id, loading, user._id]);

  const addActivity = (event) => {
    setActivityEvents((prev) => [...prev.slice(-49), event]);
  };

  // ── Content change ─────────────────────────────────────────────────────────
  const handleContentChange = useCallback((html, stats) => {
    if (isSocketUpdate.current) return;
    setContent(html);
    if (stats) {
      setWordCount(stats.words);
      setCharCount(stats.characters);
    }
    socket?.emit('send-changes', { documentId: id, content: html });
    socket?.emit('typing', { documentId: id, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing', { documentId: id, isTyping: false });
    }, 1500);
  }, [socket, id]);

  // ── Title change ───────────────────────────────────────────────────────────
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    socket?.emit('title-change', { documentId: id, title: newTitle });
  };

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const { forceSave } = useAutoSave({
    documentId: id,
    content,
    title,
    wordCount,
    characterCount: charCount,
    enabled: isEditable,
    onSaving: () => {
      setSaveStatus(SAVE_STATUS.SAVING);
      socket?.emit('save-document', { documentId: id, content, title, wordCount, characterCount: charCount });
    },
    onSaved: () => {
      setSaveStatus(SAVE_STATUS.SAVED);
      addActivity({ type: 'saved', timestamp: new Date() });
      if (savedStatusTimer.current) clearTimeout(savedStatusTimer.current);
      savedStatusTimer.current = setTimeout(() => setSaveStatus(SAVE_STATUS.IDLE), 4000);
    },
  });

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    setShowMoreMenu(false);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const element = window.document.querySelector('.ProseMirror');
      if (!element) { toast.error('No content to export'); return; }
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

  // ── Close more menu on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    window.document.addEventListener('mousedown', handler);
    return () => window.document.removeEventListener('mousedown', handler);
  }, []);

  // ── Save status indicator ──────────────────────────────────────────────────
  const SaveStatusIndicator = () => {
    if (!connected) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
          <WifiOff size={11} />
          Offline
        </span>
      );
    }
    if (saveStatus === SAVE_STATUS.SAVING) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-ink-400">
          <Loader2 size={11} className="animate-spin text-primary-500" />
          Saving…
        </span>
      );
    }
    if (saveStatus === SAVE_STATUS.SAVED) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-500 animate-fade-in">
          <CheckCircle2 size={11} />
          Saved just now
        </span>
      );
    }
    if (document?.updatedAt) {
      return (
        <span className="text-xs text-ink-400">
          Edited {formatDate(document.updatedAt)}
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <PenLine size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <p className="text-sm text-ink-400">Loading document…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-ink-50 dark:bg-ink-950 overflow-hidden">
      {/* ── Top navbar ──────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-ink-950 border-b border-ink-200 dark:border-ink-800 px-4 py-2.5 flex items-center gap-3 shrink-0 z-20">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-icon"
          title="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-ink-200 dark:bg-ink-700" />

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
              className="text-base font-semibold bg-transparent border-b-2 border-primary-500 outline-none text-ink-900 dark:text-ink-100 w-full max-w-md"
            />
          ) : (
            <button
              onClick={() => isEditable && setEditingTitle(true)}
              className={`text-left group ${isEditable ? 'hover:text-primary-600 dark:hover:text-primary-400 cursor-text' : 'cursor-default'}`}
              title={isEditable ? 'Click to rename' : ''}
            >
              <h1 className="text-base font-semibold text-ink-900 dark:text-ink-100 truncate max-w-sm">
                {title || 'Untitled Document'}
              </h1>
            </button>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 shrink-0">
          <SaveStatusIndicator />

          {/* Permission badge */}
          <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isEditable
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
          }`}>
            {isEditable ? <Edit3 size={10} /> : <Eye size={10} />}
            {permission}
          </div>

          {/* Connection dot */}
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} title={connected ? 'Connected' : 'Disconnected'} />

          {/* Active user avatars */}
          {activeUsers.length > 0 && (
            <div className="flex -space-x-2 items-center">
              {activeUsers.slice(0, 3).map((u, i) => (
                <div
                  key={u.socketId || i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-ink-950"
                  style={{ backgroundColor: u.color }}
                  title={u.name}
                >
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center text-ink-600 dark:text-ink-300 text-[10px] font-bold ring-2 ring-white dark:ring-ink-950">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Primary actions */}
          <div className="flex items-center gap-1">
            {isEditable && (
              <button
                onClick={() => forceSave()}
                className="btn-ghost px-2.5 py-1.5 text-xs font-semibold hidden sm:flex"
                title="Force save (Ctrl+S)"
              >
                Save
              </button>
            )}
            <button
              onClick={() => setShowShare(true)}
              className="btn-primary py-1.5 px-3 text-sm"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Collaborators panel toggle */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`btn-icon ${rightSidebarOpen ? 'bg-ink-100 dark:bg-ink-800 text-primary-600 dark:text-primary-400' : ''}`}
              title="Collaborators"
            >
              <Users size={15} />
            </button>

            {/* More actions (History + Export) */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu((v) => !v)}
                className="btn-icon"
                title="More actions"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMoreMenu && (
                <div className="context-menu right-0 top-9 w-44">
                  <button
                    onClick={() => { setShowHistory(true); setShowMoreMenu(false); }}
                    className="context-menu-item w-full text-left"
                  >
                    <History size={14} />
                    Version History
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="context-menu-item w-full text-left"
                  >
                    <Download size={14} />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Typing indicator ────────────────────────────────────────────────── */}
      {typingUsers.length > 0 && (
        <div className="bg-white dark:bg-ink-950 border-b border-ink-100 dark:border-ink-800 px-6 py-1 flex items-center gap-2">
          <div className="flex gap-0.5">
            <span className="typing-dot bg-primary-400" />
            <span className="typing-dot bg-primary-400" />
            <span className="typing-dot bg-primary-400" />
          </div>
          <span className="text-xs text-ink-500 dark:text-ink-400">
            {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
          </span>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 overflow-hidden p-4">
          <Editor
            content={content}
            onChange={handleContentChange}
            editable={isEditable}
            placeholder="Start writing your document…"
          />
        </div>

        {/* Right sidebar */}
        {rightSidebarOpen && (
          <div className="w-64 border-l border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 overflow-y-auto flex flex-col shrink-0 animate-slide-in">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
              <span className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">Panel</span>
              <button onClick={() => setRightSidebarOpen(false)} className="btn-icon w-6 h-6 text-ink-400">
                <X size={13} />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <CollaboratorsList activeUsers={activeUsers} connected={connected} />
              <ActivityLog events={activityEvents} />

              {/* Document info */}
              <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 bg-ink-50 dark:bg-ink-900">
                <h3 className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-3">Info</h3>
                <dl className="space-y-2">
                  {[
                    { label: 'Words',      value: wordCount.toLocaleString() },
                    { label: 'Characters', value: charCount.toLocaleString() },
                    { label: 'Owner',      value: document?.owner?.name || 'Unknown' },
                    { label: 'Last edited',value: formatDate(document?.updatedAt) },
                    { label: 'Your role',  value: permission, highlight: isEditable },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <dt className="text-ink-500">{label}</dt>
                      <dd className={`font-medium truncate max-w-[100px] text-right ${
                        highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-700 dark:text-ink-300'
                      }`}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
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
