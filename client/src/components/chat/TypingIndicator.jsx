const TypingIndicator = ({ names = [] }) => {
  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : 'Several people are typing';

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2">
        <div className="typing-dot" style={{ animationDelay: '0ms' }} />
        <div className="typing-dot" style={{ animationDelay: '200ms' }} />
        <div className="typing-dot" style={{ animationDelay: '400ms' }} />
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

export default TypingIndicator;
