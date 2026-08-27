import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';

export function useMediaPermissions() {
  const [permissionResponse, setPermissionResponse] = useState<MediaLibrary.PermissionResponse | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const checkPermission = useCallback(async () => {
    try {
      const response = await MediaLibrary.getPermissionsAsync();
      setPermissionResponse(response);
    } catch (error) {
      console.error('Error checking photo permissions:', error);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      // Request writeOnly / full access as required for deletion confirmation
      const response = await MediaLibrary.requestPermissionsAsync(true);
      setPermissionResponse(response);
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
  }, [checkPermission]);

  return {
    hasPermission: permissionResponse?.granted ?? false,
    canAskAgain: permissionResponse?.canAskAgain ?? true,
    status: permissionResponse?.status,
    isRequesting,
    requestPermission,
    checkPermission,
  };
}
