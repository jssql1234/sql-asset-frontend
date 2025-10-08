import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { useSerialNumberValidation } from "../hooks/useSerialNumberValidation";
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

  // Use the validation hook
  const validation = useSerialNumberValidation(serialData);

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
  }, [quantity, quantityPerUnit, isBatchMode]);

  // Notify parent of changes
  useEffect(() => {
    onSerialNumbersChange?.(serialData);
  }, [serialData, onSerialNumbersChange]);

  const updateSerialNumber = useCallback((index: number, field: 'serial' | 'remark', value: string) => {
    setSerialData(prevData => {
      const updated = [...prevData];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const getNextAvailableSerialNumber = useMemo((): number => {
    const format = 'SN-%.5d';
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
  }, [serialData]);


  const generateSerialNumbers = useCallback((count: number, format: string, nextNumber: number) => {
    setSerialData(prevData => {
      // Find empty fields
      const emptyFields = prevData
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !item.serial.trim())
        .slice(0, count);

      let counter = nextNumber;

      // Generate serial numbers and update state
      const updated = [...prevData];
      emptyFields.forEach(({ index }) => {
        const serialNumber = format.replace(/%.(\d+)d/g, (_, digits) => {
          const num = counter++;
          return String(num).padStart(parseInt(digits), '0');
        });

        if (updated[index]) {
          updated[index] = { ...updated[index], serial: serialNumber };
        }
      });

      return updated;
    });
  }, []);

  const getEmptySerialFieldsCount = useMemo((): number => {
    return serialData.filter(item => !item.serial.trim()).length;
  }, [serialData]);

  if (isBatchMode) {
    return (
      <Card className="p-6 shadow-sm">
        <BatchModeSerialNumbers
          quantity={quantity}
          quantityPerUnit={quantityPerUnit}
          serialData={serialData}
          onUpdateSerialNumber={updateSerialNumber}
          onGenerateClick={() => setIsGenerationModalOpen(true)}
          validation={validation}
        />
        <SerialNumberGenerationModal
          isOpen={isGenerationModalOpen}
          onClose={() => setIsGenerationModalOpen(false)}
          emptyFieldsCount={getEmptySerialFieldsCount}
          nextAvailableNumber={getNextAvailableSerialNumber}
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

      {!validation.isValid && validation.message && (
        <div className="mb-4 p-3 bg-errorContainer text-onErrorContainer rounded-md">
          <p className="body-small font-medium">{validation.message}</p>
        </div>
      )}

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
              {validation.errors[index] && (
                <span className="body-small text-error mt-1 block">{validation.errors[index]}</span>
              )}
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
        emptyFieldsCount={getEmptySerialFieldsCount}
        nextAvailableNumber={getNextAvailableSerialNumber}
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
  validation: { isValid: boolean; message: string; errors: Record<number, string> };
}

const BatchModeSerialNumbers: React.FC<BatchModeSerialNumbersProps> = ({
  quantity,
  quantityPerUnit,
  serialData,
  onUpdateSerialNumber,
  onGenerateClick,
  validation,
}) => {
  const assetIDs = useMemo(() => {
    // Generate asset IDs similar to the sub-window.js logic
    const ids: string[] = [];
    for (let i = 0; i < quantity; i++) {
      ids.push(`AS-${String(i + 1).padStart(4, '0')}`);
    }
    return ids;
  }, [quantity]);

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
        {!validation.isValid && validation.message && (
          <div className="p-3 bg-errorContainer text-onErrorContainer rounded-md">
            <p className="body-small font-medium">{validation.message}</p>
          </div>
        )}

        {assetIDs.map((assetID, assetIndex) => {
          const startIndex = assetIndex * quantityPerUnit;
          const endIndex = startIndex + quantityPerUnit;
          const assetSerialData = serialData.slice(startIndex, endIndex);

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
                  const globalIndex = startIndex + serialIndex;
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
                        {validation.errors[globalIndex] && (
                          <span className="body-small text-error mt-1 block">{validation.errors[globalIndex]}</span>
                        )}
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
