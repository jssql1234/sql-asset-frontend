import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface MFRS5DisposalFormData {
  assetId: string;
  classificationDate: string;
  disposalValue: number;
  recipient: string;
}

interface MFRS5DisposalFormProps {
  data: MFRS5DisposalFormData;
  onChange: (field: keyof MFRS5DisposalFormData, value: string | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
}

const MFRS5DisposalForm: React.FC<MFRS5DisposalFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  readOnly = false,
}) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleInputChange = (field: keyof MFRS5DisposalFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      setLocalData(prev => ({ ...prev, [field]: value }));
      onChange(field, value);
    };

  return (
    <Card className="space-y-6">
      <div className="border-b border-outlineVariant pb-4">
        <h3 className="text-lg font-semibold text-onSurface">MFRS 5 Held-for-Sale</h3>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-blue-800 text-sm">
          <strong>MFRS 5 Held-for-Sale:</strong> Trigger BA BC on classification date
        </div>
      </div>

      {/* Asset Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mfrs5-asset-id" className="block text-sm font-medium text-gray-900">
            Asset ID
          </label>
          <Input
            id="mfrs5-asset-id"
            type="text"
            value={localData.assetId}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mfrs5-classification-date" className="block text-sm font-medium text-onSurface">
            Classification Date (= Disposal Date) <span className="text-error">*</span>
          </label>
          <Input
            id="mfrs5-classification-date"
            type="date"
            value={localData.classificationDate}
            onChange={handleInputChange('classificationDate')}
            disabled={readOnly}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mfrs5-disposal-value" className="block text-sm font-medium text-onSurface">
            Disposal Value <span className="text-error">*</span>
          </label>
          <Input
            id="mfrs5-disposal-value"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={localData.disposalValue}
            onChange={handleInputChange('disposalValue')}
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
            value={localData.recipient}
            onChange={handleInputChange('recipient')}
            disabled={readOnly}
          />
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
