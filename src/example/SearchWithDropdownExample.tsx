import { useState } from "react";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";

/**
 * Example component demonstrating SearchWithDropdown usage
 * This can be imported and used in any page
 */
export const SearchWithDropdownExample = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Categories for left dropdown (single select)
  const categories = [
    { id: "all", label: "All Categories" },
    { id: "heavy", label: "Heavy Equipment", sublabel: "Excavators, Bulldozers" },
    { id: "lifting", label: "Lifting Equipment", sublabel: "Cranes, Hoists" },
    { id: "power", label: "Power Equipment", sublabel: "Generators, UPS" },
    { id: "material", label: "Material Handling", sublabel: "Forklifts, Conveyors" },
    { id: "tools", label: "Tools & Equipment", sublabel: "Welding, Compressors" },
  ];

  // Sample data - replace with your actual data
  const assets = [
    { id: "AST-001", label: "Excavator CAT 320D", sublabel: "EXC-001" },
    { id: "AST-002", label: "Bulldozer Komatsu D65", sublabel: "BLD-002" },
    { id: "AST-003", label: "Crane Liebherr LTM 1060", sublabel: "CRN-003" },
    { id: "AST-004", label: "Generator Cummins 500kVA", sublabel: "GEN-004" },
    { id: "AST-005", label: "Forklift Toyota 8FG25", sublabel: "FRK-005" },
    { id: "AST-006", label: "Compressor Atlas Copco", sublabel: "CMP-006" },
    { id: "AST-007", label: "Welding Machine Lincoln", sublabel: "WLD-007" },
    { id: "AST-008", label: "Tower Crane Potain", sublabel: "CRN-008" },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    console.log("Selected category:", categoryId);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedAssetIds(ids);
    console.log("Selected asset IDs:", ids);
  };

  const getSelectedAssetNames = () => {
    return selectedAssetIds
      .map((id) => assets.find((a) => a.id === id)?.label)
      .filter(Boolean);
  };

  return (
    <div className="p-6 space-y-6">

      {/* SearchWithDropdown Component */}
      <div className="max-w-full">
        <SearchWithDropdown
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategoryChange}
          items={assets}
          selectedIds={selectedAssetIds}
          onSelectionChange={handleSelectionChange}
          placeholder="Search assets by name or code..."
          emptyMessage="No assets found. Try a different search term."
          hideSelectedField={false}
        />
      </div>


      {/* Debug Info */}
      <div className="max-w-full">
        <details className="rounded-lg border border-outlineVariant bg-surfaceContainerLowest">
          <summary className="cursor-pointer px-4 py-3 label-large font-medium text-onSurface hover:bg-surfaceContainerHighest transition-colors">
            Debug Info (Click to expand)
          </summary>
          <div className="px-4 py-3 border-t border-outlineVariant">
            <pre className="text-xs text-onSurfaceVariant overflow-auto">
              {JSON.stringify(
                {
                  selectedIds: selectedAssetIds,
                  selectedCount: selectedAssetIds.length,
                  selectedAssets: getSelectedAssetNames(),
                },
                null,
                2
              )}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SearchWithDropdownExample;
