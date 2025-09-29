import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "./components/ui/components";
import { lazy } from "react";

// Import page components
import AssetMainPage from "./features/asset/pages/AssetMainPage";
import ProcessCAPage from "./features/asset/pages/ProcessCAPage";
import DashboardPage from "./features/asset/pages/DashboardPage";
import MaintenanceSchedulePage from "./features/asset/pages/MaintenanceSchedulePage";
import WorkRequestPage from "./features/work-request/pages/WorkRequestPage";
import DowntimeTrackingPage from "./features/downtime/pages/DowntimeTrackingPage";
import CoverageManagementPage from "./features/coverage/pages/CoverageManagementPage";
import MeterPage from "./features/meter/pages/MeterPage";
import DisposalMainPage from "./features/disposal/pages/DisposalMainPage";

const Testing = lazy(() => import("@/example/example"));
const TableDemo = lazy(() => import("@/example/tableDemo"));
const AssetAllocationPage = lazy(
  () => import("@/features/allocation/pages/AssetAllocation")
);

const Allocation = () => <AssetAllocationPage />;

export function Home() {
  return <Button>Hello</Button>;
}
  
function AppRoutes() {
  return (
    <Routes>
      {/* Root path */}
      <Route path="/asset" element={<AssetMainPage />} />
      <Route path="/testing" element={<Testing />} />
      <Route path="/tabledemo" element={<TableDemo />} />
      {/* Asset Management Routes */}

      <Route path="/asset" element={<AssetMainPage />} />
      <Route path="/process-ca" element={<ProcessCAPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/maintenance-schedule" element={<MaintenanceSchedulePage />} />
      <Route path="/work-request" element={<WorkRequestPage />} />
      <Route path="/allocation" element={<Allocation />} />
      <Route path="/downtime-tracking" element={<DowntimeTrackingPage />} />
      <Route path="/insurance" element={<CoverageManagementPage />} />
      <Route path="/meter-reading" element={<MeterPage />} />
      
      {/* Disposal Routes */}
      <Route path="/disposal" element={<DisposalMainPage />} />

      {/* Catch-all (404 redirect) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
