import React from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";

const ProcessCAPage: React.FC = () => {
  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tax Computation" },
        { label: "Process CA" },
      ]}
    >
      <></>
    </SidebarHeader>
  );
};

export default ProcessCAPage;
