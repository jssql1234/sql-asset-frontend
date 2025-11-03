import React, { useState, useEffect } from "react";
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
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import { coverageAssets, coverageAssetGroups } from "@/features/coverage/mockData";
import type { CoverageWarranty } from "@/features/coverage/types";

interface LogWarrantyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warranty?: CoverageWarranty;
  onCreate?: (data: Omit<CoverageWarranty, 'id' | 'status'>) => void;
  onUpdate?: (id: string, data: Omit<CoverageWarranty, 'id' | 'status'>) => void;
}

// Helper function to calculate expiry date (364 days from start date)
const calculateExpiryDate = (startDate: Date): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(startDate.getDate() + 364);
  return expiryDate;
};

export const LogWarrantyModal = ({
  open,
  onOpenChange,
  warranty,
  onCreate,
  onUpdate,
}: LogWarrantyModalProps) => {
  const isEditing = Boolean(warranty);

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

  const [warrantyData, setWarrantyData] = useState(() => {
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
    if (open) {
      const today = new Date();
      const expiryDate = calculateExpiryDate(today);
      
      setWarrantyData({
        name: warranty?.name ?? "",
        provider: warranty?.provider ?? "",
        warrantyNumber: warranty?.warrantyNumber ?? "",
        coverage: warranty?.coverage ?? "",
        startDate: today.toISOString(),
        expiryDate: warranty?.expiryDate ?? expiryDate.toISOString(),
        description: warranty?.description ?? "",
      });
      
      setSelectedAssetIds(warranty?.assetsCovered.map((a) => a.id) ?? []);
      setSelectedAssetCategory("all");
    }
  }, [warranty, open]);

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
      ...warrantyData,
      assetsCovered,
    };
    
    if (isEditing && warranty && onUpdate) {
      onUpdate(warranty.id, formData);
    } else if (!isEditing && onCreate) {
      onCreate(formData);
    }
    
    // Modal will be closed by the handlers in useCoverageState
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
            {/* Warranty Details Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Warranty Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      placeholder="Enter provider name"
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
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    <label className="body-small text-onSurface">Expiry Date *</label>
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

        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={() => { onOpenChange(false) }}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
