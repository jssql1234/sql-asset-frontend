import React from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/components";
import { CoverageAssetGrid } from "@/features/coverage/components/CoverageAssetGrid";
import { DetailModalSection } from "@/features/coverage/components/DetailModalSection";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoveragePolicy } from "@/features/coverage/types";
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
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <DialogTitle>{policy.name}</DialogTitle>
                  <DialogDescription>
                    {policy.provider} • {policy.policyNumber}
                  </DialogDescription>
                </div>
                <div className="md:mr-11">
                  <StatusBadge status={policy.status}/>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailModalSection
                  title="Coverage Overview"
                  items={[
                    {
                      label: "Coverage Amount",
                      value: formatCurrency(policy.coverageAmount),
                    },
                    {
                      label: "Remaining Coverage",
                      value: formatCurrency(policy.remainingCoverage)
                    },
                    {
                      label: "Total Claimed",
                      value: formatCurrency(policy.totalClaimed),
                    },
                    {
                      label: "Annual Premium",
                      value: formatCurrency(policy.annualPremium),
                    },
                  ]}
                />

                <DetailModalSection
                  title="Key Dates"
                  items={[
                    {
                      label: "Start Date",
                      value: formatDate(policy.startDate),
                    },
                    {
                      label: "Expiry Date",
                      value: formatDate(policy.expiryDate),
                    },
                  ]}
                />
              </div>

              <DetailModalSection title="Description">
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {policy.description || "No additional description provided."}
                </p>
              </DetailModalSection>

              <DetailModalSection
                title="Assets Covered"
                subtitle={`${policy.assetsCovered.length} assets`}
              >
                <CoverageAssetGrid
                  assets={policy.assetsCovered}
                  action={(asset) => (
                    <Button variant="link" size="sm" aria-label={`View ${asset.name}`}>
                      View Asset
                    </Button>
                  )}
                />
              </DetailModalSection>
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
