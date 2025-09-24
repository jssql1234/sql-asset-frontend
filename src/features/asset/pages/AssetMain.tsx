import { useState } from "react";
import {
  AssetLayout,
  type SidebarItem,
} from "../../../components/AssetSidebar";

export default function AssetMain() {
  const [activeItem, setActiveItem] = useState<string>("asset");

  const handleSidebarItemSelect = (item: SidebarItem) => {
    setActiveItem(item.id);
    console.log("Selected item:", item);
  };

  return (
    <AssetLayout
      activeSidebarItem={activeItem}
      onSidebarItemSelect={handleSidebarItemSelect}
    >
      <div className="space-y-6">
        <div>
          <h1 className="title-large text-onBackground">Asset Management</h1>
          <p className="body-medium text-onSurfaceVariant">
            Manage your assets and maintenance schedules
          </p>
        </div>

        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="title-small text-onSurface mb-4">
            Current Section: {activeItem}
          </h2>
          <p className="body-medium text-onSurfaceVariant">
            This is the main content area. The sidebar navigation is now fully
            functional with React state management and design system styling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface rounded-lg shadow p-4">
            <h3 className="label-large-bold text-onSurface">Quick Actions</h3>
            <p className="body-small text-onSurfaceVariant mt-2">
              Access common tasks
            </p>
          </div>
          <div className="bg-surface rounded-lg shadow p-4">
            <h3 className="label-large-bold text-onSurface">Recent Activity</h3>
            <p className="body-small text-onSurfaceVariant mt-2">
              View recent changes
            </p>
          </div>
          <div className="bg-surface rounded-lg shadow p-4">
            <h3 className="label-large-bold text-onSurface">Statistics</h3>
            <p className="body-small text-onSurfaceVariant mt-2">
              Key metrics and KPIs
            </p>
          </div>
        </div>
      </div>
    </AssetLayout>
  );
}
