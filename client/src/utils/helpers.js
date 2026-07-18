import { format, formatDistanceToNow, isToday, isYesterday, differenceInDays } from 'date-fns';

// ─── Time formatting ───────────────────────────────────────────────────────────
export const formatMessageTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
};

export const formatConversationTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  if (differenceInDays(new Date(), d) < 7) return format(d, 'EEE');
  return format(d, 'dd/MM/yy');
};

export const formatDateDivider = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

export const formatLastSeen = (date) => {
  if (!date) return 'Offline';
  return `Last seen ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
};

// ─── Message grouping ─────────────────────────────────────────────────────────
export const groupMessagesByDate = (messages) => {
  if (!messages?.length) return [];
  const groups = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = format(new Date(msg.createdAt), 'yyyy-MM-dd');
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ type: 'date-divider', date: msg.createdAt, id: `divider-${msgDate}` });
    }
    groups.push(msg);
  });

  return groups;
};

// ─── Text helpers ─────────────────────────────────────────────────────────────
export const truncateText = (text, maxLength = 40) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ─── Avatar color ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export const generateAvatarColor = (str) => {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── File helpers ─────────────────────────────────────────────────────────────
export const getFileIcon = (type) => {
  if (!type) return 'file';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'music';
  if (type.includes('pdf')) return 'file-text';
  if (type.includes('word') || type.includes('document')) return 'file-text';
  if (type.includes('sheet') || type.includes('excel')) return 'table';
  if (type.includes('zip') || type.includes('rar')) return 'archive';
  return 'file';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Message preview ──────────────────────────────────────────────────────────
export const getMessagePreview = (message) => {
  if (!message) return '';
  if (message.isDeleted) return '🚫 Message deleted';
  if (message.type === 'image') return '📷 Image';
  if (message.type === 'file') return `📎 ${message.fileName || 'File'}`;
  if (message.type === 'audio') return '🎵 Voice message';
  return truncateText(message.content, 45);
};

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const isImageFile = (file) => file?.type?.startsWith('image/');

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
