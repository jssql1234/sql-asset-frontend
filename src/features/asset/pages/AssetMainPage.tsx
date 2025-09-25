import React from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import AssetContentArea from "@asset/components/AssetContentArea";

const AssetMainPage: React.FC = () => {
  return (
    <AssetLayout activeSidebarItem="asset">
      <AssetContentArea />
    </AssetLayout>
  );
};

export default AssetMainPage;
