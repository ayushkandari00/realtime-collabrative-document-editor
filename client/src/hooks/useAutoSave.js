import { useEffect, useRef } from 'react';
import { documentService } from '../services/documentService';

const useAutoSave = ({ documentId, content, title, wordCount, characterCount, onSaving, onSaved, enabled = true }) => {
  const saveTimer = useRef(null);
  const lastSavedContent = useRef(content);
  const lastSavedTitle = useRef(title);

  useEffect(() => {
    if (!enabled || !documentId) return;

    const hasChanges =
      content !== lastSavedContent.current || title !== lastSavedTitle.current;

    if (!hasChanges) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        onSaving?.();
        await documentService.update(documentId, { content, title, wordCount, characterCount });
        lastSavedContent.current = content;
        lastSavedTitle.current = title;
        onSaved?.();
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 2000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, title, documentId, enabled]);

  const forceSave = async () => {
    if (!documentId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      onSaving?.();
      await documentService.update(documentId, { content, title, wordCount, characterCount });
      lastSavedContent.current = content;
      lastSavedTitle.current = title;
      onSaved?.();
    } catch (err) {
      console.error('Force save error:', err);
    }
  };

  return { forceSave };
};

export default useAutoSave;
