import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
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
  const [searchValue, setSearchValue] = useState('');
  const [users] = useState<User[]>(mockUsers);

  const handleAddUser = () => {
    // TODO: Implement add user modal
    console.log('Add user clicked');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.role.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.department.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'User Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-onSurfaceVariant">{row.original.email}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.role}</div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.department}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.phone}</div>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.lastLogin}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.createdAt}</div>
      ),
    },
  ];

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
          subtitle="Manage user accounts and their information"
          actions={[
            {
              label: "Add User",
              onAction: handleAddUser,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <Search
          searchValue={searchValue}
          searchPlaceholder="Search users..."
          onSearch={setSearchValue}
          live
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