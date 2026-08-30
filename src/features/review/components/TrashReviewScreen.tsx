import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MediaAsset } from '../../../types/media';
import { formatBytes, deleteBatchAssets } from '../../media/services/mediaService';
import { Trash2, RotateCcw, Check, X, Inbox } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - 32 - (GRID_COLUMNS - 1) * 8) / GRID_COLUMNS;

interface TrashReviewScreenProps {
  stagedAssets: MediaAsset[];
  onClose: () => void;
  onRestoreAsset: (assetId: string) => void;
  onConfirmBatchDelete: (deletedAssetIds: string[]) => void;
  isDemoMode?: boolean;
}

export const TrashReviewScreen: React.FC<TrashReviewScreenProps> = ({
  stagedAssets,
  onClose,
  onRestoreAsset,
  onConfirmBatchDelete,
  isDemoMode = false,
}) => {
  // Array of asset IDs marked for deletion (all checked by default)
  const [selectedIds, setSelectedIds] = useState<string[]>(stagedAssets.map((a) => a.id));
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === stagedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stagedAssets.map((a) => a.id));
    }
  };

  const handleRestoreSelected = () => {
    const idsToRestore = stagedAssets.filter((a) => !selectedIds.includes(a.id)).map((a) => a.id);
    idsToRestore.forEach((id) => onRestoreAsset(id));
  };

  const totalBytesSelected = stagedAssets
    .filter((a) => selectedIds.includes(a.id))
    .reduce((sum, a) => sum + (a.filesize || 2500000), 0);

  const handleDeleteBatch = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one photo to delete.');
      return;
    }

    Alert.alert(
      'Permanent Device Cleanup',
      `Delete ${selectedIds.length} photo(s) from your camera roll? Your device OS will present 1 final confirmation modal.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute Native Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await deleteBatchAssets(selectedIds, isDemoMode);
              if (success) {
                onConfirmBatchDelete(selectedIds);
                Alert.alert('Cleanup Successful', `Successfully freed ~${formatBytes(totalBytesSelected)} of device storage!`);
                onClose();
              } else {
                Alert.alert('Deletion Cancelled', 'The deletion request was cancelled or denied by the system.');
              }
            } catch (error) {
              console.error('Error executing batch delete:', error);
              Alert.alert('Deletion Error', 'An unexpected error occurred during batch deletion.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderGridItem = ({ item }: { item: MediaAsset }) => {
    const isChecked = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.gridItem, !isChecked && styles.gridItemUnchecked]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.uri }} style={styles.gridImage} contentFit="cover" />

        {/* Check Indicator Box */}
        <View style={[styles.checkBadge, isChecked ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
          {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemSizeText}>
            {item.filesize ? formatBytes(item.filesize) : 'Photo'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Staged Deletions</Text>
          <Text style={styles.subtitle}>
            {stagedAssets.length} photo(s) • ~{formatBytes(totalBytesSelected)} staged
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
          <X size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Select All Toggle Bar */}
      {stagedAssets.length > 0 && (
        <View style={styles.toolBar}>
          <TouchableOpacity style={styles.toolBarButton} onPress={selectAll} activeOpacity={0.75}>
            <Text style={styles.toolBarText}>
              {selectedIds.length === stagedAssets.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBarButton} onPress={handleRestoreSelected} activeOpacity={0.75}>
            <RotateCcw size={14} color="#0F172A" style={{ marginRight: 5 }} />
            <Text style={styles.restoreText}>Restore Unchecked</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grid Content */}
      {stagedAssets.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Inbox size={36} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>Trash Queue Empty</Text>
          <Text style={styles.emptySubtitle}>
            Swiping left on photos in the deck will stage them here for batch cleanup.
          </Text>
        </View>
      ) : (
        <FlatList
          data={stagedAssets}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Action Footer */}
      {stagedAssets.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
            onPress={handleDeleteBatch}
            disabled={isDeleting}
            activeOpacity={0.85}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Trash2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>
                  Clean Up Selected ({selectedIds.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBarText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  restoreText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  gridContent: {
    padding: 16,
    gap: 8,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    marginRight: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  gridItemUnchecked: {
    borderColor: 'transparent',
    opacity: 0.45,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeActive: {
    backgroundColor: '#DC2626',
  },
  checkBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  itemFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  itemSizeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

