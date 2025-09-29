import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
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
              <section className="rounded-md border border-outline bg-surfaceContainer p-4 flex flex-col gap-4">
                <h3 className="title-small font-semibold text-onSurface">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4 flex flex-col gap-4">
                <h3 className="title-small font-semibold text-onSurface">Assets</h3>
                <p className="body-small text-onSurfaceVariant">
                  Asset linkage is read-only for warranty-originated work orders.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {claim.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-md border border-outlineVariant bg-surfaceContainerLowest px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-onSurface">{asset.name}</span>
                        <span className="body-small text-onSurfaceVariant">{asset.id}</span>
                      </div>
                      <Button variant="link" size="sm" disabled>
                        Locked
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4 flex flex-col gap-4">
                <h3 className="title-small font-semibold text-onSurface">Work Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </section>

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
