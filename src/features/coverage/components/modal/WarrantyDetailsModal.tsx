import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageWarranty } from "@/features/coverage/types";
import { formatDate } from "@/features/coverage/utils/formatters";

interface WarrantyDetailsModalProps {
  warranty: CoverageWarranty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WarrantyDetailsModal: React.FC<WarrantyDetailsModalProps> = ({
  warranty,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {warranty ? (
          <>
            <DialogHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <DialogTitle>{warranty.name}</DialogTitle>
                  <DialogDescription>
                    {warranty.provider} • {warranty.warrantyNumber}
                  </DialogDescription>
                </div>
                <StatusBadge status={warranty.status} />
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <h3 className="title-small font-semibold text-onSurface mb-3">Warranty Coverage</h3>
                <dl className="space-y-3 body-medium text-onSurface">
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Coverage Details</dt>
                    <dd className="text-right font-semibold text-onSurface">
                      {warranty.coverage}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-onSurfaceVariant">Expiry Date</dt>
                    <dd>{formatDate(warranty.expiryDate)}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <h3 className="title-small font-semibold text-onSurface mb-3">Description</h3>
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {warranty.description || "No additional description provided."}
                </p>
              </section>

              <section className="rounded-md border border-outline bg-surfaceContainer p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
                  <span className="body-small text-onSurfaceVariant">
                    {warranty.assetsCovered.length} assets
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {warranty.assetsCovered.map((asset) => (
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
              <Button>Edit Warranty</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-10 text-center body-medium text-onSurfaceVariant">
            Select a warranty to view its details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
