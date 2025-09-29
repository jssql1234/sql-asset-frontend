import React from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageClaim } from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

interface ClaimDetailsModalProps {
  claim: CoverageClaim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claim,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {claim ? (
          <>
            <DialogHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <DialogTitle>{claim.claimNumber}</DialogTitle>
                  <DialogDescription>
                    {claim.type} claim • {claim.referenceName} ({claim.referenceId})
                  </DialogDescription>
                </div>
                <StatusBadge status={claim.status} />
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <h3 className="title-small font-semibold text-onSurface mb-3">Claim Summary</h3>
                <dl className="space-y-3 body-medium text-onSurface">
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Claim Type</dt>
                    <dd className="font-semibold text-onSurface">{claim.type}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Reference</dt>
                    <dd className="text-right">
                      <span className="block font-medium text-onSurface">{claim.referenceName}</span>
                      <span className="body-small text-onSurfaceVariant">{claim.referenceId}</span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Claim Amount</dt>
                    <dd className="font-semibold">{formatCurrency(claim.amount)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Work Order</dt>
                    <dd>{claim.workOrderId ?? "Not created"}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <h3 className="title-small font-semibold text-onSurface mb-3">Timeline</h3>
                <dl className="space-y-3 body-medium text-onSurface">
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Filed On</dt>
                    <dd>{formatDate(claim.dateFiled)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Status</dt>
                    <dd>
                      <StatusBadge status={claim.status} />
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <h3 className="title-small font-semibold text-onSurface mb-3">Description</h3>
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {claim.description || "No additional description provided."}
                </p>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="title-small font-semibold text-onSurface">Assets</h3>
                  <span className="body-small text-onSurfaceVariant">
                    {claim.assets.length} assets
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {claim.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-md border border-outlineVariant bg-surfaceContainerLowest px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-onSurface">{asset.name}</span>
                        <span className="body-small text-onSurfaceVariant">{asset.id}</span>
                      </div>
                      <Button variant="link" size="sm">
                        View Asset
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <DialogFooter className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button>Edit Claim</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-10 text-center body-medium text-onSurfaceVariant">
            Select a claim to view its details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
