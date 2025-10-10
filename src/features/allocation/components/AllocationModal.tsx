import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Button, Card, Badge,} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
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
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});

  const availableAssets = useMemo(() => {
    return assets;
  }, [assets]);

  const resetState = () => {
    setStep(1);
    setAllocationType(null);
    setTargetLocation("");
    setTargetUser("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setSelectedMap({});
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedMap({});
    } else {
      resetState();
    }
  }, [isOpen]);

  const toggleAsset = (assetId: string, maxQuantity: number) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[assetId]) {
        delete next[assetId];
      } else {
        next[assetId] = Math.min(1, maxQuantity);
        if (maxQuantity > 0) {
          next[assetId] = 1;
        }
      }
      return next;
    });
  };

  const updateQuantity = (assetId: string, value: number, max: number) => {
    setSelectedMap((prev) => ({
      ...prev,
      [assetId]: Math.max(0, Math.min(value, max)),
    }));
  };

  const buildSelections = (): AllocationSelection[] =>
    Object.entries(selectedMap)
      .filter(([, quantity]) => quantity > 0)
      .map(([assetId, quantity]) => {
        const asset = assets.find((item) => item.id === assetId);
        return {
          assetId,
          assetName: asset?.name ?? assetId,
          requestedQuantity: quantity,
          availableQuantity: asset?.remaining ?? 0,
        };
      });

  const canProceed = useMemo(() => {
    if (!allocationType) return false;
    const hasAssets = buildSelections().length > 0;
    if (!hasAssets) return false;
    if (allocationType === "location") {
      return targetLocation.trim().length > 0;
    }
    return (
      targetUser.trim().length > 0 &&
      startDate !== undefined &&
      startDate !== ""
    );
  }, [allocationType, targetLocation, targetUser, startDate, selectedMap]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                            onChange={(event) => setTargetLocation(event.target.value)}
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
                              onChange={(event) => setTargetUser(event.target.value)}
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
                              onChange={(value) => setStartDate(value as string | Date)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="body-small text-onSurface">
                              End Date (Optional)
                            </label>
                            <SemiDatePicker
                              inputType="dateTime"
                              value={endDate}
                              onChange={(value) => setEndDate(value as string | Date)}
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
                          {Object.keys(selectedMap).length}
                        </dd>
                      </div>
                      <div>
                        <dt className="body-small text-onSurfaceVariant">
                          Total quantity
                        </dt>
                        <dd className="label-large text-onSurface">
                          {Object.values(selectedMap).reduce(
                            (sum, quantity) => sum + quantity,
                            0
                          )}
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
                      Set the quantity for each asset. Max quantity is based on remaining availability.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {availableAssets.map((asset) => {
                      const selected = Boolean(selectedMap[asset.id]);
                      const quantity = selectedMap[asset.id] ?? 0;
                      const maxQuantity = Math.max(asset.remaining, asset.total - asset.allocated);
                      return (
                        <button
                          type="button"
                          key={asset.id}
                          onClick={() => toggleAsset(asset.id, maxQuantity)}
                          className={cn(
                            "flex h-full flex-col gap-4 rounded-lg border p-4 text-left transition-shadow",
                            selected
                              ? "border-primary bg-primaryContainer shadow-sm"
                              : "border-outline bg-surface hover:border-primary"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="label-medium text-onSurface">
                                {asset.name}
                              </p>
                              <p className="body-small text-onSurfaceVariant">
                                {asset.code} • {asset.category}
                              </p>
                            </div>
                            <Badge
                              text={asset.status}
                              variant={selected ? "primary" : "secondary"}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="body-small text-onSurfaceVariant">
                                Remaining
                              </span>
                              <span className="label-large text-onSurface">
                                {asset.remaining}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="body-small text-onSurfaceVariant">
                                Utilisation
                              </span>
                              <span className="label-large text-onSurface">
                                {Math.round(asset.utilizationRate * 100)}%
                              </span>
                            </div>
                          </div>
                          {selected && (
                            <div
                              className="flex items-center gap-3 rounded-md border border-primary bg-primaryContainer px-3 py-2"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <label
                                htmlFor={`allocation-qty-${asset.id}`}
                                className="body-small text-primary"
                              >
                                Quantity
                              </label>
                              <Input
                                id={`allocation-qty-${asset.id}`}
                                type="number"
                                min={1}
                                max={maxQuantity}
                                value={quantity}
                                onChange={(event) =>
                                  updateQuantity(
                                    asset.id,
                                    Number(event.target.value),
                                    maxQuantity
                                  )
                                }
                                className="w-20"
                              />
                              <span className="body-small text-onSurfaceVariant">
                                of {maxQuantity}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {availableAssets.length === 0 && (
                    <div className="rounded-md border border-dashed border-outline p-6 text-center">
                      <p className="body-medium text-onSurfaceVariant">
                        No assets available for allocation. Select assets from the main table first.
                      </p>
                    </div>
                  )}
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
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-outline bg-surface px-6 py-4">
          {step === 2 ? (
            <div className="flex w-full items-center justify-between gap-3">
              <div className="body-small text-onSurfaceVariant">
                {Object.keys(selectedMap).length === 0 &&
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
