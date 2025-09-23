import { useToast } from "@/components/ui/components/Toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation(["common"]);
  const { addToast } = useToast();

  const copy = async (text: string, showToast: boolean = true) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (showToast) {
        addToast({
          variant: "success",
          title: t("copy.copySuccess"),
        });
      }

      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (showToast) {
        addToast({
          variant: "error",
          title: t("copy.copyFail"),
        });
      }
    }
  };

  return { copied, copy };
}
