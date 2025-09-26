import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "./components/ui/components";
import { lazy } from "react";

// Import page components
import AssetMainPage from "./features/asset/pages/AssetMainPage";
import ProcessCAPage from "./features/asset/pages/ProcessCAPage";
import DashboardPage from "./features/asset/pages/DashboardPage";
import MaintenanceSchedulePage from "./features/asset/pages/MaintenanceSchedulePage";
import WorkRequestPage from "./features/asset/pages/WorkRequestPage";
import DowntimeTrackingPage from "./features/asset/pages/DowntimeTrackingPage";
import InsurancePage from "./features/asset/pages/InsurancePage";
import MeterPage from "./features/meter/pages/MeterPage";

const Testing = lazy(() => import("@/example/example"));
const TableDemo = lazy(() => import("@/example/tableDemo"));
// const AssetAllocationPage = lazy(
//   () => import("@/features/asset-allocation/pages/AssetAllocation")
// );



// const Allocation = () => <AssetAllocationPage />;

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
      <Route path="/process-ca" element={<ProcessCAPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/maintenance-schedule" element={<MaintenanceSchedulePage />} />
      <Route path="/work-request" element={<WorkRequestPage />} />
      {/* <Route path="/allocation" element={<Allocation />} /> */}
      <Route path="/downtime-tracking" element={<DowntimeTrackingPage />} />
      <Route path="/insurance" element={<InsurancePage />} />
      <Route path="/meter-reading" element={<MeterPage />} />

      {/* Catch-all (404 redirect) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
