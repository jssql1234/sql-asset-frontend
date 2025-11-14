import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Button, Card } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { AssetRecord, RentalPayload } from "../types";

interface RentalModalProps {
  isOpen: boolean;
  assets: AssetRecord[];
  onClose: () => void;
  onSubmit: (payload: RentalPayload) => void;
}

const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  assets,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [startDate, setStartDate] = useState<string | Date | undefined>();
  const [endDate, setEndDate] = useState<string | Date | undefined>();
  const [notes, setNotes] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Prepare asset categories for SearchWithDropdown
  const assetCategories = useMemo(() => {
    const categories = Array.from(new Set(assets.map((asset) => asset.category)));
    return [
      { id: "all", label: "All Categories" },
      ...categories.map((category) => ({
        id: category,
        label: category,
      })),
    ];
  }, [assets]);

  // Prepare asset items for SearchWithDropdown
  const assetItems = useMemo(() => {
    return assets.map((asset) => ({
      id: asset.id,
      label: `${asset.name} (${asset.code})`,
      sublabel: asset.category,
    }));
  }, [assets]);

  const resetState = useCallback(() => {
    setCustomerName("");
    setRentAmount("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setSelectedAssetIds([]);
    setSelectedCategoryId("all");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleAssetSelectionChange = useCallback((assetIds: string[]) => {
    setSelectedAssetIds(assetIds);
  }, []);

  const parsedRentAmount = Number(rentAmount);
  const hasValidRentAmount = Number.isFinite(parsedRentAmount) && parsedRentAmount > 0;
  const rentAmountDisplay = hasValidRentAmount
    ? parsedRentAmount.toFixed(2)
    : "0.00";

  const canProceed = useMemo(() => {
    return (
      selectedAssetIds.length > 0 &&
      customerName.trim().length > 0 &&
      hasValidRentAmount &&
      startDate !== undefined &&
      startDate !== ""
    );
  }, [customerName, hasValidRentAmount, startDate, selectedAssetIds]);

  const handleSubmit = () => {
    if (!hasValidRentAmount || !startDate) {
      return;
    }
    const payload: RentalPayload = {
      assetIds: selectedAssetIds,
      customerName: customerName.trim(),
      rentAmount: parsedRentAmount,
      startDate: startDate ? new Date(startDate).toISOString() : "",
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      notes: notes.trim() || undefined,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden border border-outline bg-surface p-0">
        <DialogHeader className="space-y-2 border-b border-outline px-6 py-4">
          <DialogTitle className="title-medium text-onSurface">
            New Asset Rental
          </DialogTitle>
          <p className="body-small text-onSurfaceVariant">
            Create a rental agreement for customer asset usage with scheduling details.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <Card className="border border-outline bg-surfaceContainer">
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                <div className="flex-1 space-y-4">
                  <h3 className="title-small text-onSurface">
                    Customer Information
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="body-small text-onSurface">
                        Customer Name <span className="text-error">*</span>
                      </label>
                      <Input
                        placeholder="eg. John Doe"
                        value={customerName}
                        onChange={(event) => { setCustomerName(event.target.value); }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="body-small text-onSurface">
                        Rent Amount <span className="text-error">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="eg. 100.00"
                        value={rentAmount}
                        onChange={(event) => { setRentAmount(event.target.value); }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="body-small text-onSurface">
                        Start Date <span className="text-error">*</span>
                      </label>
                      <SemiDatePicker
                        inputType="dateTime"
                        value={startDate}
                        onChange={(value) => { setStartDate(value as string | Date); }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="body-small text-onSurface">
                        End Date
                      </label>
                      <SemiDatePicker
                        inputType="dateTime"
                        value={endDate}
                        onChange={(value) => { setEndDate(value as string | Date); }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-outline bg-surfaceContainerLow p-4">
                  <dl className="grid gap-2">
                    <div>
                      <dt className="body-small text-onSurfaceVariant">
                        Selected assets
                      </dt>
                      <dd className="label-large text-onSurface">
                        {selectedAssetIds.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="body-small text-onSurfaceVariant">
                        Rent amount
                      </dt>
                      <dd className="label-large text-onSurface">
                        ${rentAmountDisplay}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="border border-outline bg-surfaceContainer">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="title-small text-onSurface">
                    Select Assets
                  </h3>
                  <p className="body-small text-onSurfaceVariant">
                    Choose assets to include in this rental agreement.
                  </p>
                </div>

                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={setSelectedCategoryId}
                  items={assetItems}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={handleAssetSelectionChange}
                  placeholder="Search assets by name or code..."
                  emptyMessage="No assets found"
                  className="w-full"
                  hideSelectedCount
                />
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface" htmlFor="rental-notes">
                Notes (optional)
              </label>
              <TextArea
                id="rental-notes"
                rows={3}
                maxRows={6}
                placeholder="Add any special instructions or terms for this rental."
                value={notes}
                onChange={(event) => { setNotes(event.target.value); }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-outline bg-surface px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="body-small text-onSurfaceVariant">
              {selectedAssetIds.length === 0 && "Select at least one asset to continue."}
              {selectedAssetIds.length > 0 && !customerName.trim() && "Customer name is required."}
              {selectedAssetIds.length > 0 && customerName.trim() && !hasValidRentAmount && "Rent amount must be greater than 0."}
              {selectedAssetIds.length > 0 && customerName.trim() && hasValidRentAmount && !startDate && "Start date is required."}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={!canProceed} onClick={handleSubmit}>
                Create Rental
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalModal;
