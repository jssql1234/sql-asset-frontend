import { useState } from "react";
import { AssetLayout, type SidebarItem } from "@/components/AssetSidebar";
import AssetContentArea from "../components/AssetContentArea";

export default function AssetMain() {
  const [activeItem, setActiveItem] = useState<string>("asset");

  const handleSidebarItemSelect = (item: SidebarItem) => {
    setActiveItem(item.id);
    console.log("Selected item:", item);
  };

    return (
        <AssetLayout 
            activeSidebarItem={activeItem}
            onSidebarItemSelect={handleSidebarItemSelect}
        >
            <div className="space-y-6">
                

                <AssetContentArea />
            </div>
        </AssetLayout>
    );
}
