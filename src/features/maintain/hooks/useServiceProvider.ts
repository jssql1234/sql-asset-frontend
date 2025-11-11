import { useCallback, useEffect, useState } from 'react';
import type {
  ServiceProvider,
  ServiceProviderFormData,
  ServiceProviderFilters,
  ServiceProviderTypeOption,
} from '../types/serviceProvider';

import {
  createServiceProviderFromForm,
  filterServiceProvider,
  validateServiceProviderForm,
} from '../utils/serviceProviderUtils';

import { useToast } from '@/components/ui/components/Toast';

const SERVICE_PROVIDERS_STORAGE_KEY = 'maintain_service_providers';
const SERVICE_PROVIDER_TYPES_STORAGE_KEY = 'maintain_service_provider_types';

const mockServiceProviderTypes: ServiceProviderTypeOption[] = [
  { id: 'TSP', name: 'IT Support' },
  { id: 'MM', name: 'Equipment Maintenance' },
  { id: 'CTS', name: 'Cleaning Services' },
  { id: 'SSI', name: 'Security Services' },
];

const mockServiceProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'TechSupport Pro',
    code: 'TSP001',
    contactPerson: 'Emma Rodriguez',
    email: 'emma@techsupportpro.com',
    phone: '+1-555-0201',
    description: 'IT Support',
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
    description: 'Equipment Maintenance',
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
    description: 'Cleaning Services',
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
    description: 'Security Services',
    status: 'Inactive',
    createdAt: '2023-04-05',
  },
];

export function useServiceProvider() {
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider[]>([]);
  const [filteredServiceProvider, setFilteredServiceProvider] = useState<ServiceProvider[]>([]);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<string[]>([]);
  const [filters, setFilters] = useState<ServiceProviderFilters>({
    search: '',
    code: '',
  });
  const [serviceProviderTypes, setServiceProviderTypes] = useState<ServiceProviderTypeOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceProvider, setEditingServiceProvider] = useState<ServiceProvider | null>(null);

  const { addToast } = useToast();

  useEffect(() => {
    try {
      const storedProviders = typeof window !== 'undefined'
        ? window.localStorage.getItem(SERVICE_PROVIDERS_STORAGE_KEY)
        : null;

      const storedTypes = typeof window !== 'undefined'
        ? window.localStorage.getItem(SERVICE_PROVIDER_TYPES_STORAGE_KEY)
        : null;

      const initialProviders: ServiceProvider[] = storedProviders
        ? JSON.parse(storedProviders)
        : mockServiceProviders;

      const initialTypes: ServiceProviderTypeOption[] = storedTypes
        ? JSON.parse(storedTypes)
        : mockServiceProviderTypes;

      setServiceProvider(initialProviders);
      setServiceProviderTypes(initialTypes);

      const filtered = filterServiceProvider(initialProviders, filters.search, filters.code, initialTypes);
      setFilteredServiceProvider(filtered);
    } catch (err) {
      console.error('Failed to load service providers from localStorage', err);
      setServiceProvider(mockServiceProviders);
      setServiceProviderTypes(mockServiceProviderTypes);
      setFilteredServiceProvider(mockServiceProviders);
    }
  }, []);

  useEffect(() => {
    const filtered = filterServiceProvider(serviceProvider, filters.search, filters.code, serviceProviderTypes);
    setFilteredServiceProvider(filtered);
  }, [serviceProvider, filters, serviceProviderTypes]);

  const updateFilters = useCallback((newFilters: Partial<ServiceProviderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const persistServiceProviders = useCallback((providers: ServiceProvider[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SERVICE_PROVIDERS_STORAGE_KEY, JSON.stringify(providers));
    }
  }, []);

  const isDuplicateId = useCallback((id: string, ignoreId?: string) => {
    return serviceProvider.some(sp => sp.id === id && sp.id !== ignoreId);
  }, [serviceProvider]);

  const addServiceProvider = useCallback((formData: ServiceProviderFormData) => {
    const validationErrors = validateServiceProviderForm(formData);
    if (Object.keys(validationErrors).length > 0) throw new Error('Validation failed');
    if (isDuplicateId(formData.id)) throw new Error('Service Provider ID already exists');

    const newProvider = createServiceProviderFromForm(formData);

    setServiceProvider(prev => {
      const next = [...prev, newProvider];
      persistServiceProviders(next);
      return next;
    });

    return newProvider;
  }, [isDuplicateId, persistServiceProviders]);

  const updateServiceProvider = useCallback((formData: ServiceProviderFormData) => {
    const validationErrors = validateServiceProviderForm(formData);
    if (Object.keys(validationErrors).length > 0) throw new Error('Validation failed');

    setServiceProvider(prev => {
      const next = prev.map(sp => sp.id === formData.id ? createServiceProviderFromForm(formData) : sp);
      persistServiceProviders(next);
      return next;
    });
  }, [persistServiceProviders]);

  const deleteMultipleServiceProvider = useCallback((ids: string[]) => {
    setServiceProvider(prev => {
      const next = prev.filter(sp => !ids.includes(sp.id));
      persistServiceProviders(next);
      return next;
    });

    setSelectedServiceProvider(prev => prev.filter(id => !ids.includes(id)));
  }, [persistServiceProviders]);

  const toggleServiceProviderSelection = useCallback((id: string) => {
    setSelectedServiceProvider(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const handleAddServiceProvider = () => {
    setEditingServiceProvider(null);
    setIsModalOpen(true);
  };

  const handleEditServiceProvider = (provider: ServiceProvider) => {
    setEditingServiceProvider(provider);
    setIsModalOpen(true);
  };

  const handleSaveServiceProvider = (formData: ServiceProviderFormData) => {
    try {
      if (editingServiceProvider) {
        updateServiceProvider(formData);
        addToast({
          title: 'Success',
          description: `Service Provider "${formData.name}" updated successfully.`,
          variant: 'success',
          duration: 5000,
        });
      } else {
        addServiceProvider(formData);
        addToast({
          title: 'Success',
          description: `Service Provider "${formData.name}" created successfully.`,
          variant: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving.',
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteServiceProvider = (id: string) => {
    if (!id) return;

    try {
      deleteMultipleServiceProvider([id]);
      addToast({
        title: 'Success',
        description: 'Service provider deleted successfully!',
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error deleting service provider',
        variant: 'error',
      });
    }
  };

  const handleDeleteMultipleServiceProvider = (ids: string[]) => {
    if (ids.length === 0) return;

    if (confirm(`Are you sure you want to delete ${ids.length} selected service providers?`)) {
      try {
        deleteMultipleServiceProvider(ids);
        addToast({
          title: 'Success',
          description: `${ids.length} service providers deleted successfully!`,
          variant: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Error deleting service providers',
          variant: 'error',
        });
      }
    }
  };

  return {
    serviceProvider,
    filteredServiceProvider,
    selectedServiceProvider,
    filters,
    serviceProviderTypes,
    isModalOpen,
    editingServiceProvider,
    setIsModalOpen,
    setEditingServiceProvider,
    updateFilters,
    toggleServiceProviderSelection,
    handleAddServiceProvider,
    handleEditServiceProvider,
    handleDeleteServiceProvider,
    handleDeleteMultipleServiceProvider,
    handleSaveServiceProvider,
  };
}
