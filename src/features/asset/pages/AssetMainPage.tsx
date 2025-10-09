import React from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import AssetContentArea from "@asset/components/AssetContentArea";

const AssetMainPage: React.FC = () => {
  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Assets" },
      ]}
    >
      <AssetContentArea />
    </SidebarHeader>
  );
};

export default AssetMainPage;
