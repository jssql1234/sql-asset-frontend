import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from '@/assets/icons';

interface Customer {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    code: 'TC001',
    contactPerson: 'Alice Brown',
    email: 'alice.brown@techcorp.com',
    phone: '+1-555-0101',
    status: 'Active',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Global Industries Ltd',
    code: 'GI002',
    contactPerson: 'Bob Wilson',
    email: 'bob.wilson@globalind.com',
    phone: '+1-555-0102',
    status: 'Active',
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Metro Services Inc',
    code: 'MS003',
    contactPerson: 'Carol Davis',
    email: 'carol.davis@metroservices.com',
    phone: '+1-555-0103',
    status: 'Active',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Prime Logistics',
    code: 'PL004',
    contactPerson: 'David Miller',
    email: 'david.miller@primelog.com',
    phone: '+1-555-0104',
    status: 'Inactive',
    createdAt: '2023-04-05',
  },
];

const MaintainCustomerPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);

  const handleAddCustomer = () => {
    // TODO: Implement add customer modal
    console.log('Add customer clicked');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    customer.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    customer.contactPerson.toLowerCase().includes(searchValue.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.code}</div>
        </div>
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
        { label: "Maintain Customer" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Maintain Customer"
          subtitle="Manage customer information and relationships"
          actions={[
            {
              label: "Add Customer",
              onAction: handleAddCustomer,
              icon: <Plus />,
              variant: "default",
            },
          ]}
        />

        <Search
          searchValue={searchValue}
          searchPlaceholder="Search customers..."
          onSearch={setSearchValue}
          live
        />

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredCustomers}
            showPagination
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainCustomerPage;