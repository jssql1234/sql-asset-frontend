import React from 'react';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface DisposalTypeSelectorProps {
  selectedCase: 'special' | 'normal' | null;
  selectedDisposalType: string;
  onCaseChange: (caseType: 'special' | 'normal') => void;
  onDisposalTypeChange: (disposalType: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
  showPrevious?: boolean;
}

const DisposalTypeSelector: React.FC<DisposalTypeSelectorProps> = ({
  selectedCase,
  selectedDisposalType,
  onCaseChange,
  onDisposalTypeChange,
  onNext,
  onPrevious,
  disabled = false,
  showPrevious = true,
}) => {
  const disposalTypes = [
    {
      value: 'partial',
      label: 'Normal / Partial / Controlled / Written Off Disposal',
    },
    {
      value: 'mfrs5',
      label: 'MFRS 5 Held-for-Sale',
    },
    {
      value: 'gift',
      label: 'Gift to Approved Institutions',
    },
    {
      value: 'agriculture',
      label: 'Agriculture Disposal',
    },
  ];

  const handleCaseChange = (caseType: 'special' | 'normal') => {
    onCaseChange(caseType);
    // Reset disposal type when case changes
    onDisposalTypeChange('');
  };

  const isNextDisabled = !selectedCase || (selectedCase === 'normal' && !selectedDisposalType);

  return (
    <Card className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cases</h3>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="building-type"
              value="toll-road"
              checked={selectedCase === 'special'}
              onChange={() => handleCaseChange('special')}
              disabled={disabled}
              className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
            />
            <span className="text-gray-900">Special Cases</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="building-type"
              value="normal"
              checked={selectedCase === 'normal'}
              onChange={() => handleCaseChange('normal')}
              disabled={disabled}
              className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
            />
            <span className="text-gray-900">Normal Cases</span>
          </label>
        </div>

        {selectedCase === 'normal' && (
          <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-md">
            <div className="border-b border-gray-200 pb-2">
              <h4 className="font-medium text-gray-900">Disposal Type</h4>
            </div>

            <div className="space-y-3">
              {disposalTypes.map((type) => (
                <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="disposal-type"
                    value={type.value}
                    checked={selectedDisposalType === type.value}
                    onChange={() => onDisposalTypeChange(type.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
                  />
                  <span className="text-gray-900 text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        {showPrevious ? (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={disabled}
            className="min-w-24"
          >
            Previous
          </Button>
        ) : (
          <div></div>
        )}
        <Button
          onClick={onNext}
          disabled={disabled || isNextDisabled}
          className="min-w-24"
        >
          Next
        </Button>
      </div>
    </Card>
  );
};

export default DisposalTypeSelector;
