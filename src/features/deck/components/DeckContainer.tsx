import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MediaAsset, SwipeDirection } from '../../../types/media';
import { SwipeableCard } from './SwipeableCard';
import { Trash2, RotateCcw, Check, Sparkles, FolderCheck } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DeckContainerProps {
  assets: MediaAsset[];
  currentIndex: number;
  onSwipe: (direction: SwipeDirection, asset: MediaAsset) => void;
  onUndo: () => void;
  canUndo: boolean;
  onRefreshMedia: () => void;
}

export const DeckContainer: React.FC<DeckContainerProps> = ({
  assets,
  currentIndex,
  onSwipe,
  onUndo,
  canUndo,
  onRefreshMedia,
}) => {
  // STRICT MEMORY RULE: Render ONLY top 3 visible cards in stack
  const visibleAssets = assets.slice(currentIndex, currentIndex + 3);
  const currentAsset = assets[currentIndex];

  if (!currentAsset || visibleAssets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <FolderCheck size={48} color="#10B981" />
        </View>
        <Text style={styles.emptyTitle}>Chunk Cleanup Complete!</Text>
        <Text style={styles.emptySubtitle}>
          You've reviewed all photos in this batch. Review staged items or load the next set of photos.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefreshMedia} activeOpacity={0.8}>
          <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.refreshButtonText}>Load Next Photo Set</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleManualSwipe = (direction: SwipeDirection) => {
    if (currentAsset) {
      onSwipe(direction, currentAsset);
    }
  };

  return (
    <View style={styles.container}>
      {/* 3-Card Virtualized Stack */}
      <View style={styles.deckArea}>
        {visibleAssets.map((asset, index) => {
          const isTopCard = index === 0;
          return (
            <SwipeableCard
              key={asset.id}
              asset={asset}
              index={index}
              isTopCard={isTopCard}
              onSwipe={(direction) => onSwipe(direction, asset)}
            />
          );
        })}
      </View>

      {/* Quick Action Controls */}
      <View style={styles.controlsRow}>
        {/* Delete Button (Shmel - Left) */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={() => handleManualSwipe('left')}
          activeOpacity={0.8}
        >
          <Trash2 size={26} color="#EF4444" />
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.undoActionButton, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          activeOpacity={0.8}
        >
          <RotateCcw size={22} color={canUndo ? '#F8FAFC' : '#475569'} />
        </TouchableOpacity>

        {/* Keep Button (Yamin - Right) */}
        <TouchableOpacity
          style={[styles.actionButton, styles.keepActionButton]}
          onPress={() => handleManualSwipe('right')}
          activeOpacity={0.8}
        >
          <Check size={28} color="#10B981" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  deckArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 16,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  keepActionButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  undoActionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
