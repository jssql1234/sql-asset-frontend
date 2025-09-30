import React from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import { DetailModalSection } from "@/features/coverage/components/DetailModalSection";
import type { CoverageClaim } from "@/features/coverage/types";

interface WorkOrderFromClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: CoverageClaim | null;
}

export const WorkOrderFromClaimModal: React.FC<WorkOrderFromClaimModalProps> = ({
  open,
  onOpenChange,
  claim,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {claim ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Work Order from Claim</DialogTitle>
              <DialogDescription>
                Convert warranty claims into actionable maintenance work orders. Workflow automation will wire up scheduling and assignments in future iterations.
              </DialogDescription>
            </DialogHeader>

            <form
              className="flex flex-col gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                onOpenChange(false);
              }}
            >
              <DetailModalSection title="Basic Information">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Work Order ID</label>
                    <Input value={claim.workOrderId ?? "Pending"} disabled />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Claim Reference</label>
                    <Input value={`${claim.claimNumber} • ${claim.referenceName}`} disabled />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="body-small text-onSurface">Job Title *</label>
                    <Input placeholder="e.g. Restore robotic arm alignment" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="body-small text-onSurface">Description</label>
                    <TextArea
                      rows={3}
                      placeholder="Add corrective actions, scope, or service partner notes"
                      defaultValue={claim.description}
                    />
                  </div>
                </div>
              </DetailModalSection>

              <DetailModalSection
                title="Assets"
                subtitle="Asset linkage is read-only for warranty-originated work orders."
                assetGrid={{
                  assets: claim.assets,
                  action: (asset) => (
                    <Button variant="link" size="sm" disabled aria-label={`${asset.name} locked`}>
                      Locked
                    </Button>
                  ),
                }}
              />

              <DetailModalSection title="Work Order Details">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Work Type *</label>
                    <Input placeholder="e.g. Corrective" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Priority *</label>
                    <Input placeholder="e.g. Critical" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="body-small text-onSurface">Status *</label>
                    <Input placeholder="e.g. Approved" />
                  </div>
                </div>
              </DetailModalSection>

              <DialogFooter className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Work Order</Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-10 text-center body-medium text-onSurfaceVariant">
            Select a claim to generate a work order.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
