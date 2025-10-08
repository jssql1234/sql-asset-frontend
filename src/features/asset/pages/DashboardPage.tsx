import React from "react";
import { SidebarLayout } from "@/layout/sidebar/SidebarLayout";

const DashboardPage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Dashboard" },
      ]}
    >
      <></>
    </SidebarLayout>
  );
};

export default DashboardPage;
