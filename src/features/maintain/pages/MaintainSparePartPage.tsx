import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  category: string;
  quantity: number;
  unitCost: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
}

const mockSpareParts: SparePart[] = [
  {
    id: '1',
    name: 'CPU Fan',
    partNumber: 'CPU-FAN-001',
    description: 'High-performance CPU cooling fan',
    category: 'Cooling',
    quantity: 25,
    unitCost: 45.99,
    status: 'In Stock',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Power Supply Unit',
    partNumber: 'PSU-500W-002',
    description: '500W ATX power supply',
    category: 'Power',
    quantity: 8,
    unitCost: 89.99,
    status: 'Low Stock',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'RAM Module 8GB',
    partNumber: 'RAM-8GB-003',
    description: 'DDR4 8GB memory module',
    category: 'Memory',
    quantity: 0,
    unitCost: 65.50,
    status: 'Out of Stock',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Hard Drive 1TB',
    partNumber: 'HDD-1TB-004',
    description: '1TB SATA hard drive',
    category: 'Storage',
    quantity: 15,
    unitCost: 79.99,
    status: 'In Stock',
    createdAt: '2023-04-05',
  },
];

const MaintainSparePartPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [spareParts] = useState<SparePart[]>(mockSpareParts);

  const handleAddSparePart = () => {
    // TODO: Implement add spare part modal
    console.log('Add spare part clicked');
  };

  const filteredSpareParts = spareParts.filter(sparePart =>
    sparePart.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    sparePart.partNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
    sparePart.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    sparePart.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<SparePart>[] = [
    {
      accessorKey: 'name',
      header: 'Part Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">PN: {row.original.partNumber}</div>
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
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.quantity}</div>
      ),
    },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      cell: ({ row }) => (
        <div className="text-sm">${row.original.unitCost.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorClass = status === 'In Stock' ? 'bg-green-100 text-green-800' :
                          status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
            {status}
          </span>
        );
      },
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
        { label: "Maintain Spare Part" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain Spare Part"
          subtitle="Manage spare parts inventory and information"
          actions={[
            {
              label: "Add Spare Part",
              onAction: handleAddSparePart,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <Search
          searchValue={searchValue}
          searchPlaceholder="Search spare parts..."
          onSearch={setSearchValue}
          live
        />

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredSpareParts}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainSparePartPage;