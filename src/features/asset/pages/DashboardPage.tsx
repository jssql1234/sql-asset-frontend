import React from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";

const DashboardPage: React.FC = () => {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Dashboard" },
      ]}
    >
      <></>
    </AppLayout>
  );
};

export default DashboardPage;
