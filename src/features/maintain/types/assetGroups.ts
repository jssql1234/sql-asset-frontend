export interface AssetGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface AssetGroupFormData {
  id: string;
  name: string;
  description: string;
}

export interface AssetGroupsFilters {
  searchValue: string;
}

export interface AssetGroupsState {
  assetGroups: AssetGroup[];
  filteredAssetGroups: AssetGroup[];
  selectedAssetGroupIds: string[];
  isLoading: boolean;
  filters: AssetGroupsFilters;
}

export interface AssetGroupValidationErrors {
  id?: string;
  name?: string;
}
