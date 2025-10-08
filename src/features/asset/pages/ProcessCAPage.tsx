import React from "react";
import { SidebarLayout } from "@/components/sidebar";

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
