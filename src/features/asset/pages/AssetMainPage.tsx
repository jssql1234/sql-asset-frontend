import React from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import AssetContentArea from "@asset/components/AssetContentArea";

const AssetMainPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-1 size-full">
        <AssetContentArea />
      </div>
    </AppLayout>
  );
};

export default AssetMainPage;
