import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import { coverageAssets, coverageAssetGroups } from "@/features/coverage/mockData";
import type { CoverageInsurance } from "@/features/coverage/types";

const EMPTY_ARRAY: readonly string[] = [];

interface LogInsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers?: string[];
  insurance?: CoverageInsurance;
}

export const LogInsuranceModal = ({
  open,
  onOpenChange,
  providers,
  insurance,
}: LogInsuranceModalProps) => {
  const isEditing = Boolean(insurance);
  const effectiveProviders = providers ?? EMPTY_ARRAY;

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

  const [insuranceData, setInsuranceData] = useState({
    name: insurance?.name ?? "",
    provider: insurance?.provider ?? "",
    policyNumber: insurance?.policyNumber ?? "",
    annualPremium: insurance?.annualPremium ?? 0,
    coverageAmount: insurance?.coverageAmount ?? 0,
    remainingCoverage: insurance?.remainingCoverage ?? 0,
    startDate: insurance?.startDate ?? "",
    expiryDate: insurance?.expiryDate ?? "",
    description: insurance?.description ?? "",
  });

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    insurance?.assetsCovered.map((a) => a.id) ?? []
  );

  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Insurance Policy" : "Add Insurance Policy"}
          </DialogTitle>
          <DialogDescription>
            Capture policy coverage details, premiums, and associated assets. Workflow
            orchestration will be added later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Policy Details Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Policy Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Policy Name *</label>
                    <Input
                      value={insuranceData.name}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, name: e.target.value });
                      }}
                      placeholder="e.g. Comprehensive Equipment Protection"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Insurance Provider *</label>
                    <Input
                      value={insuranceData.provider}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, provider: e.target.value });
                      }}
                      placeholder="Enter provider name"
                      list="policy-provider-suggestions"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Policy Number *</label>
                    <Input
                      value={insuranceData.policyNumber}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, policyNumber: e.target.value });
                      }}
                      placeholder="e.g. AIB-CEQ-2025-01"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Annual Premium *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={insuranceData.annualPremium}
                      onChange={(e) => {
                        setInsuranceData({
                          ...insuranceData,
                          annualPremium: parseFloat(e.target.value),
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
                        setInsuranceData({
                          ...insuranceData,
                          coverageAmount: parseFloat(e.target.value),
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
                        setInsuranceData({
                          ...insuranceData,
                          remainingCoverage: parseFloat(e.target.value),
                        });
                      }}
                      placeholder="Auto calculated"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Start Date *</label>
                    <Input
                      type="date"
                      value={insuranceData.startDate}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, startDate: e.target.value });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Expiry Date *</label>
                    <Input
                      type="date"
                      value={insuranceData.expiryDate}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, expiryDate: e.target.value });
                      }}
                    />
                  </div>
                </div>
                {effectiveProviders.length > 0 && (
                  <datalist id="policy-provider-suggestions">
                    {effectiveProviders.map((provider) => (
                      <option key={provider} value={provider} />
                    ))}
                  </datalist>
                )}
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

        <DialogFooter className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
