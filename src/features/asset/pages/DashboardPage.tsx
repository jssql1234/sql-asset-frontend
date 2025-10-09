import React from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";

const DashboardPage: React.FC = () => {
  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Dashboard" },
      ]}
    >
      <></>
    </SidebarHeader>
  );
};

export default DashboardPage;
