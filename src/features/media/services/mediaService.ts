import * as MediaLibrary from 'expo-media-library';
import { MediaAsset, MonthGroup, DeviceAlbum, CleanScope } from '../../../types/media';

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
 * Fetch list of albums present on the device.
 */
export async function fetchDeviceAlbums(isDemoMode: boolean = false): Promise<DeviceAlbum[]> {
  if (isDemoMode) {
    return [
      { id: 'demo-cam', title: 'Camera', assetCount: 8, coverUri: DEMO_SAMPLE_ASSETS[0].uri },
      { id: 'demo-screens', title: 'Screenshots', assetCount: 4, coverUri: DEMO_SAMPLE_ASSETS[1].uri },
      { id: 'demo-trips', title: 'Travel & Trips', assetCount: 6, coverUri: DEMO_SAMPLE_ASSETS[2].uri },
    ];
  }

  try {
    const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    const nonEmpty = albums.filter((a) => a.assetCount > 0).sort((a, b) => b.assetCount - a.assetCount);

    const result: DeviceAlbum[] = await Promise.all(
      nonEmpty.map(async (alb) => {
        let coverUri: string | undefined;
        try {
          const sample = await MediaLibrary.getAssetsAsync({
            album: alb.id,
            first: 1,
            mediaType: [MediaLibrary.MediaType.photo],
          });
          if (sample.assets.length > 0) {
            coverUri = sample.assets[0].uri;
          }
        } catch {
          // ignore thumbnail cover error
        }
        return {
          id: alb.id,
          title: alb.title,
          assetCount: alb.assetCount,
          type: alb.type,
          coverUri,
        };
      })
    );

    return result;
  } catch (error) {
    console.error('Error fetching device albums:', error);
    return [];
  }
}

/**
 * Fetch photo assets from device camera roll or demo pool with optional scope filtering.
 */
export async function fetchMediaChunk(
  after?: string,
  limit: number = CHUNK_SIZE,
  isDemoMode: boolean = false,
  scope?: CleanScope
): Promise<{ assets: MediaAsset[]; hasNextPage: boolean; endCursor?: string }> {
  if (isDemoMode) {
    let filtered = DEMO_SAMPLE_ASSETS;
    if (scope && scope.type === 'MONTH') {
      filtered = DEMO_SAMPLE_ASSETS.filter((a) => {
        const d = new Date(a.creationTime);
        return d.getFullYear() === scope.year && d.getMonth() === scope.month;
      });
    }
    return {
      assets: filtered.length > 0 ? filtered : DEMO_SAMPLE_ASSETS,
      hasNextPage: false,
      endCursor: undefined,
    };
  }

  try {
    const queryOptions: MediaLibrary.AssetsOptions = {
      mediaType: [MediaLibrary.MediaType.photo],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
      first: limit,
      after: after,
    };

    if (scope) {
      if (scope.type === 'ALBUM') {
        queryOptions.album = scope.id;
      } else if (scope.type === 'MONTH') {
        const startOfMonth = new Date(scope.year, scope.month, 1, 0, 0, 0).getTime();
        const endOfMonth = new Date(scope.year, scope.month + 1, 0, 23, 59, 59, 999).getTime();
        queryOptions.createdAfter = startOfMonth;
        queryOptions.createdBefore = endOfMonth;
      }
    }

    const page = await MediaLibrary.getAssetsAsync(queryOptions);

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
      albumId: asset.albumId,
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
    console.error('Native batch delete failed in MediaLibrary:', error);
    throw error;
  }
}

/**
 * Discover and compute all months that contain photos on the device.
 */
export async function fetchDeviceMonthGroups(isDemoMode: boolean = false): Promise<MonthGroup[]> {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isDemoMode) {
    const now = new Date(2026, 7, 24); // Aug 2026 base
    const demoGroups: MonthGroup[] = [];
    const sampleCounts = [28, 45, 62, 19, 34, 88, 51, 23, 40, 15, 76, 32];
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const id = `${y}-${String(m + 1).padStart(2, '0')}`;
      demoGroups.push({
        id,
        title: `${monthNames[m]} ${y}`,
        year: y,
        month: m,
        count: sampleCounts[i % sampleCounts.length],
        assets: [],
      });
    }
    return demoGroups;
  }

  try {
    const [newestRes, oldestRes] = await Promise.all([
      MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo],
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: 1,
      }),
      MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo],
        sortBy: [[MediaLibrary.SortBy.creationTime, true]],
        first: 1,
      }),
    ]);

    if (!newestRes.assets.length || !oldestRes.assets.length) {
      return [];
    }

    const newestTime = newestRes.assets[0].creationTime;
    let oldestTime = oldestRes.assets[0].creationTime;

    const newestDate = new Date(newestTime);
    let oldestDate = new Date(oldestTime);

    // Sanity check: prevent invalid/corrupted timestamps (e.g. Unix epoch 1970) from creating hundreds of empty months
    const minSensibleYear = Math.max(oldestDate.getFullYear(), 2016);
    if (oldestDate.getFullYear() < minSensibleYear) {
      oldestDate = new Date(minSensibleYear, 0, 1);
    }

    interface MonthCandidate {
      year: number;
      month: number;
      id: string;
      title: string;
      start: number;
      end: number;
    }

    const candidates: MonthCandidate[] = [];
    let curYear = newestDate.getFullYear();
    let curMonth = newestDate.getMonth();

    const endYear = oldestDate.getFullYear();
    const endMonth = oldestDate.getMonth();

    while (curYear > endYear || (curYear === endYear && curMonth >= endMonth)) {
      const start = new Date(curYear, curMonth, 1, 0, 0, 0).getTime();
      const end = new Date(curYear, curMonth + 1, 0, 23, 59, 59, 999).getTime();
      const id = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;
      const title = `${monthNames[curMonth]} ${curYear}`;

      candidates.push({ year: curYear, month: curMonth, id, title, start, end });

      curMonth--;
      if (curMonth < 0) {
        curMonth = 11;
        curYear--;
      }
    }

    // Cap candidate months to 48 months (4 years) to keep execution snappy
    const querySlice = candidates.slice(0, 48);
    const BATCH_SIZE = 8;
    const groups: MonthGroup[] = [];

    for (let i = 0; i < querySlice.length; i += BATCH_SIZE) {
      const batch = querySlice.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (c) => {
          try {
            const page = await MediaLibrary.getAssetsAsync({
              mediaType: [MediaLibrary.MediaType.photo],
              createdAfter: c.start,
              createdBefore: c.end,
              first: 1,
            });
            return {
              candidate: c,
              count: page.totalCount || page.assets.length,
            };
          } catch {
            return { candidate: c, count: 0 };
          }
        })
      );

      for (const res of batchResults) {
        if (res.count > 0) {
          groups.push({
            id: res.candidate.id,
            title: res.candidate.title,
            year: res.candidate.year,
            month: res.candidate.month,
            count: res.count,
            assets: [],
          });
        }
      }
    }

    return groups;
  } catch (error) {
    console.error('Error discovering device month groups:', error);
    return [];
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
