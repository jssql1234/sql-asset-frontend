import React, { useMemo, useState } from "react";
import { BaseFormModal } from "@/features/coverage/components/modal/BaseFormModal";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type {
  CoverageInsurance,
  CoverageWarranty,
  CoverageClaim,
  ClaimType,
  ClaimStatus,
} from "@/features/coverage/types";

type CoverageFormVariant = "insurance" | "warranty" | "claim";

const EMPTY_ARRAY: readonly string[] = [];
const EMPTY_POLICIES: readonly CoverageInsurance[] = [];
const EMPTY_WARRANTIES: readonly CoverageWarranty[] = [];

interface CoverageFormModalProps {
  variant: CoverageFormVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers?: string[];
  policies?: CoverageInsurance[];
  warranties?: CoverageWarranty[];
  initialData?: CoverageInsurance | CoverageWarranty | CoverageClaim;
}

export const CoverageFormModal = ({
  variant,
  open,
  onOpenChange,
  providers,
  policies,
  warranties,
  initialData,
}: CoverageFormModalProps) => {
  const isEditing = Boolean(initialData);
  const effectiveProviders = providers ?? EMPTY_ARRAY;
  const effectivePolicies = policies ?? EMPTY_POLICIES;
  const effectiveWarranties = warranties ?? EMPTY_WARRANTIES;

  // Insurance state
  const [insuranceData, setInsuranceData] = useState({
    name: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).name : "",
    provider: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).provider : "",
    policyNumber: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).policyNumber : "",
    annualPremium: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).annualPremium : 0,
    coverageAmount: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).coverageAmount : 0,
    remainingCoverage: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).remainingCoverage : 0,
    startDate: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).startDate : "",
    expiryDate: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).expiryDate : "",
    description: isEditing && variant === "insurance" ? (initialData as CoverageInsurance).description : "",
  });

  // Warranty state
  const [warrantyData, setWarrantyData] = useState({
    name: isEditing && variant === "warranty" ? (initialData as CoverageWarranty).name : "",
    provider: isEditing && variant === "warranty" ? (initialData as CoverageWarranty).provider : "",
    warrantyNumber: isEditing && variant === "warranty" ? (initialData as CoverageWarranty).warrantyNumber : "",
    coverage: isEditing && variant === "warranty" ? (initialData as CoverageWarranty).coverage : "",
    expiryDate: isEditing && variant === "warranty" ? (initialData as CoverageWarranty).expiryDate : "",
    description: isEditing && variant === "warranty" ? (initialData as CoverageWarranty).description : "",
  });

  // Claim state
  const [claimType, setClaimType] = useState<ClaimType>(
    isEditing && variant === "claim" ? (initialData as CoverageClaim).type : "Insurance"
  );
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>(
    isEditing && variant === "claim" ? (initialData as CoverageClaim).status : "Filed"
  );
  const [referenceId, setReferenceId] = useState<string>(
    isEditing && variant === "claim" ? (initialData as CoverageClaim).referenceId : ""
  );
  const [claimData, setClaimData] = useState({
    claimNumber: isEditing && variant === "claim" ? (initialData as CoverageClaim).claimNumber : "",
    amount: isEditing && variant === "claim" ? (initialData as CoverageClaim).amount : 0,
    dateFiled: isEditing && variant === "claim" ? (initialData as CoverageClaim).dateFiled : "",
    description: isEditing && variant === "claim" ? (initialData as CoverageClaim).description : "",
  });

  // Asset selection state
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    isEditing && initialData
      ? "assetsCovered" in initialData
        ? initialData.assetsCovered.map((a) => a.id)
        : "assets" in initialData
        ? initialData.assets.map((a) => a.id)
        : []
      : []
  );

  // Mock assets - in real app, these would come from props or API
  const mockAssets = useMemo(
    () => [
      { id: "A001", label: "Robotic Arm Unit (A001)", sublabel: "Production Line 1" },
      { id: "A002", label: "CNC Machine (A002)", sublabel: "Workshop A" },
      { id: "A003", label: "Hydraulic Press (A003)", sublabel: "Assembly Floor" },
    ],
    []
  );

  const assetCategories = useMemo(
    () => [
      { id: "all", label: "All Assets" },
      { id: "production", label: "Production Equipment" },
      { id: "facility", label: "Facility Assets" },
    ],
    []
  );

  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");

  const references = useMemo(() => {
    return claimType === "Insurance" ? (policies ?? EMPTY_POLICIES) : (warranties ?? EMPTY_WARRANTIES);
  }, [claimType, policies, warranties]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    onOpenChange(false);
  };

  const getFormConfig = () => {
    switch (variant) {
      case "insurance":
        return {
          title: isEditing ? "Edit Insurance Policy" : "Add Insurance Policy",
          description:
            "Capture policy coverage details, premiums, and associated assets. Workflow orchestration will be added later.",
          sections: [
            {
              title: "Policy Details",
              content: (
                <>
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
                        onChange={(e) =>
                          setInsuranceData({ ...insuranceData, provider: e.target.value })
                        }
                        placeholder="Enter provider name"
                        list="policy-provider-suggestions"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Policy Number *</label>
                      <Input
                        value={insuranceData.policyNumber}
                        onChange={(e) =>
                          setInsuranceData({ ...insuranceData, policyNumber: e.target.value })
                        }
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
                        onChange={(e) =>
                          setInsuranceData({
                            ...insuranceData,
                            annualPremium: parseFloat(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          setInsuranceData({
                            ...insuranceData,
                            coverageAmount: parseFloat(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          setInsuranceData({
                            ...insuranceData,
                            remainingCoverage: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Auto calculated"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Start Date *</label>
                      <Input
                        type="date"
                        value={insuranceData.startDate}
                        onChange={(e) =>
                          setInsuranceData({ ...insuranceData, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Expiry Date *</label>
                      <Input
                        type="date"
                        value={insuranceData.expiryDate}
                        onChange={(e) =>
                          setInsuranceData({ ...insuranceData, expiryDate: e.target.value })
                        }
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
                </>
              ),
            },
            {
              title: "Assets Covered",
              content: (
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedAssetCategory}
                  onCategoryChange={setSelectedAssetCategory}
                  items={mockAssets}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={setSelectedAssetIds}
                  placeholder="Search assets by name or ID"
                  emptyMessage="No assets found"
                />
              ),
            },
            {
              title: "Additional Notes",
              content: (
                <TextArea
                  rows={3}
                  value={insuranceData.description}
                  onChange={(e) =>
                    setInsuranceData({ ...insuranceData, description: e.target.value })
                  }
                  placeholder="Provide additional coverage notes, deductibles, or asset-specific clauses"
                />
              ),
            },
          ],
        };

      case "warranty":
        return {
          title: isEditing ? "Edit Warranty" : "Add Warranty",
          description:
            "Register manufacturer warranty coverage for critical equipment. Integration hooks for asset assignment will be configured later.",
          sections: [
            {
              title: "Warranty Details",
              content: (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Warranty Name *</label>
                      <Input
                        value={warrantyData.name}
                        onChange={(e) =>
                          setWarrantyData({ ...warrantyData, name: e.target.value })
                        }
                        placeholder="e.g. Robotics Extended Care"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Provider *</label>
                      <Input
                        value={warrantyData.provider}
                        onChange={(e) =>
                          setWarrantyData({ ...warrantyData, provider: e.target.value })
                        }
                        list="warranty-provider-suggestions"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Warranty Number *</label>
                      <Input
                        value={warrantyData.warrantyNumber}
                        onChange={(e) =>
                          setWarrantyData({ ...warrantyData, warrantyNumber: e.target.value })
                        }
                        placeholder="e.g. OMNI-PR-2201"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="body-small text-onSurface">Coverage Type *</label>
                      <Input
                        value={warrantyData.coverage}
                        onChange={(e) =>
                          setWarrantyData({ ...warrantyData, coverage: e.target.value })
                        }
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
                        onChange={(e) =>
                          setWarrantyData({ ...warrantyData, expiryDate: e.target.value })
                        }
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
                </>
              ),
            },
            {
              title: "Assets Covered",
              content: (
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedAssetCategory}
                  onCategoryChange={setSelectedAssetCategory}
                  items={mockAssets}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={setSelectedAssetIds}
                  placeholder="Search assets by name or ID"
                  emptyMessage="No assets found"
                />
              ),
            },
            {
              title: "Description",
              content: (
                <TextArea
                  rows={3}
                  value={warrantyData.description}
                  onChange={(e) =>
                    setWarrantyData({ ...warrantyData, description: e.target.value })
                  }
                  placeholder="Important clauses, limitations, service windows, etc."
                />
              ),
            },
          ],
        };

      case "claim":
        return {
          title: isEditing ? "Edit Claim" : "Add Claim",
          description:
            "Record an insurance or warranty claim. Additional workflow automation and validations will be handled by dedicated hooks later on.",
          sections: [
            {
              title: "Claim Details",
              content: (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Type *</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger label={claimType} className="justify-between" />
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
                        className="justify-between"
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
                      onChange={(e) =>
                        setClaimData({ ...claimData, claimNumber: e.target.value })
                      }
                      placeholder="e.g. CLM-2025-118"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Incident Date *</label>
                    <Input
                      type="date"
                      value={claimData.dateFiled}
                      onChange={(e) =>
                        setClaimData({ ...claimData, dateFiled: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Amount *</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={claimData.amount}
                      onChange={(e) =>
                        setClaimData({ ...claimData, amount: parseFloat(e.target.value) })
                      }
                      placeholder="Enter claim amount"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Status *</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger label={claimStatus} className="justify-between" />
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
              ),
            },
            {
              title: "Assets",
              content: (
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedAssetCategory}
                  onCategoryChange={setSelectedAssetCategory}
                  items={mockAssets}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={setSelectedAssetIds}
                  placeholder="Search assets by name or ID"
                  emptyMessage="No assets found"
                />
              ),
            },
            {
              title: "Description",
              content: (
                <TextArea
                  rows={4}
                  value={claimData.description}
                  onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
                  placeholder="Provide summary of incident, damages, or supporting notes"
                />
              ),
            },
          ],
        };
    }
  };

  const config = getFormConfig();

  return (
    <BaseFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={config.title}
      description={config.description}
      sections={config.sections}
      onSubmit={handleSubmit}
      isEditing={isEditing}
    />
  );
};

// Legacy exports for backward compatibility
export const InsuranceFormModal = ({
  insurance,
  ...props
}: {
  insurance?: CoverageInsurance;
} & Omit<CoverageFormModalProps, "variant" | "initialData">) => (
  <CoverageFormModal variant="insurance" initialData={insurance} {...props} />
);

export const WarrantyFormModal = ({
  warranty,
  ...props
}: {
  warranty?: CoverageWarranty;
} & Omit<CoverageFormModalProps, "variant" | "initialData">) => (
  <CoverageFormModal variant="warranty" initialData={warranty} {...props} />
);

export const ClaimFormModal = ({
  claim,
  ...props
}: {
  claim?: CoverageClaim;
} & Omit<CoverageFormModalProps, "variant" | "initialData">) => (
  <CoverageFormModal variant="claim" initialData={claim} {...props} />
);
