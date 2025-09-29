import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';
import MultipleAssetsTable from './MultipleAssetsTable';

interface NormalDisposalFormData {
  assetId: string;
  acquireDate: string;
  disposalDate: string;
  disposalValue: number;
  recipient: string;
  isAssetScrapped: boolean;
  isControlledDisposal: boolean;
}

interface NormalDisposalFormProps {
  data: NormalDisposalFormData;
  onChange: (field: keyof NormalDisposalFormData, value: string | number | boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
}

const NormalDisposalForm: React.FC<NormalDisposalFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  readOnly = false,
}) => {
  const [localData, setLocalData] = useState(data);
  const [isMultipleAssets, setIsMultipleAssets] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleInputChange = (field: keyof NormalDisposalFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' 
        ? parseFloat(e.target.value) || 0 
        : e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value;
      
      setLocalData(prev => ({ ...prev, [field]: value }));
      onChange(field, value);
    };

  const handleCheckboxChange = (field: keyof NormalDisposalFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;
      setLocalData(prev => ({ ...prev, [field]: value }));
      onChange(field, value);
      
      // If asset is scrapped, set disposal value to 0
      if (field === 'isAssetScrapped' && value) {
        setLocalData(prev => ({ ...prev, disposalValue: 0 }));
        onChange('disposalValue', 0);
      }
    };

  const handleToggleChange = () => {
    setIsMultipleAssets(!isMultipleAssets);
  };

  return (
    <Card className="space-y-6">
      <div className="border-b border-outlineVariant pb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-onSurface">
            Normal / Partial / Controlled / Written Off Disposal
          </h3>
          
          {/* Toggle Button for Single/Multiple Assets */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-onSurface">Single Asset</span>
            <button
              type="button"
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none ${
                isMultipleAssets ? 'bg-primary' : 'bg-outlineVariant'
              }`}
              onClick={handleToggleChange}
              disabled={readOnly}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                  isMultipleAssets ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-onSurface">Multiple Assets</span>
          </div>
        </div>
      </div>

      {isMultipleAssets ? (
        /* Multiple Assets Form */
        <div className="space-y-6">
          <div className="bg-primaryContainer border border-primary rounded-md p-4">
            <div className="text-onPrimaryContainer text-sm">
              <strong>Multiple Assets Disposal:</strong> Configure disposal details for multiple assets at once.
            </div>
          </div>
          
          {/* Common disposal details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="disposal-date" className="block text-sm font-medium text-onSurface">
                Disposal Date <span className="text-error">*</span>
              </label>
              <Input
                id="disposal-date"
                type="date"
                value={localData.disposalDate}
                onChange={handleInputChange('disposalDate')}
                disabled={readOnly}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="recipient" className="block text-sm font-medium text-onSurface">
                Recipient
              </label>
              <Input
                id="recipient"
                type="text"
                placeholder="Recipient name"
                value={localData.recipient}
                onChange={handleInputChange('recipient')}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="asset-scrapped-multiple"
                checked={localData.isAssetScrapped}
                onChange={handleCheckboxChange('isAssetScrapped')}
                disabled={readOnly}
                className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
              />
              <label htmlFor="asset-scrapped-multiple" className="text-sm text-onSurface">
                Asset Scrapped (Value = 0)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="controlled-disposal-multiple"
                checked={localData.isControlledDisposal}
                onChange={handleCheckboxChange('isControlledDisposal')}
                disabled={readOnly}
                className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
              />
              <label htmlFor="controlled-disposal-multiple" className="text-sm text-onSurface">
                Controlled Disposal (≥50% control)
              </label>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t border-outline my-6" />

          {/* Multiple Assets Table */}
           <MultipleAssetsTable
             assets={[]}
             disposalType="normal"
             onAssetChange={() => {}}
             onAddAsset={() => {}}
             onRemoveAsset={() => {}}
             availableAssetIds={['AS-0001', 'AS-0002', 'AS-0004', 'AS-0005']}
             readOnly={readOnly}
           />

          {/* Warning Messages */}
          {localData.isAssetScrapped && (
            <div className="bg-warningContainer border border-warning rounded-md p-4">
              <div className="text-onWarningContainer text-sm">
                <strong>Note:</strong> Asset scrapped - disposal value is set to 0 for all assets.
              </div>
            </div>
          )}

          {localData.isControlledDisposal && (
            <div className="bg-primaryContainer border border-primary rounded-md p-4">
              <div className="text-onPrimaryContainer text-sm">
                Special rules apply for controlled disposal transactions.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Single Asset Form */
        <div className="space-y-6">
          {/* Asset Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="asset-id" className="block text-sm font-medium text-onBackground">
                Asset ID
              </label>
              <Input
                id="asset-id"
                type="text"
                value={localData.assetId}
                disabled={true}
                className="bg-surfaceContainer cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="acquire-date" className="block text-sm font-medium text-onSurface">
                Acquire Date
              </label>
              <Input
                id="acquire-date"
                type="date"
                value={localData.acquireDate}
                onChange={handleInputChange('acquireDate')}
                disabled={true}
                className="bg-surfaceContainer cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="disposal-date" className="block text-sm font-medium text-onSurface">
                Disposal Date <span className="text-error">*</span>
              </label>
              <Input
                id="disposal-date"
                type="date"
                value={localData.disposalDate}
                onChange={handleInputChange('disposalDate')}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          {/* Disposal Value and Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="disposal-value" className="block text-sm font-medium text-onSurface">
                Disposal Value <span className="text-error">*</span>
              </label>
              <Input
                id="disposal-value"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={localData.disposalValue}
                onChange={handleInputChange('disposalValue')}
                disabled={readOnly || localData.isAssetScrapped}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="recipient" className="block text-sm font-medium text-onSurface">
                Recipient
              </label>
              <Input
                id="recipient"
                type="text"
                placeholder="Recipient name"
                value={localData.recipient}
                onChange={handleInputChange('recipient')}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="asset-scrapped"
                checked={localData.isAssetScrapped}
                onChange={handleCheckboxChange('isAssetScrapped')}
                disabled={readOnly}
                className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
              />
              <label htmlFor="asset-scrapped" className="text-sm text-onSurface">
                Asset Scrapped (Value = 0)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="controlled-disposal"
                checked={localData.isControlledDisposal}
                onChange={handleCheckboxChange('isControlledDisposal')}
                disabled={readOnly}
                className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
              />
              <label htmlFor="controlled-disposal" className="text-sm text-onSurface">
                Controlled Disposal (≥50% control)
              </label>
            </div>
          </div>

          {/* Warning Messages */}
          {localData.isAssetScrapped && (
            <div className="bg-warningContainer border border-warning rounded-md p-4">
              <div className="text-onWarningContainer text-sm">
                <strong>Note:</strong> Asset scrapped - disposal value is set to 0.
              </div>
            </div>
          )}

          {localData.isControlledDisposal && (
            <div className="bg-primaryContainer border border-primary rounded-md p-4">
              <div className="text-onPrimaryContainer text-sm">
                Special rules apply for controlled disposal transactions.
              </div>
            </div>
          )}
        </div>
      )}

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

export default NormalDisposalForm;
