import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import SearchFilter from '@/components/SearchFilter';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface ServiceProvider {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceType: string;
  contractEndDate: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const mockServiceProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'TechSupport Pro',
    code: 'TSP001',
    contactPerson: 'Emma Rodriguez',
    email: 'emma@techsupportpro.com',
    phone: '+1-555-0201',
    serviceType: 'IT Support',
    contractEndDate: '2024-12-31',
    status: 'Active',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Maintenance Masters',
    code: 'MM002',
    contactPerson: 'Frank Garcia',
    email: 'frank@maintenancemasters.com',
    phone: '+1-555-0202',
    serviceType: 'Equipment Maintenance',
    contractEndDate: '2024-06-30',
    status: 'Active',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'CleanTech Services',
    code: 'CTS003',
    contactPerson: 'Grace Lee',
    email: 'grace@cleantech.com',
    phone: '+1-555-0203',
    serviceType: 'Cleaning Services',
    contractEndDate: '2024-08-15',
    status: 'Active',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Security Solutions Inc',
    code: 'SSI004',
    contactPerson: 'Henry Wilson',
    email: 'henry@securitysolutions.com',
    phone: '+1-555-0204',
    serviceType: 'Security Services',
    contractEndDate: '2023-12-31',
    status: 'Inactive',
    createdAt: '2023-04-05',
  },
];

const MaintainServiceProviderPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [serviceProviders] = useState<ServiceProvider[]>(mockServiceProviders);

  const handleAddServiceProvider = () => {
    // TODO: Implement add service provider modal
    console.log('Add service provider clicked');
  };

  const filteredServiceProviders = serviceProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    provider.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    provider.contactPerson.toLowerCase().includes(searchValue.toLowerCase()) ||
    provider.serviceType.toLowerCase().includes(searchValue.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<ServiceProvider>[] = [
    {
      accessorKey: 'name',
      header: 'Provider Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'serviceType',
      header: 'Service Type',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.serviceType}</div>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.contactPerson}</div>
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
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.phone}</div>
      ),
    },
    {
      accessorKey: 'contractEndDate',
      header: 'Contract End',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.contractEndDate}</div>
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
        { label: "Maintain Service Provider" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain Service Provider"
          subtitle="Manage service provider information and contracts"
          actions={[
            {
              label: "Add Service Provider",
              onAction: handleAddServiceProvider,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <SearchFilter
          searchValue={searchValue}
          searchPlaceholder="Search service providers..."
          onSearch={setSearchValue}
          live
        />

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredServiceProviders}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainServiceProviderPage;