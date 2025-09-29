import React, { useMemo, useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import type { ClaimType, CoverageClaim, CoveragePolicy, CoverageWarranty } from "@/features/coverage/types";

interface ClaimFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policies: CoveragePolicy[];
  warranties: CoverageWarranty[];
  initialClaim?: CoverageClaim;
}

export const ClaimFormModal: React.FC<ClaimFormModalProps> = ({
  open,
  onOpenChange,
  policies,
  warranties,
  initialClaim,
}) => {
  const [claimType, setClaimType] = useState<ClaimType>(initialClaim?.type ?? "Insurance");
  const [referenceId, setReferenceId] = useState<string>(initialClaim?.referenceId ?? "");

  const references = useMemo(() => {
    return claimType === "Insurance" ? policies : warranties;
  }, [claimType, policies, warranties]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialClaim ? "Edit Claim" : "Add Claim"}</DialogTitle>
          <DialogDescription>
            Record an insurance or warranty claim. Additional workflow automation and validations will be handled by dedicated hooks later on.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Claim Type *</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  label={claimType}
                  className="justify-between"
                />
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
                      ? references.find((item) => item.id === referenceId)?.name ?? "Select reference"
                      : "Select reference"
                  }
                  className="justify-between"
                />
                <DropdownMenuContent className="max-h-64 overflow-y-auto min-w-[260px]">
                  {references.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setReferenceId(item.id)}
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
              <Input defaultValue={initialClaim?.claimNumber} placeholder="e.g. CLM-2025-118" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Incident Date *</label>
              <Input type="date" defaultValue={initialClaim?.dateFiled} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Claim Amount *</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                defaultValue={initialClaim?.amount}
                placeholder="Enter claim amount"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Claim Status *</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  label={initialClaim?.status ?? "Filed"}
                  className="justify-between"
                />
                <DropdownMenuContent>
                  {(["Filed", "Approved", "Settled", "Rejected"] as const).map((status) => (
                    <DropdownMenuItem key={status}>{status}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="body-small text-onSurface">Assets</label>
              <Button variant="outline" size="sm">
                Manage Assets
              </Button>
            </div>
            <Input placeholder="Search assets by name or ID" disabled />
            <div className="min-h-[80px] rounded-md border border-outline flex flex-wrap gap-2 p-3 bg-surfaceContainer">
              {initialClaim?.assets.length ? (
                initialClaim.assets.map((asset) => (
                  <span
                    key={asset.id}
                    className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 body-small text-primary"
                  >
                    {asset.name}
                  </span>
                ))
              ) : (
                <span className="body-small text-onSurfaceVariant">
                  Asset selection UI will connect to maintenance assets in subsequent iteration.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="body-small text-onSurface">Description *</label>
            <TextArea
              rows={4}
              placeholder="Provide summary of incident, damages, or supporting notes"
              defaultValue={initialClaim?.description}
            />
          </div>

          <DialogFooter className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
