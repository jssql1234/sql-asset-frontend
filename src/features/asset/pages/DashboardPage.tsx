import React from "react";
import { SidebarLayout } from "@/layout/sidebar/sidebar-layout";

const DashboardPage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Maintenance", href: "/" },
        { label: "Dashboard" },
      ]}
    >
      <></>
    </SidebarLayout>
  );
};

export default DashboardPage;
