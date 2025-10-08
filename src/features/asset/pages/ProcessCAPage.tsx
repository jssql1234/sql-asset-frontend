import React from "react";
import { SidebarLayout } from "@/layout/sidebar/sidebar-layout";

const ProcessCAPage: React.FC = () => {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Tax Computation", href: "/" },
        { label: "Process CA" },
      ]}
    >
      <></>
    </SidebarLayout>
  );
};

export default ProcessCAPage;
