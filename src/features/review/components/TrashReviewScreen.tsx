import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MediaAsset } from '../../../types/media';
import { formatBytes, deleteBatchAssets } from '../../media/services/mediaService';
import { Trash2, RotateCcw, CheckSquare, Square, X, AlertTriangle } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - 32 - (GRID_COLUMNS - 1) * 8) / GRID_COLUMNS;

interface TrashReviewScreenProps {
  stagedAssets: MediaAsset[];
  onClose: () => void;
  onRestoreAsset: (assetId: string) => void;
  onConfirmBatchDelete: (deletedAssetIds: string[]) => void;
}

export const TrashReviewScreen: React.FC<TrashReviewScreenProps> = ({
  stagedAssets,
  onClose,
  onRestoreAsset,
  onConfirmBatchDelete,
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
              const success = await deleteBatchAssets(selectedIds);
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

        <View style={styles.checkBadge}>
          {isChecked ? (
            <CheckSquare size={20} color="#EF4444" fill="rgba(239, 68, 68, 0.2)" />
          ) : (
            <Square size={20} color="#64748B" />
          )}
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
      <StatusBar barStyle="light-content" />

      {/* Screen Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Staged for Deletion (Shmel)</Text>
          <Text style={styles.subtitle}>
            {stagedAssets.length} photo(s) • ~{formatBytes(totalBytesSelected)} ready to clean
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Select All Toggle Bar */}
      {stagedAssets.length > 0 && (
        <View style={styles.toolBar}>
          <TouchableOpacity style={styles.toolBarButton} onPress={selectAll}>
            <Text style={styles.toolBarText}>
              {selectedIds.length === stagedAssets.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBarButton} onPress={handleRestoreSelected}>
            <RotateCcw size={16} color="#818CF8" style={{ marginRight: 6 }} />
            <Text style={styles.restoreText}>Restore Unselected</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grid Content */}
      {stagedAssets.length === 0 ? (
        <View style={styles.emptyState}>
          <Trash2 size={56} color="#475569" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Trash is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Swiping left (Shmel) on photos in the deck will stage them here for batch cleanup.
          </Text>
        </View>
      ) : (
        <FlatList
          data={stagedAssets}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.gridContent}
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
                <Trash2 size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
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
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  toolBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBarText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  restoreText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '600',
  },
  gridContent: {
    padding: 16,
    gap: 8,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 8,
    marginRight: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  gridItemUnchecked: {
    borderColor: 'transparent',
    opacity: 0.5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 4,
    padding: 2,
  },
  itemFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  itemSizeText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0F172A',
  },
  deleteButton: {
    height: 54,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
