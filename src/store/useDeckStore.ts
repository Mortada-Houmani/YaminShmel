import { create } from 'zustand';
import { MediaAsset, DeckAction, SwipeDirection } from '../types/media';

interface DeckState {
  currentIndex: number;
  stagedForDeletion: MediaAsset[];
  keptAssets: MediaAsset[];
  undoStack: DeckAction[];
  
  // Actions
  swipeLeft: (asset: MediaAsset) => void;
  swipeRight: (asset: MediaAsset) => void;
  undo: () => DeckAction | null;
  restoreFromTrash: (assetId: string) => void;
  confirmBatchDelete: (deletedAssetIds: string[]) => void;
  resetDeck: () => void;
  setCurrentIndex: (index: number) => void;
}

export const useDeckStore = create<DeckState>()((set, get) => ({
  currentIndex: 0,
  stagedForDeletion: [],
  keptAssets: [],
  undoStack: [],

  swipeLeft: (asset: MediaAsset) => {
    const { stagedForDeletion, undoStack, currentIndex } = get();
    
    // Check if already in staged
    const exists = stagedForDeletion.some((item) => item.id === asset.id);
    const updatedStaged = exists ? stagedForDeletion : [...stagedForDeletion, asset];
    
    const action: DeckAction = {
      assetId: asset.id,
      direction: 'left',
      timestamp: Date.now(),
      asset,
    };

    set({
      currentIndex: currentIndex + 1,
      stagedForDeletion: updatedStaged,
      undoStack: [...undoStack, action],
    });
  },

  swipeRight: (asset: MediaAsset) => {
    const { keptAssets, undoStack, currentIndex } = get();
    
    const updatedKept = keptAssets.some((item) => item.id === asset.id)
      ? keptAssets
      : [...keptAssets, asset];

    const action: DeckAction = {
      assetId: asset.id,
      direction: 'right',
      timestamp: Date.now(),
      asset,
    };

    set({
      currentIndex: currentIndex + 1,
      keptAssets: updatedKept,
      undoStack: [...undoStack, action],
    });
  },

  undo: () => {
    const { undoStack, currentIndex, stagedForDeletion, keptAssets } = get();
    if (undoStack.length === 0 || currentIndex === 0) return null;

    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    const newIndex = Math.max(0, currentIndex - 1);

    let newStaged = stagedForDeletion;
    let newKept = keptAssets;

    if (lastAction.direction === 'left') {
      newStaged = stagedForDeletion.filter((item) => item.id !== lastAction.assetId);
    } else {
      newKept = keptAssets.filter((item) => item.id !== lastAction.assetId);
    }

    set({
      currentIndex: newIndex,
      stagedForDeletion: newStaged,
      keptAssets: newKept,
      undoStack: newUndoStack,
    });

    return lastAction;
  },

  restoreFromTrash: (assetId: string) => {
    const { stagedForDeletion, keptAssets } = get();
    const targetAsset = stagedForDeletion.find((item) => item.id === assetId);
    
    if (!targetAsset) return;

    set({
      stagedForDeletion: stagedForDeletion.filter((item) => item.id !== assetId),
      keptAssets: [...keptAssets, targetAsset],
    });
  },

  confirmBatchDelete: (deletedIds: string[]) => {
    const { stagedForDeletion } = get();
    const deleteSet = new Set(deletedIds);
    set({
      stagedForDeletion: stagedForDeletion.filter((item) => !deleteSet.has(item.id)),
    });
  },

  resetDeck: () => {
    set({
      currentIndex: 0,
      undoStack: [],
    });
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },
}));
