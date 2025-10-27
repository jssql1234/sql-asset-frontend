import React from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';

const AssetHistoryPage: React.FC = () => {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tools" },
        { label: "Asset History" },
      ]}
    >
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-onSurface">Asset History</h1>
            <p className="text-sm text-onSurfaceVariant mt-1">
              View and track asset history and changes
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="text-center py-12">
            <p className="text-onSurfaceVariant">Asset History page content will be implemented here.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AssetHistoryPage;
