import type { Asset } from "@/types/asset";
import { mockAssets } from "../assetMockData";

export const fetchAssetList = (): Asset[] => {
  // Mock implementation
  return [...mockAssets];
};

export const createAsset = (payload: Asset): void => {
  // Mock implementation: add to mock data
  mockAssets.push(payload);
};

export const updateAsset = (payload: Asset): void => {
  // Mock implementation: update in mock data
  const index = mockAssets.findIndex(asset => asset.id === payload.id);
  if (index !== -1) {
    mockAssets[index] = payload;
  }
};

export const deleteAsset = (id: string): void => {
  const index = mockAssets.findIndex(asset => asset.id === id);
  if (index !== -1) {
    mockAssets.splice(index, 1);
  }
};

// Batch-related functions
export const fetchBatchAssets = (batchId: string): Asset[] => {
  return mockAssets.filter(asset => asset.batchId === batchId);
};

export const getBatchQuantity = (batchId: string): number => {
  const assets = fetchBatchAssets(batchId);
  return assets.length;
};

export const bulkUpdateAssetBatchId = (assetIds: string[], newBatchId: string | null): void => {
  assetIds.forEach(id => {
    const asset = mockAssets.find(a => a.id === id);
    if (asset) {
      asset.batchId = newBatchId ?? '';
    }
  });
};

export const bulkUpdateAssets = (updates: ({ id: string } & Partial<Asset>)[]): void => {
  updates.forEach(({ id, ...partial }) => {
    const asset = mockAssets.find(a => a.id === id);
    if (asset) {
      Object.assign(asset, partial);
    }
  });
};

export const createMultipleAssets = (assets: Asset[]): void => {
  mockAssets.push(...assets);
};