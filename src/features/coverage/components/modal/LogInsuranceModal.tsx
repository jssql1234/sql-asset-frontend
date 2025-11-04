import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import { coverageAssets, coverageAssetGroups } from "@/features/coverage/mockData";
import type { CoverageInsurance, InsuranceLimitType } from "@/features/coverage/types";
import { createInsuranceSchema, updateInsuranceSchema } from "@/features/coverage/zod/coverageSchemas";

interface LogInsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurance?: CoverageInsurance;
  onCreate?: (data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>) => void;
  onUpdate?: (id: string, data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>) => void;
}

// Helper function to calculate expiry date (364 days from start date)
const calculateExpiryDate = (startDate: Date): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(startDate.getDate() + 364);
  return expiryDate;
};

export const LogInsuranceModal = ({
  open,
  onOpenChange,
  insurance,
  onCreate,
  onUpdate,
}: LogInsuranceModalProps) => {
  const isEditing = Boolean(insurance);

  const assetCategories = React.useMemo(
    () => [
      { id: "all", label: "All Assets" },
      ...coverageAssetGroups.map((group) => ({ id: group.id, label: group.label })),
    ],
    []
  );

  const mockAssets = React.useMemo(
    () =>
      coverageAssets.map((asset) => ({
        id: asset.id,
        label: `${asset.name} (${asset.id})`,
        sublabel: asset.groupLabel,
      })),
    []
  );

  const [insuranceData, setInsuranceData] = useState(() => {
    const today = new Date();
    const expiryDate = calculateExpiryDate(today);
    
    return {
      name: insurance?.name ?? "",
      provider: insurance?.provider ?? "",
      policyNumber: insurance?.policyNumber ?? "",
      annualPremium: insurance?.annualPremium ?? 0,
      limitType: insurance?.limitType ?? "Aggregate" as InsuranceLimitType,
      coverageAmount: insurance?.coverageAmount ?? 0,
      remainingCoverage: insurance?.remainingCoverage ?? 0,
      startDate: insurance?.startDate ?? today.toISOString(),
      expiryDate: insurance?.expiryDate ?? expiryDate.toISOString(),
      description: insurance?.description ?? "",
    };
  });

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    insurance?.assetsCovered.map((a) => a.id) ?? []
  );

  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset form when insurance prop changes (for edit mode) or when modal opens/closes
  useEffect(() => {
    if (open) {
      const today = new Date();
      const expiryDate = calculateExpiryDate(today);
      
      setInsuranceData({
        name: insurance?.name ?? "",
        provider: insurance?.provider ?? "",
        policyNumber: insurance?.policyNumber ?? "",
        annualPremium: insurance?.annualPremium ?? 0,
        limitType: insurance?.limitType ?? "Aggregate" as InsuranceLimitType,
        coverageAmount: insurance?.coverageAmount ?? 0,
        remainingCoverage: insurance?.remainingCoverage ?? 0,
        startDate: insurance?.startDate ?? today.toISOString(),
        expiryDate: insurance?.expiryDate ?? expiryDate.toISOString(),
        description: insurance?.description ?? "",
      });
      
      setSelectedAssetIds(insurance?.assetsCovered.map((a) => a.id) ?? []);
      setSelectedAssetCategory("all");
    }
  }, [insurance, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Get selected assets with their names
    const assetsCovered = selectedAssetIds.map(id => {
      const asset = mockAssets.find(a => a.id === id);
      return {
        id,
        name: asset?.label.split(' (')[0] ?? id,
      };
    });
    
    const formData = {
      ...insuranceData,
      assetsCovered,
    };
    
    // Validate with Zod
    const schema = isEditing ? updateInsuranceSchema : createInsuranceSchema;
    const validation = schema.safeParse(formData);
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
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
          <DialogDescription>Capture policy coverage details, premiums, and associated assets.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Policy Details Section */}
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
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, name: e.target.value });
                        if (fieldErrors.name) {
                          setFieldErrors(prev => ({ ...prev, name: "" }));
                        }
                      }}
                      placeholder="e.g. Comprehensive Equipment Protection"
                    />
                    {fieldErrors.name && (
                      <span className="label-small text-error">{fieldErrors.name}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Insurance Provider *</label>
                    <Input
                      value={insuranceData.provider}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, provider: e.target.value });
                        if (fieldErrors.provider) {
                          setFieldErrors(prev => ({ ...prev, provider: "" }));
                        }
                      }}
                      placeholder="Enter provider name"
                    />
                    {fieldErrors.provider && (
                      <span className="label-small text-error">{fieldErrors.provider}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Policy Number *</label>
                    <Input
                      value={insuranceData.policyNumber}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, policyNumber: e.target.value });
                        if (fieldErrors.policyNumber) {
                          setFieldErrors(prev => ({ ...prev, policyNumber: "" }));
                        }
                      }}
                      placeholder="e.g. AIB-CEQ-2025-01"
                    />
                    {fieldErrors.policyNumber && (
                      <span className="label-small text-error">{fieldErrors.policyNumber}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Annual Premium *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.annualPremium}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                        setInsuranceData({
                          ...insuranceData,
                          annualPremium: value,
                        });
                      }}
                      placeholder="Enter annual premium"
                    />
                  </div>                 
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Coverage Amount *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.coverageAmount}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                        setInsuranceData({
                          ...insuranceData,
                          coverageAmount: value,
                          remainingCoverage: value,
                        });
                      }}
                      placeholder="Enter coverage amount"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Remaining Coverage</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.remainingCoverage}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                        setInsuranceData({
                          ...insuranceData,
                          remainingCoverage: value,
                        });
                      }}
                      placeholder="Enter remaining coverage"
                    />
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
                        const expiryDate = calculateExpiryDate(startDate);
                        
                        setInsuranceData({ 
                          ...insuranceData, 
                          startDate: isoDate,
                          expiryDate: expiryDate.toISOString()
                        });
                      }}
                      inputType="date"
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Expiry Date *</label>
                    <SemiDatePicker
                      value={insuranceData.expiryDate ? new Date(insuranceData.expiryDate) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        setInsuranceData({ 
                          ...insuranceData, 
                          expiryDate: isoDate
                        });
                      }}
                      inputType="date"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Covered Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
              </div>
              <div className="space-y-3">
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedAssetCategory}
                  onCategoryChange={setSelectedAssetCategory}
                  items={mockAssets}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={setSelectedAssetIds}
                  placeholder="Search assets by name or ID"
                  emptyMessage="No assets found"
                  hideSelectedField={selectedAssetIds.length === 0}
                />
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Description</h3>
              </div>
              <div className="space-y-3">
                <TextArea
                  rows={3}
                  value={insuranceData.description}
                  onChange={(e) => {
                    setInsuranceData({ ...insuranceData, description: e.target.value });
                  }}
                  placeholder="Describe coverage, deductibles, or asset-specific clauses"
                />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={() => { onOpenChange(false) }}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
