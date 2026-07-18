import { useState } from 'react';
import { X, Share2, UserPlus, Loader2, Crown, Eye, Edit3, Trash2 } from 'lucide-react';
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
    if (!window.confirm(`Remove ${name} from this document?`)) return;
    setRemoving(collabUserId);
    try {
      await documentService.removeCollaborator(document._id, collabUserId);
      toast.success('Collaborator removed');
      onUpdate?.({
        ...document,
        collaborators: document.collaborators.filter((c) => c.user._id !== collabUserId),
      });
    } catch {
      toast.error('Failed to remove collaborator');
    } finally {
      setRemoving(null);
    }
  };

  const isOwner = document.owner?._id === user?._id || document.owner === user?._id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <Share2 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Share Document</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{document.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        {/* Share form (owner only) */}
        {isOwner && (
          <form onSubmit={handleShare} className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="input-field text-sm w-28"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary w-full"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Sharing...' : 'Send Invite'}
            </button>
          </form>
        )}

        {/* Owner */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            People with access
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <UserAvatar name={document.owner?.name || ''} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {document.owner?.name}
                  {document.owner?._id === user?._id && ' (you)'}
                </div>
                <div className="text-xs text-slate-400">{document.owner?.email}</div>
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Crown size={13} />
                <span className="text-xs font-semibold">Owner</span>
              </div>
            </div>

            {/* Collaborators */}
            {document.collaborators?.map((collab) => (
              <div key={collab.user?._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <UserAvatar name={collab.user?.name || ''} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {collab.user?.name}
                    {collab.user?._id === user?._id && ' (you)'}
                  </div>
                  <div className="text-xs text-slate-400">{collab.user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    collab.permission === 'editor'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {collab.permission === 'editor' ? <Edit3 size={12} /> : <Eye size={12} />}
                    {collab.permission}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleRemove(collab.user._id, collab.user.name)}
                      disabled={removing === collab.user._id}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!document.collaborators?.length && !isOwner && (
              <p className="text-sm text-slate-400 text-center py-4">No other collaborators</p>
            )}
          </div>
        </div>

        {/* Permission legend */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
            <Eye size={14} className="text-slate-500 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Viewer</div>
              <div className="text-[10px] text-slate-400">Can read only</div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
            <Edit3 size={14} className="text-emerald-500 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Editor</div>
              <div className="text-[10px] text-slate-400">Can view & edit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
