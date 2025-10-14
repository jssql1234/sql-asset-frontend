export type AssetGroupStatus = 'Active' | 'Inactive';

export interface AssetGroup {
  id: string;
  name: string;
  description: string;
  status: AssetGroupStatus;
  createdAt: string;
}

export interface AssetGroupFormData {
  id: string;
  name: string;
  description: string;
  status: AssetGroupStatus;
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
