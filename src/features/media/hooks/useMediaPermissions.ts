import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export function useMediaPermissions() {
  const [permissionResponse, setPermissionResponse] = useState<MediaLibrary.PermissionResponse | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const checkPermission = useCallback(async () => {
    try {
      const response = await MediaLibrary.getPermissionsAsync(false, ['photo']);
      setPermissionResponse(response);
      return response.granted;
    } catch (error) {
      console.error('Error checking photo permissions:', error);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      // Request full read/write access (writeOnly: false) with photo granularity
      const response = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      setPermissionResponse(response);

      // If denied and cannot ask again, guide user to app settings
      if (!response.granted && !response.canAskAgain) {
        await Linking.openSettings();
      }
      return response.granted;
    } catch (error) {
      console.error('Error requesting photo permissions:', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();

    // Automatically re-check permissions when returning to app from system settings
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    hasPermission: permissionResponse?.granted ?? false,
    canAskAgain: permissionResponse?.canAskAgain ?? true,
    status: permissionResponse?.status,
    isRequesting,
    requestPermission,
    checkPermission,
    openSettings: Linking.openSettings,
  };
}

