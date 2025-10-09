import { useDataQuery } from "@/hooks/useDataQuery";
import type { Asset } from "@/types/asset";
import { t } from "i18next";
import { createAsset, fetchAssetList } from "../services/assetService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";

export function useGetAsset() {
  return useDataQuery<Asset[]>({
    key: ["assetList"],
    queryFn: fetchAssetList,
    title: t("asset:toast.getAssetFail"),
  });
}

export function useCreateAsset(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<unknown, Error, Asset>({
    mutationFn: createAsset,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["assetList"],
      });
      addToast({
        variant: "success",
        title: "Asset Created",
        description: "Asset has been created successfully.",
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
