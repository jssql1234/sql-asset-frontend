import { Card } from "@/components/ui/components";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { AllocationCategoryOption, AllocationItemOption } from "../types";

interface AssetSelectionSectionProps {
  description: string;
  categories: AllocationCategoryOption[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  items: AllocationItemOption[];
  selectedIds: string[];
  onSelectionChange: (assetIds: string[]) => void;
}

const AssetSelectionSection = ({
  description,
  categories,
  selectedCategoryId,
  onCategoryChange,
  items,
  selectedIds,
  onSelectionChange,
}: AssetSelectionSectionProps) => (
  <Card className="border border-outline bg-surfaceContainer" data-testid="allocation-asset-selection">
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="title-small text-onSurface">Select Assets</h3>
        <p className="body-small text-onSurfaceVariant">{description}</p>
      </div>

      <SearchWithDropdown
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        items={items}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        placeholder="Search assets by name or code..."
        emptyMessage="No assets found"
        className="w-full"
        hideSelectedCount
      />
    </div>
  </Card>
);

export default AssetSelectionSection;
