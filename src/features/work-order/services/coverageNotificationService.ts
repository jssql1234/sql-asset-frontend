import { notificationService } from "@/features/notification/services/notificationService";
import type { CoverageWarranty, CoverageInsurance } from "@/features/coverage/types";
import { mockWarranties, mockInsurances } from "@/features/coverage/mockData";

/**
 * Check if assets have active warranty or insurance coverage and create notifications
 * This function integrates with the coverage module to get actual coverage data
 *
 * @param assetIds - Array of asset IDs to check for coverage
 * @param workOrderId - The work order ID for reference
 * @param workOrderDescription - Optional description from the work order to prefill claim
 */
export const checkAndNotifyCoverage = (
  assetIds: string[],
  workOrderId: string,
  workOrderDescription?: string
): void => {
  if (assetIds.length === 0) {
    return;
  }

  const warranties = mockWarranties;
  const insurances = mockInsurances;
  const currentDate = new Date();
  const assetWarrantyMap = new Map<string, CoverageWarranty>();
  const assetInsuranceMap = new Map<string, CoverageInsurance>();

  // Find active warranties for each asset
  assetIds.forEach((assetId) => {
    const warranty = warranties.find((w) => {
      const isAssetCovered = w.assetsCovered.some((asset) => asset.id === assetId);

      if (!isAssetCovered) return false;

      // Check if warranty is still valid
      const startDate = new Date(w.startDate);
      const expiryDate = new Date(w.expiryDate);
      const isNotExpired = expiryDate >= currentDate;
      const hasStarted = startDate <= currentDate;
      const isActive = w.status === "Active";

      return isNotExpired && hasStarted && isActive;
    });

    if (warranty) {
      assetWarrantyMap.set(assetId, warranty);
    }

    // Find active insurances for each asset
    const insurance = insurances.find((ins) => {
      const isAssetCovered = ins.assetsCovered.some((asset) => asset.id === assetId);

      if (!isAssetCovered) return false;

      // Check if insurance is still valid
      const startDate = new Date(ins.startDate);
      const expiryDate = new Date(ins.expiryDate);
      const isNotExpired = expiryDate >= currentDate;
      const hasStarted = startDate <= currentDate;
      const isActive = ins.status === "Active";

      return isNotExpired && hasStarted && isActive;
    });

    if (insurance) {
      assetInsuranceMap.set(assetId, insurance);
    }
  });

  // Create warranty notifications
  if (assetWarrantyMap.size > 0) {
    const notifiedWarranties = new Set<string>();

    assetWarrantyMap.forEach((warranty) => {
      if (!notifiedWarranties.has(warranty.id)) {
        // Find all assets in the work order that are covered by this warranty
        const coveredAssets = assetIds.filter((id) => {
          const w = assetWarrantyMap.get(id);
          return w?.id === warranty.id;
        });

        // Get asset names from the warranty's assetsCovered list
        const assetNames = coveredAssets.map((id) => {
          const asset = warranty.assetsCovered.find((a) => a.id === id);
          return asset?.name ?? id;
        });

        notificationService.createNotification({
          type: "warranty",
          title: `Warranty Available for Work Order ${workOrderId}`,
          message: `Asset(s) ${assetNames.join(", ")} under warranty "${warranty.name}" (${warranty.provider}). You may file a warranty claim before proceeding with repairs.`,
          sourceModule: "work-order",
          sourceId: workOrderId,
          actionUrl: "/insurance?tab=claims",
          actionLabel: "File Warranty Claim",
          metadata: {
            warrantyId: warranty.id,
            warrantyName: warranty.name,
            assetIds: coveredAssets,
            expiryDate: warranty.expiryDate,
            workOrderId: workOrderId,
            workOrderDescription: workOrderDescription ?? "",
          },
        });

        notifiedWarranties.add(warranty.id);
      }
    });
  }

  // Create insurance notifications
  if (assetInsuranceMap.size > 0) {
    const notifiedInsurances = new Set<string>();

    assetInsuranceMap.forEach((insurance) => {
      if (!notifiedInsurances.has(insurance.id)) {
        // Find all assets in the work order that are covered by this insurance
        const coveredAssets = assetIds.filter((id) => {
          const ins = assetInsuranceMap.get(id);
          return ins?.id === insurance.id;
        });

        // Get asset names from the insurance's assetsCovered list
        const assetNames = coveredAssets.map((id) => {
          const asset = insurance.assetsCovered.find((a) => a.id === id);
          return asset?.name ?? id;
        });

        notificationService.createNotification({
          type: "insurance",
          title: `Insurance Coverage Available for Work Order ${workOrderId}`,
          message: `Asset(s) ${assetNames.join(", ")} covered by insurance "${insurance.name}" (${insurance.provider}). You may file an insurance claim before proceeding with repairs.`,
          sourceModule: "work-order",
          sourceId: workOrderId,
          actionUrl: "/insurance?tab=claims",
          actionLabel: "File Insurance Claim",
          metadata: {
            insuranceId: insurance.id,
            insuranceName: insurance.name,
            policyNumber: insurance.policyNumber,
            assetIds: coveredAssets,
            expiryDate: insurance.expiryDate,
            remainingCoverage: insurance.remainingCoverage,
            workOrderId: workOrderId,
            workOrderDescription: workOrderDescription ?? "",
          },
        });

        notifiedInsurances.add(insurance.id);
      }
    });
  }
};

/**
 * @deprecated Use checkAndNotifyCoverage instead
 */
export const checkAndNotifyWarranty = checkAndNotifyCoverage;
