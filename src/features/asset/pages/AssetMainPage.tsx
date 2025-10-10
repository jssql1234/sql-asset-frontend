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
      <div className="flex flex-col gap-6 p-1">
        <AssetContentArea />
      </div>
    </SidebarHeader>
  );
};

export default AssetMainPage;
