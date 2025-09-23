import { API_URL } from "@/config";
import type { Asset } from "@/types/asset";
import type { ApiResponse } from "@/types/commonApiRes";
import { createApiClient, validateApiResponse } from "@/utils/apiHelpers";

const BASE_URL = `${API_URL}/v1`;
const apiClient = createApiClient(BASE_URL);

export const fetchAssetList = async (): Promise<Asset[]> => {
  const res = await apiClient<ApiResponse<Asset[]>>(`/asset`);
  return validateApiResponse(res, "Fetching asset info");
};

export const createAsset = async (payload: Asset): Promise<void> => {
  const res = await apiClient<ApiResponse<void>, typeof payload>("/asset", {
    method: "POST",
    payload,
  });
  return validateApiResponse(res, "Creating Asset");
};
