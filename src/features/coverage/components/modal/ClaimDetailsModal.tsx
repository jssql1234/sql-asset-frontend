import React from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { CoverageAssetGrid } from "@/features/coverage/components/CoverageAssetGrid";
import { CoverageDefinitionList } from "@/features/coverage/components/CoverageDefinitionList";
import { CoverageSection } from "@/features/coverage/components/CoverageSection";
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
                <div className="md:mr-11">
                    <StatusBadge status={claim.status} />
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <CoverageSection title="Claim Summary">
                <CoverageDefinitionList
                  items={[
                    {
                      label: "Claim Type",
                      value: (
                        <span className="font-semibold text-onSurface">{claim.type}</span>
                      ),
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
                      value: (
                        <span className="font-semibold">{formatCurrency(claim.amount)}</span>
                      ),
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
              </CoverageSection>

              <CoverageSection title="Description">
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {claim.description || "No additional description provided."}
                </p>
              </CoverageSection>

              <CoverageSection
                title="Assets"
                subtitle={`${claim.assets.length} assets`}
              >
                <CoverageAssetGrid
                  assets={claim.assets}
                  action={(asset) => (
                    <Button variant="link" size="sm" aria-label={`View ${asset.name}`}>
                      View Asset
                    </Button>
                  )}
                />
              </CoverageSection>
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
