import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Clock, Crown, Edit3, Eye } from 'lucide-react';
import { formatDate, truncate, stripHtml } from '../utils/helpers';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';

// Subtle accent colors for doc cards — avoids rainbow look, uses ink + primary family
const CARD_ACCENTS = [
  'bg-primary-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
];

const DocumentCard = ({ document, onDelete, view = 'grid', index = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const isOwner = document.owner?._id === user?._id || document.owner === user?._id;
  const preview = truncate(stripHtml(document.content || ''), 110);
  const ownerName = document.owner?.name || 'Unknown';
  const accentColor = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${document.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(document._id);
    setDeleting(false);
  };

  const handleOpen = () => navigate(`/document/${document._id}`);

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div
        onClick={handleOpen}
        className="flex items-center gap-4 px-4 py-3 rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card cursor-pointer transition-all duration-150 group animate-fade-in"
      >
        {/* Accent dot */}
        <div className={`w-1.5 h-8 rounded-full ${accentColor} opacity-60 shrink-0`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-ink-900 dark:text-ink-100 truncate text-sm">
              {document.title || 'Untitled'}
            </h3>
            {isOwner
              ? <Crown size={11} className="text-amber-500 shrink-0" />
              : <span className="badge badge-primary text-[10px]">Shared</span>
            }
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            <span className="flex items-center gap-1"><Clock size={10} />{formatDate(document.updatedAt)}</span>
            <span className="hidden sm:block truncate">{ownerName}</span>
          </div>
        </div>

        {/* Word count */}
        {document.wordCount > 0 && (
          <span className="text-[10px] text-ink-400 shrink-0 hidden md:block">{document.wordCount} words</span>
        )}

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    );
  }

  // ── Grid view ──────────────────────────────────────────────────────────────
  return (
    <div
      onClick={handleOpen}
      className="doc-card group animate-scale-in relative overflow-hidden"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentColor} opacity-70`} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-3 pt-1">
        <div className="w-9 h-9 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-ink-500 dark:text-ink-400" />
        </div>
        <div className="flex items-center gap-1">
          {isOwner ? (
            <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <Crown size={9} /> Owner
            </span>
          ) : (
            <span className="badge badge-primary">
              <Eye size={9} /> Shared
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-ink-900 dark:text-ink-100 mb-1.5 truncate text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {document.title || 'Untitled Document'}
      </h3>

      {/* Content preview */}
      <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 leading-relaxed min-h-[2.25rem]">
        {preview || <span className="italic text-ink-300 dark:text-ink-600">Empty document</span>}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar name={ownerName} size="xs" />
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-ink-600 dark:text-ink-400 truncate">{ownerName}</div>
            <div className="text-[10px] text-ink-400 dark:text-ink-500">{formatDate(document.updatedAt)}</div>
          </div>
        </div>

        {/* Delete button — owner only, hover-reveal */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
            title="Delete document"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Collaborators */}
      {document.collaborators?.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex -space-x-1.5">
            {document.collaborators.slice(0, 4).map((c, i) => (
              <UserAvatar key={i} name={c.user?.name || ''} size="xs" />
            ))}
          </div>
          <span className="text-[10px] text-ink-400 dark:text-ink-500">
            {document.collaborators.length} collaborator{document.collaborators.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
