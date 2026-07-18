import { createContext, useContext, useReducer, useCallback } from 'react';

const ChatContext = createContext(null);

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {}, // keyed by conversationId
  typingUsers: {}, // keyed by conversationId -> [userId]
  unreadCounts: {}, // keyed by conversationId
  loadingConversations: false,
  loadingMessages: false,
  hasMoreMessages: {}, // keyed by conversationId
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload, loadingConversations: false };

    case 'SET_LOADING_CONVERSATIONS':
      return { ...state, loadingConversations: action.payload };

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload };

    case 'ADD_OR_UPDATE_CONVERSATION': {
      const exists = state.conversations.find((c) => c._id === action.payload._id);
      if (exists) {
        return {
          ...state,
          conversations: state.conversations.map((c) =>
            c._id === action.payload._id ? action.payload : c
          ),
        };
      }
      return { ...state, conversations: [action.payload, ...state.conversations] };
    }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.conversationId]: action.payload },
        loadingMessages: false,
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [action.conversationId]: action.hasMore,
        },
      };

    case 'PREPEND_MESSAGES': {
      const existing = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: [...action.payload, ...existing],
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [action.conversationId]: action.hasMore,
        },
      };
    }

    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.payload };

    case 'ADD_MESSAGE': {
      const msgs = state.messages[action.conversationId] || [];
      // Avoid duplicates
      if (msgs.find((m) => m._id === action.payload._id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: [...msgs, action.payload],
        },
      };
    }

    case 'UPDATE_MESSAGE': {
      const msgs = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: msgs.map((m) =>
            m._id === action.payload._id ? { ...m, ...action.payload } : m
          ),
        },
      };
    }

    case 'DELETE_MESSAGE': {
      const msgs = state.messages[action.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: msgs.map((m) =>
            m._id === action.messageId
              ? { ...m, isDeleted: true, content: 'This message was deleted' }
              : m
          ),
        },
      };
    }

    case 'SET_TYPING': {
      const current = state.typingUsers[action.conversationId] || [];
      if (current.includes(action.userId)) return state;
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.conversationId]: [...current, action.userId],
        },
      };
    }

    case 'CLEAR_TYPING': {
      const current = state.typingUsers[action.conversationId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.conversationId]: current.filter((id) => id !== action.userId),
        },
      };
    }

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCounts: { ...state.unreadCounts, [action.conversationId]: action.count },
      };

    case 'INCREMENT_UNREAD': {
      const count = state.unreadCounts[action.conversationId] || 0;
      return {
        ...state,
        unreadCounts: { ...state.unreadCounts, [action.conversationId]: count + 1 },
      };
    }

    case 'CLEAR_UNREAD':
      return {
        ...state,
        unreadCounts: { ...state.unreadCounts, [action.conversationId]: 0 },
      };

    case 'UPDATE_LAST_MESSAGE': {
      const convs = state.conversations.map((c) =>
        c._id === action.conversationId
          ? { ...c, lastMessage: action.payload, lastActivity: action.payload.createdAt }
          : c
      );
      // Re-sort by lastActivity
      convs.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      return { ...state, conversations: convs };
    }

    default:
      return state;
  }
}

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const setConversations = useCallback((convs) => {
    dispatch({ type: 'SET_CONVERSATIONS', payload: convs });
  }, []);

  const setActiveConversation = useCallback((conv) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv });
  }, []);

  const addOrUpdateConversation = useCallback((conv) => {
    dispatch({ type: 'ADD_OR_UPDATE_CONVERSATION', payload: conv });
  }, []);

  const setMessages = useCallback((conversationId, messages, hasMore) => {
    dispatch({ type: 'SET_MESSAGES', conversationId, payload: messages, hasMore });
  }, []);

  const prependMessages = useCallback((conversationId, messages, hasMore) => {
    dispatch({ type: 'PREPEND_MESSAGES', conversationId, payload: messages, hasMore });
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    dispatch({ type: 'ADD_MESSAGE', conversationId, payload: message });
  }, []);

  const updateMessage = useCallback((conversationId, message) => {
    dispatch({ type: 'UPDATE_MESSAGE', conversationId, payload: message });
  }, []);

  const deleteMessage = useCallback((conversationId, messageId) => {
    dispatch({ type: 'DELETE_MESSAGE', conversationId, messageId });
  }, []);

  const setTyping = useCallback((conversationId, userId) => {
    dispatch({ type: 'SET_TYPING', conversationId, userId });
  }, []);

  const clearTyping = useCallback((conversationId, userId) => {
    dispatch({ type: 'CLEAR_TYPING', conversationId, userId });
  }, []);

  const clearUnread = useCallback((conversationId) => {
    dispatch({ type: 'CLEAR_UNREAD', conversationId });
  }, []);

  const incrementUnread = useCallback((conversationId) => {
    dispatch({ type: 'INCREMENT_UNREAD', conversationId });
  }, []);

  const updateLastMessage = useCallback((conversationId, message) => {
    dispatch({ type: 'UPDATE_LAST_MESSAGE', conversationId, payload: message });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        setConversations,
        setActiveConversation,
        addOrUpdateConversation,
        setMessages,
        prependMessages,
        addMessage,
        updateMessage,
        deleteMessage,
        setTyping,
        clearTyping,
        clearUnread,
        incrementUnread,
        updateLastMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export default ChatContext;
