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
import type { CoverageWarranty } from "@/features/coverage/types";

const EMPTY_ARRAY: readonly string[] = [];

interface LogWarrantyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers?: string[];
  warranty?: CoverageWarranty;
}

export const LogWarrantyModal = ({
  open,
  onOpenChange,
  providers,
  warranty,
}: LogWarrantyModalProps) => {
  const isEditing = Boolean(warranty);
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

  const [warrantyData, setWarrantyData] = useState({
    name: warranty?.name ?? "",
    provider: warranty?.provider ?? "",
    warrantyNumber: warranty?.warrantyNumber ?? "",
    coverage: warranty?.coverage ?? "",
    expiryDate: warranty?.expiryDate ?? "",
    description: warranty?.description ?? "",
  });

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    warranty?.assetsCovered.map((a) => a.id) ?? []
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
          <DialogTitle>{isEditing ? "Edit Warranty" : "Add Warranty"}</DialogTitle>
          <DialogDescription>
            Register manufacturer warranty coverage for critical equipment. Integration hooks
            for asset assignment will be configured later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Warranty Details Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Warranty Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Warranty Name *</label>
                    <Input
                      value={warrantyData.name}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, name: e.target.value });
                      }}
                      placeholder="e.g. Robotics Extended Care"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Provider *</label>
                    <Input
                      value={warrantyData.provider}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, provider: e.target.value });
                      }}
                      list="warranty-provider-suggestions"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Warranty Number *</label>
                    <Input
                      value={warrantyData.warrantyNumber}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, warrantyNumber: e.target.value });
                      }}
                      placeholder="e.g. OMNI-PR-2201"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Coverage Type *</label>
                    <Input
                      value={warrantyData.coverage}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, coverage: e.target.value });
                      }}
                      placeholder="Parts, Labour, or Full Coverage"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Start Date *</label>
                    <Input type="date" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Expiry Date *</label>
                    <Input
                      type="date"
                      value={warrantyData.expiryDate}
                      onChange={(e) => {
                        setWarrantyData({ ...warrantyData, expiryDate: e.target.value });
                      }}
                    />
                  </div>
                </div>
                {effectiveProviders.length > 0 && (
                  <datalist id="warranty-provider-suggestions">
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
                  value={warrantyData.description}
                  onChange={(e) => {
                    setWarrantyData({ ...warrantyData, description: e.target.value });
                  }}
                  placeholder="Important clauses, limitations, service windows, etc."
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
