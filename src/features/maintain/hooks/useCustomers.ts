import { useState, useCallback, useEffect } from 'react';
import type {
  Customer,
  CustomerFormData,
  CustomersFilters,
} from '../types/customers';
import {
  createCustomerFromForm,
  filterCustomers,
  validateCustomerForm,
} from '../utils/customerUtils';
import { useToast } from '@/components/ui/components/Toast';

const CUSTOMERS_STORAGE_KEY = 'maintain_customers_data';

const sampleCustomers: Customer[] = [
  { 
    name: 'TechCorp Solutions', 
    code: 'TC001', 
    contactPerson: 'Alice Brown', 
    email: 'alice.brown@techcorp.com', 
    phone: '+1-555-0101', 
    status: 'Active', 
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  { 
    name: 'Global Industries Ltd', 
    code: 'GI002', 
    contactPerson: 'Bob Wilson', 
    email: 'bob.wilson@globalind.com', 
    phone: '+1-555-0102', 
    status: 'Active', 
    createdAt: '2025-02-20T11:00:00Z',
    updatedAt: '2025-02-20T11:00:00Z',
  },
  { 
    name: 'Metro Services Inc', 
    code: 'MS003', 
    contactPerson: 'Carol Davis', 
    email: 'carol.davis@metroservices.com', 
    phone: '+1-555-0103', 
    status: 'Active', 
    createdAt: '2025-03-10T12:00:00Z', 
    updatedAt: '2025-03-10T12:00:00Z' 
  },
  { 
    name: 'Prime Logistics', 
    code: 'PL004', 
    contactPerson: 'David Miller', 
    email: 'david.miller@primelog.com', 
    phone: '+1-555-0104', 
    status: 'Inactive', 
    createdAt: '2025-04-05T13:00:00Z', 
    updatedAt: '2025-04-05T13:00:00Z' 
  },
];

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filters, setFilters] = useState<CustomersFilters>({
    search: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const initialize = () => {
      try {
        const storedCustomers = typeof window !== 'undefined'
          ? window.localStorage.getItem(CUSTOMERS_STORAGE_KEY)
          : null;

        let initialCustomers = sampleCustomers;

        if (storedCustomers) {
          const parsedCustomers = JSON.parse(storedCustomers) as Customer[];
          if (Array.isArray(parsedCustomers)) {
            initialCustomers = parsedCustomers;
          }
        } else if (typeof window !== 'undefined') {
          window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(sampleCustomers));
        }

        setCustomers(initialCustomers);
        setFilteredCustomers(filterCustomers(initialCustomers, ''));
        setIsLoading(false);
      } catch (initializationError) {
        console.error('Error initializing customers data:', initializationError);
        setCustomers(sampleCustomers);
        setFilteredCustomers(sampleCustomers);
        setIsLoading(false);
        setError('Failed to load customers data');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const filtered = filterCustomers(customers, filters.search);
    setFilteredCustomers(filtered);
  }, [customers, filters]);

  const updateFilters = useCallback((newFilters: Partial<CustomersFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const persistCustomers = useCallback((nextCustomers: Customer[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(nextCustomers));
    }
  }, []);

  const isDuplicateCode = useCallback((code: string, ignoreCode?: string) => {
    return customers.some(customer => customer.code === code && customer.code !== ignoreCode);
  }, [customers]);

  const addCustomer = useCallback((formData: CustomerFormData) => {
    const validationErrors = validateCustomerForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (isDuplicateCode(formData.code)) {
      throw new Error('Customer Code already exists');
    }

    const newCustomer = createCustomerFromForm(formData);
    const nextCustomers = [...customers, newCustomer];
    setCustomers(nextCustomers);
    persistCustomers(nextCustomers);

    return newCustomer;
  }, [customers, isDuplicateCode, persistCustomers]);

  const updateCustomer = useCallback((formData: CustomerFormData) => {
    const validationErrors = validateCustomerForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    setCustomers(prevCustomers => {
      const nextCustomers = prevCustomers.map(customer =>
        customer.code === formData.code
          ? createCustomerFromForm(formData, customer)
          : customer,
      );
      persistCustomers(nextCustomers);
      return nextCustomers;
    });
  }, [persistCustomers]);

  const deleteMultipleCustomers = useCallback((codes: string[]) => {
    setCustomers(prevCustomers => {
      const nextCustomers = prevCustomers.filter(customer => !codes.includes(customer.code));
      persistCustomers(nextCustomers);
      return nextCustomers;
    });
    setSelectedCustomers(prev => prev.filter(code => !codes.includes(code)));
  }, [persistCustomers]);

  const toggleCustomerSelection = useCallback((code: string) => {
    setSelectedCustomers(prev =>
      prev.includes(code) ? prev.filter(selectedCode => selectedCode !== code) : [...prev, code],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCustomers([]);
  }, []);

  const getCustomerByCode = useCallback((code: string) => {
    return customers.find(customer => customer.code === code);
  }, [customers]);

  const resetToSampleData = useCallback(() => {
    setCustomers(sampleCustomers);
    setSelectedCustomers([]);
    setFilters({ search: '' });
    persistCustomers(sampleCustomers);
  }, [persistCustomers]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (formData: CustomerFormData) => {
    try {
      if (editingCustomer) {
        updateCustomer(formData);
        addToast({
          title: 'Success',
          description: `Customer "${formData.name}" has been updated successfully.`,
          variant: 'success',
          duration: 5000,
        });
      } else {
        addCustomer(formData);
        addToast({
          title: 'Success',
          description: `Customer "${formData.name}" has been created successfully.`,
          variant: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving the customer.',
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteMultipleCustomers = (codes: string[]) => {
    if (codes.length === 0) {
      return;
    }

    if (confirm(`Are you sure you want to delete ${String(codes.length)} selected customers?`)) {
      try {
        deleteMultipleCustomers(codes);
        addToast({
          title: 'Success',
          description: `${String(codes.length)} customers deleted successfully!`,
          variant: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred while deleting the customers.',
          variant: 'error',
        });
      }
    }
  };

  return {
    customers,
    filteredCustomers,
    selectedCustomers,
    filters,
    isLoading,
    error,
    isModalOpen,
    editingCustomer,
    setIsModalOpen,
    setEditingCustomer,
    updateFilters,
    toggleCustomerSelection,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteMultipleCustomers,
    handleSaveCustomer,

    // Unused Exports
    addCustomer,
    updateCustomer,
    deleteMultipleCustomers,
    clearSelection,
    getCustomerByCode,
    resetToSampleData,
  };
}