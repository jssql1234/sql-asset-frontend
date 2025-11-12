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


