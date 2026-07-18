import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, ExternalLink, Clock, User, Crown, Edit3 } from 'lucide-react';
import { formatDate, truncate, stripHtml } from '../utils/helpers';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';

const DocumentCard = ({ document, onDelete, view = 'grid' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const isOwner = document.owner?._id === user?._id || document.owner === user?._id;
  const preview = truncate(stripHtml(document.content || ''), 120);
  const ownerName = document.owner?.name || 'Unknown';

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${document.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(document._id);
    setDeleting(false);
  };

  const handleOpen = () => navigate(`/document/${document._id}`);

  if (view === 'list') {
    return (
      <div
        onClick={handleOpen}
        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all duration-200 group animate-fade-in"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center shrink-0 group-hover:from-primary-200 dark:group-hover:from-primary-800/40 transition-colors">
          <FileText size={18} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm">{document.title || 'Untitled'}</h3>
            {!isOwner && <span className="badge badge-primary text-[10px]">Shared</span>}
            {isOwner && <Crown size={12} className="text-amber-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Clock size={10} />{formatDate(document.updatedAt)}</span>
            <span className="flex items-center gap-1"><User size={10} />{ownerName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpen(); }}
            className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 transition-colors"
            title="Open"
          >
            <ExternalLink size={14} />
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleOpen}
      className="doc-card group animate-scale-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center group-hover:from-primary-200 dark:group-hover:from-primary-800/40 transition-colors">
          <FileText size={18} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex items-center gap-1.5">
          {isOwner ? (
            <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <Crown size={10} /> Owner
            </span>
          ) : (
            <span className="badge badge-primary">
              <Edit3 size={10} /> Shared
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {document.title || 'Untitled Document'}
      </h3>

      {/* Preview */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
        {preview || 'Empty document'}
      </p>

      {/* Stats */}
      {document.wordCount > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{document.wordCount} words</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <UserAvatar name={ownerName} size="xs" />
          <div>
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{ownerName}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(document.updatedAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpen(); }}
            className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors"
            title="Open"
          >
            <ExternalLink size={13} />
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Collaborators */}
      {document.collaborators?.length > 0 && (
        <div className="flex items-center gap-1 mt-3">
          <div className="flex -space-x-2">
            {document.collaborators.slice(0, 3).map((c, i) => (
              <UserAvatar key={i} name={c.user?.name || ''} size="xs" className="-ml-1 first:ml-0" />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
            +{document.collaborators.length} collaborator{document.collaborators.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
