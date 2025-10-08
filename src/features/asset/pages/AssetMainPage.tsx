import React from "react";
import { SidebarLayout } from "@/layout/sidebar/SidebarLayout";
import AssetContentArea from "@asset/components/AssetContentArea";

const AssetMainPage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Assets" },
      ]}
    >
      <AssetContentArea />
    </SidebarLayout>
  );
};

export default AssetMainPage;
