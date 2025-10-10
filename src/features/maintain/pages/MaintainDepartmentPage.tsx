import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  manager: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Information Technology',
    code: 'IT',
    description: 'Handles all IT infrastructure and support',
    manager: 'John Smith',
    status: 'Active',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Human Resources',
    code: 'HR',
    description: 'Manages employee relations and policies',
    manager: 'Sarah Johnson',
    status: 'Active',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Finance',
    code: 'FIN',
    description: 'Handles financial operations and reporting',
    manager: 'Mike Davis',
    status: 'Active',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Operations',
    code: 'OPS',
    description: 'Oversees daily operations and maintenance',
    manager: 'Lisa Chen',
    status: 'Inactive',
    createdAt: '2023-04-05',
  },
];

const MaintainDepartmentPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [departments] = useState<Department[]>(mockDepartments);

  const handleAddDepartment = () => {
    // TODO: Implement add department modal
    console.log('Add department clicked');
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    department.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    department.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    department.manager.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'name',
      header: 'Department Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'manager',
      header: 'Manager',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.manager}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="text-sm text-onSurfaceVariant">{row.original.description}</div>
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
        { label: "Maintain Department" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain Department"
          subtitle="Manage department information and configurations"
          actions={[
            {
              label: "Add Department",
              onAction: handleAddDepartment,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <Search
          searchValue={searchValue}
          searchPlaceholder="Search departments..."
          onSearch={setSearchValue}
          live
        />

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredDepartments}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainDepartmentPage;