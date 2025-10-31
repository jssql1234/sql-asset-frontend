import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";
import { DetailModalSection } from "@/features/coverage/components/DetailModal";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageClaim, CoverageInsurance, CoverageWarranty, CoverageStatus } from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

export interface CoverageItem {
  id: string;
  name: string;
}

export interface BaseCoverageData {
  status: CoverageStatus;
  description?: string;
  assetsCovered?: CoverageItem[];
  assets?: CoverageItem[];
}

export interface DetailSection {
  title: string;
  subtitle?: string;
  items?: {
    label: string;
    value: ReactNode;
  }[];
  children?: ReactNode;
  assetGrid?: {
    assets: CoverageItem[];
  };
}

type CoverageVariant = "insurance" | "warranty" | "claim";

interface CoverageDetailsModalProps {
  variant: CoverageVariant;
  data: CoverageInsurance | CoverageWarranty | CoverageClaim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (data: CoverageInsurance | CoverageWarranty | CoverageClaim) => void;
}

interface ModalConfig {
  contentClassName: string;
  editButtonLabel: string;
  showCloseButton: boolean;
  emptyMessage: string;
  title: string;
  subtitle: string;
  sections: DetailSection[];
}

const getInsuranceConfig = (data: CoverageInsurance): ModalConfig => ({
  contentClassName: "max-w-4xl max-h-[80vh] overflow-hidden",
  editButtonLabel: "Edit Policy",
  showCloseButton: false,
  emptyMessage: "Select a policy to view its details.",
  title: data.name,
  subtitle: `${data.provider} • ${data.policyNumber}`,
  sections: [
    {
      title: "Coverage Overview",
      items: [
        {
          label: "Coverage Amount",
          value: formatCurrency(data.coverageAmount),
        },
        {
          label: "Remaining Coverage",
          value: formatCurrency(data.remainingCoverage),
        },
        {
          label: "Total Claimed",
          value: formatCurrency(data.totalClaimed),
        },
        {
          label: "Annual Premium",
          value: formatCurrency(data.annualPremium),
        },
      ],
    },
    {
      title: "Key Dates",
      items: [
        {
          label: "Start Date",
          value: formatDate(data.startDate),
        },
        {
          label: "Expiry Date",
          value: formatDate(data.expiryDate),
        },
      ],
    },
    {
      title: "Description",
      children: (
        <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
          {data.description ?? "No additional description provided."}
        </p>
      ),
    },
    {
      title: "Assets Covered",
      subtitle: `${data.assetsCovered.length.toString()} assets`,
      assetGrid: {
        assets: data.assetsCovered,
      },
    },
  ],
});

const getWarrantyConfig = (data: CoverageWarranty): ModalConfig => ({
  contentClassName: "max-w-3xl max-h-[80vh] overflow-hidden",
  editButtonLabel: "Edit Warranty",
  showCloseButton: true,
  emptyMessage: "Select a warranty to view its details.",
  title: data.name,
  subtitle: `${data.provider} • ${data.warrantyNumber}`,
  sections: [
    {
      title: "Warranty Coverage",
      items: [
        {
          label: "Coverage Details",
          value: data.coverage,
        },
        {
          label: "Expiry Date",
          value: formatDate(data.expiryDate),
        },
      ],
    },
    {
      title: "Description",
      children: (
        <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
          {data.description ?? "No additional description provided."}
        </p>
      ),
    },
    {
      title: "Assets Covered",
      subtitle: `${data.assetsCovered.length.toString()} assets`,
      assetGrid: {
        assets: data.assetsCovered,
      },
    },
  ],
});

