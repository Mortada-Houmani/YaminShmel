import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Modal, ActivityIndicator, Text } from 'react-native';
import { useMediaPermissions } from '../features/media/hooks/useMediaPermissions';
import { PermissionGuard } from '../features/media/components/PermissionGuard';
import { useMediaStore } from '../store/useMediaStore';
import { useDeckStore } from '../store/useDeckStore';
import { fetchMediaChunk, groupAssetsByMonth } from '../features/media/services/mediaService';
import { Header } from '../components/Header';
import { DeckContainer } from '../features/deck/components/DeckContainer';
import { MonthSelectorModal } from '../components/MonthSelectorModal';
import { TrashReviewScreen } from '../features/review/components/TrashReviewScreen';
import { MediaAsset, SwipeDirection, MonthGroup } from '../types/media';

export const HomeScreen: React.FC = () => {
  const { hasPermission, isRequesting, requestPermission } = useMediaPermissions();

  const {
    assets,
    monthGroups,
    selectedMonthId,
    isLoading,
    endCursor,
    setAssets,
    appendAssets,
    setMonthGroups,
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

  // Load initial media assets chunk
  const loadMedia = useCallback(async () => {
    if (!hasPermission) return;
    setLoading(true);
    try {
      const result = await fetchMediaChunk();
      setAssets(result.assets);
      const groups = groupAssetsByMonth(result.assets);
      setMonthGroups(groups);
      resetDeck();
    } catch (err: any) {
      setError(err?.message || 'Failed to load photo library');
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  useEffect(() => {
    if (hasPermission && assets.length === 0) {
      loadMedia();
    }
  }, [hasPermission, assets.length, loadMedia]);

  // Load more assets when queue is near end
  const loadMoreMedia = async () => {
    if (isLoading) return;
    setLoading(true);
    try {
      const result = await fetchMediaChunk(endCursor);
      appendAssets(result.assets, result.hasNextPage, result.endCursor);
      const updatedGroups = groupAssetsByMonth([...assets, ...result.assets]);
      setMonthGroups(updatedGroups);
    } catch (err) {
      console.error('Error fetching pagination chunk:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter assets by month selection
  const filteredAssets = useMemo(() => {
    if (selectedMonthId === 'ALL') return assets;
    const targetGroup = monthGroups.find((g: MonthGroup) => g.id === selectedMonthId);
    return targetGroup ? targetGroup.assets : assets;
  }, [assets, monthGroups, selectedMonthId]);

  const handleSwipe = (direction: SwipeDirection, asset: MediaAsset) => {
    if (direction === 'left') {
      swipeLeft(asset);
    } else {
      swipeRight(asset);
    }
  };

  // Selected Month Title for Header
  const selectedMonthTitle = useMemo(() => {
    if (selectedMonthId === 'ALL') return 'All Photos';
    const group = monthGroups.find((g: MonthGroup) => g.id === selectedMonthId);
    return group ? group.title : 'All Photos';
  }, [selectedMonthId, monthGroups]);

  if (!hasPermission) {
    return (
      <PermissionGuard
        onRequestPermission={requestPermission}
        isRequesting={isRequesting}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <Header
        stagedCount={stagedForDeletion.length}
        selectedMonthTitle={selectedMonthTitle}
        onOpenMonthSelector={() => setIsMonthModalOpen(true)}
        onOpenTrashReview={() => setIsTrashModalOpen(true)}
      />

      {/* Center Swipe Deck */}
      {isLoading && assets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Accessing Camera Roll...</Text>
        </View>
      ) : (
        <DeckContainer
          assets={filteredAssets}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
          onUndo={undo}
          canUndo={undoStack.length > 0}
          onRefreshMedia={loadMoreMedia}
        />
      )}

      {/* Month Filter Selector Modal */}
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
          onConfirmBatchDelete={(deletedIds) => {
            confirmBatchDelete(deletedIds);
            addCleanedStats(deletedIds.length, deletedIds.length * 2500000);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
});
