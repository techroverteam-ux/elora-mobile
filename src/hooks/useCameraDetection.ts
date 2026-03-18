import { useState, useCallback, useEffect } from 'react';
import { cameraDetectionService, CameraOption, CameraDetectionResult } from '../services/cameraDetectionService';

export interface UseCameraDetectionOptions {
  autoDetect?: boolean;
  useCase?: 'measurement' | 'documentation' | 'proof';
}

export interface UseCameraDetectionReturn {
  cameraDetection: CameraDetectionResult | null;
  isDetecting: boolean;
  isCapturing: boolean;
  detectCameras: () => Promise<void>;
  showCameraSelection: (
    onCameraSelected: (camera: CameraOption) => void,
    onCancel?: () => void
  ) => Promise<void>;
  launchCamera: (
    camera: CameraOption,
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  getRecommendedCameras: () => CameraOption[];
  getAvailableCameras: () => CameraOption[];
  getGPSCameras: () => CameraOption[];
  getDeviceCameras: () => CameraOption[];
}

export const useCameraDetection = (options: UseCameraDetectionOptions = {}): UseCameraDetectionReturn => {
  const { autoDetect = true, useCase = 'documentation' } = options;
  
  const [cameraDetection, setCameraDetection] = useState<CameraDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const detectCameras = useCallback(async () => {
    try {
      setIsDetecting(true);
      const detection = await cameraDetectionService.detectAllCameras();
      setCameraDetection(detection);
      console.log('Camera detection completed:', {
        deviceCameras: detection.deviceCameras.length,
        gpsApps: detection.gpsApps.length,
        totalAvailable: detection.totalAvailable
      });
    } catch (error) {
      console.error('Error detecting cameras:', error);
      setCameraDetection({
        deviceCameras: [],
        gpsApps: [],
        totalAvailable: 0
      });
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const showCameraSelection = useCallback(async (
    onCameraSelected: (camera: CameraOption) => void,
    onCancel?: () => void
  ) => {
    await cameraDetectionService.showCameraSelectionDialog(onCameraSelected, onCancel);
  }, []);

  const launchCamera = useCallback(async (
    camera: CameraOption,
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setIsCapturing(true);
      await cameraDetectionService.launchSelectedCamera(
        camera,
        (photoUri: string, metadata?: any) => {
          setIsCapturing(false);
          onCapture(photoUri, {
            ...metadata,
            cameraUsed: camera.name,
            cameraType: camera.type,
            hasGPSData: camera.type === 'gps_app'
          });
        },
        (error: string) => {
          setIsCapturing(false);
          onError?.(error);
        }
      );
    } catch (error) {
      setIsCapturing(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown camera error';
      onError?.(errorMessage);
    }
  }, []);

  const getRecommendedCameras = useCallback((): CameraOption[] => {
    if (!cameraDetection) return [];
    
    const recommended = cameraDetectionService.getRecommendedCameras(useCase);
    const allCameras = [...cameraDetection.deviceCameras, ...cameraDetection.gpsApps];
    
    return recommended
      .map(id => allCameras.find(camera => camera.id === id))
      .filter((camera): camera is CameraOption => camera !== undefined && camera.isAvailable);
  }, [cameraDetection, useCase]);

  const getAvailableCameras = useCallback((): CameraOption[] => {
    if (!cameraDetection) return [];
    
    return [...cameraDetection.deviceCameras, ...cameraDetection.gpsApps]
      .filter(camera => camera.isAvailable);
  }, [cameraDetection]);

  const getGPSCameras = useCallback((): CameraOption[] => {
    if (!cameraDetection) return [];
    
    return cameraDetection.gpsApps.filter(camera => camera.isAvailable);
  }, [cameraDetection]);

  const getDeviceCameras = useCallback((): CameraOption[] => {
    if (!cameraDetection) return [];
    
    return cameraDetection.deviceCameras.filter(camera => camera.isAvailable);
  }, [cameraDetection]);

  // Auto-detect cameras on mount if enabled
  useEffect(() => {
    if (autoDetect) {
      detectCameras();
    }
  }, [autoDetect, detectCameras]);

  return {
    cameraDetection,
    isDetecting,
    isCapturing,
    detectCameras,
    showCameraSelection,
    launchCamera,
    getRecommendedCameras,
    getAvailableCameras,
    getGPSCameras,
    getDeviceCameras
  };
};