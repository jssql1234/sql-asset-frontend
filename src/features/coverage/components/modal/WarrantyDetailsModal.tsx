import React from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { DetailModalSection } from "@/features/coverage/components/DetailModal";
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
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
                <div className="md:mr-11">
                    <StatusBadge status={warranty.status} />
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6 overflow-y-auto">
              <DetailModalSection
                title="Warranty Coverage"
                items={[
                  {
                    label: "Coverage Details",
                    value: (warranty.coverage),
                  },
                  {
                    label: "Expiry Date",
                    value: formatDate(warranty.expiryDate),
                  },
                ]}
              />

              <DetailModalSection title="Description">
                <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
                  {warranty.description || "No additional description provided."}
                </p>
              </DetailModalSection>

              <DetailModalSection
                title="Assets Covered"
                subtitle={`${warranty.assetsCovered.length} assets`}
                assetGrid={{
                  assets: warranty.assetsCovered,
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
