import React from "react";
import { SidebarLayout } from "@/layout/sidebar/SidebarLayout";

const MaintenanceSchedulePage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Maintenance Schedule" },
      ]}
    >
      <></>
    </SidebarLayout>
  );
};

export default MaintenanceSchedulePage;
