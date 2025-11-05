import { useEffect, useState, type FormEvent } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { CoverageEntityAsset, CoverageWarranty, CoverageWarrantyPayload } from "@/features/coverage/types";
import { useCoverageAssetCatalog } from "@/features/coverage/hooks/useCoverageAssets";

interface LogWarrantyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warranty?: CoverageWarranty;
  onCreate?: (data: CoverageWarrantyPayload) => void;
  onUpdate?: (id: string, data: CoverageWarrantyPayload) => void;
}

// Helper function to calculate expiry date (364 days from start date)
const calculateExpiryDate = (startDate: Date): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(startDate.getDate() + 364);
  return expiryDate;
};

type WarrantyFormState = Omit<CoverageWarrantyPayload, "assetsCovered"> & {
  startDate: string;
};

export const LogWarrantyModal = ({
  open,
  onOpenChange,
  warranty,
  onCreate,
  onUpdate,
}: LogWarrantyModalProps) => {
  const isEditing = Boolean(warranty);

  const { assetCategories, assetOptions, assetNameById } = useCoverageAssetCatalog();

  const [warrantyData, setWarrantyData] = useState<WarrantyFormState>(() => {
    const today = new Date();
    const expiryDate = calculateExpiryDate(today);
    
    return {
      name: warranty?.name ?? "",
      provider: warranty?.provider ?? "",
      warrantyNumber: warranty?.warrantyNumber ?? "",
      coverage: warranty?.coverage ?? "",
      startDate: today.toISOString(),
      expiryDate: warranty?.expiryDate ?? expiryDate.toISOString(),
      description: warranty?.description ?? "",
    };
  });

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    warranty?.assetsCovered.map((a) => a.id) ?? []
  );

  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");

  // Reset form when warranty prop changes (for edit mode) or when modal opens/closes
  useEffect(() => {
    if (!open) {
      return;
    }

    const today = new Date();
    const expiryDate = calculateExpiryDate(today).toISOString();

    setWarrantyData({
      name: warranty?.name ?? "",
      provider: warranty?.provider ?? "",
      warrantyNumber: warranty?.warrantyNumber ?? "",
      coverage: warranty?.coverage ?? "",
      startDate: today.toISOString(),
      expiryDate: warranty?.expiryDate ?? expiryDate,
      description: warranty?.description ?? "",
    });

    setSelectedAssetIds(warranty?.assetsCovered.map((asset) => asset.id) ?? []);
    setSelectedAssetCategory("all");
  }, [warranty, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Get selected assets with their names
    const assetsCovered: CoverageEntityAsset[] = selectedAssetIds.map((id) => ({
      id,
      name: assetNameById.get(id) ?? id,
    }));
    
    const formData: CoverageWarrantyPayload = {
      name: warrantyData.name,
      provider: warrantyData.provider,
      warrantyNumber: warrantyData.warrantyNumber,
      coverage: warrantyData.coverage,
      expiryDate: warrantyData.expiryDate,
      description: warrantyData.description,
      assetsCovered,
    };
    
    if (isEditing && warranty && onUpdate) {
      onUpdate(warranty.id, formData);
    } else if (!isEditing && onCreate) {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1000px] max-w-[90vw] max-h-[90vh]"> 
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Warranty" : "Add Warranty"}</DialogTitle>
          <DialogDescription>Register manufacturer warranty coverage for assets.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Warranty Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Warranty Name<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.name}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, name: e.target.value });
                      }}
                      placeholder="Enter warranty name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Provider<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.provider}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, provider: e.target.value });
                      }}
                      placeholder="Enter provider name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Warranty Number<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.warrantyNumber}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, warrantyNumber: e.target.value });
                      }}
                      placeholder="Enter warranty number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Coverage Type<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.coverage}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, coverage: e.target.value });
                      }}
                      placeholder="Parts, Labour, or Full Coverage"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Start Date<span className="text-error"> *</span></label>
                    <SemiDatePicker
                      value={warrantyData.startDate ? new Date(warrantyData.startDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        const startDate = new Date(isoDate);
                        const expiryDate = calculateExpiryDate(startDate);
                        
                        setWarrantyData({ 
                          ...warrantyData, 
                          startDate: isoDate,
                          expiryDate: expiryDate.toISOString()
                        });
                      }}
                      inputType="date"
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Expiry Date<span className="text-error"> *</span></label>
                    <SemiDatePicker
                      value={warrantyData.expiryDate ? new Date(warrantyData.expiryDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        setWarrantyData({ ...warrantyData, expiryDate: isoDate });
                      }}
                      inputType="date"
                      className="w-full"
                    />
                  </div>
                </div>
            </div>

            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
              <SearchWithDropdown
                categories={assetCategories}
                selectedCategoryId={selectedAssetCategory}
                onCategoryChange={setSelectedAssetCategory}
                items={assetOptions}
                selectedIds={selectedAssetIds}
                onSelectionChange={setSelectedAssetIds}
                placeholder="Search assets by name or ID"
                emptyMessage="No assets found"
                hideSelectedField={selectedAssetIds.length === 0}
              />
            </div>

            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Description</h3>
              <TextArea
                rows={3}
                value={warrantyData.description}
                onChange={(e) => {
                  setWarrantyData({ ...warrantyData, description: e.target.value });
                }}
                placeholder="Important clauses, limitations, service windows, etc."
              />
            </div>

            <DialogFooter className="flex justify-end">
              <Button variant="outline" onClick={() => { onOpenChange(false) }}>Cancel</Button>
              <Button type="submit">Add warranty</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
