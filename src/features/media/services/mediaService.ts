import * as MediaLibrary from 'expo-media-library';
import { MediaAsset, MonthGroup } from '../../../types/media';

export const CHUNK_SIZE = 50;

/**
 * Fetch photo assets from device camera roll in paginated chunks.
 */
export async function fetchMediaChunk(
  after?: string,
  limit: number = CHUNK_SIZE
): Promise<{ assets: MediaAsset[]; hasNextPage: boolean; endCursor?: string }> {
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
    throw error;
  }
}

/**
 * Execute native batch deletion via MediaLibrary.
 * Triggering this presents a single native OS deletion confirmation dialog.
 */
export async function deleteBatchAssets(assetIds: string[]): Promise<boolean> {
  if (assetIds.length === 0) return true;
  try {
    const success = await MediaLibrary.deleteAssetsAsync(assetIds);
    return success;
  } catch (error) {
    console.error('Failed to delete assets in batch:', error);
    return false;
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
