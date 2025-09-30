import { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import type { ClaimSummaryMetrics, InsuranceSummaryMetrics, WarrantySummaryMetrics } from "@/features/coverage/types";
import { formatCurrency } from "@/features/coverage/utils/formatters";

interface InsuranceSummaryCardsProps {
  summary: InsuranceSummaryMetrics;
}

export const InsuranceSummaryCards: React.FC<InsuranceSummaryCardsProps> = ({ summary }) => {
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Policies",
        value: summary.activeInsurances,
        description: "In-force coverage",
        tone: summary.activeInsurances > 0 ? "success" : "default",
      },
      {
        label: "Total Coverage",
        value: formatCurrency(summary.totalCoverage),
        description: "Aggregate limit",
      },
      {
        label: "Remaining Coverage",
        value: formatCurrency(summary.remainingCoverage),
        description: "Available balance",
      },
      {
        label: "Annual Premiums",
        value: formatCurrency(summary.annualPremiums),
        description: "Per fiscal year",
      },
      {
        label: "Assets Covered",
        value: summary.assetsCovered,
        description: "Across all policies",
      },
      {
        label: "Assets Not Covered",
        value: summary.assetsNotCovered,
        tone: summary.assetsNotCovered > 0 ? "warning" : "success",
      },
      {
        label: "Expiring Soon (30d)",
        value: summary.expiringSoon,
        tone: summary.expiringSoon > 0 ? "warning" : "success",
      },
      {
        label: "Expired Policies",
        value: summary.expired,
        tone: summary.expired > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

  return <SummaryCards data={summaryCards} columns={4} />;
};

interface WarrantySummaryCardsProps {
  summary: WarrantySummaryMetrics;
}

export const WarrantySummaryCards: React.FC<WarrantySummaryCardsProps> = ({ summary }) => {
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Warranties",
        value: summary.activeWarranties,
        description: "Currently in coverage",
        tone: summary.activeWarranties > 0 ? "success" : "default",
      },
      {
        label: "Assets Covered",
        value: summary.assetsCovered,
        description: "Equipment protected",
      },
      {
        label: "Assets Not Covered",
        value: summary.assetsNotCovered,
        tone: summary.assetsNotCovered > 0 ? "warning" : "success",
      },
      {
        label: "Expiring Soon (30d)",
        value: summary.expiringSoon,
        tone: summary.expiringSoon > 0 ? "warning" : "success",
      },
      {
        label: "Expired Warranties",
        value: summary.expired,
        tone: summary.expired > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

  return <SummaryCards data={summaryCards} columns={4} />;
};

interface ClaimSummaryCardsProps {
  summary: ClaimSummaryMetrics;
}

export const ClaimSummaryCards: React.FC<ClaimSummaryCardsProps> = ({ summary }) => {
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Total Claims",
        value: summary.totalClaims,
        description: "Across policies & warranties",
      },
      {
        label: "Pending Claims",
        value: summary.pendingClaims,
        tone: summary.pendingClaims > 0 ? "warning" : "success",
      },
      {
        label: "Settled Claims",
        value: summary.settledClaims,
        tone: summary.settledClaims > 0 ? "success" : "default",
      },
      {
        label: "Total Settlement Amount",
        value: formatCurrency(summary.totalSettlementAmount),
        description: "Approved payouts",
      },
      {
        label: "Rejected Claims",
        value: summary.rejectedClaims,
        tone: summary.rejectedClaims > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

  return <SummaryCards data={summaryCards} columns={4} />;
};
