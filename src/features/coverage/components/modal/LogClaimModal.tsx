import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import { getCoverageAssetName } from "@/features/coverage/mockData";
import type { CoverageInsurance, CoverageWarranty, CoverageClaim, CoverageClaimPayload, ClaimType, ClaimStatus } from "@/features/coverage/types";
import { createClaimSchema, updateClaimSchema } from "@/features/coverage/zod/coverageSchemas";
import { useCoverageAssetCatalog } from "@/features/coverage/hooks/useCoverageAssets";

interface LogClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policies?: CoverageInsurance[];
  warranties?: CoverageWarranty[];
  claim?: CoverageClaim;
  warrantyPrefillData?: Record<string, unknown> | null;
  insurancePrefillData?: Record<string, unknown> | null;
  onCreate?: (data: CoverageClaimPayload) => void;
  onUpdate?: (id: string, data: CoverageClaimPayload) => void;
}

const EMPTY_POLICIES: readonly CoverageInsurance[] = [];
const EMPTY_WARRANTIES: readonly CoverageWarranty[] = [];

export const LogClaimModal = ({
  open,
  onOpenChange,
  policies,
  warranties,
  claim,
  warrantyPrefillData,
  insurancePrefillData,
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
  
  // Track workOrderId for claims created from warranty notifications
  const [workOrderId, setWorkOrderId] = useState<string | undefined>(claim?.workOrderId);
  
  type ClaimFormState = Omit<CoverageClaimPayload, "assets">;
  type ClaimField = keyof ClaimFormState | "assets";
  type ClaimFieldErrors = Partial<Record<ClaimField, string>>;

  const [fieldErrors, setFieldErrors] = useState<ClaimFieldErrors>({});

  // Track amount as string to allow clearing
  const [amountInput, setAmountInput] = useState<string>(
    claim?.amount.toString() ?? ""
  );

  const clearFieldError = (field: ClaimField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== field)
      ) as ClaimFieldErrors;
    });
  };

  // Computed values that depend on state
  const references = useMemo((): readonly (CoverageInsurance | CoverageWarranty)[] => {
    const allReferences = claimType === "Insurance"
      ? policies ?? EMPTY_POLICIES
      : warranties ?? EMPTY_WARRANTIES;
    
    // Filter to show only references with 'Active' status
    return allReferences.filter((ref) => ref.status === "Active");
  }, [claimType, policies, warranties]);

  const { assetCategories, assetOptions, assetNameById } = useCoverageAssetCatalog();

  const availableAssets = useMemo(() => {
    if (!referenceId) {
      return assetOptions;
    }

    const selectedReference = references.find((ref) => ref.id === referenceId);
    if (!selectedReference?.assetsCovered) {
      return assetOptions;
    }

    const coveredAssetIds = new Set(selectedReference.assetsCovered.map((asset) => asset.id));
    return assetOptions.filter((asset) => coveredAssetIds.has(asset.id));
  }, [assetOptions, referenceId, references]);

  useEffect(() => {
    setSelectedAssetIds((prev) => prev.filter((id) => availableAssets.some((asset) => asset.id === id)));
  }, [availableAssets]);

  // Reset form when claim prop changes (for edit mode) or when modal opens/closes
  useEffect(() => {
    if (open) {
      const today = new Date();

      // Check if we have warranty or insurance prefill data from notification
      if ((warrantyPrefillData ?? insurancePrefillData) && !claim) {
        const prefillData = warrantyPrefillData ?? insurancePrefillData;
        if (!prefillData) return; // Safety check
        
        const isWarranty = Boolean(warrantyPrefillData);
        
        // Set claim type based on prefill data
        setClaimType(isWarranty ? "Warranty" : "Insurance");
        setClaimStatus("Filed");
        
        // Set the reference ID (warranty or insurance ID)
        const referenceId = isWarranty 
          ? (prefillData.warrantyId as string)
          : (prefillData.insuranceId as string);
        const assetIds = prefillData.assetIds as string[];
        const woId = prefillData.workOrderId as string;
        const workOrderDescription = prefillData.workOrderDescription as string;
        
        setReferenceId(referenceId);
        setWorkOrderId(woId); // Store work order ID for claim submission

        // Prefill description with work order info
        const coverageType = isWarranty ? "warranty" : "insurance";
        const description = workOrderDescription 
          ? `${workOrderDescription} (From Work Order ${woId})`
          : `${coverageType.charAt(0).toUpperCase() + coverageType.slice(1)} claim from Work Order ${woId}`;

        setClaimData({
          claimNumber: "", // User needs to fill this
          amount: 0, // User needs to fill this
          dateFiled: today.toISOString(),
          description: description,
        });
        
        setAmountInput("");
        setSelectedAssetIds(assetIds);
        setSelectedAssetCategory("all");
        setFieldErrors({});
      } else {
        // Normal claim edit or create mode
        setClaimType(claim?.type ?? "Insurance");
        setClaimStatus(claim?.status ?? "Filed");
        setReferenceId(claim?.referenceId ?? "");

        setClaimData({
          claimNumber: claim?.claimNumber ?? "",
          amount: claim?.amount ?? 0,
          dateFiled: claim?.dateFiled ?? today.toISOString(),
          description: claim?.description ?? "",
        });
        
        setAmountInput(claim?.amount.toString() ?? "");
        setSelectedAssetIds(claim?.assets.map((a) => a.id) ?? []);
        setSelectedAssetCategory("all");
        setFieldErrors({});
      }
    }
  }, [claim, open, warrantyPrefillData, insurancePrefillData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Get selected assets with their names
    const assets = selectedAssetIds.map((id) => ({
      id,
      name: assetNameById.get(id) ?? getCoverageAssetName(id),
    }));
    
    // Find reference name
    const reference = references.find(ref => ref.id === referenceId);
    const referenceName = reference?.name ?? "";
    
    // Use the amount from claimData for both Insurance and Warranty types
    const claimAmount = Number.isFinite(claimData.amount) ? claimData.amount : 0;

    const formData: CoverageClaimPayload = {
      claimNumber: claimData.claimNumber,
      type: claimType,
      referenceId,
      referenceName,
      assets,
      amount: claimAmount,
      status: claimStatus,
      dateFiled: claimData.dateFiled,
      workOrderId: workOrderId, // Use the state variable that gets set from warranty notification
      description: claimData.description,
    };

    const schema = isEditing ? updateClaimSchema : createClaimSchema;
    const validation = schema.safeParse(formData);

    if (!validation.success) {
      const errors: ClaimFieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          errors[field as ClaimField] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    if (isEditing && claim && onUpdate) {
      onUpdate(claim.id, formData);
    } else if (!isEditing && onCreate) {
      onCreate(formData);
    }    
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
            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Claim Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Claim Type<span className="text-error"> *</span></label>
                  {isEditing ? (
                    <Input value={claimType} disabled />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger label={claimType} className="w-full justify-between" />
                      <DropdownMenuContent>
                        {(["Insurance", "Warranty"] as ClaimType[]).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => {
                              setClaimType(type);
                              setReferenceId("");
                              setSelectedAssetIds([]);
                              // Reset amount for warranty claims
                              if (type === "Warranty") {
                                setClaimData(prev => ({ ...prev, amount: 0 }));
                                setAmountInput("");
                              }
                            }}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Policy / Warranty<span className="text-error"> *</span></label>
                  {isEditing ? (
                    <Input
                      value={references.find((item) => item.id === referenceId)?.name ?? claim?.referenceName ?? ""}
                      disabled
                    />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        label={
                          referenceId
                            ? references.find((item) => item.id === referenceId)?.name ?? "Select reference"
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
                              setSelectedAssetIds([]);
                              clearFieldError("referenceId");
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
                  )}
                  {fieldErrors.referenceId ? (
                    <span className="label-small text-error">{fieldErrors.referenceId}</span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Claim Number<span className="text-error"> *</span></label>
                  <Input
                    value={claimData.claimNumber}
                    onChange={(event) => {
                      if (isEditing) return;
                      setClaimData({ ...claimData, claimNumber: event.target.value });
                      clearFieldError("claimNumber");
                    }}
                    disabled={isEditing}
                    placeholder="Enter claim number"
                  />
                  {fieldErrors.claimNumber ? (
                    <span className="label-small text-error">{fieldErrors.claimNumber}</span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Incident Date<span className="text-error"> *</span></label>
                  <SemiDatePicker
                    value={claimData.dateFiled ? new Date(claimData.dateFiled) : null}
                    onChange={(date) => {
                      const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
                      setClaimData({ ...claimData, dateFiled: isoDate });
                      clearFieldError("dateFiled");
                    }}
                    inputType="date"
                    className="w-full"
                  />
                  {fieldErrors.dateFiled ? (
                    <span className="label-small text-error">{fieldErrors.dateFiled}</span>
                  ) : null}
                </div>
                {claimType === "Insurance" && (
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Amount<span className="text-error"> *</span></label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={amountInput}
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        setAmountInput(inputValue);
                        const numValue = inputValue === "" ? 0 : Number.parseFloat(inputValue);
                        setClaimData({ ...claimData, amount: Number.isNaN(numValue) ? 0 : numValue });
                        clearFieldError("amount");
                      }}
                      placeholder="Enter claim amount"
                    />
                    {fieldErrors.amount ? (
                      <span className="label-small text-error">{fieldErrors.amount}</span>
                    ) : null}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Claim Status<span className="text-error"> *</span></label>
                  <DropdownMenu>
                    <DropdownMenuTrigger label={claimStatus} className="w-full justify-between" />
                    <DropdownMenuContent>
                      {(["Filed", "Approved", "Settled", "Rejected"] as ClaimStatus[]).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => {
                            setClaimStatus(status);
                          }}
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Assets</h3>
              <div className="flex flex-col gap-2">
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedAssetCategory}
                  onCategoryChange={setSelectedAssetCategory}
                  items={availableAssets}
                  selectedIds={selectedAssetIds}
                  onSelectionChange={(ids) => {
                    setSelectedAssetIds(ids);
                    clearFieldError("assets");
                  }}
                  placeholder="Search assets by name or ID"
                  emptyMessage="No assets found"
                  hideSelectedField={selectedAssetIds.length === 0}
                />
                {fieldErrors.assets ? (
                  <span className="label-small text-error">{fieldErrors.assets}</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="title-small font-semibold text-onSurface">Description<span className="text-error"> *</span></h3>
              <div className="flex flex-col gap-2">
                <TextArea
                  rows={4}
                  value={claimData.description}
                  onChange={(e) => {
                    setClaimData({ ...claimData, description: e.target.value });
                    clearFieldError("description");
                  }}
                  placeholder="Provide summary of incident, damages, or supporting notes"
                />
                {fieldErrors.description ? (
                  <span className="label-small text-error">{fieldErrors.description}</span>
                ) : null}
              </div>
            </div>

            <DialogFooter className="flex justify-end">
              <Button variant="outline" onClick={() => { onOpenChange(false) }}>Cancel</Button>
              <Button type="submit">{isEditing ? "Update claim" : "Add claim"}</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
