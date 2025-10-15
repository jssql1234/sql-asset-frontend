import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "./components/ui/components";
import { lazy } from "react";

import AssetMainPage from "./features/asset/pages/AssetMainPage";
import ProcessCAPage from "./features/asset/pages/ProcessCAPage";
import DashboardPage from "./features/asset/pages/DashboardPage";
import WorkOrdersPage from "./features/work-order/pages/WorkOrderPage";
import WorkRequestPage from "./features/work-request/pages/WorkRequestPage";
import DowntimeTrackingPage from "./features/downtime/pages/DowntimeTrackingPage";
import CoveragePage from "./features/coverage/pages/CoveragePage";
import MeterPage from "./features/meter/pages/MeterPage";
import MeterGroupDetailPage from "./features/meter/pages/MeterGroupDetailPage";
import DisposalMainPage from "./features/disposal/pages/DisposalMainPage";
import UserAccessRightsPage from "./features/user/pages/UserAccessRightsPage";
import MaintainUserGroupPage from "./features/user/pages/MaintainUserGroupPage";
import MaintainUserPage from "./features/user/pages/MaintainUserPage";
import MaintainAssetGroupPage from "./features/maintain/pages/MaintainAssetGroupPage";
import MaintainLocationPage from "./features/maintain/pages/MaintainLocationPage";
import MaintainDepartmentPage from "./features/maintain/pages/MaintainDepartmentPage";
import MaintainCustomerPage from "./features/maintain/pages/MaintainCustomerPage";
import MaintainSparePartPage from "./features/maintain/pages/MaintainSparePartPage";
import MaintainServiceProviderPage from "./features/maintain/pages/MaintainServiceProviderPage";
import AssetHistoryPage from "./features/maintain/pages/AssetHistoryPage";

const Testing = lazy(() => import("@/example/example"));
const TableDemo = lazy(() => import("@/example/tableDemo"));
const AllocationPage = lazy(
  () => import("@/features/allocation/pages/AllocationPage")
);

const Allocation = () => <AllocationPage />;

export function Home() {
  return <Button>Hello</Button>;
}
  
function AppRoutes() {
  return (
    <Routes>
      {/* Root path */}
      <Route path="/" element={<AssetMainPage />} />
      <Route path="/testing" element={<Testing />} />
      <Route path="/tabledemo" element={<TableDemo />} />
      
       {/* Asset Management Routes */}
       <Route path="/asset" element={<AssetMainPage />} />
       <Route path="/asset/create-asset" element={<AssetMainPage />} />
       <Route path="/asset/edit-asset/:id" element={<AssetMainPage />} />
      <Route path="/process-ca" element={<ProcessCAPage />} />
      <Route path="/disposal" element={<DisposalMainPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/work-orders" element={<WorkOrdersPage />} />
      <Route path="/work-request" element={<WorkRequestPage />} />
      <Route path="/allocation" element={<Allocation />} />
      <Route path="/downtime-tracking" element={<DowntimeTrackingPage />} />
      <Route path="/insurance" element={<CoveragePage />} />
      <Route path="/meter-reading" element={<MeterPage />} />
      <Route path="/meter-reading/group/:groupId" element={<MeterGroupDetailPage />} />

      {/* Maintenance Routes */}
      <Route path="/user-access-rights" element={<UserAccessRightsPage />} />
      <Route path="/maintain-user-group" element={<MaintainUserGroupPage />} />

      {/* Maintenance Routes */}
      <Route path="/maintain-asset-group" element={<MaintainAssetGroupPage />} />
      <Route path="/maintain-user" element={<MaintainUserPage />} />
      <Route path="/maintain-location" element={<MaintainLocationPage />} />
      <Route path="/maintain-department" element={<MaintainDepartmentPage />} />
      <Route path="/maintain-customer" element={<MaintainCustomerPage />} />
      <Route path="/maintain-spare-part" element={<MaintainSparePartPage />} />
      <Route path="/maintain-service-provider" element={<MaintainServiceProviderPage />} />
      <Route path="/asset-history" element={<AssetHistoryPage />} />

      {/* Catch-all (404 redirect) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}