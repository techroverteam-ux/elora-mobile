import { useState, useCallback } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  refreshThreshold?: number;
}

interface UsePullToRefreshReturn {
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
  refreshState: 'idle' | 'pulling' | 'ready' | 'refreshing';
  setRefreshState: (state: 'idle' | 'pulling' | 'ready' | 'refreshing') => void;
}

export const usePullToRefresh = ({
  onRefresh,
  refreshThreshold = 100,
}: UsePullToRefreshProps): UsePullToRefreshReturn => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setRefreshState('refreshing');
    
    try {
      await onRefresh();
    } catch (error) {
      console.error('Pull to refresh error:', error);
    } finally {
      setRefreshing(false);
      setRefreshState('idle');
    }
  }, [onRefresh, refreshing]);

  return {
    refreshing,
    handleRefresh,
    refreshState,
    setRefreshState,
  };
};

export default usePullToRefresh;