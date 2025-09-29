import React from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/components";
import { CoverageAssetGrid } from "@/features/coverage/components/CoverageAssetGrid";
import { CoverageDefinitionList } from "@/features/coverage/components/CoverageDefinitionList";
import { CoverageSection } from "@/features/coverage/components/CoverageSection";
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
                <CoverageSection title="Coverage Overview">
                  <CoverageDefinitionList
                    items={[
                      {
                        label: "Coverage Amount",
                        value: (
                          <span className="font-semibold text-onSurface">
                            {formatCurrency(policy.coverageAmount)}
                          </span>
                        ),
                      },
                      {
                        label: "Remaining Coverage",
                        value: (
                          <span className="font-semibold text-onSurface">
                            {formatCurrency(policy.remainingCoverage)}
                          </span>
                        ),
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
                </CoverageSection>

                <CoverageSection title="Key Dates">
                  <CoverageDefinitionList
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
                </CoverageSection>
              </div>

              <CoverageSection title="Description">
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {policy.description || "No additional description provided."}
                </p>
              </CoverageSection>

              <CoverageSection
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
              </CoverageSection>
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
