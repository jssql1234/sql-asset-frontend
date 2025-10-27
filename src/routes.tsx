import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

import ProtectedRoute, { ProtectedRouteFallback } from "./components/ProtectedRoute";
import { usePermissions } from "./hooks/usePermissions";

const AssetMainPage = lazy(() => import("./features/asset/pages/AssetMainPage"));
const ProcessCAPage = lazy(() => import("./features/asset/pages/ProcessCAPage"));
const DashboardPage = lazy(() => import("./features/asset/pages/DashboardPage"));
const WorkOrdersPage = lazy(() => import("./features/work-order/pages/WorkOrderPage"));
const WorkRequestPage = lazy(() => import("./features/work-request/pages/WorkRequestPage"));
const DowntimeTrackingPage = lazy(() => import("./features/downtime/pages/DowntimeTrackingPage"));
const CoveragePage = lazy(() => import("./features/coverage/pages/CoveragePage"));
const MeterPage = lazy(() => import("./features/meter/pages/MeterPage"));
const MeterGroupDetailPage = lazy(() => import("./features/meter/pages/MeterGroupDetailPage"));
const DisposalMainPage = lazy(() => import("./features/disposal/pages/DisposalMainPage"));
const UserAccessRightsPage = lazy(() => import("./features/user/pages/UserAccessRightsPage"));
const MaintainUserGroupPage = lazy(() => import("./features/user/pages/MaintainUserGroupPage"));
const MaintainUserPage = lazy(() => import("./features/user/pages/MaintainUserPage"));
const MaintainAssetGroupPage = lazy(() => import("./features/maintain/pages/MaintainAssetGroupPage"));
const MaintainLocationPage = lazy(() => import("./features/maintain/pages/MaintainLocationPage"));
const MaintainDepartmentPage = lazy(() => import("./features/maintain/pages/MaintainDepartmentPage"));
const MaintainCustomerPage = lazy(() => import("./features/maintain/pages/MaintainCustomerPage"));
const MaintainSparePartPage = lazy(() => import("./features/maintain/pages/MaintainSparePartPage"));
const MaintainServiceProviderPage = lazy(() => import("./features/maintain/pages/MaintainServiceProviderPage"));
const AssetHistoryPage = lazy(() => import("./features/maintain/pages/AssetHistoryPage"));

const Testing = lazy(() => import("@/example/example"));
const TableDemo = lazy(() => import("@/example/tableDemo"));
const AllocationPage = lazy(() => import("@/features/allocation/pages/AllocationPage"));
  
function AppRoutes() {
  const { hasPermission } = usePermissions();

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Outlet />}>
          {/* Root path */}
          <Route path="/" element={
            <ProtectedRoute when={hasPermission("processCA", "execute")}>
              <AssetMainPage />
              <ProtectedRouteFallback>
                <AssetMainPage />
              </ProtectedRouteFallback>
            </ProtectedRoute>
          } />
          <Route path="/testing" element={<Testing />} />
          <Route path="/tabledemo" element={<TableDemo />} />
          
          {/* Asset Management Routes */}
          <Route path="/asset" element={
            <ProtectedRoute when={hasPermission("processCA", "execute")}>
              <AssetMainPage />
              <ProtectedRouteFallback>
                <AssetMainPage />
              </ProtectedRouteFallback>
            </ProtectedRoute>
          } />
          <Route path="/asset/create-asset" element={<AssetMainPage />} />
          <Route path="/asset/edit-asset/:id" element={<AssetMainPage />} />
          <Route path="/process-ca" element={<ProcessCAPage />} />
          <Route path="/disposal" element={<DisposalMainPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="/work-request" element={<WorkRequestPage />} />
          <Route path="/allocation" element={<AllocationPage />} />
          <Route path="/downtime-tracking" element={<DowntimeTrackingPage />} />
          <Route path="/insurance" element={<CoveragePage />} />
          <Route path="/meter-reading" element={<MeterPage />} />
          <Route path="/meter-reading/group/:groupId" element={<MeterGroupDetailPage />} />

          {/* Maintenance Routes */}
          <Route path="/user-access-rights" element={<UserAccessRightsPage />} />
          <Route path="/maintain-user-group" element={<MaintainUserGroupPage />} />
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
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <AppRoutes />;
}