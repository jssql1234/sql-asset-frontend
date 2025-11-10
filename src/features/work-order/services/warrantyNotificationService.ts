import { notificationService } from "@/features/notification/services/notificationService";
import type { CoverageWarranty } from "@/features/coverage/types";
import { mockWarranties } from "@/features/coverage/mockData";

/**
 * Check if assets have active warranty coverage and create notifications
 * This function integrates with the coverage module to get actual warranty data
 * 
 * @param assetIds - Array of asset IDs to check for warranty
 * @param workOrderId - The work order ID for reference
 * @param workOrderDescription - Optional description from the work order to prefill claim
 */
export const checkAndNotifyWarranty = (
  assetIds: string[],
  workOrderId: string,
  workOrderDescription?: string
): void => {
  if (assetIds.length === 0) {
    return;
  }

  const warranties = mockWarranties;
  const currentDate = new Date();
  const assetWarrantyMap = new Map<string, CoverageWarranty>();

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
  });

  if (assetWarrantyMap.size === 0) {
    return;
  }

  // Create a notification for each unique warranty
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
        priority: "medium",
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
};
