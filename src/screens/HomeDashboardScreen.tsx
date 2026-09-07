import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Trash2,
  Folder,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  HardDrive,
  CheckCircle2,
  Smartphone,
} from 'lucide-react-native';
import { useMediaStore } from '../store/useMediaStore';
import { useDeckStore } from '../store/useDeckStore';
import { fetchDeviceAlbums, formatBytes, fetchMediaChunk, fetchDeviceMonthGroups, groupAssetsByMonth } from '../features/media/services/mediaService';
import { GridBackground } from '../components/GridBackground';
import { TrashReviewScreen } from '../features/review/components/TrashReviewScreen';
import { DeviceAlbum, CleanScope, MonthGroup } from '../types/media';

interface HomeDashboardScreenProps {
  onStartCleaning: (scope: CleanScope) => void;
  isDemoMode?: boolean;
}

export const HomeDashboardScreen: React.FC<HomeDashboardScreenProps> = ({
  onStartCleaning,
  isDemoMode = false,
}) => {
  const {
    albums,
    monthGroups,
    assets,
    totalBytesCleaned,
    totalPhotosCleanedCount,
    setAlbums,
    setMonthGroups,
    setAssets,
    removeAssets,
    addCleanedStats,
  } = useMediaStore();

  const {
    stagedForDeletion,
    restoreFromTrash,
    confirmBatchDelete,
    resetDeck,
  } = useDeckStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState<boolean>(false);

  // Load albums, full device timeline of months, and initial chunk
  const loadDashboardData = useCallback(async () => {
    try {
      const [fetchedAlbums, fetchedMonths, chunk] = await Promise.all([
        fetchDeviceAlbums(isDemoMode),
        fetchDeviceMonthGroups(isDemoMode),
        fetchMediaChunk(undefined, 50, isDemoMode),
      ]);

      setAlbums(fetchedAlbums);
      setMonthGroups(
        fetchedMonths.length > 0 ? fetchedMonths : groupAssetsByMonth(chunk.assets)
      );
      setAssets(chunk.assets);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, [isDemoMode, setAlbums, setAssets, setMonthGroups]);

  useEffect(() => {
    setIsLoading(true);
    loadDashboardData().finally(() => setIsLoading(false));
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleSelectAll = () => {
    onStartCleaning({ type: 'ALL', title: 'All Photos' });
  };

  const handleSelectAlbum = (album: DeviceAlbum) => {
    onStartCleaning({
      type: 'ALBUM',
      id: album.id,
      title: album.title,
      assetCount: album.assetCount,
    });
  };

  const handleSelectMonth = (group: MonthGroup) => {
    onStartCleaning({
      type: 'MONTH',
      id: group.id,
      title: group.title,
      year: group.year,
      month: group.month,
      count: group.count,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <GridBackground gridSize={28} gridColor="#E2E8F0" backgroundColor="#FAFAFA" />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/logo-yamin shmel.png')}
            style={styles.brandLogo}
            contentFit="contain"
          />
          <View>
            <Text style={styles.appTitle}>YaminShmel</Text>
            <Text style={styles.appSubtitle}>يمين شمال • Photo Declutter</Text>
          </View>
        </View>

        {/* Trash Bin Header Button */}
        <TouchableOpacity
          style={[styles.trashHeaderBtn, stagedForDeletion.length > 0 && styles.trashHeaderBtnActive]}
          onPress={() => setIsTrashModalOpen(true)}
          activeOpacity={0.75}
        >
          <Trash2
            size={19}
            color={stagedForDeletion.length > 0 ? '#DC2626' : '#64748B'}
            strokeWidth={2.2}
          />
          {stagedForDeletion.length > 0 && (
            <View style={styles.trashBadge}>
              <Text style={styles.trashBadgeText}>{stagedForDeletion.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Storage Cleaned Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeaderRow}>
            <View style={styles.statsIconBox}>
              <HardDrive size={18} color="#059669" strokeWidth={2.5} />
            </View>
            <Text style={styles.statsCardTitle}>Storage Freed</Text>
          </View>

          <View style={styles.statsMetricsRow}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricValue}>
                {totalBytesCleaned > 0 ? formatBytes(totalBytesCleaned) : '0 MB'}
              </Text>
              <Text style={styles.metricLabel}>Total Cleaned</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricBlock}>
              <Text style={styles.metricValue}>{totalPhotosCleanedCount}</Text>
              <Text style={styles.metricLabel}>Photos Removed</Text>
            </View>
          </View>
        </View>

        {/* Active Staged Trash Card (Prominent Callout when items are queued) */}
        {stagedForDeletion.length > 0 && (
          <TouchableOpacity
            style={styles.stagedCard}
            onPress={() => setIsTrashModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.stagedCardContent}>
              <View style={styles.stagedCardIconCircle}>
                <Trash2 size={20} color="#DC2626" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stagedCardTitle}>
                  {stagedForDeletion.length} Photo{stagedForDeletion.length > 1 ? 's' : ''} Staged in Trash
                </Text>
                <Text style={styles.stagedCardDesc}>
                  Ready for permanent native cleanup from device.
                </Text>
              </View>
            </View>
            <View style={styles.stagedCardAction}>
              <Text style={styles.stagedCardActionText}>Review & Delete →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Declutter: All Photos Card */}
        <TouchableOpacity style={styles.allPhotosCard} onPress={handleSelectAll} activeOpacity={0.85}>
          <View style={styles.allPhotosLeft}>
            <View style={styles.allPhotosIconCircle}>
              <Layers size={22} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View>
              <Text style={styles.allPhotosTitle}>All Photos</Text>
              <Text style={styles.allPhotosSubtitle}>
                {assets.length > 0 ? `Review camera roll (${assets.length} loaded)` : 'Swipe through all photos'}
              </Text>
            </View>
          </View>
          <View style={styles.allPhotosAction}>
            <Text style={styles.allPhotosActionText}>Start</Text>
            <ChevronRight size={16} color="#0F172A" />
          </View>
        </TouchableOpacity>

        {/* Clean by Album Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Folder size={16} color="#0F172A" strokeWidth={2.4} />
            <Text style={styles.sectionTitle}>Clean by Album</Text>
          </View>
          <Text style={styles.sectionCount}>{albums.length} albums</Text>
        </View>

        {isLoading && albums.length === 0 ? (
          <ActivityIndicator size="small" color="#0F172A" style={{ marginVertical: 20 }} />
        ) : albums.length === 0 ? (
          <View style={styles.emptyAlbumBox}>
            <Text style={styles.emptyAlbumText}>No device albums found.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumsScroll}
          >
            {albums.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                onPress={() => handleSelectAlbum(album)}
                activeOpacity={0.8}
              >
                {album.coverUri ? (
                  <Image source={{ uri: album.coverUri }} style={styles.albumCover} contentFit="cover" />
                ) : (
                  <View style={styles.albumPlaceholder}>
                    <Smartphone size={24} color="#94A3B8" />
                  </View>
                )}
                <View style={styles.albumInfo}>
                  <Text style={styles.albumName} numberOfLines={1}>
                    {album.title}
                  </Text>
                  <Text style={styles.albumCount}>{album.assetCount} photos</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Clean by Month Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={16} color="#0F172A" strokeWidth={2.4} />
            <Text style={styles.sectionTitle}>Clean by Month</Text>
          </View>
          <Text style={styles.sectionCount}>{monthGroups.length} periods</Text>
        </View>

        <View style={styles.monthsList}>
          {monthGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.monthRow}
              onPress={() => handleSelectMonth(group)}
              activeOpacity={0.75}
            >
              <View style={styles.monthRowLeft}>
                <View style={styles.monthIconDot} />
                <Text style={styles.monthRowTitle}>{group.title}</Text>
              </View>
              <View style={styles.monthRowRight}>
                <View style={styles.monthCountBadge}>
                  <Text style={styles.monthCountText}>{group.count} photos</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Trash Review Modal */}
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
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  appSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -1,
  },
  trashHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  trashHeaderBtnActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
  },
  trashBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  trashBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statsCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  statsMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  metricBlock: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  stagedCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  stagedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stagedCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stagedCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
  },
  stagedCardDesc: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
  },
  stagedCardAction: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  stagedCardActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  allPhotosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  allPhotosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  allPhotosIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  allPhotosTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  allPhotosSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  allPhotosAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  allPhotosActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  albumsScroll: {
    gap: 12,
    paddingBottom: 8,
    marginBottom: 16,
  },
  albumCard: {
    width: 124,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  albumCover: {
    width: '100%',
    height: 90,
    backgroundColor: '#F1F5F9',
  },
  albumPlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    padding: 8,
  },
  albumName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  albumCount: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  emptyAlbumBox: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  emptyAlbumText: {
    fontSize: 12,
    color: '#64748B',
  },
  monthsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  monthRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F172A',
    marginRight: 10,
  },
  monthRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  monthRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  monthCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontVariant: ['tabular-nums'],
  },
});