const getClaimConfig = (data: CoverageClaim): ModalConfig => ({
  contentClassName: "max-w-3xl max-h-[80vh] overflow-hidden",
  editButtonLabel: "Edit Claim",
  showCloseButton: true,
  emptyMessage: "Select a claim to view its details.",
  title: data.claimNumber,
  subtitle: `${data.type} claim • ${data.referenceName} (${data.referenceId})`,
  sections: [
    {
      title: "Claim Summary",
      items: [
        {
          label: "Claim Type",
          value: data.type,
        },
        {
          label: "Reference",
          value: (
            <div className="text-right">
              <span className="block font-medium text-onSurface">{data.referenceName}</span>
              <span className="body-small text-onSurfaceVariant">{data.referenceId}</span>
            </div>
          ),
        },
        {
          label: "Claim Amount",
          value: formatCurrency(data.amount),
        },
        {
          label: "Filed On",
          value: formatDate(data.dateFiled),
        },
        {
          label: "Work Order",
          value: data.workOrderId ?? "Not created",
        },
      ],
    },
    {
      title: "Description",
      children: (
        <p className="body-medium text-onSurfaceVariant whitespace-pre-line">
          {data.description ?? "No additional description provided."}
        </p>
      ),
    },
    {
      title: "Assets",
      subtitle: `${data.assets.length.toString()} assets`,
      assetGrid: {
        assets: data.assets,
      },
    },
  ],
});

const getModalConfig = (
  variant: CoverageVariant,
  data: CoverageInsurance | CoverageWarranty | CoverageClaim | null
): ModalConfig | null => {
  if (!data) return null;

  switch (variant) {
    case "insurance":
      return getInsuranceConfig(data as CoverageInsurance);
    case "warranty":
      return getWarrantyConfig(data as CoverageWarranty);
    case "claim":
      return getClaimConfig(data as CoverageClaim);
  }
};

export function CoverageDetailsModal({
  variant,
  data,
  open,
  onOpenChange,
  onEdit,
}: CoverageDetailsModalProps) {
  const config = getModalConfig(variant, data);

  if (!config) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <div className="py-10 text-center body-medium text-onSurfaceVariant">
            {variant === "insurance" && "Select a policy to view its details."}
            {variant === "warranty" && "Select a warranty to view its details."}
            {variant === "claim" && "Select a claim to view its details."}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={config.contentClassName}>
        <DialogHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.subtitle}</DialogDescription>
            </div>
            <div className="md:mr-11">
              {data && <StatusBadge status={data.status} />}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto">
          {config.sections.map((section) => {
            if (section.children) {
              return (
                <DetailModalSection key={section.title} title={section.title}>
                  {section.children}
                </DetailModalSection>
              );
            }

            if (section.assetGrid) {
              return (
                <DetailModalSection
                  key={section.title}
                  title={section.title}
                  subtitle={section.subtitle}
                  assetGrid={section.assetGrid}
                />
              );
            }

            if (section.items) {
              return (
                <DetailModalSection
                  key={section.title}
                  title={section.title}
                  items={section.items}
                />
              );
            }

            return null;
          })}
        </div>

        <DialogFooter className="flex justify-end gap-3">
          {config.showCloseButton && (
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Close
            </Button>
          )}
          <Button
            onClick={() => {
              if (onEdit && data) {
                onEdit(data);
              }
            }}
          >
            {config.editButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Legacy exports for backward compatibility
export const InsuranceDetailsModal = ({ insurance, ...props }: { insurance: CoverageInsurance | null } & Omit<CoverageDetailsModalProps, 'variant' | 'data'>) => (
  <CoverageDetailsModal variant="insurance" data={insurance} {...props} />
);

export const WarrantyDetailsModal = ({ warranty, ...props }: { warranty: CoverageWarranty | null } & Omit<CoverageDetailsModalProps, 'variant' | 'data'>) => (
  <CoverageDetailsModal variant="warranty" data={warranty} {...props} />
);

export const ClaimDetailsModal = ({ claim, ...props }: { claim: CoverageClaim | null } & Omit<CoverageDetailsModalProps, 'variant' | 'data'>) => (
  <CoverageDetailsModal variant="claim" data={claim} {...props} />
);