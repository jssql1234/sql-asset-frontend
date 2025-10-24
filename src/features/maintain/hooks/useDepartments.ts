import { useCallback, useEffect, useState } from 'react';
import type {
  Department,
  DepartmentFormData,
  DepartmentsFilters,
  DepartmentTypeOption,
} from '../types/departments';
import {
  createDepartmentFromForm,
  filterDepartments,
  generateDepartmentId,
  validateDepartmentForm,
} from '../utils/departmentUtils';
import { useToast } from '@/components/ui/components/Toast';

const DEPARTMENTS_STORAGE_KEY = 'maintain_departments_data';
const DEPARTMENT_TYPES_STORAGE_KEY = 'maintain_department_types_data';

const sampleDepartmentTypes: DepartmentTypeOption[] = [
  { id: 'OPS', name: 'Operations' },
  { id: 'ENG', name: 'Engineering' },
  { id: 'QAC', name: 'Quality Control' },
  { id: 'SAF', name: 'Safety' },
  { id: 'ADM', name: 'Administration' },
];

const sampleDepartments: Department[] = [
  {
    id: 'DEPT001',
    name: 'Maintenance',
    typeId: 'OPS',
    manager: 'Robert Johnson',
    contact: '+60 12-345 6789',
    description: 'Responsible for equipment maintenance and facility upkeep.',
    createdAt: '2025-07-10T08:30:00.000Z',
    updatedAt: '2025-07-10T08:30:00.000Z',
  },
  {
    id: 'DEPT002',
    name: 'Engineering',
    typeId: 'ENG',
    manager: 'Sarah Wilson',
    contact: '+60 13-222 3344',
    description: 'Design and technical development department.',
    createdAt: '2025-07-12T10:15:00.000Z',
    updatedAt: '2025-07-12T10:15:00.000Z',
  },
  {
    id: 'DEPT003',
    name: 'Quality Control',
    typeId: 'QAC',
    manager: 'Michael Lee',
    contact: '+60 16-555 6677',
    description: 'Quality assurance and compliance monitoring.',
    createdAt: '2025-07-18T09:45:00.000Z',
    updatedAt: '2025-07-18T09:45:00.000Z',
  },
  {
    id: 'DEPT004',
    name: 'Safety',
    typeId: 'SAF',
    manager: 'Jennifer Adams',
    contact: '+60 11-444 5566',
    description: 'Workplace safety and compliance oversight.',
    createdAt: '2025-07-22T14:05:00.000Z',
    updatedAt: '2025-07-22T14:05:00.000Z',
  },
  {
    id: 'DEPT005',
    name: 'Administration',
    typeId: 'ADM',
    manager: 'Thomas Miller',
    contact: '+60 17-888 9900',
    description: 'Administrative and support functions.',
    createdAt: '2025-07-25T11:20:00.000Z',
    updatedAt: '2025-07-25T11:20:00.000Z',
  },
];

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [filters, setFilters] = useState<DepartmentsFilters>({
    search: '',
    typeId: '',
  });
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentTypeOption[]>(sampleDepartmentTypes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const initialize = () => {
      try {
        const storedDepartments = typeof window !== 'undefined'
          ? window.localStorage.getItem(DEPARTMENTS_STORAGE_KEY)
          : null;
        const storedTypes = typeof window !== 'undefined'
          ? window.localStorage.getItem(DEPARTMENT_TYPES_STORAGE_KEY)
          : null;

        let initialDepartments = sampleDepartments;
        let initialTypes = sampleDepartmentTypes;

        if (storedDepartments) {
          const parsedDepartments = JSON.parse(storedDepartments) as Department[];
          if (Array.isArray(parsedDepartments)) {
            initialDepartments = parsedDepartments;
          }
        } else if (typeof window !== 'undefined') {
          window.localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(sampleDepartments));
        }

        if (storedTypes) {
          const parsedTypes = JSON.parse(storedTypes) as DepartmentTypeOption[];
          if (Array.isArray(parsedTypes) && parsedTypes.length > 0) {
            initialTypes = parsedTypes;
          }
        } else if (typeof window !== 'undefined') {
          window.localStorage.setItem(DEPARTMENT_TYPES_STORAGE_KEY, JSON.stringify(sampleDepartmentTypes));
        }

        setDepartmentTypes(initialTypes);
        setDepartments(initialDepartments);
        setFilteredDepartments(filterDepartments(initialDepartments, '', '', initialTypes));
        setIsLoading(false);
      } catch (initializationError) {
        console.error('Error initializing departments data:', initializationError);
        setDepartmentTypes(sampleDepartmentTypes);
        setDepartments(sampleDepartments);
        setFilteredDepartments(sampleDepartments);
        setIsLoading(false);
        setError('Failed to load departments data');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (departmentTypes.length === 0) {
      setFilteredDepartments([]);
      return;
    }

    const filtered = filterDepartments(departments, filters.search, filters.typeId, departmentTypes);
    setFilteredDepartments(filtered);
  }, [departments, filters, departmentTypes]);

  const updateFilters = useCallback((newFilters: Partial<DepartmentsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const persistDepartments = useCallback((nextDepartments: Department[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(nextDepartments));
    }
  }, []);

  const persistDepartmentTypes = useCallback((nextTypes: DepartmentTypeOption[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEPARTMENT_TYPES_STORAGE_KEY, JSON.stringify(nextTypes));
    }
  }, []);

  const isDuplicateId = useCallback((id: string, ignoreId?: string) => {
    return departments.some(department => department.id === id && department.id !== ignoreId);
  }, [departments]);

  const addDepartment = useCallback((formData: DepartmentFormData) => {
    const validationErrors = validateDepartmentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (isDuplicateId(formData.id)) {
      throw new Error('Department ID already exists');
    }

    const newDepartment = createDepartmentFromForm(formData);
    const nextDepartments = [...departments, newDepartment];
    setDepartments(nextDepartments);
    persistDepartments(nextDepartments);

    return newDepartment;
  }, [departments, isDuplicateId, persistDepartments]);

  const updateDepartment = useCallback((formData: DepartmentFormData) => {
    const validationErrors = validateDepartmentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    setDepartments(prevDepartments => {
      const nextDepartments = prevDepartments.map(department =>
        department.id === formData.id
          ? createDepartmentFromForm(formData, department)
          : department,
      );
      persistDepartments(nextDepartments);
      return nextDepartments;
    });
  }, [persistDepartments]);

  const deleteMultipleDepartments = useCallback((ids: string[]) => {
    setDepartments(prevDepartments => {
      const nextDepartments = prevDepartments.filter(department => !ids.includes(department.id));
      persistDepartments(nextDepartments);
      return nextDepartments;
    });
    setSelectedDepartments(prev => prev.filter(id => !ids.includes(id)));
  }, [persistDepartments]);

  const toggleDepartmentSelection = useCallback((id: string) => {
    setSelectedDepartments(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDepartments([]);
  }, []);

  const getDepartmentById = useCallback((id: string) => {
    return departments.find(department => department.id === id);
  }, [departments]);

  const resetToSampleData = useCallback(() => {
    setDepartments(sampleDepartments);
    setDepartmentTypes(sampleDepartmentTypes);
    setSelectedDepartments([]);
    setFilters({ search: '', typeId: '' });
    persistDepartments(sampleDepartments);
    persistDepartmentTypes(sampleDepartmentTypes);
  }, [persistDepartments, persistDepartmentTypes]);

  const exportData = useCallback(() => {
    const payload = {
      departments,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `departments_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [departments]);

  const getNewDepartmentId = useCallback(() => generateDepartmentId(departments), [departments]);

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleSaveDepartment = (formData: DepartmentFormData) => {
    try {
      if (editingDepartment) {
        updateDepartment(formData);
        addToast({
          title: 'Success',
          description: `Department "${formData.name}" has been updated successfully.`,
          variant: 'success',
          duration: 5000,
        });
      } else {
        addDepartment(formData);
        addToast({
          title: 'Success',
          description: `Department "${formData.name}" has been created successfully.`,
          variant: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving the department.',
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteMultipleDepartments = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    if (confirm(`Are you sure you want to delete ${String(ids.length)} selected departments?`)) {
      try {
        deleteMultipleDepartments(ids);
        addToast({
          title: 'Success',
          description: `${String(ids.length)} departments deleted successfully!`,
          variant: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred while deleting the departments.',
          variant: 'error',
        });
      }
    }
  };

  return {
    departments,
    filteredDepartments,
    selectedDepartments,
    filters,
    departmentTypes,
    isModalOpen,
    editingDepartment,
    setIsModalOpen,
    setEditingDepartment,
    updateFilters,
    toggleDepartmentSelection,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteMultipleDepartments,
    handleSaveDepartment,

    // Unused Exports?
    isLoading,
    error,
    addDepartment,
    updateDepartment,
    deleteMultipleDepartments,
    clearSelection,
    getDepartmentById,
    resetToSampleData,
    exportData,
    getNewDepartmentId,
  };
}
