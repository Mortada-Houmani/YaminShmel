import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MediaAsset, SwipeDirection } from '../../../types/media';
import { SwipeableCard } from './SwipeableCard';
import { Trash2, RotateCcw, Check, Sparkles, CheckCircle2 } from 'lucide-react-native';

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
          <CheckCircle2 size={40} color="#059669" strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>Batch Review Complete</Text>
        <Text style={styles.emptySubtitle}>
          You've reviewed all photos in this batch. Inspect your staged items in the top trash or load more photos.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefreshMedia} activeOpacity={0.85}>
          <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.refreshButtonText}>Load More Photos</Text>
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
          activeOpacity={0.75}
        >
          <Trash2 size={24} color="#DC2626" strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.undoActionButton, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          activeOpacity={0.75}
        >
          <RotateCcw size={20} color={canUndo ? '#0F172A' : '#CBD5E1'} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Keep Button (Yamin - Right) */}
        <TouchableOpacity
          style={[styles.actionButton, styles.keepActionButton]}
          onPress={() => handleManualSwipe('right')}
          activeOpacity={0.75}
        >
          <Check size={26} color="#059669" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  deckArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 14,
  },
  actionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  deleteActionButton: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  keepActionButton: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  undoActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  buttonDisabled: {
    opacity: 0.4,
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 280,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

