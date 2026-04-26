import React, { useEffect } from 'react';
import { DownloadSuccessModal } from './DownloadSuccessModal';
import { DownloadErrorModal } from './DownloadErrorModal';
import { useDownloadModal } from '../services/downloadModalService';
import { simpleDownloadService } from '../services/simpleDownloadService';

export const DownloadModalContainer: React.FC = () => {
  const { 
    state, 
    showSuccessModal, 
    showErrorModal, 
    hideSuccessModal, 
    hideErrorModal 
  } = useDownloadModal();

  // Connect the download service to the modal system
  useEffect(() => {
    simpleDownloadService.setModalCallbacks({
      showSuccess: showSuccessModal,
      showError: showErrorModal,
    });
  }, [showSuccessModal, showErrorModal]);

  return (
    <>
      <DownloadSuccessModal
        visible={state.successModal.visible}
        onClose={hideSuccessModal}
        filename={state.successModal.filename}
        fileSize={state.successModal.fileSize}
        downloadPath={state.successModal.downloadPath}
        onOpenFile={state.successModal.onOpenFile}
        onShareFile={state.successModal.onShareFile}
        onOpenFolder={state.successModal.onOpenFolder}
      />
      
      <DownloadErrorModal
        visible={state.errorModal.visible}
        onClose={hideErrorModal}
        filename={state.errorModal.filename}
        errorMessage={state.errorModal.errorMessage}
        onRetry={state.errorModal.onRetry}
        onShare={state.errorModal.onShare}
      />
    </>
  );
};

export default DownloadModalContainer;