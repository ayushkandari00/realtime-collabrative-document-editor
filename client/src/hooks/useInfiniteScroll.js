import { useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export const useInfiniteScroll = (onLoadMore, hasMore) => {
  const isLoadingRef = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
    onChange: async (inView) => {
      if (inView && hasMore && !isLoadingRef.current) {
        isLoadingRef.current = true;
        try {
          await onLoadMore();
        } finally {
          isLoadingRef.current = false;
        }
      }
    },
  });

  return { sentinelRef: ref, inView };
};
