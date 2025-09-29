import React, { useState } from 'react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/components/Button';
import { Input } from '@/components/ui/components/Input';
import type { WorkRequestAsset, AssetSearchResult } from '@/types/work-request';

interface AssetSelectorProps {
  selectedAssets: WorkRequestAsset[];
  onAssetSelect: (asset: AssetSearchResult) => void;
  onAssetRemove: (assetCode: string) => void;
  onClearAll: () => void;
  className?: string;
  disabled?: boolean;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAssets,
  onAssetSelect,
  onAssetRemove,
  onClearAll,
  className,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [assetData, setAssetData] = useState<AssetSearchResult[]>([]);

  // Load asset data on component mount
  React.useEffect(() => {
    try {
      const savedAssetData = localStorage.getItem('assetData');
      if (savedAssetData) {
        const parsed = JSON.parse(savedAssetData);
        setAssetData(parsed.assets || []);
      } else {
        // Handle case where no asset data exists
        console.error('No asset data found in localStorage.');
      }
    } catch (error) {
      console.error('Error loading asset data:', error);
      setAssetData([]);
    }
  }, []);

  const filteredAssets = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    return assetData.filter(asset => {
      const isAlreadySelected = selectedAssets.some(selected => 
        selected.main.code === asset.main.code
      );
      if (isAlreadySelected) return false;

      return (
        asset.main.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.main.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.main.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }).slice(0, 10);
  }, [assetData, selectedAssets, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length >= 2);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleAssetSelect = (asset: AssetSearchResult) => {
    onAssetSelect(asset);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleClickOutside = React.useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.asset-search-container')) {
      setShowDropdown(false);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Asset Search */}
      <div className="space-y-2">
        <div className="flex gap-4">
          <div className="flex-1 relative asset-search-container">
            <label className="block text-sm font-medium text-onSurface mb-2">
              Search Assets
            </label>
            <Input
              type="text"
              placeholder="Search asset by name or ID"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              disabled={disabled}
              className="w-full"
            />
            
            {/* Asset Dropdown */}
            {showDropdown && filteredAssets.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md max-h-48 overflow-y-auto z-50 shadow-lg">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.main.code}
                    type="button"
                    onClick={() => handleAssetSelect(asset)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 text-sm transition-colors cursor-pointer"
                  >
                    <div className="font-medium text-gray-900">
                      {asset.main.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {asset.main.code} | {asset.main.description || 'No description'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-end">
            <Button
              type="button"
              variant="destructive"
              onClick={onClearAll}
              disabled={disabled || selectedAssets.length === 0}
              className="whitespace-nowrap"
            >
              Clear All Assets
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Assets Display */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-onSurface">
          Selected Assets
        </label>
        <div className="min-h-[80px] border border-outlineVariant rounded-md p-3 bg-surfaceContainerLowest">
          {selectedAssets.length === 0 ? (
            <span className="text-onSurfaceVariant italic text-sm">
              No assets selected. Use the search above to add assets.
            </span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedAssets.map((asset) => (
                <div
                  key={asset.main.code}
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>{asset.main.code}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => onAssetRemove(asset.main.code)}
                      className="w-4 h-4 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-content text-white text-xs transition-colors"
                      aria-label={`Remove ${asset.main.code}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};