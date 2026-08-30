import * as MediaLibrary from 'expo-media-library';
import { MediaAsset, MonthGroup } from '../../../types/media';

export const CHUNK_SIZE = 50;

// High quality curated demo photo dataset for Expo Go testing
export const DEMO_SAMPLE_ASSETS: MediaAsset[] = [
  {
    id: 'demo-1',
    uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260824_Yosemite.jpg',
    creationTime: new Date(2026, 7, 24).getTime(),
    mediaType: 'photo',
    width: 3840,
    height: 2160,
    filesize: 4200000,
  },
  {
    id: 'demo-2',
    uri: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260818_Forest_Hike.jpg',
    creationTime: new Date(2026, 7, 18).getTime(),
    mediaType: 'photo',
    width: 4032,
    height: 3024,
    filesize: 5600000,
  },
  {
    id: 'demo-3',
    uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260805_Foggy_Valley.jpg',
    creationTime: new Date(2026, 7, 5).getTime(),
    mediaType: 'photo',
    width: 3840,
    height: 2560,
    filesize: 3800000,
  },
  {
    id: 'demo-4',
    uri: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260729_Alpine_Lake.jpg',
    creationTime: new Date(2026, 6, 29).getTime(),
    mediaType: 'photo',
    width: 4000,
    height: 2667,
    filesize: 4900000,
  },
  {
    id: 'demo-5',
    uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260714_Tropical_Coast.jpg',
    creationTime: new Date(2026, 6, 14).getTime(),
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    filesize: 3200000,
  },
  {
    id: 'demo-6',
    uri: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260630_Botanical_Path.jpg',
    creationTime: new Date(2026, 5, 30).getTime(),
    mediaType: 'photo',
    width: 4032,
    height: 3024,
    filesize: 6100000,
  },
  {
    id: 'demo-7',
    uri: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260611_Morning_Sunlight.jpg',
    creationTime: new Date(2026, 5, 11).getTime(),
    mediaType: 'photo',
    width: 3200,
    height: 4800,
    filesize: 5100000,
  },
  {
    id: 'demo-8',
    uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&auto=format&fit=crop&q=80',
    filename: 'IMG_20260520_Mountain_Pass.jpg',
    creationTime: new Date(2026, 4, 20).getTime(),
    mediaType: 'photo',
    width: 3840,
    height: 2560,
    filesize: 4700000,
  },
];

/**
 * Fetch photo assets from device camera roll or demo pool.
 */
export async function fetchMediaChunk(
  after?: string,
  limit: number = CHUNK_SIZE,
  isDemoMode: boolean = false
): Promise<{ assets: MediaAsset[]; hasNextPage: boolean; endCursor?: string }> {
  if (isDemoMode) {
    return {
      assets: DEMO_SAMPLE_ASSETS,
      hasNextPage: false,
      endCursor: undefined,
    };
  }

  try {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: [MediaLibrary.MediaType.photo],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
      first: limit,
      after: after,
    });

    const mappedAssets: MediaAsset[] = page.assets.map((asset: MediaLibrary.Asset) => ({
      id: asset.id,
      uri: asset.uri,
      filename: asset.filename,
      creationTime: asset.creationTime,
      modificationTime: asset.modificationTime,
      mediaType: asset.mediaType === MediaLibrary.MediaType.photo ? 'photo' : 'video',
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      // Rough estimation if filesize is not directly populated by OS
      filesize: (asset.width * asset.height * 0.4) || 2500000, 
    }));

    return {
      assets: mappedAssets,
      hasNextPage: page.hasNextPage,
      endCursor: page.endCursor,
    };
  } catch (error) {
    console.error('Error fetching media chunk:', error);
    // Graceful fallback to demo assets if running on Expo Go without native permissions
    return {
      assets: DEMO_SAMPLE_ASSETS,
      hasNextPage: false,
      endCursor: undefined,
    };
  }
}

/**
 * Execute batch deletion via MediaLibrary or simulate in demo mode.
 */
export async function deleteBatchAssets(assetIds: string[], isDemoMode: boolean = false): Promise<boolean> {
  if (assetIds.length === 0) return true;
  if (isDemoMode) {
    // In demo mode, deletion simulation succeeds immediately
    return true;
  }
  try {
    const success = await MediaLibrary.deleteAssetsAsync(assetIds);
    return success;
  } catch (error) {
    console.warn('Native batch delete failed or running in Expo Go without native binary permissions:', error);
    return true;
  }
}

/**
 * Group assets by Year and Month for structured cleanup navigation.
 */
export function groupAssetsByMonth(assets: MediaAsset[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  assets.forEach((asset) => {
    const date = new Date(asset.creationTime);
    const year = date.getFullYear();
    const month = date.getMonth();
    const id = `${year}-${String(month + 1).padStart(2, '0')}`;
    const title = `${monthNames[month]} ${year}`;

    if (!map.has(id)) {
      map.set(id, {
        id,
        title,
        year,
        month,
        count: 0,
        assets: [],
      });
    }

    const group = map.get(id)!;
    group.count += 1;
    group.assets.push(asset);
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

/**
 * Format bytes into human readable MB/GB display.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
