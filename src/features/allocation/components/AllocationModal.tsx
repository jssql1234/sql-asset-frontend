import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Button, Card } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import { cn } from "@/utils/utils";
import type { AllocationActionPayload, AllocationSelection, AllocationType, AssetRecord, } from "../types";

interface AllocationModalProps {
  isOpen: boolean;
  assets: AssetRecord[];
  locations: string[];
  users: string[];
  onClose: () => void;
  onSubmit: (payload: AllocationActionPayload) => void;
}

const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  assets,
  locations,
  users,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [allocationType, setAllocationType] =
    useState<AllocationType | null>(null);
  const [targetLocation, setTargetLocation] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [startDate, setStartDate] = useState<string | Date | undefined>();
  const [endDate, setEndDate] = useState<string | Date | undefined>();
  const [notes, setNotes] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Prepare asset categories for SearchWithDropdown
  const assetCategories = useMemo(() => {
    const categories = Array.from(new Set(assets.map((asset) => asset.category)));
    return [
      { id: "all", label: "All Categories" },
      ...categories.map((category) => ({
        id: category,
        label: category,
      })),
    ];
  }, [assets]);

  // Prepare asset items for SearchWithDropdown
  const assetItems = useMemo(() => {
    return assets.map((asset) => ({
      id: asset.id,
      label: `${asset.name} (${asset.code})`,
      sublabel: asset.category,
    }));
  }, [assets]);

  const resetState = useCallback(() => {
    setStep(1);
    setAllocationType(null);
    setTargetLocation("");
    setTargetUser("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setSelectedAssetIds([]);
    setSelectedCategoryId("all");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  // Handle asset selection from SearchWithDropdown
  const handleAssetSelectionChange = useCallback((assetIds: string[]) => {
    setSelectedAssetIds(assetIds);
  }, []);

  const buildSelections = (): AllocationSelection[] =>
    selectedAssetIds.map((assetId) => {
      const asset = assets.find((item) => item.id === assetId);
      return {
        assetId,
        assetName: asset?.name ?? assetId,
        requestedQuantity: 1,
        availableQuantity: asset?.remaining ?? 0,
      };
    });

  const canProceed = useMemo(() => {
    if (!allocationType) return false;
    const hasAssets = selectedAssetIds.length > 0;
    if (!hasAssets) return false;
    if (allocationType === "location") {
      return targetLocation.trim().length > 0;
    }
    return (
      targetUser.trim().length > 0 &&
      startDate !== undefined &&
      startDate !== ""
    );
  }, [allocationType, targetLocation, targetUser, startDate, selectedAssetIds]);

  const handleBack = () => {
    setAllocationType(null);
    setStep(1);
  };

  const handleSubmit = () => {
    if (!allocationType) return;
    const payload: AllocationActionPayload = {
      type: allocationType,
      targetLocation: allocationType === "location" ? targetLocation : undefined,
      targetUser: allocationType === "user" ? targetUser : undefined,
      startDate:
        allocationType === "user" && startDate
          ? new Date(startDate).toISOString()
          : undefined,
      endDate:
        allocationType === "user" && endDate
          ? new Date(endDate).toISOString()
          : undefined,
      notes: notes.trim() || undefined,
      assets: buildSelections(),
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden border border-outline bg-surface p-0">
        <DialogHeader className="space-y-2 border-b border-outline px-6 py-4">
          <DialogTitle className="title-medium text-onSurface">
            Asset Allocation & Assignment
          </DialogTitle>
          <p className="body-small text-onSurfaceVariant">
            {step === 1
              ? "Choose the allocation workflow that matches your requirement."
              : "Configure allocation details and select assets to include."}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <AllocationTypeCard
                title="Allocate to Location"
                description="Assign assets to a location, branch, or department for shared usage."
                iconColor="bg-warning"
                onClick={() => {
                  setAllocationType("location");
                  setStep(2);
                }}
              />
              <AllocationTypeCard
                title="Assign to User"
                description="Assign assets directly to a user with optional scheduling and return date."
                iconColor="bg-error"
                onClick={() => {
                  setAllocationType("user");
                  setStep(2);
                }}
              />
            </div>
          )}

          {step === 2 && allocationType && (
            <div className="space-y-6">
              <Card className="border border-outline bg-surfaceContainer">
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div className="space-y-3">
                    <h3 className="title-small text-onSurface">
                      Allocation Details
                    </h3>
                    {allocationType === "location" ? (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className="body-small text-onSurface">
                            Target Location
                          </label>
                          <Input
                            placeholder="eg. HQ - IT Store"
                            value={targetLocation}
                            onChange={(event) => { setTargetLocation(event.target.value); }}
                            list="allocation-locations"
                          />
                          <datalist id="allocation-locations">
                            {locations.map((location) => (
                              <option key={location} value={location} />
                            ))}
                          </datalist>
                        </div>
                        <p className="body-small text-onSurfaceVariant">
                          Assets remain at this location until returned or transferred.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <label className="body-small text-onSurface">
                              Assign To
                            </label>
                            <Input
                              placeholder="eg. John Lee"
                              value={targetUser}
                              onChange={(event) => { setTargetUser(event.target.value); }}
                              list="allocation-users"
                            />
                            <datalist id="allocation-users">
                              {users.map((user) => (
                                <option key={user} value={user} />
                              ))}
                            </datalist>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="body-small text-onSurface">
                              Start Date
                            </label>
                            <SemiDatePicker
                              inputType="dateTime"
                              value={startDate}
                              onChange={(value) => { setStartDate(value as string | Date); }}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="body-small text-onSurface">
                              End Date (Optional)
                            </label>
                            <SemiDatePicker
                              inputType="dateTime"
                              value={endDate}
                              onChange={(value) => { setEndDate(value as string | Date); }}
                            />
                          </div>
                        </div>
                        <p className="body-small text-onSurfaceVariant">
                          Assignments can be returned or transferred earlier if needed.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-outline bg-surfaceContainerLow p-4">
                    <dl className="grid gap-2">
                      <div>
                        <dt className="body-small text-onSurfaceVariant">
                          Selected assets
                        </dt>
                        <dd className="label-large text-onSurface">
                          {selectedAssetIds.length}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="border border-outline bg-surfaceContainer">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="title-small text-onSurface">
                      Select Assets
                    </h3>
                    <p className="body-small text-onSurfaceVariant">
                      Choose specific assets from each category to allocate.
                    </p>
                  </div>

                  <SearchWithDropdown
                    categories={assetCategories}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryChange={setSelectedCategoryId}
                    items={assetItems}
                    selectedIds={selectedAssetIds}
                    onSelectionChange={handleAssetSelectionChange}
                    placeholder="Search assets by name or code..."
                    emptyMessage="No assets found"
                    className="w-full"
                    hideSelectedCount
                  />
                </div>
              </Card>

              <div className="flex flex-col gap-2">
                <label className="body-small text-onSurface" htmlFor="allocation-notes">
                  Notes (optional)
                </label>
                <TextArea
                  id="allocation-notes"
                  rows={3}
                  maxRows={6}
                  placeholder="Provide additional instructions or context for this allocation."
                  value={notes}
                  onChange={(event) => { setNotes(event.target.value); }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-outline bg-surface px-6 py-4">
          {step === 2 ? (
            <div className="flex w-full items-center justify-between gap-3">
              <div className="body-small text-onSurfaceVariant">
                {selectedAssetIds.length === 0 &&
                  "Select at least one asset to continue."}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button disabled={!canProceed} onClick={handleSubmit}>
                  Create Allocation
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AllocationTypeCardProps {
  title: string;
  description: string;
  iconColor: string;
  onClick: () => void;
}

const AllocationTypeCard: React.FC<AllocationTypeCardProps> = ({
  title,
  description,
  iconColor,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col gap-4 rounded-xl border border-outline bg-surface p-6 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
  >
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", iconColor)}>
      <span className="text-xl text-white">↦</span>
    </div>
    <div className="space-y-2">
      <h4 className="label-large-bold text-onSurface">{title}</h4>
      <p className="body-small text-onSurfaceVariant">{description}</p>
    </div>
  </button>
);

export default AllocationModal;
