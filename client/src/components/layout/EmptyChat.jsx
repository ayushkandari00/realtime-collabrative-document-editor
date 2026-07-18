import { MessageSquare, Zap } from 'lucide-react';

const EmptyChat = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-gray-950 select-none">
    {/* Animated icon */}
    <div className="relative">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce-in">
        <MessageSquare className="w-12 h-12 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
        <Zap className="w-4 h-4 text-white" />
      </div>
    </div>

    {/* Copy */}
    <div className="text-center max-w-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Select a conversation
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        Choose from your recent chats or search for someone new to start messaging instantly.
      </p>
    </div>

    {/* Features */}
    <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        End-to-end secure
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        Real-time messages
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        File sharing
      </span>
    </div>
  </div>
);

export default EmptyChat;
