import React from 'react';

interface DownloadModalState {
  successModal: {
    visible: boolean;
    filename: string;
    fileSize?: string;
    downloadPath: string;
    onOpenFile?: () => void;
    onShareFile?: () => void;
    onOpenFolder?: () => void;
  };
  errorModal: {
    visible: boolean;
    filename: string;
    errorMessage: string;
    onRetry?: () => void;
    onShare?: () => void;
  };
}

type DownloadModalAction = 
  | { type: 'SHOW_SUCCESS'; payload: Omit<DownloadModalState['successModal'], 'visible'> }
  | { type: 'SHOW_ERROR'; payload: Omit<DownloadModalState['errorModal'], 'visible'> }
  | { type: 'HIDE_SUCCESS' }
  | { type: 'HIDE_ERROR' }
  | { type: 'HIDE_ALL' };

const initialState: DownloadModalState = {
  successModal: {
    visible: false,
    filename: '',
    downloadPath: '',
  },
  errorModal: {
    visible: false,
    filename: '',
    errorMessage: '',
  },
};

function downloadModalReducer(state: DownloadModalState, action: DownloadModalAction): DownloadModalState {
  switch (action.type) {
    case 'SHOW_SUCCESS':
      return {
        ...state,
        successModal: {
          ...action.payload,
          visible: true,
        },
        errorModal: {
          ...state.errorModal,
          visible: false,
        },
      };
    case 'SHOW_ERROR':
      return {
        ...state,
        errorModal: {
          ...action.payload,
          visible: true,
        },
        successModal: {
          ...state.successModal,
          visible: false,
        },
      };
    case 'HIDE_SUCCESS':
      return {
        ...state,
        successModal: {
          ...state.successModal,
          visible: false,
        },
      };
    case 'HIDE_ERROR':
      return {
        ...state,
        errorModal: {
          ...state.errorModal,
          visible: false,
        },
      };
    case 'HIDE_ALL':
      return {
        ...state,
        successModal: {
          ...state.successModal,
          visible: false,
        },
        errorModal: {
          ...state.errorModal,
          visible: false,
        },
      };
    default:
      return state;
  }
}

interface DownloadModalContextType {
  state: DownloadModalState;
  showSuccessModal: (data: Omit<DownloadModalState['successModal'], 'visible'>) => void;
  showErrorModal: (data: Omit<DownloadModalState['errorModal'], 'visible'>) => void;
  hideSuccessModal: () => void;
  hideErrorModal: () => void;
  hideAllModals: () => void;
}

const DownloadModalContext = React.createContext<DownloadModalContextType | undefined>(undefined);

export const DownloadModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = React.useReducer(downloadModalReducer, initialState);

  const showSuccessModal = React.useCallback((data: Omit<DownloadModalState['successModal'], 'visible'>) => {
    dispatch({ type: 'SHOW_SUCCESS', payload: data });
  }, []);

  const showErrorModal = React.useCallback((data: Omit<DownloadModalState['errorModal'], 'visible'>) => {
    dispatch({ type: 'SHOW_ERROR', payload: data });
  }, []);

  const hideSuccessModal = React.useCallback(() => {
    dispatch({ type: 'HIDE_SUCCESS' });
  }, []);

  const hideErrorModal = React.useCallback(() => {
    dispatch({ type: 'HIDE_ERROR' });
  }, []);

  const hideAllModals = React.useCallback(() => {
    dispatch({ type: 'HIDE_ALL' });
  }, []);

  const value = React.useMemo(() => ({
    state,
    showSuccessModal,
    showErrorModal,
    hideSuccessModal,
    hideErrorModal,
    hideAllModals,
  }), [state, showSuccessModal, showErrorModal, hideSuccessModal, hideErrorModal, hideAllModals]);

  return (
    <DownloadModalContext.Provider value={value}>
      {children}
    </DownloadModalContext.Provider>
  );
};

export const useDownloadModal = () => {
  const context = React.useContext(DownloadModalContext);
  if (context === undefined) {
    throw new Error('useDownloadModal must be used within a DownloadModalProvider');
  }
  return context;
};

// Utility functions for easy usage
export const downloadModalService = {
  showSuccess: (data: Omit<DownloadModalState['successModal'], 'visible'>) => {
    // This will be set by the provider
  },
  showError: (data: Omit<DownloadModalState['errorModal'], 'visible'>) => {
    // This will be set by the provider
  },
  hideAll: () => {
    // This will be set by the provider
  },
};