import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

const Dropdown = ({ trigger, items, align = 'left', className = '' }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4 + window.scrollY,
      left: align === 'right'
        ? rect.right - 160 + window.scrollX
        : rect.left + window.scrollX,
    });
  };

  const toggle = () => {
    if (!open) updatePosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    const close = (e) => {
      if (!triggerRef.current?.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <>
      <div ref={triggerRef} onClick={toggle} className="inline-flex cursor-pointer">
        {trigger}
      </div>
      {open &&
        createPortal(
          <div
            className={clsx(
              'fixed z-50 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-1 animate-scale-in',
              className
            )}
            style={{ top: position.top, left: position.left }}
          >
            {items.map((item, i) =>
              item.divider ? (
                <hr key={i} className="my-1 border-gray-100 dark:border-gray-700" />
              ) : (
                <button
                  key={i}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                    item.danger
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default Dropdown;
