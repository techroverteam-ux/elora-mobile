import { useState, useEffect } from 'react';

interface UseSkeletonOptions {
  minLoadingTime?: number; // Minimum time to show skeleton (in ms)
  delay?: number; // Delay before showing skeleton (in ms)
}

export const useSkeleton = (
  isLoading: boolean,
  options: UseSkeletonOptions = {}
) => {
  const { minLoadingTime = 500, delay = 200 } = options;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minTimeTimer: NodeJS.Timeout;

    if (isLoading) {
      // Start delay timer
      delayTimer = setTimeout(() => {
        setShowSkeleton(true);
        setStartTime(Date.now());
      }, delay);
    } else {
      // Clear delay timer if loading stops before delay
      clearTimeout(delayTimer);
      
      if (showSkeleton && startTime) {
        const elapsed = Date.now() - startTime;
        const remaining = minLoadingTime - elapsed;
        
        if (remaining > 0) {
          // Wait for minimum time
          minTimeTimer = setTimeout(() => {
            setShowSkeleton(false);
            setStartTime(null);
          }, remaining);
        } else {
          // Hide immediately
          setShowSkeleton(false);
          setStartTime(null);
        }
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minTimeTimer);
    };
  }, [isLoading, delay, minLoadingTime, showSkeleton, startTime]);

  return showSkeleton;
};