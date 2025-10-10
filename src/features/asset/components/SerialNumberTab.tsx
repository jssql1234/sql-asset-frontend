import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { useSerialNumberValidation } from "../hooks/useSerialNumberValidation";
import SerialNumberGenerationModal from "./SerialNumberGenerationModal";

interface SerialNumberData {
  serial: string;
  remark: string;
}

const EMPTY_SERIAL_NUMBERS: SerialNumberData[] = [];

interface SerialNumberTabProps {
  quantity: number;
  quantityPerUnit?: number;
  isBatchMode?: boolean;
  serialNumbers?: SerialNumberData[];
  onSerialNumbersChange?: (serialNumbers: SerialNumberData[]) => void;
}

interface SerialNumberInputRowProps {
  item: SerialNumberData;
  index: number;
  serialIndex: number;
  validation: { isValid: boolean; message: string; errors: Record<number, string> };
  onUpdate: (index: number, field: 'serial' | 'remark', value: string) => void;
}

const SerialNumberInputRow: React.FC<SerialNumberInputRowProps> = ({ item, index, serialIndex, validation, onUpdate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="relative">
      <Input
        value={item.serial}
        onChange={(e) => { onUpdate(index, 'serial', e.target.value); }}
        placeholder={`# Serial number ${String(serialIndex + 1)}`}
        className="pl-8"
      />
      {validation.errors[index] && (
        <span className="body-small text-error mt-1 block">{validation.errors[index]}</span>
      )}
    </div>
    <Input
      value={item.remark}
      onChange={(e) => { onUpdate(index, 'remark', e.target.value); }}
      placeholder="Enter remark"
    />
  </div>
);

export const SerialNumberTab: React.FC<SerialNumberTabProps> = ({
  quantity,
  quantityPerUnit = 1,
  isBatchMode = false,
  serialNumbers = EMPTY_SERIAL_NUMBERS,
  onSerialNumbersChange,
}) => {
  const [serialData, setSerialData] = useState<SerialNumberData[]>([]);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [serialFormat, setSerialFormat] = useState('SN-%.5d');
  const [startingNumber, setStartingNumber] = useState(1);
  const validation = useSerialNumberValidation(serialData);

  useEffect(() => {
    const assetsInBatch = isBatchMode ? quantity : 1;
    const totalSerialFields = assetsInBatch * quantityPerUnit;

    const newSerialData: SerialNumberData[] = [];
    for (let i = 0; i < totalSerialFields; i++) {
      if (serialNumbers[i]) {
        newSerialData.push({ ...serialNumbers[i] });
      } else {
        newSerialData.push({ serial: '', remark: '' });
      }
    }

    setSerialData(prevData => {
      if (JSON.stringify(prevData) === JSON.stringify(newSerialData)) {
        return prevData;
      }
      return newSerialData;
    });
  }, [quantity, quantityPerUnit, isBatchMode, serialNumbers]);


  useEffect(() => {
    onSerialNumbersChange?.(serialData);
  }, [onSerialNumbersChange, serialData]);

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
    const existingNumbers: number[] = [];

    serialData.forEach(item => {
      if (item.serial) {
        // Extract number from serial number based on current format pattern
        const formatRegex = serialFormat.replace(/%.(\d+)d/g, '(\\d+)');
        const regex = new RegExp(formatRegex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\(\\\\d\\+\\)', '(\\d+)'));
        const match = item.serial.match(regex);
        if (match?.[1]) {
          existingNumbers.push(parseInt(match[1]));
        }
      }
    });

    if (existingNumbers.length === 0) {
      return startingNumber;
    }

    existingNumbers.sort((a, b) => a - b);
    let nextNumber = Math.max(startingNumber, 1);

    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else if (num > nextNumber) {
        break;
      }
    }

    return nextNumber;
  }, [serialData, serialFormat, startingNumber]);


  const generateSerialNumbers = useCallback((count: number, format: string, nextNumber: number) => {
    // Update the stored format and starting number for future use
    setSerialFormat(format);
    setStartingNumber(nextNumber);

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
        const serialNumber = format.replace(/%.(\d+)d/g, (_, digits: string) => {
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

  const renderSerialNumberInputs = () => {
    const assetsInBatch = isBatchMode ? quantity : 1;
    const showGroupedView = isBatchMode || assetsInBatch > 1;

    if (showGroupedView) {
      const assetIDs = [];
      for (let i = 0; i < assetsInBatch; i++) {
        assetIDs.push(`AS-${String(i + 1).padStart(4, '0')}`);
      }

      return assetIDs.map((assetID, assetIndex) => {
        const startIndex = assetIndex * quantityPerUnit;
        const endIndex = startIndex + quantityPerUnit;
        const assetSerialData = serialData.slice(startIndex, endIndex);

        const filledCount = assetSerialData.filter(item => item.serial.trim()).length;
        const emptyCount = assetSerialData.filter(item => !item.serial.trim()).length;

        return (
          <div key={`asset-${String(assetIndex)}`} className="border border-outline rounded-lg p-4 bg-surface">
            {/* Batch mode specific: Asset header with generate button */}
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
                onClick={() => { setIsGenerationModalOpen(true); }}
                className="text-xs"
              >
                Generate <span>{emptyCount}</span>
              </Button>
            </div>

            <div className="grid gap-3">
              {assetSerialData.map((item, serialIndex) => {
                const globalIndex = startIndex + serialIndex;
                return (
                  <div key={`asset-${String(assetIndex)}-serial-${String(serialIndex)}`}>
                    <SerialNumberInputRow
                      item={item}
                      index={globalIndex}
                      serialIndex={serialIndex}
                      validation={validation}
                      onUpdate={updateSerialNumber}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      });
    } else {

      return serialData.map((item, index) => (
        <div key={`single-mode-serial-${String(index)}`}>
          <SerialNumberInputRow
            item={item}
            index={index}
            serialIndex={index}
            validation={validation}
            onUpdate={updateSerialNumber}
          />
        </div>
      ));
    }
  };

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <label className="body-medium text-onSurface">
          Serial Numbers {isBatchMode ? "(Batch Mode)" : ""}
        </label>
        <Button
          type="button"
          onClick={() => { setIsGenerationModalOpen(true); }}
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

      <div className={isBatchMode ? "space-y-6" : "space-y-3"}>
        {serialData.length === 0 && (
          <p className="body-small text-onSurfaceVariant text-center py-8">
            No serial numbers to display. Adjust quantity to add serial number fields.
          </p>
        )}

        {renderSerialNumberInputs()}
      </div>

      <SerialNumberGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => { setIsGenerationModalOpen(false); }}
        emptyFieldsCount={getEmptySerialFieldsCount}
        nextAvailableNumber={getNextAvailableSerialNumber}
        onGenerate={generateSerialNumbers}
        initialFormat={serialFormat}
        initialStartingNumber={startingNumber}
      />
    </Card>
  );
};


export default SerialNumberTab;
