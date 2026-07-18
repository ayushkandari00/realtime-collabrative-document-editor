import { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X, Mic } from 'lucide-react';
import clsx from 'clsx';
import Button from '../ui/Button';
import EmojiPickerPopover from '../chat/EmojiPickerPopover';
import AttachmentPreview from '../chat/AttachmentPreview';
import ReplyPreview from '../chat/ReplyPreview';
import { useTyping } from '../../hooks/useTyping';
import { uploadService } from '../../services/uploadService';
import toast from 'react-hot-toast';
import { MAX_FILE_SIZE } from '../../utils/constants';

const MessageInput = ({ conversationId, onSend, replyTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { handleTyping, stopTyping } = useTyping(conversationId);

  const handleInput = (e) => {
    setText(e.target.value);
    handleTyping();
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File too large (max 10 MB)');
      return;
    }
    setFile(f);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;
    if (sending || uploading) return;

    setSending(true);
    stopTyping();

    try {
      let payload = {
        content: text.trim(),
        type: 'text',
        replyTo: replyTo?._id,
      };

      if (file) {
        setUploading(true);
        const uploadResult = await uploadService.uploadFile(file);
        setUploading(false);
        payload = {
          content: text.trim() || file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          fileUrl: uploadResult.url,
          fileName: uploadResult.originalName || file.name,
          fileSize: file.size,
          replyTo: replyTo?._id,
        };
      }

      await onSend(payload);
      setText('');
      setFile(null);
      onCancelReply?.();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  if (!conversationId) return null;

  return (
    <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Reply preview */}
      {replyTo && (
        <div className="pt-3">
          <ReplyPreview message={replyTo} onClose={onCancelReply} />
        </div>
      )}

      {/* Attachment preview */}
      {file && (
        <div className="pt-3">
          <AttachmentPreview file={file} onRemove={() => setFile(null)} />
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-3">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-150"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.zip"
        />

        {/* Textarea */}
        <div className="flex-1 relative bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Emoji */}
        <EmojiPickerPopover onEmojiSelect={handleEmojiSelect} />

        {/* Send button */}
        <Button
          variant="primary"
          size="icon"
          onClick={handleSend}
          loading={sending || uploading}
          disabled={!text.trim() && !file}
          className="flex-shrink-0 w-11 h-11 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
