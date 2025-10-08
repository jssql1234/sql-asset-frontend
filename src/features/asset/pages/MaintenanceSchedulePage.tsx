import React from "react";
import { SidebarLayout } from "@/layout/sidebar/sidebar-layout";

const MaintenanceSchedulePage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Maintenance", href: "/" },
        { label: "Maintenance Schedule" },
      ]}
    >
      <></>
    </SidebarLayout>
  );
};

export default MaintenanceSchedulePage;
