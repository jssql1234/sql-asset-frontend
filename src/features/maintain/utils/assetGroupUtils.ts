import type { AssetGroup, AssetGroupFormData, AssetGroupsFilters, AssetGroupValidationErrors } from '../types/assetGroups';

interface StoredAssetMain {
  'asset-group'?: unknown;
}

interface StoredAssetRecord {
  main?: StoredAssetMain;
}

interface StoredAssetPayload {
  assets?: StoredAssetRecord[];
}

const isStoredAssetRecord = (value: unknown): value is StoredAssetRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const mainValue = (value as { main?: unknown }).main;
  return mainValue === undefined || (typeof mainValue === 'object' && mainValue !== null);
};

const ASSET_GROUP_ID_PREFIX = 'AG-';

export function generateAssetGroupId(existingAssetGroups: AssetGroup[]): string {
  const existingIds = existingAssetGroups
    .map(assetGroup => assetGroup.id)
    .filter(id => id.startsWith(ASSET_GROUP_ID_PREFIX))
    .map(id => parseInt(id.replace(ASSET_GROUP_ID_PREFIX, ''), 10))
    .filter(number => !Number.isNaN(number));

  let highestStoredNumber = existingIds.length > 0 ? Math.max(...existingIds) : 0;

  if (typeof window !== 'undefined') {
    try {
      const storage = window.localStorage.getItem('assetGroupsData');
      if (storage) {
        const data = JSON.parse(storage) as { assetGroups?: AssetGroup[] } | null;
        const storedIds = Array.isArray(data?.assetGroups)
          ? data.assetGroups
              .map(assetGroup => assetGroup.id)
              .filter(id => id.startsWith(ASSET_GROUP_ID_PREFIX))
              .map(id => parseInt(id.replace(ASSET_GROUP_ID_PREFIX, ''), 10))
              .filter(number => !Number.isNaN(number))
          : [];
        if (storedIds.length > 0) {
          highestStoredNumber = Math.max(highestStoredNumber, Math.max(...storedIds));
        }
      }
    } catch (error) {
      console.error('Error parsing asset groups data:', error);
    }
  }

  const nextNumber = highestStoredNumber + 1;
  return `${ASSET_GROUP_ID_PREFIX}${String(nextNumber).padStart(3, '0')}`;
}

export function formatAssetGroupDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function normalizeAssetGroupCode(code: string): string {
  return code.trim().toUpperCase();
}

export function filterAssetGroups(assetGroups: AssetGroup[], filters: AssetGroupsFilters): AssetGroup[] {
  if (!filters.searchValue) {
    return assetGroups;
  }
  
  const searchTerm = filters.searchValue.toLowerCase();
  
  return assetGroups.filter(assetGroup =>
    assetGroup.id.toLowerCase().includes(searchTerm) ||
    assetGroup.name.toLowerCase().includes(searchTerm) ||
    assetGroup.description.toLowerCase().includes(searchTerm)
  );
}

export function createAssetGroupFromForm(formData: AssetGroupFormData): AssetGroup {
  const normalizedId = normalizeAssetGroupCode(formData.id);

  return {
    id: normalizedId,
    name: formData.name.trim(),
    description: formData.description.trim(),
    createdAt: new Date().toISOString().split('T')[0]
  };
}

export function validateAssetGroupForm(formData: Partial<AssetGroupFormData>): AssetGroupValidationErrors {
  const errors: AssetGroupValidationErrors = {};
  
  if (!formData.id || formData.id.trim() === '') {
    errors.id = 'Asset group code is required';
  }
  
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Asset group name is required';
  }
  
  return errors;
}

export function getAssetCountForGroup(groupId: string): number {
  try {
    if (typeof window === 'undefined') {
      return 0;
    }

    const assetsData = window.localStorage.getItem('assetsData');
    if (!assetsData) return 0;

    const parsed = JSON.parse(assetsData) as unknown;
    const assets =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as StoredAssetPayload).assets
        : undefined;

    if (!Array.isArray(assets) || !assets.every(isStoredAssetRecord)) {
      return 0;
    }

    return assets.reduce((count, asset) => {
      const potentialGroup = asset.main?.['asset-group'];
      if (typeof potentialGroup === 'string' && potentialGroup === groupId) {
        return count + 1;
      }
      return count;
    }, 0);
  } catch (error) {
    console.error('Error getting asset count:', error);
    return 0;
  }
}
