import React from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";

const MaintenanceSchedulePage: React.FC = () => {
  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Maintenance Schedule" },
      ]}
    >
      <></>
    </SidebarHeader>
  );
};

export default MaintenanceSchedulePage;
