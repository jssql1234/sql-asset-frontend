import React, { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import SerialNumberGenerationModal from "./SerialNumberGenerationModal.tsx";

interface SerialNumberData {
  serial: string;
  remark: string;
}

interface SerialNumberTabProps {
  quantity: number;
  quantityPerUnit?: number;
  isBatchMode?: boolean;
  serialNumbers?: SerialNumberData[];
  onSerialNumbersChange?: (serialNumbers: SerialNumberData[]) => void;
}

export const SerialNumberTab: React.FC<SerialNumberTabProps> = ({
  quantity,
  quantityPerUnit = 1,
  isBatchMode = false,
  serialNumbers = [],
  onSerialNumbersChange,
}) => {
  const [serialData, setSerialData] = useState<SerialNumberData[]>([]);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);

  // Initialize serial data based on quantity
  useEffect(() => {
    const totalSerialFields = isBatchMode
      ? quantity * quantityPerUnit
      : quantity;

    // Initialize or expand serial data array
    const newSerialData = [...serialData];
    while (newSerialData.length < totalSerialFields) {
      newSerialData.push({ serial: '', remark: '' });
    }

    // Update existing data if provided
    if (serialNumbers.length > 0) {
      serialNumbers.forEach((item, index) => {
        if (newSerialData[index]) {
          newSerialData[index] = { ...item };
        }
      });
    }

    setSerialData(newSerialData);
  }, [quantity, quantityPerUnit, isBatchMode, serialNumbers]);

  // Notify parent of changes
  useEffect(() => {
    onSerialNumbersChange?.(serialData);
  }, [serialData, onSerialNumbersChange]);

  const updateSerialNumber = (index: number, field: 'serial' | 'remark', value: string) => {
    const updated = [...serialData];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setSerialData(updated);
    }
  };

  const getNextAvailableSerialNumber = (format = 'SN-%.5d'): number => {
    const existingNumbers: number[] = [];

    serialData.forEach(item => {
      if (item.serial) {
        // Extract number from serial number based on format pattern
        const formatRegex = format.replace(/%.(\d+)d/g, '(\\d+)');
        const regex = new RegExp(formatRegex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\(\\\\d\\+\\)', '(\\d+)'));
        const match = item.serial.match(regex);
        if (match && match[1]) {
          existingNumbers.push(parseInt(match[1]));
        }
      }
    });

    if (existingNumbers.length === 0) {
      return 1;
    }

    existingNumbers.sort((a, b) => a - b);
    let nextNumber = 1;

    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else if (num > nextNumber) {
        break;
      }
    }

    return nextNumber;
  };


  const generateSerialNumbers = (count: number, format: string, nextNumber: number) => {
    const emptyFields = serialData
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.serial.trim())
      .slice(0, count);

    let counter = nextNumber;

    emptyFields.forEach(({ index }) => {
      const serialNumber = format.replace(/%.(\d+)d/g, (_, digits) => {
        const num = counter++;
        return String(num).padStart(parseInt(digits), '0');
      });

      updateSerialNumber(index, 'serial', serialNumber);
    });
  };

  const getEmptySerialFieldsCount = (): number => {
    return serialData.filter(item => !item.serial.trim()).length;
  };

  if (isBatchMode) {
    return (
      <Card className="p-6 shadow-sm">
        <BatchModeSerialNumbers
          quantity={quantity}
          quantityPerUnit={quantityPerUnit}
          serialData={serialData}
          onUpdateSerialNumber={updateSerialNumber}
          onGenerateClick={() => setIsGenerationModalOpen(true)}
        />
        <SerialNumberGenerationModal
          isOpen={isGenerationModalOpen}
          onClose={() => setIsGenerationModalOpen(false)}
          emptyFieldsCount={getEmptySerialFieldsCount()}
          nextAvailableNumber={getNextAvailableSerialNumber()}
          onGenerate={generateSerialNumbers}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <label className="body-medium text-onSurface">Serial Numbers</label>
        <Button
          type="button"
          onClick={() => setIsGenerationModalOpen(true)}
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Generate SN
        </Button>
      </div>

      <div className="space-y-3">
        {serialData.length === 0 && (
          <p className="body-small text-onSurfaceVariant text-center py-8">
            No serial numbers to display. Adjust quantity to add serial number fields.
          </p>
        )}

        {serialData.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-onSurfaceVariant">#</span>
              <Input
                value={item.serial}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSerialNumber(index, 'serial', e.target.value)}
                placeholder={`Serial number ${index + 1}`}
                className="pl-8"
              />
            </div>
            <Input
              value={item.remark}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSerialNumber(index, 'remark', e.target.value)}
              placeholder="Enter remark"
            />
          </div>
        ))}
      </div>

      <SerialNumberGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        emptyFieldsCount={getEmptySerialFieldsCount()}
        nextAvailableNumber={getNextAvailableSerialNumber()}
        onGenerate={generateSerialNumbers}
      />
    </Card>
  );
};

// Batch Mode Component
interface BatchModeSerialNumbersProps {
  quantity: number;
  quantityPerUnit: number;
  serialData: SerialNumberData[];
  onUpdateSerialNumber: (index: number, field: 'serial' | 'remark', value: string) => void;
  onGenerateClick: () => void;
}

const BatchModeSerialNumbers: React.FC<BatchModeSerialNumbersProps> = ({
  quantity,
  quantityPerUnit,
  serialData,
  onUpdateSerialNumber,
  onGenerateClick,
}) => {
  const generateAssetIDs = (): string[] => {
    // Generate asset IDs similar to the sub-window.js logic
    const assetIDs: string[] = [];
    for (let i = 0; i < quantity; i++) {
      assetIDs.push(`AS-${String(i + 1).padStart(4, '0')}`);
    }
    return assetIDs;
  };

  const assetIDs = generateAssetIDs();
  let serialCounter = 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="body-medium text-onSurface">Serial Numbers (Batch Mode)</label>
        <Button
          type="button"
          onClick={onGenerateClick}
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Generate SN
        </Button>
      </div>

      <div className="space-y-6">
        {assetIDs.map((assetID, assetIndex) => {
          const assetSerialData = [];
          for (let i = 0; i < quantityPerUnit && serialCounter < serialData.length; i++) {
            assetSerialData.push(serialData[serialCounter]);
            serialCounter++;
          }

          const filledCount = assetSerialData.filter(item => item.serial.trim()).length;
          const emptyCount = assetSerialData.filter(item => !item.serial.trim()).length;

          return (
            <div key={assetIndex} className="border border-outline rounded-lg p-4 bg-surface">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline">
                <div className="flex items-center gap-3">
                  <span className="label-medium text-onSurface">Asset ID: {assetID}</span>
                  <span className="body-small text-onSurfaceVariant">
                    {filledCount} filled, {emptyCount} empty
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onGenerateClick}
                  className="text-xs"
                >
                  Generate <span>{emptyCount}</span>
                </Button>
              </div>

              <div className="grid gap-3">
                {assetSerialData.map((item, serialIndex) => {
                  const globalIndex = (assetIndex * quantityPerUnit) + serialIndex;
                  return (
                    <div key={serialIndex} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-onSurfaceVariant">#</span>
                        <Input
                          value={item.serial}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSerialNumber(globalIndex, 'serial', e.target.value)}
                          placeholder={`Serial number ${serialIndex + 1}`}
                          className="pl-8"
                        />
                      </div>
                      <Input
                        value={item.remark}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSerialNumber(globalIndex, 'remark', e.target.value)}
                        placeholder="Enter remark"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SerialNumberTab;
