import React from "react";
import AssetLogo from "@/components/AssetLogo";
import { MenuBar } from "@/components/MenuBar";
import AssetSidebar from "@/components/AssetSidebar";

const AssetMainPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Top Header with AssetLogo */}
      <div className="bg-surface px-4 py-0 relative z-10">
        <AssetLogo />
      </div>

      {/* MenuBar */}
      <MenuBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <AssetSidebar activeItem="asset" />
        <main className="flex-1 overflow-y-auto bg-surfaceContainer p-6">
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
        </main>
      </div>
    </div>
  );
};

export default AssetMainPage;
