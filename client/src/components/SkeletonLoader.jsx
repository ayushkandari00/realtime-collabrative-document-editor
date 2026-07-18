const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const CardSkeleton = () => (
    <div className="doc-card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="w-16 h-5 rounded-full skeleton" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-5 rounded skeleton w-3/4" />
        <div className="h-4 rounded skeleton w-1/2" />
        <div className="h-4 rounded skeleton w-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-3 rounded skeleton w-24" />
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-lg skeleton" />
          <div className="w-7 h-7 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded skeleton w-1/2" />
        <div className="h-3 rounded skeleton w-1/3" />
      </div>
      <div className="h-3 rounded skeleton w-16" />
    </div>
  );

  const rows = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {rows.map((_, i) => <ListSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {rows.map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
};

export default SkeletonLoader;
