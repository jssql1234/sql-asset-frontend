import { useDataQuery } from "@/hooks/useDataQuery";
import type { Asset } from "@/types/asset";
import { t } from "i18next";
import { createAsset, fetchAssetList, updateAsset, deleteAsset, fetchBatchAssets, getBatchQuantity, bulkUpdateAssetBatchId, bulkUpdateAssets, createMultipleAssets } from "../services/assetService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";

export function useGetAsset() {
  return useDataQuery<Asset[]>({
    key: ["assetList"],
    queryFn: () => Promise.resolve(fetchAssetList()),
    title: t("asset:toast.getAssetFail"),
  });
}

export function useCreateAsset(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: Asset) => {
      createAsset(payload);
      return Promise.resolve();
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["assetList"],
      });
      addToast({
        variant: "success",
        title: "Asset Created",
        description: `Asset "${variables.name}" has been created successfully.`,
        duration: 5000,
      });
      onSuccess?.();
    },

    onError: () => {
      addToast({
        variant: "error",
        title: t("asset:toast.createAssetFail"),
      });
    },
  });
}

export function useUpdateAsset(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: Asset) => {
      updateAsset(payload);
      return Promise.resolve();
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["assetList"],
      });
      addToast({
        variant: "success",
        title: "Asset Updated",
        description: `Asset "${variables.name}" has been updated successfully.`,
        duration: 5000,
      });
      onSuccess?.();
    },

    onError: () => {
      addToast({
        variant: "error",
        title: t("asset:toast.updateAssetFail"),
      });
    },
  });
}

export function useDeleteAsset(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      deleteAsset(id);
      return Promise.resolve();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assetList"] });
      addToast({
        variant: "success",
        title: "Asset Deleted",
        description: "The asset has been deleted successfully.",
        duration: 5000,
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        variant: "error",
        title: "Failed to delete asset",
      });
    },
  });
}

// Batch-related hooks
export function useGetBatchAssets(batchId: string) {
  return useDataQuery<Asset[]>({
    key: ["batchAssets", batchId],
    queryFn: () => Promise.resolve(fetchBatchAssets(batchId)),
    title: "Failed to fetch batch assets",
  });
}

export function useGetBatchQuantity(batchId: string) {
  return useDataQuery<number>({
    key: ["batchQuantity", batchId],
    queryFn: () => Promise.resolve(getBatchQuantity(batchId)),
    title: "Failed to get batch quantity",
  });
}

export function useBulkUpdateAssetBatchId(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ assetIds, newBatchId }: { assetIds: string[]; newBatchId: string | null }) => {
      bulkUpdateAssetBatchId(assetIds, newBatchId);
      return Promise.resolve();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assetList"] });
      addToast({
        variant: "success",
        title: "Batch updated",
        description: "Assets have been detached from batch successfully.",
        duration: 5000,
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        variant: "error",
        title: "Failed to update batch",
      });
    },
  });
}

export function useBulkUpdateAssets(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (updates: ({ id: string } & Partial<Asset>)[]) => {
      bulkUpdateAssets(updates);
      return Promise.resolve();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assetList"] });
      addToast({
        variant: "success",
        title: "Assets updated",
        description: "Batch assets have been updated successfully.",
        duration: 5000,
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        variant: "error",
        title: "Failed to update assets",
      });
    },
  });
}

export function useCreateMultipleAssets(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (assets: Asset[]) => {
      createMultipleAssets(assets);
      return Promise.resolve();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assetList"] });
      addToast({
        variant: "success",
        title: "Assets created",
        description: "New assets added to batch successfully.",
        duration: 5000,
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        variant: "error",
        title: "Failed to create assets",
      });
    },
  });
}
