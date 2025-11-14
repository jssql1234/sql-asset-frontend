import React, { useState, useMemo, useEffect } from "react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter} from "@/components/ui/components";
import { Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { DataTableExtended } from '@/components/DataTableExtended';
import { type CustomColumnDef } from '@/components/ui/utils/dataTable';
import SearchWithDropdown from '@/components/SearchWithDropdown';

interface SerialNumberItem {
  serialNumber: string;
  status: 'available' | 'disposed' | 'in-use';
  location?: string;
}

interface SerialNumberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  availableSerialNumbers: SerialNumberItem[];
  maxSelection: number;
  onConfirm: (selectedSerials: string[]) => void;
  preSelectedSerials?: string[];
}

export const SerialNumberSelectionModal: React.FC<SerialNumberSelectionModalProps> = ({
  isOpen,
  onClose,
  assetId,
  availableSerialNumbers,
  maxSelection,
  onConfirm,
  preSelectedSerials = [],
}) => {
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(
    new Set(preSelectedSerials)
  );
  const [searchValue, setSearchValue] = useState('');
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [qtyValue, setQtyValue] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedSerials(new Set(preSelectedSerials));
      setSearchValue('');
      setQtyValue(1);
    }
  }, [isOpen, assetId, preSelectedSerials]);

  // search and filter serial numbers
  const filteredSerials = useMemo(() => {
    if (!searchValue.trim()) return availableSerialNumbers;
    
    const searchLower = searchValue.toLowerCase();
    return availableSerialNumbers.filter(item =>
      item.serialNumber.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    );
  }, [availableSerialNumbers, searchValue]);

  // Convert serials to dropdown items
  const availableItems = useMemo(() => 
    availableSerialNumbers.map(s => ({
      id: s.serialNumber,
      label: s.serialNumber,
      sublabel: s.location || undefined,
    })), 
    [availableSerialNumbers]
  );

  const handleToggleSerial = (serialNumber: string) => {
    const newSelected = new Set(selectedSerials);
    if (newSelected.has(serialNumber)) {
      newSelected.delete(serialNumber);
    } else {
      if (newSelected.size < maxSelection) {
        newSelected.add(serialNumber);
      }
    }
    setSelectedSerials(newSelected);
  };

  const handleSelectAll = () => {
    const toSelect = filteredSerials.slice(0, maxSelection);
    setSelectedSerials(new Set(toSelect.map(item => item.serialNumber)));
  };
  
  const handleConfirm = () => {
    onConfirm(Array.from(selectedSerials));
    setSelectedSerials(new Set());
    onClose();
  };
  
  const handleClose = () => {
    setSelectedSerials(new Set());
    setSearchValue('');
    onClose();
  };
  
  const handleSelectByQty = () => {
    const qty = Math.min(qtyValue, maxSelection, filteredSerials.length);
    const toSelect = filteredSerials.slice(0, qty).map(item => item.serialNumber);
    setSelectedSerials(new Set(toSelect));
    setIsQtyModalOpen(false);
  };

  const columns: CustomColumnDef<SerialNumberItem>[] = useMemo(() => [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => {
        const item = row.original;
        const isSelected = selectedSerials.has(item.serialNumber);
        const isDisabled = !isSelected && selectedSerials.size >= maxSelection;
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleToggleSerial(item.serialNumber)}
            disabled={isDisabled}
            aria-label={`Select serial ${item.serialNumber}`}
            title={`Select serial ${item.serialNumber}`}
            className="w-4 h-4"
          />
        );
      },
      meta: { width: 80 }
    },
    {
      id: 'serialNumber',
      accessorKey: 'serialNumber',
      header: 'Serial Number',
      enableColumnFilter: false,
      enableSorting: false,
      cell: info => <span className="font-mono">{info.getValue<string>()}</span>,
    },
    {
      id: 'location',
      accessorKey: 'location',
      header: 'Location',
      enableSorting: false,
      cell: info => info.getValue<string>() || '-',
    },
  ], [selectedSerials, maxSelection, handleToggleSerial]);
  
  const availableCount = filteredSerials.length;
  const rangeStart = availableCount > 0 ? filteredSerials[0].serialNumber : '';
  const rangeEnd = availableCount > 0 ? filteredSerials[availableCount - 1].serialNumber : '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[600px] max-w-full flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Serial Numbers - {assetId}</DialogTitle>
          <p className="body-small text-onSurfaceVariant">
            Select up to {maxSelection} serial number{maxSelection !== 1 ? 's' : ''} for disposal
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col space-y-3 py-3 overflow-y-auto">
          <div className="px-1 flex-shrink-0">
            <SearchWithDropdown
              categories={[{ id: 'all', label: 'All' }]}
              selectedCategoryId="all"
              onCategoryChange={() => {}}
              items={availableItems}
              selectedIds={Array.from(selectedSerials)}
              onSelectionChange={(ids: string[]) => {
                const limited = ids.slice(0, maxSelection);
                setSelectedSerials(new Set(limited));
              }}
              placeholder="Search serial numbers..."
              emptyMessage="No serial numbers found"
              disable={false}
              hideSearchField={false}
              hideSelectedField={selectedSerials.size === 0}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedSerials.size >= maxSelection}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQtyModalOpen(true)}
              disabled={availableCount === 0}
            >
              Select by Qty
            </Button>
          </div>

          <div className="flex items-center justify-between px-1 pt-2 flex-shrink-0">
            {selectedSerials.size > 0 && (
              <span className="body-small text-onSurfaceVariant">
                {selectedSerials.size} of {maxSelection} selected
              </span>
            )}
            <span className="body-small text-onSurfaceVariant">
              {filteredSerials.length} total available
            </span>
          </div>

          <div className="min-h-0 max-h-75 overflow-y-auto border border-outline rounded-md flex-shrink-0">
            <DataTableExtended
              columns={columns}
              data={filteredSerials}
              showPagination={false}
              showCheckbox={false}
              enableRowClickSelection={false}
            />
          </div>
        </div>
  
        <DialogFooter>
          <div className="flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedSerials.size === 0}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={isQtyModalOpen} onOpenChange={setIsQtyModalOpen}>
        <DialogContent className="w-[400px] max-w-full">
          <DialogHeader>
            <DialogTitle>Select by Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-onSurface">How many serial numbers would you like to select?</p>
            <Input
              type="number"
              min={1}
              max={Math.min(maxSelection, availableCount)}
              value={qtyValue}
              onChange={(e) => setQtyValue(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <div className="text-sm text-onSurfaceVariant">
              <p>Available: {availableCount} serial numbers</p>
              <p>Example Range: {rangeStart} – {rangeEnd}</p>
              <p>Maximum: {Math.min(maxSelection, availableCount)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQtyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSelectByQty}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default SerialNumberSelectionModal;