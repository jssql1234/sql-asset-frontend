import React from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";

const MaintenanceSchedulePage: React.FC = () => {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Maintenance Schedule" },
      ]}
    >
      <></>
    </AppLayout>
  );
};

export default MaintenanceSchedulePage;
