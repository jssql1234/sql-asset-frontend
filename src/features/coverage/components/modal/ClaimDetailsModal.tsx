import React from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { DetailModalSection } from "@/features/coverage/components/modal/DetailModal";
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
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
                <div className="md:mr-11">
                    <StatusBadge status={claim.status} />
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6 overflow-y-auto">
              <DetailModalSection
                title="Claim Summary"
                items={[
                  {
                    label: "Claim Type",
                    value: claim.type,
                  },
                  {
                    label: "Reference",
                    value: (
                      <div className="text-right">
                        <span className="block font-medium text-onSurface">{claim.referenceName}</span>
                        <span className="body-small text-onSurfaceVariant">{claim.referenceId}</span>
                      </div>
                    ),
                  },
                  {
                    label: "Claim Amount",
                    value: formatCurrency(claim.amount),
                  },
                  {
                    label: "Filed On",
                    value: formatDate(claim.dateFiled),
                  },
                  {
                    label: "Work Order",
                    value: claim.workOrderId ?? "Not created",
                  },
                ]}
              />

              <DetailModalSection title="Description">
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {claim.description || "No additional description provided."}
                </p>
              </DetailModalSection>

              <DetailModalSection
                title="Assets"
                subtitle={`${claim.assets.length} assets`}
                assetGrid={{
                  assets: claim.assets,
                  action: (asset) => (
                    <Button variant="link" size="sm" aria-label={`View ${asset.name}`}>
                      View Asset
                    </Button>
                  ),
                }}
              />
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
