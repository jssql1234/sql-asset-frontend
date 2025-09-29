import React from 'react';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface DisposalTypeSelectorProps {
  selectedDisposalType: string;
  onDisposalTypeChange: (disposalType: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
  showPrevious?: boolean;
}

const DisposalTypeSelector: React.FC<DisposalTypeSelectorProps> = ({
  selectedDisposalType,
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

  const isNextDisabled = !selectedDisposalType;

  return (
    <Card className="space-y-6">
      <div className="border-b border-outline pb-4">
        <h3 className="text-lg font-semibold text-onBackground">Disposal Type</h3>
        <p className="text-onSurface mt-1">Select the type of asset disposal</p>
      </div>

      <div className="space-y-4">
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
              <span className="text-onBackground text-sm">{type.label}</span>
            </label>
          ))}
        </div>
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
