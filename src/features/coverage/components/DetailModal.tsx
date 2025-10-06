import type { ReactNode } from "react";
import { Card } from "@/components/ui/components";
import { cn } from "@/utils/utils";

export interface DetailModalDefinitionItem {
  label: string;
  value: ReactNode;
  align?: "start" | "end";
}

interface AssetItem {
  id: string;
  name: string;
}

interface AssetGridConfig {
  assets: AssetItem[];
  action?: (asset: AssetItem) => ReactNode;
  footer?: ReactNode;
}

interface DetailModalSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  items?: DetailModalDefinitionItem[];
  assetGrid?: AssetGridConfig;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const DetailModalSection = ({
  title,
  subtitle,
  action,
  items,
  assetGrid,
  children,
  className,
  contentClassName,
}: DetailModalSectionProps) => {
  const hasItems = Boolean(items?.length);
  const hasAssetGrid = Boolean(assetGrid?.assets?.length);
  const hasChildren = Boolean(children);

  return (
    <Card className={cn("mt-0 space-y-4 border border-outline bg-surfaceContainer", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="title-small font-semibold text-onSurface">{title}</h3>
          {subtitle ? (
            <p className="body-small text-onSurfaceVariant">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="md:self-start">{action}</div> : null}
      </div>
      {(hasItems || hasAssetGrid || hasChildren) ? (
        <div className={cn("space-y-3", contentClassName)}>
          {hasItems ? (
            <dl className="space-y-3 body-medium text-onSurface">
              {items!.map(({ label, value, align = "end" }) => (
                <div key={label} className="flex items-start justify-between gap-6">
                  <dt className="text-onSurfaceVariant">{label}</dt>
                  <dd className={cn("max-w-[60%]", align === "end" ? "text-right" : "text-left")}>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {hasAssetGrid ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {assetGrid!.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between rounded-md border border-outlineVariant bg-surfaceContainerLowest px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-onSurface">{asset.name}</span>
                      <span className="body-small text-onSurfaceVariant">{asset.id}</span>
                    </div>
                    {assetGrid!.action ? assetGrid!.action(asset) : null}
                  </div>
                ))}
              </div>
              {assetGrid!.footer}
            </div>
          ) : null}
          {children}
        </div>
      ) : null}
    </Card>
  );
};
