import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMediaPermissions } from './src/features/media/hooks/useMediaPermissions';
import { PermissionGuard } from './src/features/media/components/PermissionGuard';
import { HomeDashboardScreen } from './src/screens/HomeDashboardScreen';
import { DeckScreen } from './src/screens/DeckScreen';
import { useMediaStore } from './src/store/useMediaStore';
import { CleanScope } from './src/types/media';

type ScreenMode = 'HOME' | 'DECK';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('HOME');
  const { hasPermission, isRequesting, canAskAgain, requestPermission, openSettings } = useMediaPermissions();
  const { isDemoMode, setDemoMode, setActiveScope } = useMediaStore();

  const handleLaunchDemoMode = () => {
    setDemoMode(true);
    setCurrentScreen('HOME');
  };

  const handleStartCleaning = (scope: CleanScope) => {
    setActiveScope(scope);
    setCurrentScreen('DECK');
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        {!hasPermission && !isDemoMode ? (
          <PermissionGuard
            onRequestPermission={requestPermission}
            onOpenSettings={openSettings}
            onLaunchDemoMode={handleLaunchDemoMode}
            isRequesting={isRequesting}
            canAskAgain={canAskAgain}
          />
        ) : currentScreen === 'HOME' ? (
          <HomeDashboardScreen
            onStartCleaning={handleStartCleaning}
            isDemoMode={isDemoMode}
          />
        ) : (
          <DeckScreen
            onBackToHome={() => setCurrentScreen('HOME')}
          />
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});

