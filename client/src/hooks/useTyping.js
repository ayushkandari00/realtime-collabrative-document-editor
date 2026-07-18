import { useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';
import { SOCKET_EVENTS, TYPING_TIMEOUT } from '../utils/constants';

export const useTyping = (conversationId) => {
  const { emitTyping, emitStopTyping } = useSocket();
  const { setTyping, clearTyping } = useChat();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping(conversationId);
    }

    // Reset timeout on each keystroke
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitStopTyping(conversationId);
    }, TYPING_TIMEOUT);
  }, [conversationId, emitTyping, emitStopTyping]);

  const stopTyping = useCallback(() => {
    if (!conversationId) return;
    clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emitStopTyping(conversationId);
    }
  }, [conversationId, emitStopTyping]);

  return { handleTyping, stopTyping };
};
