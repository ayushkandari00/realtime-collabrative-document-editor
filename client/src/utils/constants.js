export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
};

export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_CONVERSATION: 'join-conversation',
  LEAVE_CONVERSATION: 'leave-conversation',
  SEND_MESSAGE: 'send-message',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  MARK_READ: 'mark-read',

  // Server → Client
  NEW_MESSAGE: 'new-message',
  MESSAGE_EDITED: 'message-edited',
  MESSAGE_DELETED: 'message-deleted',
  REACTION_UPDATED: 'reaction-updated',
  USER_TYPING: 'user-typing',
  USER_STOP_TYPING: 'user-stop-typing',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  ONLINE_USERS: 'online-users',
  MESSAGE_READ: 'message-read',
};

export const TYPING_TIMEOUT = 2000;
export const MESSAGES_PER_PAGE = 30;
