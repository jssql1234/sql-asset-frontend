import { useDataQuery } from "@/hooks/useDataQuery";
import type { Asset } from "@/types/assetType";
import { t } from "i18next";
import { createAsset, fetchAssetList } from "../services/asset";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";

export function useGetAsset() {
  return useDataQuery<Asset[], Error>({
    key: ["assetList"],
    queryFn: fetchAssetList,
    title: t("asset:toast.getAssetFail"),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, Asset>({
    mutationFn: createAsset,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assetList"],
      });
      addToast({
        variant: "success",
        title: "Asset Created",
        description: "Asset has been created successfully.",
        duration: 5000,
      });
    },

    onError: (_error: Error) => {
      addToast({
        variant: "error",
        title: t("asset:toast.createAssetFail"),
      });
    },
  });
}
