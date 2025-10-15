import type { Asset } from "@/types/asset";
import { mockAssets } from "../assetMockData";

export const fetchAssetList = async (): Promise<Asset[]> => {
  // Mock implementation
  return Promise.resolve([...mockAssets]);
};

export const createAsset = (payload: Asset): Promise<void> => {
  // Mock implementation: add to mock data
  mockAssets.push(payload);
  return Promise.resolve();
};

export const updateAsset = (payload: Asset): Promise<void> => {
  // Mock implementation: update in mock data
  const index = mockAssets.findIndex(asset => asset.id === payload.id);
  if (index !== -1) {
    mockAssets[index] = payload;
  }
  return Promise.resolve();
};
