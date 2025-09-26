import React from 'react';
import { Button } from '@/components/ui/components';
import { Input } from '@/components/ui/components/Input';

interface AssetData {
  id: string;
  assetId: string;
  recipient: string;
  disposalValue: number;
  originalCost: number;
  disposedCost: number;
  qty: number;
}

interface MultipleAssetsTableProps {
  assets: AssetData[];
  disposalType: 'mfrs5' | 'partial' | 'normal';
  onAssetChange: (id: string, field: keyof AssetData, value: string | number) => void;
  onAddAsset: () => void;
  onRemoveAsset: (id: string) => void;
  availableAssetIds: string[];
  readOnly?: boolean;
}

const MultipleAssetsTable: React.FC<MultipleAssetsTableProps> = ({
  assets,
  disposalType,
  onAssetChange,
  onAddAsset,
  onRemoveAsset,
  availableAssetIds,
  readOnly = false,
}) => {

  const handleInputChange = (id: string, field: keyof AssetData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onAssetChange(id, field, value);
    };

  const getColumns = () => {
    if (disposalType === 'partial') {
      return [
        { key: 'assetId', label: 'Asset ID', width: 'w-32' },
        { key: 'recipient', label: 'Recipient', width: 'w-40' },
        { key: 'disposalValue', label: 'Disposal Value', width: 'w-36' },
        { key: 'originalCost', label: 'Original Cost', width: 'w-36' },
        { key: 'disposedCost', label: 'Disposed Cost', width: 'w-36' },
        { key: 'qty', label: 'QTY', width: 'w-20' },
        ...(readOnly ? [] : [{ key: 'actions', label: 'Actions', width: 'w-24' }])
      ];
    } else {
      // For MFRS5 or other types - simplified structure
      return [
        { key: 'assetId', label: 'Asset ID', width: 'w-32' },
        { key: 'recipient', label: 'Recipient', width: 'w-40' },
        { key: 'disposalValue', label: 'Disposal Value', width: 'w-36' },
        { key: 'originalCost', label: 'Original Cost', width: 'w-36' },
        { key: 'qty', label: 'QTY', width: 'w-20' },
        ...(readOnly ? [] : [{ key: 'actions', label: 'Actions', width: 'w-24' }])
      ];
    }
  };

  const renderCell = (asset: AssetData, column: { key: string; label: string; width: string }) => {
    const isReadOnlyField = ['assetId', 'originalCost'].includes(column.key);
    
    switch (column.key) {
      case 'assetId':
        return (
          <select
            value={asset.assetId}
            onChange={handleInputChange(asset.id, 'assetId')}
            disabled={readOnly || isReadOnlyField}
            className={`w-full px-2 py-1 border border-gray-300 rounded ${isReadOnlyField ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Asset</option>
            {availableAssetIds.map(assetId => (
              <option key={assetId} value={assetId}>{assetId}</option>
            ))}
          </select>
        );
      
      case 'actions':
        return assets.length > 1 ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemoveAsset(asset.id)}
            className="text-xs px-2 py-1 h-auto"
          >
            ×
          </Button>
        ) : null;
      
      default: {
        const value = asset[column.key as keyof AssetData];
        const isNumericField = ['disposalValue', 'originalCost', 'disposedCost', 'qty'].includes(column.key);
        
        return (
          <Input
            type={isNumericField ? 'number' : 'text'}
            value={value || ''}
            onChange={handleInputChange(asset.id, column.key as keyof AssetData)}
            disabled={readOnly || isReadOnlyField}
            className={`w-full ${isReadOnlyField ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            step={isNumericField ? '0.01' : undefined}
            placeholder={isNumericField ? '0.00' : column.key === 'recipient' ? 'Enter recipient' : ''}
          />
        );
      }
    }
  };

  const columns = getColumns();
  
  // Calculate totals
  const totals = {
    disposalValue: assets.reduce((sum, asset) => sum + (asset.disposalValue || 0), 0),
    originalCost: assets.reduce((sum, asset) => sum + (asset.originalCost || 0), 0),
    disposedCost: assets.reduce((sum, asset) => sum + (asset.disposedCost || 0), 0),
    qty: assets.reduce((sum, asset) => sum + (asset.qty || 0), 0),
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-onSurface">Assets for Disposal</h4>
        {!readOnly && (
          <Button
            variant="outline"
            onClick={onAddAsset}
            disabled={availableAssetIds.length === 0}
            className="text-sm"
          >
            Add Asset
          </Button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-md">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3">
                    {renderCell(asset, column)}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Totals Row */}
            {assets.length > 0 && (
              <tr className="bg-gray-100 border-t-2 border-gray-400 font-semibold">
                <td className="px-3 py-3 text-sm text-gray-700">TOTAL</td>
                <td className="px-3 py-3 text-sm text-gray-700">-</td>
                <td className="px-3 py-3 text-sm text-blue-700">
                  {totals.disposalValue.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">
                  {totals.originalCost.toFixed(2)}
                </td>
                {disposalType === 'partial' && (
                  <td className="px-3 py-3 text-sm text-gray-700">
                    {totals.disposedCost.toFixed(2)}
                  </td>
                )}
                <td className="px-3 py-3 text-sm text-gray-700">
                  {totals.qty}
                </td>
                {!readOnly && <td className="px-3 py-3"></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {assets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No assets added yet. Click "Add Asset" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MultipleAssetsTable;