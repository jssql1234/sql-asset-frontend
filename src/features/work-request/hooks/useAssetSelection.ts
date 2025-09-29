import { useState, useEffect, useCallback } from 'react';
import type { WorkRequestAsset, AssetSearchResult } from '@/types/work-request';

interface UseAssetSelectionProps {
  onAssetChange?: (assets: WorkRequestAsset[]) => void;
}

export const useAssetSelection = ({ onAssetChange }: UseAssetSelectionProps = {}) => {
  const [selectedAssets, setSelectedAssets] = useState<WorkRequestAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [assetData, setAssetData] = useState<AssetSearchResult[]>([]);

  // Load asset data from localStorage
  useEffect(() => {
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

  // Notify parent when assets change
  useEffect(() => {
    onAssetChange?.(selectedAssets);
  }, [selectedAssets, onAssetChange]);

  const filteredAssets = assetData.filter(asset => {
    const isAlreadySelected = selectedAssets.some(selected => 
      selected.main.code === asset.main.code
    );
    if (isAlreadySelected) return false;

    if (!searchTerm) return false;

    return (
      asset.main.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.main.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.main.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).slice(0, 10); // Limit to 10 items

  const selectAsset = useCallback((asset: AssetSearchResult) => {
    setSelectedAssets(prev => [...prev, asset]);
    setSearchTerm('');
    setShowDropdown(false);
  }, []);

  const removeAsset = useCallback((assetCode: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.main.code !== assetCode));
  }, []);

  const clearSelectedAssets = useCallback(() => {
    setSelectedAssets([]);
    setSearchTerm('');
    setShowDropdown(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length >= 2);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchTerm.length >= 2) {
      setShowDropdown(true);
    }
  }, [searchTerm]);

  const hideDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return {
    selectedAssets,
    searchTerm,
    showDropdown,
    filteredAssets,
    selectAsset,
    removeAsset,
    clearSelectedAssets,
    handleSearchChange,
    handleSearchFocus,
    hideDropdown,
    setSelectedAssets,
  };
};