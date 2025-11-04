import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import { coverageAssets, coverageAssetGroups } from "@/features/coverage/mockData";
import type { CoverageEntityAsset, CoverageInsurance, CoverageInsurancePayload, InsuranceLimitType } from "@/features/coverage/types";
import { createInsuranceSchema, updateInsuranceSchema } from "@/features/coverage/zod/coverageSchemas";

interface LogInsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurance?: CoverageInsurance;
  onCreate?: (data: CoverageInsurancePayload) => void;
  onUpdate?: (id: string, data: CoverageInsurancePayload) => void;
}

// Helper function to calculate expiry date (364 days from start date)
const calculateExpiryDate = (startDate: Date): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(startDate.getDate() + 364);
  return expiryDate;
};

const DEFAULT_LIMIT_TYPE: InsuranceLimitType = "Aggregate";

type InsuranceFormState = Omit<CoverageInsurancePayload, "assetsCovered">;
type InsuranceField = keyof InsuranceFormState | "assetsCovered";
type InsuranceFieldErrors = Partial<Record<InsuranceField, string>>;

const buildInitialFormState = (insurance?: CoverageInsurance): InsuranceFormState => {
  const today = new Date();
  const fallbackExpiry = calculateExpiryDate(today).toISOString();

  return {
    name: insurance?.name ?? "",
    provider: insurance?.provider ?? "",
    policyNumber: insurance?.policyNumber ?? "",
    annualPremium: insurance?.annualPremium ?? 0,
    limitType: insurance?.limitType ?? DEFAULT_LIMIT_TYPE,
    coverageAmount: insurance?.coverageAmount ?? 0,
    remainingCoverage: insurance?.remainingCoverage ?? 0,
    startDate: insurance?.startDate ?? today.toISOString(),
    expiryDate: insurance?.expiryDate ?? fallbackExpiry,
    description: insurance?.description ?? "",
  };
};

