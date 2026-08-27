import { create } from 'zustand';
import { MediaAsset, MonthGroup } from '../types/media';

interface MediaState {
  assets: MediaAsset[];
  monthGroups: MonthGroup[];
  selectedMonthId: string | 'ALL';
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  endCursor: string | undefined;
  
  // Stats
  totalBytesCleaned: number;
  totalPhotosCleanedCount: number;

  // Actions
  setAssets: (assets: MediaAsset[]) => void;
  appendAssets: (newAssets: MediaAsset[], hasNextPage: boolean, endCursor?: string) => void;
  setMonthGroups: (groups: MonthGroup[]) => void;
  setSelectedMonth: (monthId: string | 'ALL') => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addCleanedStats: (count: number, estimatedBytes: number) => void;
}

export const useMediaStore = create<MediaState>()((set) => ({
  assets: [],
  monthGroups: [],
  selectedMonthId: 'ALL',
  isLoading: false,
  error: null,
  hasNextPage: true,
  endCursor: undefined,
  totalBytesCleaned: 0,
  totalPhotosCleanedCount: 0,

  setAssets: (assets) => set({ assets }),
  appendAssets: (newAssets, hasNextPage, endCursor) =>
    set((state) => ({
      assets: [...state.assets, ...newAssets],
      hasNextPage,
      endCursor,
    })),
  setMonthGroups: (monthGroups) => set({ monthGroups }),
  setSelectedMonth: (selectedMonthId) => set({ selectedMonthId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addCleanedStats: (count, estimatedBytes) =>
    set((state) => ({
      totalPhotosCleanedCount: state.totalPhotosCleanedCount + count,
      totalBytesCleaned: state.totalBytesCleaned + estimatedBytes,
    })),
}));
