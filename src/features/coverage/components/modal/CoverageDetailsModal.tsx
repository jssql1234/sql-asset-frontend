import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/components";
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
  gridSections?: DetailSection[];
}

type CoverageVariant = "insurance" | "warranty" | "claim";

interface CoverageDetailsModalProps {
  variant: CoverageVariant;
  data: CoverageInsurance | CoverageWarranty | CoverageClaim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModalConfig {
  contentClassName: string;
  title: string;
  subtitle: string;
  sections: DetailSection[];
}

const getInsuranceConfig = (data: CoverageInsurance): ModalConfig => ({
  contentClassName: "max-w-4xl max-h-[80vh] overflow-hidden",
  title: data.name,
  subtitle: `${data.provider} • ${data.policyNumber}`,
  sections: [
    {
      title: "Coverage & Dates",
      gridSections: [
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
            {
              label: "Limit Type",
              value: data.limitType,
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
}: CoverageDetailsModalProps) {
  const config = getModalConfig(variant, data);

  if (!config || !data) {
    return null;
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
              <StatusBadge status={data.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          {config.sections.map((section) => {
            if (section.gridSections) {
              return (
                <div key={section.title} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.gridSections.map((gridSection) => (
                    <DetailModalSection
                      key={gridSection.title}
                      title={gridSection.title}
                      items={gridSection.items}
                    />
                  ))}
                </div>
              );
            }

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