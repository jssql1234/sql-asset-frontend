import React from "react";
import { AssetLayout } from "@/layout/AssetSidebar";

const AssetMainPage: React.FC = () => {
  return (
    <AssetLayout activeSidebarItem="asset">
      <div className="space-y-6">
        <div>
          <h1 className="title-large text-onBackground">Asset Management</h1>
          <p className="body-medium text-onSurfaceVariant">
            Main asset management dashboard and overview
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="body-medium text-onSurfaceVariant">
            Asset management functionality will be implemented here.
          </p>
        </div>
      </div>
    </AssetLayout>
  );
};

export default AssetMainPage;
