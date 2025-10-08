import React from "react";
import { SidebarLayout } from "@/layout/sidebar/SidebarLayout";

const ProcessCAPage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Tax Computation" },
        { label: "Process CA" },
      ]}
    >
      <></>
    </SidebarLayout>
  );
};

export default ProcessCAPage;
