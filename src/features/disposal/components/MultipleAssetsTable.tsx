import React from 'react';
import { Button } from '@/components/ui/components';
import { Input } from '@/components/ui/components/Input';

interface AssetData {
  id: string;
  assetId: string;
  qty: number;
  disposalValue: number;
  originalCost: number;
  qualifyingExpenditure: number;
  residualExpenditure: number;
  totalCAClaimed: number;
  acquireDate: string;
  recipient?: string;
}

interface MultipleAssetsTableProps {
  assets: AssetData[];
  disposalType: 'mfrs5' | 'partial' | 'normal';
  onAssetChange: (id: string, field: keyof AssetData, value: string | number) => void;
  onAddAsset: () => void;
  onRemoveAsset: (id: string) => void;
  availableAssetIds: string[];
  readOnly?: boolean;
  showCalculations?: boolean;
}

interface ColumnConfig {
  key: string;
  label: string;
  width: string;
}

const MultipleAssetsTable: React.FC<MultipleAssetsTableProps> = ({
  assets,
  disposalType,
  onAssetChange,
  onAddAsset,
  onRemoveAsset,
  availableAssetIds,
  readOnly = false,
  showCalculations = false,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleInputChange = (id: string, field: keyof AssetData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onAssetChange(id, field, value);
    };

  const calculateClawbackRisk = (acquireDate: string): boolean => {
    const acquire = new Date(acquireDate);
    const today = new Date();
    const yearsDiff = (today.getTime() - acquire.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return yearsDiff < 2;
  };

  const getColumns = () => {
    const baseColumns = [
      { key: 'assetId', label: 'Asset ID', width: 'w-32' },
      { key: 'qty', label: 'Qty', width: 'w-20' },
      { key: 'disposalValue', label: 'Disposal Value', width: 'w-36' },
      { key: 'originalCost', label: 'Original Cost', width: 'w-36' },
    ];

    if (disposalType === 'partial') {
      baseColumns.push(
        { key: 'qualifyingExpenditure', label: 'QE', width: 'w-36' },
        { key: 'residualExpenditure', label: 'RE', width: 'w-36' },
      );
    }

    baseColumns.push(
      { key: 'acquireDate', label: 'Acquire Date', width: 'w-40' },
      { key: 'recipient', label: 'Recipient', width: 'w-36' },
    );

    if (disposalType === 'mfrs5') {
      baseColumns.push({ key: 'status', label: 'Status', width: 'w-32' });
    }

    if (!readOnly) {
      baseColumns.push({ key: 'actions', label: 'Actions', width: 'w-24' });
    }

    return baseColumns;
  };

  const renderCell = (asset: AssetData, column: ColumnConfig) => {
    const isReadOnlyField = ['assetId', 'originalCost', 'qualifyingExpenditure', 'residualExpenditure', 'totalCAClaimed', 'acquireDate'].includes(column.key);
    
    switch (column.key) {
      case 'assetId':
        return (
          <Input
            type="text"
            value={asset.assetId}
            disabled={true}
            className="w-full bg-gray-100 cursor-not-allowed"
          />
        );
      
      case 'status': {
        const hasClawbackRisk = calculateClawbackRisk(asset.acquireDate);
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            hasClawbackRisk 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {hasClawbackRisk ? 'Clawback Risk' : 'No Clawback'}
          </span>
        );
      }
      case 'actions':
        return assets.length > 1 ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemoveAsset(asset.id)}
            className="text-xs"
          >
            Remove
          </Button>
        ) : null;
      
      default: {
        const value = asset[column.key as keyof AssetData];
        return (
          <Input
            type={typeof value === 'number' ? 'number' : column.key === 'acquireDate' ? 'date' : 'text'}
            value={value || ''}
            onChange={handleInputChange(asset.id, column.key as keyof AssetData)}
            disabled={readOnly || isReadOnlyField}
            className={`w-full ${isReadOnlyField ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            step={typeof value === 'number' ? '0.01' : undefined}
            placeholder={typeof value === 'number' ? '0.00' : ''}
          />
        );
      }
    }
  };

  const columns = getColumns();
  const totals = {
    disposalValue: assets.reduce((sum, asset) => sum + (asset.disposalValue || 0), 0),
    originalCost: assets.reduce((sum, asset) => sum + (asset.originalCost || 0), 0),
    qualifyingExpenditure: assets.reduce((sum, asset) => sum + (asset.qualifyingExpenditure || 0), 0),
    residualExpenditure: assets.reduce((sum, asset) => sum + (asset.residualExpenditure || 0), 0),
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-onSurface">
          {disposalType === 'mfrs5' ? 'MFRS 5 Assets' : 'Assets for Disposal'}
        </h4>
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

      <div className="overflow-x-auto border border-outlineVariant rounded-md">
        <table className="w-full">
          <thead className="bg-surfaceContainer">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant ${column.width}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-outlineVariant hover:bg-surfaceContainer/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3">
                    {renderCell(asset, column)}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Totals Row */}
            {showCalculations && assets.length > 1 && (
              <tr className="bg-surfaceContainer border-t-2 border-primary font-semibold">
                <td className="px-3 py-3 text-sm text-onSurface">TOTAL</td>
                <td className="px-3 py-3 text-sm text-onSurface">
                  {assets.reduce((sum, asset) => sum + (asset.qty || 0), 0)}
                </td>
                <td className="px-3 py-3 text-sm text-primary">
                  {formatCurrency(totals.disposalValue)}
                </td>
                <td className="px-3 py-3 text-sm text-onSurface">
                  {formatCurrency(totals.originalCost)}
                </td>
                {disposalType === 'partial' && (
                  <>
                    <td className="px-3 py-3 text-sm text-onSurface">
                      {formatCurrency(totals.qualifyingExpenditure)}
                    </td>
                    <td className="px-3 py-3 text-sm text-onSurface">
                      {formatCurrency(totals.residualExpenditure)}
                    </td>
                  </>
                )}
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                {disposalType === 'mfrs5' && <td className="px-3 py-3"></td>}
                {!readOnly && <td className="px-3 py-3"></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      {showCalculations && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-surfaceContainer p-4 rounded-md">
            <div className="text-sm text-onSurface">Total Assets</div>
            <div className="text-lg font-semibold text-primary">{assets.length}</div>
          </div>
          <div className="bg-surfaceContainer p-4 rounded-md">
            <div className="text-sm text-onSurface">Total Disposal Value</div>
            <div className="text-lg font-semibold text-primary">{formatCurrency(totals.disposalValue)}</div>
          </div>
          <div className="bg-surfaceContainer p-4 rounded-md">
            <div className="text-sm text-onSurface">Total Original Cost</div>
            <div className="text-lg font-semibold text-onSurface">{formatCurrency(totals.originalCost)}</div>
          </div>
          {disposalType === 'mfrs5' && (
            <div className="bg-surfaceContainer p-4 rounded-md">
              <div className="text-sm text-onSurface">Clawback Risk Assets</div>
              <div className="text-lg font-semibold text-error">
                {assets.filter(asset => calculateClawbackRisk(asset.acquireDate)).length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultipleAssetsTable;
