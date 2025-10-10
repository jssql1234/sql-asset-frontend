import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import SearchFilter from '@/components/SearchFilter';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Administrator',
    department: 'IT',
    phone: '+1-555-1001',
    status: 'Active',
    lastLogin: '2024-10-09',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Manager',
    department: 'HR',
    phone: '+1-555-1002',
    status: 'Active',
    lastLogin: '2024-10-08',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    role: 'Supervisor',
    department: 'Finance',
    phone: '+1-555-1003',
    status: 'Active',
    lastLogin: '2024-10-07',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa.chen@company.com',
    role: 'Technician',
    department: 'Operations',
    phone: '+1-555-1004',
    status: 'Inactive',
    lastLogin: '2024-09-15',
    createdAt: '2023-04-05',
  },
];

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
          <DataTable
            columns={columns}
            data={filteredUsers}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainUserPage;