import { useEffect, useState, type FormEvent } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { CoverageEntityAsset, CoverageWarranty, CoverageWarrantyPayload } from "@/features/coverage/types";
import { createWarrantySchema, updateWarrantySchema } from "@/features/coverage/zod/coverageSchemas";
import { useCoverageAssetCatalog } from "@/features/coverage/hooks/useCoverageAssets";
import { calculateExpiryDate } from "@/features/coverage/services/coverageService";

interface LogWarrantyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warranty?: CoverageWarranty;
  onCreate?: (data: CoverageWarrantyPayload) => void;
  onUpdate?: (id: string, data: CoverageWarrantyPayload) => void;
}

type WarrantyFormState = Omit<CoverageWarrantyPayload, "assetsCovered">;
type WarrantyField = keyof WarrantyFormState | "assetsCovered";
type WarrantyFieldErrors = Partial<Record<WarrantyField, string>>;

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
      startDate: warranty?.startDate ?? today.toISOString(),
      expiryDate: warranty?.expiryDate ?? expiryDate.toISOString(),
      description: warranty?.description ?? "",
    };
  });

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    warranty?.assetsCovered.map((a) => a.id) ?? []
  );

  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");
  const [fieldErrors, setFieldErrors] = useState<WarrantyFieldErrors>({});

  const clearFieldError = (field: WarrantyField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== field)
      ) as WarrantyFieldErrors;
    });
  };

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
      startDate: warranty?.startDate ?? today.toISOString(),
      expiryDate: warranty?.expiryDate ?? expiryDate,
      description: warranty?.description ?? "",
    });

    setSelectedAssetIds(warranty?.assetsCovered.map((asset) => asset.id) ?? []);
    setSelectedAssetCategory("all");
    setFieldErrors({});
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
      startDate: warrantyData.startDate,
      expiryDate: warrantyData.expiryDate,
      description: warrantyData.description,
      assetsCovered,
    };

    const schema = isEditing ? updateWarrantySchema : createWarrantySchema;
    const validation = schema.safeParse(formData);

    if (!validation.success) {
      const errors: WarrantyFieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          errors[field as WarrantyField] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

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
                        clearFieldError("name");
                      }}
                      placeholder="Enter warranty name"
                    />
                    {fieldErrors.name ? (
                      <span className="label-small text-error">{fieldErrors.name}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Provider<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.provider}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, provider: e.target.value });
                        clearFieldError("provider");
                      }}
                      placeholder="Enter provider name"
                    />
                    {fieldErrors.provider ? (
                      <span className="label-small text-error">{fieldErrors.provider}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Warranty Number<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.warrantyNumber}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, warrantyNumber: e.target.value });
                        clearFieldError("warrantyNumber");
                      }}
                      placeholder="Enter warranty number"
                    />
                    {fieldErrors.warrantyNumber ? (
                      <span className="label-small text-error">{fieldErrors.warrantyNumber}</span>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Coverage Type<span className="text-error"> *</span></label>
                    <Input
                      value={warrantyData.coverage}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, coverage: e.target.value });
                        clearFieldError("coverage");
                      }}
                      placeholder="Parts, Labour, or Full Coverage"
                    />
                    {fieldErrors.coverage ? (
                      <span className="label-small text-error">{fieldErrors.coverage}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Start Date<span className="text-error"> *</span></label>
                    <SemiDatePicker
                      value={warrantyData.startDate ? new Date(warrantyData.startDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        const startDate = new Date(isoDate);
                        const expiryDate = calculateExpiryDate(startDate).toISOString();
                        setWarrantyData({
                          ...warrantyData,
                          startDate: isoDate,
                          expiryDate,
                        });
                        clearFieldError("startDate");
                        clearFieldError("expiryDate");
                      }}
                      inputType="date"
                      className="w-full"
                    />
                    {fieldErrors.startDate ? (
                      <span className="label-small text-error">{fieldErrors.startDate}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Expiry Date<span className="text-error"> *</span></label>
                    <SemiDatePicker
                      value={warrantyData.expiryDate ? new Date(warrantyData.expiryDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        setWarrantyData({ ...warrantyData, expiryDate: isoDate });
                        clearFieldError("expiryDate");
                      }}
                      inputType="date"
                      className="w-full"
                    />
                    {fieldErrors.expiryDate ? (
                      <span className="label-small text-error">{fieldErrors.expiryDate}</span>
                    ) : null}
                  </div>
                </div>
            </div>

            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
              <div className="flex flex-col gap-2">
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedAssetCategory}
                  onCategoryChange={setSelectedAssetCategory}
                  items={assetOptions}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={(ids) => {
                    setSelectedAssetIds(ids);
                    clearFieldError("assetsCovered");
                  }}
                  placeholder="Search assets by name or ID"
                  emptyMessage="No assets found"
                  hideSelectedField={selectedAssetIds.length === 0}
                />
                {fieldErrors.assetsCovered ? (
                  <span className="label-small text-error">{fieldErrors.assetsCovered}</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Description<span className="text-error"> *</span></h3>
              <div className="flex flex-col gap-2">
                <TextArea
                  rows={3}
                  value={warrantyData.description}
                  onChange={(e) => {
                    setWarrantyData({ ...warrantyData, description: e.target.value });
                    clearFieldError("description");
                  }}
                  placeholder="Important clauses, limitations, service windows, etc."
                />
                {fieldErrors.description ? (
                  <span className="label-small text-error">{fieldErrors.description}</span>
                ) : null}
              </div>
            </div>

            <DialogFooter className="flex justify-end">
              <Button variant="outline" onClick={() => { onOpenChange(false) }}>Cancel</Button>
              <Button type="submit">{isEditing ? "Update warranty" : "Add warranty"}</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
