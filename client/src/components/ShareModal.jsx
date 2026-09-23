import { useState } from 'react';
import { X, Share2, UserPlus, Loader2, Crown, Eye, Edit3, Trash2, Check } from 'lucide-react';
import { documentService } from '../services/documentService';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ShareModal = ({ document, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await documentService.share({
        documentId: document._id,
        email: email.trim().toLowerCase(),
        permission,
      });
      toast.success(`Shared with ${email}`);
      setEmail('');
      onUpdate?.(data.document);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (collabUserId, name) => {
    setRemoving(collabUserId);
    try {
      await documentService.removeCollaborator(document._id, collabUserId);
      toast.success(`${name} removed`);
      onUpdate?.({
        ...document,
        collaborators: document.collaborators.filter((c) => c.user._id !== collabUserId),
      });
    } catch {
      toast.error('Failed to remove collaborator');
    } finally {
      setRemoving(null);
      setConfirmRemove(null);
    }
  };

  const isOwner = document.owner?._id === user?._id || document.owner === user?._id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <Share2 size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Share document</h2>
              <p className="text-xs text-ink-400 truncate max-w-[220px]">{document.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Share form — owner only */}
          {isOwner && (
            <form onSubmit={handleShare}>
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-400 mb-2">
                Invite by email
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="input-field text-sm flex-1"
                  required
                />
              </div>

              {/* Permission pill selector */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPermission('editor')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    permission === 'editor'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                      : 'bg-ink-50 dark:bg-ink-800 border-ink-200 dark:border-ink-700 text-ink-500 hover:border-ink-300'
                  }`}
                >
                  <Edit3 size={12} />
                  Editor
                  {permission === 'editor' && <Check size={11} />}
                </button>
                <button
                  type="button"
                  onClick={() => setPermission('viewer')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    permission === 'viewer'
                      ? 'bg-ink-100 dark:bg-ink-700 border-ink-300 dark:border-ink-600 text-ink-700 dark:text-ink-300'
                      : 'bg-ink-50 dark:bg-ink-800 border-ink-200 dark:border-ink-700 text-ink-500 hover:border-ink-300'
                  }`}
                >
                  <Eye size={12} />
                  Viewer
                  {permission === 'viewer' && <Check size={11} />}
                </button>
              </div>

              {/* Permission descriptions */}
              <p className="text-[11px] text-ink-400 mb-3">
                {permission === 'editor'
                  ? 'Editors can view and make changes to the document.'
                  : 'Viewers can read the document but cannot edit it.'}
              </p>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-primary w-full"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {loading ? 'Sending…' : 'Send Invite'}
              </button>
            </form>
          )}

          {/* People with access */}
          <div>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-3">
              People with access
            </p>
            <div className="space-y-1">
              {/* Owner */}
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors">
                <UserAvatar name={document.owner?.name || ''} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-800 dark:text-ink-200 truncate">
                    {document.owner?.name}
                    {document.owner?._id === user?._id && <span className="text-ink-400"> (you)</span>}
                  </div>
                  <div className="text-xs text-ink-400 truncate">{document.owner?.email}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 shrink-0">
                  <Crown size={12} />
                  <span className="text-xs font-semibold">Owner</span>
                </div>
              </div>

              {/* Collaborators */}
              {document.collaborators?.map((collab) => (
                <div key={collab.user?._id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors group">
                  <UserAvatar name={collab.user?.name || ''} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-800 dark:text-ink-200 truncate">
                      {collab.user?.name}
                      {collab.user?._id === user?._id && <span className="text-ink-400"> (you)</span>}
                    </div>
                    <div className="text-xs text-ink-400 truncate">{collab.user?.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      collab.permission === 'editor'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-ink-500 dark:text-ink-400'
                    }`}>
                      {collab.permission === 'editor' ? <Edit3 size={11} /> : <Eye size={11} />}
                      {collab.permission}
                    </span>
                    {isOwner && (
                      <>
                        {confirmRemove === collab.user._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRemove(collab.user._id, collab.user.name)}
                              disabled={removing === collab.user._id}
                              className="text-[11px] font-semibold text-red-600 hover:underline"
                            >
                              {removing === collab.user._id ? <Loader2 size={11} className="animate-spin" /> : 'Remove'}
                            </button>
                            <button
                              onClick={() => setConfirmRemove(null)}
                              className="text-[11px] text-ink-400 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRemove(collab.user._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {!document.collaborators?.length && (
                <p className="text-xs text-ink-400 text-center py-4">
                  No collaborators yet — invite someone above.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
