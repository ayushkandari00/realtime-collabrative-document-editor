import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import Button from '../ui/Button';

const EmojiPickerPopover = ({ onEmojiSelect, trigger, side = 'top' }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const pickerH = 450;
    const pickerW = 350;
    let top = side === 'top'
      ? rect.top - pickerH - 8 + window.scrollY
      : rect.bottom + 8 + window.scrollY;
    let left = rect.left - pickerW / 2 + rect.width / 2 + window.scrollX;

    // Clamp to viewport
    if (left < 8) left = 8;
    if (left + pickerW > window.innerWidth - 8) left = window.innerWidth - pickerW - 8;
    if (top < 8) top = rect.bottom + 8 + window.scrollY;

    setPosition({ top, left });
    setOpen((v) => !v);
  };

  const handleSelect = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleOpen}>
        {trigger || (
          <Button variant="ghost" size="icon" type="button" title="Emoji">
            <Smile className="w-5 h-5 text-gray-500" />
          </Button>
        )}
      </div>
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="fixed z-50"
              style={{ top: position.top, left: position.left }}
            >
              <EmojiPicker
                onEmojiClick={handleSelect}
                theme="auto"
                searchPlaceHolder="Search emoji..."
                previewConfig={{ showPreview: false }}
                height={450}
                width={350}
              />
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default EmojiPickerPopover;
