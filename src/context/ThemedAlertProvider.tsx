import React, { useEffect } from 'react';
import { useThemedAlert } from '../components/ThemedAlert';
import { themedAlertService } from '../services/themedAlertService';

interface ThemedAlertProviderProps {
  children: React.ReactNode;
}

export const ThemedAlertProvider: React.FC<ThemedAlertProviderProps> = ({ children }) => {
  const { showAlert, AlertComponent } = useThemedAlert();

  useEffect(() => {
    // Register the alert handler with the service
    themedAlertService.setAlertHandler(showAlert);
  }, [showAlert]);

  return (
    <>
      {children}
      <AlertComponent />
    </>
  );
};