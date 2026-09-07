import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Modal, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMediaStore } from '../store/useMediaStore';
import { useDeckStore } from '../store/useDeckStore';
import { fetchMediaChunk } from '../features/media/services/mediaService';
import { Header } from '../components/Header';
import { DeckContainer } from '../features/deck/components/DeckContainer';
import { MonthSelectorModal } from '../components/MonthSelectorModal';
import { TrashReviewScreen } from '../features/review/components/TrashReviewScreen';
import { GridBackground } from '../components/GridBackground';
import { MediaAsset, SwipeDirection, MonthGroup } from '../types/media';

interface DeckScreenProps {
  onBackToHome: () => void;
}

export const DeckScreen: React.FC<DeckScreenProps> = ({ onBackToHome }) => {
  const {
    assets,
    monthGroups,
    selectedMonthId,
    activeScope,
    isLoading,
    endCursor,
    isDemoMode,
    setAssets,
    appendAssets,
    removeAssets,
    setSelectedMonth,
    setLoading,
    setError,
    addCleanedStats,
  } = useMediaStore();

  const {
    currentIndex,
    stagedForDeletion,
    undoStack,
    swipeLeft,
    swipeRight,
    undo,
    restoreFromTrash,
    confirmBatchDelete,
    resetDeck,
  } = useDeckStore();

  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

  // Load media scoped to current activeScope
  const loadScopedMedia = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMediaChunk(undefined, undefined, isDemoMode, activeScope);
      setAssets(result.assets);
      resetDeck();
    } catch (err: any) {
      setError(err?.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [activeScope, isDemoMode, setAssets, resetDeck, setLoading, setError]);

  useEffect(() => {
    loadScopedMedia();
  }, [loadScopedMedia]);

  // Load more assets when queue is near end
  const loadMoreMedia = async () => {
    if (isLoading) return;
    setLoading(true);
    try {
      const result = await fetchMediaChunk(endCursor, undefined, isDemoMode, activeScope);
      appendAssets(result.assets, result.hasNextPage, result.endCursor);
    } catch (err) {
      console.error('Error fetching pagination chunk:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter assets if activeScope is ALL and user picked a month from top dropdown
  const filteredAssets = useMemo(() => {
    if (activeScope.type !== 'ALL') {
      return assets;
    }
    if (selectedMonthId === 'ALL') return assets;
    const targetGroup = monthGroups.find((g: MonthGroup) => g.id === selectedMonthId);
    return targetGroup ? targetGroup.assets : assets;
  }, [assets, monthGroups, selectedMonthId, activeScope]);

  const handleSwipe = (direction: SwipeDirection, asset: MediaAsset) => {
    if (direction === 'left') {
      swipeLeft(asset);
    } else {
      swipeRight(asset);
    }
  };

  // Header Title reflecting active scope
  const headerTitle = useMemo(() => {
    if (activeScope.type === 'ALBUM') {
      return activeScope.title;
    }
    if (activeScope.type === 'MONTH') {
      return activeScope.title;
    }
    if (selectedMonthId === 'ALL') return 'All Photos';
    const group = monthGroups.find((g: MonthGroup) => g.id === selectedMonthId);
    return group ? group.title : 'All Photos';
  }, [activeScope, selectedMonthId, monthGroups]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <GridBackground gridSize={28} gridColor="#E2E8F0" backgroundColor="#FAFAFA" />

      {/* Top Header with Back Button */}
      <Header
        stagedCount={stagedForDeletion.length}
        selectedMonthTitle={headerTitle}
        onOpenMonthSelector={() => setIsMonthModalOpen(true)}
        onOpenTrashReview={() => setIsTrashModalOpen(true)}
        onBack={onBackToHome}
      />

      {/* Center Swipe Deck */}
      {isLoading && assets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0F172A" />
          <Text style={styles.loadingText}>Loading Photos...</Text>
        </View>
      ) : (
        <DeckContainer
          assets={filteredAssets}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
          onUndo={undo}
          canUndo={undoStack.length > 0}
          onRefreshMedia={loadMoreMedia}
          stagedCount={stagedForDeletion.length}
          onOpenTrash={() => setIsTrashModalOpen(true)}
          onBackToHome={onBackToHome}
          scopeTitle={headerTitle}
        />
      )}

      {/* Month Filter Selector Modal (available in ALL view) */}
      <MonthSelectorModal
        visible={isMonthModalOpen}
        onClose={() => setIsMonthModalOpen(false)}
        groups={monthGroups}
        selectedMonthId={selectedMonthId}
        onSelectMonth={(id) => {
          setSelectedMonth(id);
          resetDeck();
        }}
        totalAssetsCount={assets.length}
      />

      {/* Trash Review & Batch Delete Modal */}
      <Modal visible={isTrashModalOpen} animationType="slide">
        <TrashReviewScreen
          stagedAssets={stagedForDeletion}
          onClose={() => setIsTrashModalOpen(false)}
          onRestoreAsset={restoreFromTrash}
          isDemoMode={isDemoMode}
          onConfirmBatchDelete={(deletedIds) => {
            confirmBatchDelete(deletedIds);
            removeAssets(deletedIds);
            resetDeck();
            const cleanedBytes = deletedIds.reduce((sum, id) => {
              const item = assets.find((a) => a.id === id);
              return sum + (item?.filesize || 2500000);
            }, 0);
            addCleanedStats(deletedIds.length, cleanedBytes);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
});
