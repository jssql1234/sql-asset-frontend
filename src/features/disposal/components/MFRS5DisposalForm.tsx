import React from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface MFRS5Asset {
  assetId: string;
  qty: number;
  originalCost: number;
  qualifyingExpenditure: number;
  residualExpenditure: number;
  totalCAClaimed: number;
  acquireDate: string;
  disposalValue: number;
}

interface MFRS5DisposalFormProps {
  assets: MFRS5Asset[];
  commonData: {
    disposalDate: string;
    recipient: string;
    isAssetScrapped: boolean;
  };
  onAssetChange: (index: number, field: keyof MFRS5Asset, value: string | number) => void;
  onCommonDataChange: (field: string, value: string | boolean) => void;
  onAddAsset: () => void;
  onRemoveAsset: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
}

const MFRS5DisposalForm: React.FC<MFRS5DisposalFormProps> = ({
  assets,
  commonData,
  onAssetChange,
  onCommonDataChange,
  onAddAsset,
  onRemoveAsset,
  onNext,
  onPrevious,
  readOnly = false,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateClawbackRisk = (acquireDate: string, disposalDate: string): boolean => {
    const acquire = new Date(acquireDate);
    const disposal = new Date(disposalDate);
    const yearsDiff = (disposal.getTime() - acquire.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return yearsDiff < 2;
  };

  const handleAssetInputChange = (index: number, field: keyof MFRS5Asset) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onAssetChange(index, field, value);
    };

  const handleCommonInputChange = (field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      onCommonDataChange(field, value);
    };

  return (
    <Card className="space-y-6">
      <div className="border-b border-outlineVariant pb-4">
        <h3 className="text-lg font-semibold text-onSurface">MFRS 5 Held-for-Sale Disposal</h3>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-blue-800 text-sm">
          <strong>MFRS 5 Disposal:</strong> Assets classified as held-for-sale. Clawback provisions may apply for assets acquired within 2 years.
        </div>
      </div>

      {/* Common Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="mfrs5-disposal-date" className="block text-sm font-medium text-onSurface">
            Disposal Date <span className="text-error">*</span>
          </label>
          <Input
            id="mfrs5-disposal-date"
            type="date"
            value={commonData.disposalDate}
            onChange={handleCommonInputChange('disposalDate')}
            disabled={readOnly}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mfrs5-recipient" className="block text-sm font-medium text-onSurface">
            Recipient
          </label>
          <Input
            id="mfrs5-recipient"
            type="text"
            placeholder="Recipient name"
            value={commonData.recipient}
            onChange={handleCommonInputChange('recipient')}
            disabled={readOnly}
          />
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="mfrs5-asset-scrapped"
            checked={commonData.isAssetScrapped}
            onChange={handleCommonInputChange('isAssetScrapped')}
            disabled={readOnly}
            className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
          />
          <label htmlFor="mfrs5-asset-scrapped" className="text-sm text-onSurface">
            Asset Scrapped (Value = 0)
          </label>
        </div>
      </div>

      {/* Assets Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-onSurface">Assets for Disposal</h4>
          {!readOnly && (
            <Button
              variant="outline"
              onClick={onAddAsset}
              className="text-sm"
            >
              Add Asset
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-outlineVariant rounded-md">
            <thead className="bg-surfaceContainer">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Asset ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Disposal Value
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Original Cost
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Acquire Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Status
                </th>
                {!readOnly && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => {
                const hasClawbackRisk = calculateClawbackRisk(asset.acquireDate, commonData.disposalDate);
                
                return (
                  <tr key={index} className="border-b border-outlineVariant">
                    <td className="px-4 py-3">
                      <Input
                        type="text"
                        value={asset.assetId}
                        disabled={true}
                        className="w-full min-w-32 bg-gray-100 cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={asset.qty}
                        onChange={handleAssetInputChange(index, 'qty')}
                        disabled={readOnly}
                        className="w-full min-w-20"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={asset.disposalValue}
                        onChange={handleAssetInputChange(index, 'disposalValue')}
                        disabled={readOnly || commonData.isAssetScrapped}
                        className="w-full min-w-32"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={asset.originalCost}
                        onChange={handleAssetInputChange(index, 'originalCost')}
                        disabled={true}
                        className="w-full min-w-32 bg-gray-100 cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="date"
                        value={asset.acquireDate}
                        onChange={handleAssetInputChange(index, 'acquireDate')}
                        disabled={true}
                        className="w-full min-w-36 bg-gray-100 cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {hasClawbackRisk ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Clawback Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          No Clawback
                        </span>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-3">
                        {assets.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemoveAsset(index)}
                            className="text-xs"
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clawback Warning */}
      {assets.some(asset => calculateClawbackRisk(asset.acquireDate, commonData.disposalDate)) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">
            <strong>Clawback Warning:</strong> One or more assets were acquired within 2 years of disposal date. 
            Capital allowances may be subject to clawback provisions.
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surfaceContainer p-4 rounded-md">
        <h4 className="font-medium text-onSurface mb-2">Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-onSurface">Total Assets: </span>
            <span className="font-semibold">{assets.length}</span>
          </div>
          <div>
            <span className="text-onSurface">Total Disposal Value: </span>
            <span className="font-semibold">
              {formatCurrency(assets.reduce((sum, asset) => sum + (asset.disposalValue || 0), 0))}
            </span>
          </div>
          <div>
            <span className="text-onSurface">Assets with Clawback Risk: </span>
            <span className="font-semibold text-error">
              {assets.filter(asset => calculateClawbackRisk(asset.acquireDate, commonData.disposalDate)).length}
            </span>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="min-w-24"
          >
            Previous
          </Button>
          <Button
            onClick={onNext}
            className="min-w-24"
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MFRS5DisposalForm;
