export interface MediaAsset {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  modificationTime?: number;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  duration?: number;
  filesize?: number; // Size in bytes if available
  albumId?: string;
}

export type SwipeDirection = 'left' | 'right';

export interface DeckAction {
  assetId: string;
  direction: SwipeDirection;
  timestamp: number;
  asset: MediaAsset;
}

export interface MonthGroup {
  id: string; // e.g. "2026-08"
  title: string; // e.g. "August 2026"
  year: number;
  month: number; // 0 - 11
  count: number;
  assets: MediaAsset[];
}

export interface SessionStats {
  photosCleaned: number;
  bytesFreed: number;
  keptCount: number;
  stagedCount: number;
}
