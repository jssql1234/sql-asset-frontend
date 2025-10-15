import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import AssetContentArea from "@asset/components/AssetContentArea";

const AssetMainPage: React.FC = () => {
  const location = useLocation();

   // Dynamic breadcrumbs based on current path
   const getBreadcrumbs = () => {
     if (location.pathname === '/asset/create-asset') {
       return [
         { label: "Assets" },
         { label: "Create Asset" }
       ];
     } else if (location.pathname.startsWith('/asset/edit-asset/')) {
       return [
         { label: "Assets" },
         { label: "Edit Asset" }
       ];
     }
     return [
       { label: "Assets" }
     ];
   };

  return (
    <SidebarHeader
      breadcrumbs={getBreadcrumbs()}
    >
      <div className="flex flex-col gap-6 p-1">
        <AssetContentArea />
      </div>
    </SidebarHeader>
  );
};

export default AssetMainPage;
