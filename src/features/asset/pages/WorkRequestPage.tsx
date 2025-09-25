import React from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import ToggleList from "@/components/ToggleList";

const AssetAllocationPage: React.FC = () => {
  return (
    <AssetLayout activeSidebarItem="work-request">
      <ToggleList header="Work Request">
        <p>Content for the work request section goes here.</p>
      </ToggleList>
    </AssetLayout>
  );
};

export default AssetAllocationPage;
