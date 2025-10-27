import React from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";

const ProcessCAPage: React.FC = () => {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tax Computation" },
        { label: "Process CA" },
      ]}
    >
      <></>
    </AppLayout>
  );
};

export default ProcessCAPage;
