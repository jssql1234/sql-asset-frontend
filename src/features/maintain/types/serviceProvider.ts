export interface ServiceProviderTypeOption {
  id: string;
  name: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  description: string;
  contractEndDate: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface ServiceProviderFormData {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  description: string;
  contractEndDate: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface ServiceProviderFilters {
  search: string;
  code: string;
}

export interface ServiceProviderState {
  serviceProvider: ServiceProvider[];
  filteredServiceProvider: ServiceProvider[];
  selectedServiceProvider: string[];
  filters: ServiceProviderFilters;
  serviceProvidertTypes: ServiceProviderTypeOption[];
  isLoading: boolean;
  error: string | null;
}

export interface ServiceProviderValidationErrors {
  name?: string;
  code?: string;
  status?: string;
}
