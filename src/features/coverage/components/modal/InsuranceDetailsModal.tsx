import React from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/components";
import { DetailModalSection } from "@/features/coverage/components/DetailModal";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageInsurance } from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

interface InsuranceDetailsModalProps {
  insurance: CoverageInsurance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsuranceDetailsModal: React.FC<InsuranceDetailsModalProps> = ({
  insurance,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        {insurance ? (
          <>
            <DialogHeader>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <DialogTitle>{insurance.name}</DialogTitle>
                  <DialogDescription>
                    {insurance.provider} • {insurance.policyNumber}
                  </DialogDescription>
                </div>
                <div className="md:mr-11">
                  <StatusBadge status={insurance.status}/>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailModalSection
                  title="Coverage Overview"
                  items={[
                    {
                      label: "Coverage Amount",
                      value: formatCurrency(insurance.coverageAmount),
                    },
                    {
                      label: "Remaining Coverage",
                      value: formatCurrency(insurance.remainingCoverage)
                    },
                    {
                      label: "Total Claimed",
                      value: formatCurrency(insurance.totalClaimed),
                    },
                    {
                      label: "Annual Premium",
                      value: formatCurrency(insurance.annualPremium),
                    },
                  ]}
                />

                <DetailModalSection
                  title="Key Dates"
                  items={[
                    {
                      label: "Start Date",
                      value: formatDate(insurance.startDate),
                    },
                    {
                      label: "Expiry Date",
                      value: formatDate(insurance.expiryDate),
                    },
                  ]}
                />
              </div>

              <DetailModalSection title="Description">
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {insurance.description || "No additional description provided."}
                </p>
              </DetailModalSection>

              <DetailModalSection
                title="Assets Covered"
                subtitle={`${insurance.assetsCovered.length} assets`}
                assetGrid={{
                  assets: insurance.assetsCovered,
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
