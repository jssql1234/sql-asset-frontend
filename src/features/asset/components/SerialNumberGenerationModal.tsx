import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";

interface SerialNumberGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  emptyFieldsCount: number;
  nextAvailableNumber: number;
  onGenerate: (count: number, format: string, nextNumber: number) => void;
}

export const SerialNumberGenerationModal: React.FC<SerialNumberGenerationModalProps> = ({
  isOpen,
  onClose,
  emptyFieldsCount,
  nextAvailableNumber,
  onGenerate,
}) => {
  const [count, setCount] = useState(emptyFieldsCount);
  const [format, setFormat] = useState('SN-%.5d');
  const [nextNumber, setNextNumber] = useState(nextAvailableNumber);
  const [previewFormat, setPreviewFormat] = useState(format);
  const [previewExample, setPreviewExample] = useState('');

  // Update preview when format or next number changes
  useEffect(() => {
    let example = format;
    if (format.includes('%.')) {
      // Handle %.Nd pattern
      example = format.replace(/%.(\d+)d/g, (_, digits) => {
        return String(nextNumber).padStart(parseInt(digits), '0');
      });
    }
    setPreviewFormat(format);
    setPreviewExample(example);
  }, [format, nextNumber]);

  // Reset count when modal opens
  useEffect(() => {
    if (isOpen) {
      setCount(emptyFieldsCount);
    }
  }, [isOpen, emptyFieldsCount]);

  const handleDecreaseCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const handleIncreaseCount = () => {
    if (count < emptyFieldsCount) {
      setCount(count + 1);
    }
  };

  const handleGenerate = () => {
    onGenerate(count, format, nextNumber);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border border-outline bg-surface">
        <DialogHeader className="space-y-2 border-b border-outline px-0 pb-4">
          <DialogTitle className="title-medium text-onSurface">
            Generate Serial Numbers
          </DialogTitle>
          <p className="body-small text-onSurfaceVariant">
            Configure the format and quantity for auto-generated serial numbers.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Count Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-onSurface">
              Quantity to Generate
            </label>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDecreaseCount}
                disabled={count <= 1}
                className="w-10 h-10 p-0"
              >
                −
              </Button>

              <div className="relative">
                <Input
                  type="number"
                  value={count}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseInt(e.target.value) || 1;
                    setCount(Math.max(1, Math.min(value, emptyFieldsCount)));
                  }}
                  min={1}
                  max={emptyFieldsCount}
                  className="w-20 text-center"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleIncreaseCount}
                disabled={count >= emptyFieldsCount}
                className="w-10 h-10 p-0"
              >
                +
              </Button>
            </div>
            <p className="text-xs text-onSurfaceVariant text-center">
              Empty fields available: {emptyFieldsCount}
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-onSurface">
              Format Pattern
            </label>
            <Input
              type="text"
              value={format}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormat(e.target.value)}
              placeholder="Enter format pattern (e.g., SN-%.5d)"
              className="font-mono"
            />
            <p className="text-xs text-onSurfaceVariant">
              Use %.Nd for zero-padded numbers (e.g., %.5d = 00001, %.3d = 001)
            </p>
          </div>

          {/* Next Number */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-onSurface">
              Starting Number
            </label>
            <Input
              type="number"
              value={nextNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNextNumber(parseInt(e.target.value) || 1)}
              min={1}
              className="w-full"
            />
            <p className="text-xs text-onSurfaceVariant">
              Starting number for the sequence
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-onSurface">
              Preview
            </label>
            <div className="p-3 bg-surfaceContainerLow rounded-md border border-outline">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-onSurfaceVariant">Format: </span>
                  <span className="font-mono text-primary">{previewFormat}</span>
                </div>
                <div className="text-sm">
                  <span className="text-onSurfaceVariant">Example: </span>
                  <span className="font-mono text-onSurface">{previewExample}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-outline bg-surface px-0 pt-4">
          <div className="flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={count <= 0 || count > emptyFieldsCount}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generate {count > 0 ? count : ''} Serial{count !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SerialNumberGenerationModal;
