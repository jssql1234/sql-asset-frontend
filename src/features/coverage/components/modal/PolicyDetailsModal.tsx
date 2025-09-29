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
import type { CoveragePolicy } from "@/features/coverage/types";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

interface PolicyDetailsModalProps {
  policy: CoveragePolicy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({
  policy,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {policy ? (
          <>
            <DialogHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <DialogTitle>{policy.name}</DialogTitle>
                  <DialogDescription>
                    {policy.provider} • {policy.policyNumber}
                  </DialogDescription>
                </div>
                <StatusBadge status={policy.status} />
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-md border border-outline bg-surfaceContainer p-4">
                  <h3 className="title-small font-semibold text-onSurface mb-3">Coverage Overview</h3>
                  <dl className="space-y-3 body-medium text-onSurface">
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Coverage Amount</dt>
                      <dd className="font-semibold">{formatCurrency(policy.coverageAmount)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Remaining Coverage</dt>
                      <dd className="font-semibold">{formatCurrency(policy.remainingCoverage)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Total Claimed</dt>
                      <dd>{formatCurrency(policy.totalClaimed)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Annual Premium</dt>
                      <dd>{formatCurrency(policy.annualPremium)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-md border border-outline bg-surfaceContainer p-4">
                  <h3 className="title-small font-semibold text-onSurface mb-3">Key Dates</h3>
                  <dl className="space-y-3 body-medium text-onSurface">
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Start Date</dt>
                      <dd>{formatDate(policy.startDate)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Expiry Date</dt>
                      <dd>{formatDate(policy.expiryDate)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-onSurfaceVariant">Status</dt>
                      <dd>
                        <StatusBadge status={policy.status} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <h3 className="title-small font-semibold text-onSurface mb-3">Description</h3>
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {policy.description || "No additional description provided."}
                </p>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
                  <span className="body-small text-onSurfaceVariant">
                    {policy.assetsCovered.length} assets
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {policy.assetsCovered.map((asset) => (
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
              <Button>Edit Policy</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-10 text-center body-medium text-onSurfaceVariant">
            Select a policy to view its details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
