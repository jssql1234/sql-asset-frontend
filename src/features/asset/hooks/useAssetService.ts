import { useDataQuery } from "@/hooks/useDataQuery";
import type { Asset } from "@/types/asset";
import { t } from "i18next";
import { createAsset, fetchAssetList } from "../services/asset";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";

export function useGetAsset() {
  return useDataQuery<Asset[], Error>({
    key: ["company", "companyInfo"],
    queryFn: fetchAssetList,
    title: t("company:toast.getCompanyFail"),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, Asset>({
    mutationFn: createAsset,

    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes("assetList"),
      });
      addToast({
        variant: "success",
        title: t("asset:toast.createAssetSuccess"),
      });
    },

    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: t("asset:toast.createAssetFail"),
      });
    },
  });
}
