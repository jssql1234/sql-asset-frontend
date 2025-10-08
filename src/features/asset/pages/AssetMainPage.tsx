import React from "react";
import { SidebarLayout } from "@/components/sidebar";
import AssetContentArea from "@asset/components/AssetContentArea";

const AssetMainPage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Management", href: "/" },
        { label: "Assets" },
      ]}
    >
      <AssetContentArea />
    </SidebarLayout>
  );
};

export default AssetMainPage;
