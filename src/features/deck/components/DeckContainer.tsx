import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MediaAsset, SwipeDirection } from '../../../types/media';
import { SwipeableCard } from './SwipeableCard';
import { Trash2, RotateCcw, Check, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react-native';

interface DeckContainerProps {
  assets: MediaAsset[];
  currentIndex: number;
  onSwipe: (direction: SwipeDirection, asset: MediaAsset) => void;
  onUndo: () => void;
  canUndo: boolean;
  onRefreshMedia: () => void;
  stagedCount?: number;
  onOpenTrash?: () => void;
  onBackToHome?: () => void;
  scopeTitle?: string;
}

export const DeckContainer: React.FC<DeckContainerProps> = ({
  assets,
  currentIndex,
  onSwipe,
  onUndo,
  canUndo,
  onRefreshMedia,
  stagedCount = 0,
  onOpenTrash,
  onBackToHome,
  scopeTitle,
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
        <Text style={styles.emptyTitle}>
          {scopeTitle ? `${scopeTitle} Reviewed!` : 'Batch Review Complete'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {stagedCount > 0
            ? `You have ${stagedCount} photo${stagedCount > 1 ? 's' : ''} staged in Trash ready to permanently delete.`
            : "You've reviewed all photos in this collection. Pick another album or month!"}
        </Text>

        {stagedCount > 0 && onOpenTrash && (
          <TouchableOpacity
            style={styles.reviewTrashPrimaryButton}
            onPress={onOpenTrash}
            activeOpacity={0.85}
          >
            <Trash2 size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.reviewTrashPrimaryText}>
              Review & Delete {stagedCount} Photo{stagedCount > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}

        {onBackToHome && (
          <TouchableOpacity
            style={[styles.backHomeButton, stagedCount === 0 && styles.backHomeButtonPrimary]}
            onPress={onBackToHome}
            activeOpacity={0.85}
          >
            <ArrowLeft
              size={16}
              color={stagedCount === 0 ? '#FFFFFF' : '#0F172A'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.backHomeButtonText,
                stagedCount === 0 && styles.backHomeButtonPrimaryText,
              ]}
            >
              Choose Another Album or Month
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.refreshButton, styles.refreshButtonSecondary]}
          onPress={onRefreshMedia}
          activeOpacity={0.85}
        >
          <Sparkles size={15} color="#64748B" style={{ marginRight: 6 }} />
          <Text style={styles.refreshButtonSecondaryText}>
            Check for More Photos
          </Text>
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

      {/* Staged Trash Pill Bar (Visible when photos are queued) */}
      {stagedCount > 0 && onOpenTrash && (
        <TouchableOpacity
          style={styles.stagedPillBar}
          onPress={onOpenTrash}
          activeOpacity={0.85}
        >
          <View style={styles.stagedPillBadge}>
            <Trash2 size={12} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.stagedPillBadgeText}>{stagedCount}</Text>
          </View>
          <Text style={styles.stagedPillText}>
            {stagedCount === 1 ? '1 photo staged' : `${stagedCount} photos staged`} • Tap to delete
          </Text>
          <Text style={styles.stagedPillAction}>Review →</Text>
        </TouchableOpacity>
      )}

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
  refreshButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowOpacity: 0.04,
    marginTop: 10,
  },
  refreshButtonSecondaryText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  backHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  backHomeButtonPrimary: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    marginTop: 0,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  backHomeButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  backHomeButtonPrimaryText: {
    color: '#FFFFFF',
  },
  reviewTrashPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 6,
  },
  reviewTrashPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  stagedPillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
    marginBottom: 4,
  },
  stagedPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  stagedPillBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 3,
  },
  stagedPillText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  stagedPillAction: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
});

