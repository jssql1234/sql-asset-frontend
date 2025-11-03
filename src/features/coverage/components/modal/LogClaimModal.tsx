import React, { useMemo, useState, useEffect } from "react";
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
import type {
  CoverageInsurance,
  CoverageWarranty,
  CoverageClaim,
  ClaimType,
  ClaimStatus,
} from "@/features/coverage/types";

const EMPTY_POLICIES: readonly CoverageInsurance[] = [];
const EMPTY_WARRANTIES: readonly CoverageWarranty[] = [];

interface LogClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policies?: CoverageInsurance[];
  warranties?: CoverageWarranty[];
  claim?: CoverageClaim;
  onCreate?: (data: Omit<CoverageClaim, 'id'>) => void;
  onUpdate?: (id: string, data: Omit<CoverageClaim, 'id'>) => void;
}

export const LogClaimModal = ({
  open,
  onOpenChange,
  policies,
  warranties,
  claim,
  onCreate,
  onUpdate,
}: LogClaimModalProps) => {
  const isEditing = Boolean(claim);

  // State declarations must come before any useMemo that uses them
  const [claimType, setClaimType] = useState<ClaimType>(claim?.type ?? "Insurance");
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>(claim?.status ?? "Filed");
  const [referenceId, setReferenceId] = useState<string>(claim?.referenceId ?? "");

  const [claimData, setClaimData] = useState(() => {
    const today = new Date();
    
    return {
      claimNumber: claim?.claimNumber ?? "",
      amount: claim?.amount ?? 0,
      dateFiled: claim?.dateFiled ?? today.toISOString(),
      description: claim?.description ?? "",
    };
  });

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    claim?.assets.map((a) => a.id) ?? []
  );

  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");

  // Computed values that depend on state
  const references = useMemo((): readonly (CoverageInsurance | CoverageWarranty)[] => {
    return claimType === "Insurance"
      ? policies ?? EMPTY_POLICIES
      : warranties ?? EMPTY_WARRANTIES;
  }, [claimType, policies, warranties]);

  const assetCategories = React.useMemo(
    () => [
      { id: "all", label: "All Assets" },
      ...coverageAssetGroups.map((group) => ({ id: group.id, label: group.label })),
    ],
    []
  );

  const mockAssets = React.useMemo(() => {
    // Get all assets
    const allAssets = coverageAssets.map((asset) => ({
      id: asset.id,
      label: `${asset.name} (${asset.id})`,
      sublabel: asset.groupLabel,
    }));

    // Filter assets based on selected policy/warranty
    if (!referenceId) {
      return allAssets;
    }

    const selectedReference = references.find(ref => ref.id === referenceId);
    if (!selectedReference?.assetsCovered) {
      return allAssets;
    }

    // Only show assets that are covered by the selected policy/warranty
    const coveredAssetIds = new Set(selectedReference.assetsCovered.map(a => a.id));
    return allAssets.filter(asset => coveredAssetIds.has(asset.id));
  }, [referenceId, references]);

  // Reset form when claim prop changes (for edit mode) or when modal opens/closes
  useEffect(() => {
    if (open) {
      const today = new Date();
      
      setClaimType(claim?.type ?? "Insurance");
      setClaimStatus(claim?.status ?? "Filed");
      setReferenceId(claim?.referenceId ?? "");
      
      setClaimData({
        claimNumber: claim?.claimNumber ?? "",
        amount: claim?.amount ?? 0,
        dateFiled: claim?.dateFiled ?? today.toISOString(),
        description: claim?.description ?? "",
      });
      
      setSelectedAssetIds(claim?.assets.map((a) => a.id) ?? []);
      setSelectedAssetCategory("all");
    }
  }, [claim, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Get selected assets with their names
    const assets = selectedAssetIds.map(id => {
      const asset = mockAssets.find(a => a.id === id);
      return {
        id,
        name: asset?.label.split(' (')[0] ?? id,
      };
    });
    
    // Find reference name
    const reference = references.find(ref => ref.id === referenceId);
    const referenceName = reference?.name ?? "";
    
    const formData: Omit<CoverageClaim, 'id'> = {
      claimNumber: claimData.claimNumber,
      type: claimType,
      referenceId,
      referenceName,
      assets,
      amount: claimData.amount,
      status: claimStatus,
      dateFiled: claimData.dateFiled,
      workOrderId: claim?.workOrderId,
      description: claimData.description,
    };
    
    if (isEditing && claim && onUpdate) {
      onUpdate(claim.id, formData);
    } else if (!isEditing && onCreate) {
      onCreate(formData);
    }
    
    // Modal will be closed by the handlers in useCoverageState
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Claim" : "Add Claim"}</DialogTitle>
          <DialogDescription>Record an insurance or warranty claim.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Claim Details Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Claim Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Type *</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger label={claimType} className="w-full justify-between" />
                      <DropdownMenuContent>
                        {(["Insurance", "Warranty"] as ClaimType[]).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => {
                              setClaimType(type);
                              setReferenceId("");
                            }}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Policy / Warranty *</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        label={
                          referenceId
                            ? references.find((item) => item.id === referenceId)?.name ??
                              "Select reference"
                            : "Select reference"
                        }
                        className="w-full justify-between"
                      />
                      <DropdownMenuContent className="max-h-64 min-w-[260px] overflow-y-auto">
                        {references.map((item) => (
                          <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                              setReferenceId(item.id);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="body-small text-onSurfaceVariant">{item.id}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Number *</label>
                    <Input
                      value={claimData.claimNumber}
                      onChange={(e) => {
                        setClaimData({ ...claimData, claimNumber: e.target.value });
                      }}
                      placeholder="e.g. CLM-2025-118"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Incident Date *</label>
                    <SemiDatePicker
                      value={claimData.dateFiled ? new Date(claimData.dateFiled) : null}
                      onChange={(date) => {
                        const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                        setClaimData({ ...claimData, dateFiled: isoDate });
                      }}
                      inputType="date"
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Amount *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={claimData.amount}
                      onChange={(e) => {
                        setClaimData({ ...claimData, amount: parseFloat(e.target.value) });
                      }}
                      placeholder="Enter claim amount"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Status *</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger label={claimStatus} className="w-full justify-between" />
                      <DropdownMenuContent>
                        {(["Filed", "Approved", "Settled", "Rejected"] as ClaimStatus[]).map(
                          (status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => {
                                setClaimStatus(status);
                              }}
                            >
                              {status}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Section */}
            <div className="space-y-4 bg-surfaceContainer">
              <div className="space-y-1">
                <h3 className="title-small font-semibold text-onSurface">Assets</h3>
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
                  rows={4}
                  value={claimData.description}
                  onChange={(e) => {
                    setClaimData({ ...claimData, description: e.target.value });
                  }}
                  placeholder="Provide summary of incident, damages, or supporting notes"
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
