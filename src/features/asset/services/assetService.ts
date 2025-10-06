import type { Asset } from "@/types/asset";
import { mockAssets } from "../assetMockData";

export const fetchAssetList = async (): Promise<Asset[]> => {
  // Mock implementation
  return Promise.resolve([...mockAssets]);
};

export const createAsset = async (payload: Asset): Promise<void> => {
  // Mock implementation: add to mock data
  mockAssets.push(payload);
};