export const LogInsuranceModal = ({
  open,
  onOpenChange,
  insurance,
  onCreate,
  onUpdate,
}: LogInsuranceModalProps) => {
  const isEditing = Boolean(insurance);

  const assetCategories = useMemo(
    () => [
      { id: "all", label: "All Assets" },
      ...coverageAssetGroups.map((group) => ({ id: group.id, label: group.label })),
    ],
    []
  );

  const assetOptions = useMemo(
    () =>
      coverageAssets.map((asset) => ({
        id: asset.id,
        label: `${asset.name} (${asset.id})`,
        sublabel: asset.groupLabel,
      })),
    []
  );

  const assetNameById = useMemo(() => {
    const map = new Map<string, string>();
    assetOptions.forEach((option) => {
      const [name] = option.label.split(" (");
      map.set(option.id, name);
    });
    return map;
  }, [assetOptions]);

  const [insuranceData, setInsuranceData] = useState<InsuranceFormState>(() => buildInitialFormState(insurance));
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    insurance?.assetsCovered.map((asset) => asset.id) ?? []
  );
  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");
  const [fieldErrors, setFieldErrors] = useState<InsuranceFieldErrors>({});

  const clearFieldError = (field: InsuranceField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== field)
      ) as InsuranceFieldErrors;
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setInsuranceData(buildInitialFormState(insurance));
    setSelectedAssetIds(insurance?.assetsCovered.map((asset) => asset.id) ?? []);
    setSelectedAssetCategory("all");
    setFieldErrors({});
  }, [insurance, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const assetsCovered: CoverageEntityAsset[] = selectedAssetIds.map((id) => ({
      id,
      name: assetNameById.get(id) ?? id,
    }));

    const formData: CoverageInsurancePayload = {
      ...insuranceData,
      assetsCovered,
    };

    const schema = isEditing ? updateInsuranceSchema : createInsuranceSchema;
    const validation = schema.safeParse(formData);

    if (!validation.success) {
      const errors: InsuranceFieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          errors[field as InsuranceField] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    if (isEditing && insurance && onUpdate) {
      onUpdate(insurance.id, formData);
    } else if (!isEditing && onCreate) {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1000px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Insurance Policy" : "Add Insurance Policy"}</DialogTitle>
          <DialogDescription>
            Capture policy coverage details, premiums, and associated assets.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Policy Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Policy Name *</label>
                    <Input
                      value={insuranceData.name}
                      onChange={(event) => {
                        setInsuranceData({ ...insuranceData, name: event.target.value });
                        clearFieldError("name");
                      }}
                      placeholder="e.g. Comprehensive Equipment Protection"
                    />
                    {fieldErrors.name ? (
                      <span className="label-small text-error">{fieldErrors.name}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Insurance Provider *</label>
                    <Input
                      value={insuranceData.provider}
                      onChange={(event) => {
                        setInsuranceData({ ...insuranceData, provider: event.target.value });
                        clearFieldError("provider");
                      }}
                      placeholder="Enter provider name"
                    />
                    {fieldErrors.provider ? (
                      <span className="label-small text-error">{fieldErrors.provider}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Policy Number *</label>
                    <Input
                      value={insuranceData.policyNumber}
                      onChange={(event) => {
                        setInsuranceData({ ...insuranceData, policyNumber: event.target.value });
                        clearFieldError("policyNumber");
                      }}
                      placeholder="e.g. AIB-CEQ-2025-01"
                    />
                    {fieldErrors.policyNumber ? (
                      <span className="label-small text-error">{fieldErrors.policyNumber}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Annual Premium *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.annualPremium}
                      onChange={(event) => {
                        const value = event.target.value === "" ? 0 : Number.parseFloat(event.target.value) || 0;
                        setInsuranceData({
                          ...insuranceData,
                          annualPremium: value,
                        });
                        clearFieldError("annualPremium");
                      }}
                      placeholder="Enter annual premium"
                    />
                    {fieldErrors.annualPremium ? (
                      <span className="label-small text-error">{fieldErrors.annualPremium}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Coverage Amount *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.coverageAmount}
                      onChange={(event) => {
                        const value = event.target.value === "" ? 0 : Number.parseFloat(event.target.value) || 0;
                        setInsuranceData({
                          ...insuranceData,
                          coverageAmount: value,
                          remainingCoverage: value,
                        });
                        clearFieldError("coverageAmount");
                        clearFieldError("remainingCoverage");
                      }}
                      placeholder="Enter coverage amount"
                    />
                    {fieldErrors.coverageAmount ? (
                      <span className="label-small text-error">{fieldErrors.coverageAmount}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Remaining Coverage</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.remainingCoverage}
                      onChange={(event) => {
                        const value = event.target.value === "" ? 0 : Number.parseFloat(event.target.value) || 0;
                        setInsuranceData({
                          ...insuranceData,
                          remainingCoverage: value,
                        });
                        clearFieldError("remainingCoverage");
                      }}
                      placeholder="Enter remaining coverage"
                    />
                    {fieldErrors.remainingCoverage ? (
                      <span className="label-small text-error">{fieldErrors.remainingCoverage}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Limit Type *</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger label={insuranceData.limitType} className="w-full justify-between" />
                      <DropdownMenuContent>
                        {(["Aggregate", "Per Occurrence"] as InsuranceLimitType[]).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => {
                              setInsuranceData({ ...insuranceData, limitType: type });
                              clearFieldError("limitType");
                            }}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Start Date *</label>
                    <SemiDatePicker
                      value={insuranceData.startDate ? new Date(insuranceData.startDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        const startDate = new Date(isoDate);
                        const expiryDate = calculateExpiryDate(startDate).toISOString();
                        setInsuranceData({
                          ...insuranceData,
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
                    <label className="body-small text-onSurface">Expiry Date *</label>
                    <SemiDatePicker
                      value={insuranceData.expiryDate ? new Date(insuranceData.expiryDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        setInsuranceData({
                          ...insuranceData,
                          expiryDate: isoDate,
                        });
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
            </div>

            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
              </div>
              <div className="space-y-3">
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

            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Description</h3>
              </div>
              <div className="space-y-3">
                <TextArea
                  rows={3}
                  value={insuranceData.description}
                  onChange={(event) => {
                    setInsuranceData({ ...insuranceData, description: event.target.value });
                    clearFieldError("description");
                  }}
                  placeholder="Describe coverage, deductibles, or asset-specific clauses"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
