import { X, FileText, Image } from 'lucide-react';
import { isImageFile, formatFileSize } from '../../utils/helpers';

const AttachmentPreview = ({ file, onRemove }) => {
  if (!file) return null;

  const isImage = isImageFile(file);
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 mx-4 rounded-xl border border-gray-200 dark:border-gray-700">
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AttachmentPreview;
