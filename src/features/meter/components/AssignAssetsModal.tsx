import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui/components";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { Asset } from "@/types/asset";

type AssignAssetsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAssets: Asset[];
  currentAssets: Asset[];
  onAssign: (assetIds: string[]) => void;
};

export const AssignAssetsModal = ({
  open,
  onOpenChange,
  availableAssets,
  currentAssets,
  onAssign,
}: AssignAssetsModalProps) => {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    currentAssets.map((asset) => asset.id)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Asset categories for SearchWithDropdown
  const assetCategories = [
    { id: "all", label: "All Categories" },
    { id: "heavy", label: "Heavy Equipment", sublabel: "qty: 2" },
    { id: "power", label: "Power Equipment", sublabel: "Generators, Compressors" },
    { id: "material", label: "Material Handling", sublabel: "Forklifts" },
    { id: "tools", label: "Tools & Machinery", sublabel: "Welding Machines" },
  ];

  const handleAssetSelectionChange = (assetIds: string[]) => {
    setSelectedAssetIds(assetIds);
  };

  const handleSave = () => {
    onAssign(selectedAssetIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] h-[60%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pb-3">Assign Assets to Group</DialogTitle>
          <DialogDescription >
            Select assets to assign to this meter group. Selected assets will track readings for all meters in this group.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <SearchWithDropdown
            categories={assetCategories}
            selectedCategoryId={selectedCategory}
            onCategoryChange={setSelectedCategory}
            items={availableAssets.map((asset) => ({
              id: asset.id,
              label: asset.name,
              sublabel: asset.group,
            }))}
            selectedIds={selectedAssetIds}
            onSelectionChange={handleAssetSelectionChange}
            placeholder="Search asset by name or ID..."
            emptyMessage="No assets found"
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAssetsModal;
