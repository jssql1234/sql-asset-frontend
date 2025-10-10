import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface AssetGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const mockAssetGroups: AssetGroup[] = [
  {
    id: '1',
    name: 'IT Equipment',
    description: 'Computers, laptops, and IT peripherals',
    category: 'Technology',
    status: 'Active',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Machinery',
    description: 'Production and manufacturing equipment',
    category: 'Equipment',
    status: 'Active',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Vehicles',
    description: 'Company vehicles and transportation assets',
    category: 'Transportation',
    status: 'Active',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Furniture',
    description: 'Office furniture and fixtures',
    category: 'Facilities',
    status: 'Inactive',
    createdAt: '2023-04-05',
  },
];

const MaintainAssetGroupPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [assetGroups] = useState<AssetGroup[]>(mockAssetGroups);

  const handleAddAssetGroup = () => {
    // TODO: Implement add asset group modal
    console.log('Add asset group clicked');
  };

  const filteredAssetGroups = assetGroups.filter(assetGroup =>
    assetGroup.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    assetGroup.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    assetGroup.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<AssetGroup>[] = [
    {
      accessorKey: 'name',
      header: 'Asset Group Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.category}</div>
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
        { label: "Maintain Asset Group" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain Asset Group"
          subtitle="Manage asset group information and settings"
          actions={[
            {
              label: "Add Asset Group",
              onAction: handleAddAssetGroup,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <Search
          searchValue={searchValue}
          searchPlaceholder="Search asset groups..."
          onSearch={setSearchValue}
          live
        />

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredAssetGroups}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainAssetGroupPage;