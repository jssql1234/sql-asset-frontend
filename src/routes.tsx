import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "./components/ui/components";
import { lazy } from "react";
import AssetMain from "./features/asset/pages/AssetMain";

const Testing = lazy(() => import("@/example/example"));
// const AssetAllocationPage = lazy(
//   () => import("@/features/asset-allocation/pages/AssetAllocation")
// );

// Import AssetLayout for consistent navigation
import { AssetLayout } from "./components/AssetSidebar";

// Placeholder components for other routes
const ProcessCA = () => (
  <AssetLayout activeSidebarItem="process-ca">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Process CA</h1>
        <p className="body-medium text-onSurfaceVariant">
          Process Capital Asset transactions
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Process CA functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const Dashboard = () => (
  <AssetLayout activeSidebarItem="dashboard">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Dashboard</h1>
        <p className="body-medium text-onSurfaceVariant">
          Asset management overview and analytics
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Dashboard functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const MaintenanceSchedule = () => (
  <AssetLayout activeSidebarItem="maintenance-schedule">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Maintenance Schedule</h1>
        <p className="body-medium text-onSurfaceVariant">
          Schedule and manage asset maintenance
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Maintenance Schedule functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const WorkRequest = () => (
  <AssetLayout activeSidebarItem="work-request">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Work Requests</h1>
        <p className="body-medium text-onSurfaceVariant">
          Manage work requests and assignments
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Work Requests functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const Allocation = () => (
  <AssetLayout activeSidebarItem="allocation">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Allocation</h1>
        <p className="body-medium text-onSurfaceVariant">
          Allocate assets to departments and locations
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Allocation functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const DowntimeTracking = () => (
  <AssetLayout activeSidebarItem="downtime-tracking">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Downtime Records</h1>
        <p className="body-medium text-onSurfaceVariant">
          Track asset downtime and availability
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Downtime Tracking functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const Insurance = () => (
  <AssetLayout activeSidebarItem="insurance">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">
          Insurance & Warranty Claims
        </h1>
        <p className="body-medium text-onSurfaceVariant">
          Manage insurance and warranty claims
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Insurance & Warranty Claims functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

const MeterReading = () => (
  <AssetLayout activeSidebarItem="meter-reading">
    <div className="space-y-6">
      <div>
        <h1 className="title-large text-onBackground">Meter Reading</h1>
        <p className="body-medium text-onSurfaceVariant">
          Record and track meter readings
        </p>
      </div>
      <div className="bg-surface rounded-lg shadow p-6">
        <p className="body-medium text-onSurfaceVariant">
          Meter Reading functionality will be implemented here.
        </p>
      </div>
    </div>
  </AssetLayout>
);

export function Home() {
  return <Button>Hello</Button>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root path */}
      <Route path="/" element={<AssetMain />} />
      <Route path="/testing" element={<Testing />} />
      {/* Asset Management Routes */}

      <Route path="/asset" element={<AssetMain />} />
      <Route path="/process-ca" element={<ProcessCA />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/maintenance-schedule" element={<MaintenanceSchedule />} />
      <Route path="/work-request" element={<WorkRequest />} />
      <Route path="/allocation" element={<Allocation />} />
      <Route path="/downtime-tracking" element={<DowntimeTracking />} />
      <Route path="/insurance" element={<Insurance />} />
      <Route path="/meter-reading" element={<MeterReading />} />
      {/* <Route path="/asset-allocation" element={<AssetAllocationPage />} /> */}

      {/* Catch-all (404 redirect) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
