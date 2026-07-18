import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ children, content, side = 'top', delay = 300 }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timerRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    const positions = {
      top: { top: rect.top - gap + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX },
      bottom: { top: rect.bottom + gap + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX },
      left: { top: rect.top + rect.height / 2 + window.scrollY, left: rect.left - gap + window.scrollX },
      right: { top: rect.top + rect.height / 2 + window.scrollY, left: rect.right + gap + window.scrollX },
    };

    setPosition(positions[side] || positions.top);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const sideClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-[9999] px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg pointer-events-none whitespace-nowrap ${sideClasses[side]}`}
            style={{ top: position.top, left: position.left }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
