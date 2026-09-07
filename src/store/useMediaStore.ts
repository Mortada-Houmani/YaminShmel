import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaAsset, MonthGroup, DeviceAlbum, CleanScope } from '../types/media';

interface MediaState {
  assets: MediaAsset[];
  monthGroups: MonthGroup[];
  albums: DeviceAlbum[];
  selectedMonthId: string | 'ALL';
  activeScope: CleanScope;
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  endCursor: string | undefined;
  
  // Stats
  totalBytesCleaned: number;
  totalPhotosCleanedCount: number;
  isDemoMode: boolean;

  // Actions
  setAssets: (assets: MediaAsset[]) => void;
  appendAssets: (newAssets: MediaAsset[], hasNextPage: boolean, endCursor?: string) => void;
  removeAssets: (assetIds: string[]) => void;
  setMonthGroups: (groups: MonthGroup[]) => void;
  setAlbums: (albums: DeviceAlbum[]) => void;
  setSelectedMonth: (monthId: string | 'ALL') => void;
  setActiveScope: (scope: CleanScope) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addCleanedStats: (count: number, estimatedBytes: number) => void;
  setDemoMode: (isDemo: boolean) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      assets: [],
      monthGroups: [],
      albums: [],
      selectedMonthId: 'ALL',
      activeScope: { type: 'ALL', title: 'All Photos' },
      isLoading: false,
      error: null,
      hasNextPage: true,
      endCursor: undefined,
      totalBytesCleaned: 0,
      totalPhotosCleanedCount: 0,
      isDemoMode: false,

  setAssets: (assets) => set({ assets }),
  appendAssets: (newAssets, hasNextPage, endCursor) =>
    set((state) => ({
      assets: [...state.assets, ...newAssets],
      hasNextPage,
      endCursor,
    })),
  removeAssets: (assetIds) =>
    set((state) => {
      const deleteSet = new Set(assetIds);
      const remainingAssets = state.assets.filter((asset) => !deleteSet.has(asset.id));

      // Calculate deleted counts per month
      const deletedAssets = state.assets.filter((asset) => deleteSet.has(asset.id));
      const deletedMonthCounts = new Map<string, number>();

      deletedAssets.forEach((a) => {
        const d = new Date(a.creationTime);
        const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        deletedMonthCounts.set(id, (deletedMonthCounts.get(id) || 0) + 1);
      });

      const updatedGroups = state.monthGroups
        .map((g) => {
          const dec = deletedMonthCounts.get(g.id) || 0;
          return {
            ...g,
            count: Math.max(0, g.count - dec),
          };
        })
        .filter((g) => g.count > 0);

      return {
        assets: remainingAssets,
        monthGroups: updatedGroups,
      };
    }),
  setMonthGroups: (monthGroups) => set({ monthGroups }),
  setAlbums: (albums) => set({ albums }),
  setSelectedMonth: (selectedMonthId) => set({ selectedMonthId }),
  setActiveScope: (activeScope) => set({ activeScope }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addCleanedStats: (count, estimatedBytes) =>
    set((state) => ({
      totalPhotosCleanedCount: state.totalPhotosCleanedCount + count,
      totalBytesCleaned: state.totalBytesCleaned + estimatedBytes,
    })),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
    }),
    {
      name: 'yaminshmel-media-stats',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        totalBytesCleaned: state.totalBytesCleaned,
        totalPhotosCleanedCount: state.totalPhotosCleanedCount,
      }),
    }
  )
);
