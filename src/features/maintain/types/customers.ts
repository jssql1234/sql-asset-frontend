export interface Customer {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
    name: string;
    code: string;
    contactPerson: string;
    email: string;
    phone: string;
    status: 'Active' | 'Inactive';
}

export interface CustomersFilters {
    search: string;
}

export interface CustomersState {
    customers: Customer[];
    filteredCustomers: Customer[];
    selectedCustomers: string[];
    filters: CustomersFilters;
    isLoading: boolean;
    error: string | null;
}

export interface CustomerValidationErrors {
    name?: string;
    code?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
}
