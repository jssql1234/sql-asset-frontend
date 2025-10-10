import React from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';


const MaintainUserPage: React.FC = () => {

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain User" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain User"
        />

        <div className="flex-1 overflow-hidden">
          {/* <DataTable
            columns={columns}
            data={filteredUsers}
            showPagination
          /> */}
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainUserPage;