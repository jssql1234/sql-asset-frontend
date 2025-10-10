import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface Location {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'HQ - IT Store',
    description: 'Main IT storage facility at headquarters',
    status: 'Active',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Plant Room',
    description: 'Equipment storage in plant room',
    status: 'Active',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Warehouse',
    description: 'General warehouse storage',
    status: 'Active',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Data Center',
    description: 'Secure data center location',
    status: 'Inactive',
    createdAt: '2023-04-05',
  },
];

const MaintainLocationPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [locations] = useState<Location[]>(mockLocations);

  const handleAddLocation = () => {
    // TODO: Implement add location modal
    console.log('Add location clicked');
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    location.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: 'name',
      header: 'Location Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
        </div>
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
        { label: "Maintain Location" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain Location"
          subtitle="Manage location information and settings"
          actions={[
            {
              label: "Add Location",
              onAction: handleAddLocation,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <Search
          searchValue={searchValue}
          searchPlaceholder="Search locations..."
          onSearch={setSearchValue}
          live
        />

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredLocations}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainLocationPage;