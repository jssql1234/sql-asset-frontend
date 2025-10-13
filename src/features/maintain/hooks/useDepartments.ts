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
  normalizeDepartmentCode,
  validateDepartmentForm,
} from '../utils/departmentUtils';

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
    code: 'OPS',
    name: 'Maintenance',
    typeId: 'OPS',
    manager: 'Robert Johnson',
    contact: '+60 12-345 6789',
    description: 'Responsible for equipment maintenance and facility upkeep.',
    status: 'Active',
    createdAt: '2025-07-10T08:30:00.000Z',
    updatedAt: '2025-07-10T08:30:00.000Z',
  },
  {
    id: 'DEPT002',
    code: 'ENG',
    name: 'Engineering',
    typeId: 'ENG',
    manager: 'Sarah Wilson',
    contact: '+60 13-222 3344',
    description: 'Design and technical development department.',
    status: 'Active',
    createdAt: '2025-07-12T10:15:00.000Z',
    updatedAt: '2025-07-12T10:15:00.000Z',
  },
  {
    id: 'DEPT003',
    code: 'QAC',
    name: 'Quality Control',
    typeId: 'QAC',
    manager: 'Michael Lee',
    contact: '+60 16-555 6677',
    description: 'Quality assurance and compliance monitoring.',
    status: 'Active',
    createdAt: '2025-07-18T09:45:00.000Z',
    updatedAt: '2025-07-18T09:45:00.000Z',
  },
  {
    id: 'DEPT004',
    code: 'SAF',
    name: 'Safety',
    typeId: 'SAF',
    manager: 'Jennifer Adams',
    contact: '+60 11-444 5566',
    description: 'Workplace safety and compliance oversight.',
    status: 'Active',
    createdAt: '2025-07-22T14:05:00.000Z',
    updatedAt: '2025-07-22T14:05:00.000Z',
  },
  {
    id: 'DEPT005',
    code: 'ADM',
    name: 'Administration',
    typeId: 'ADM',
    manager: 'Thomas Miller',
    contact: '+60 17-888 9900',
    description: 'Administrative and support functions.',
    status: 'Under Review',
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

  const isDuplicateCode = useCallback((code: string, ignoreId?: string) => {
    const normalized = normalizeDepartmentCode(code);
    return departments.some(department => department.code === normalized && department.id !== ignoreId);
  }, [departments]);

  const addDepartment = useCallback((formData: DepartmentFormData) => {
    const validationErrors = validateDepartmentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (isDuplicateId(formData.id)) {
      throw new Error('Department ID already exists');
    }

    if (isDuplicateCode(formData.code)) {
      throw new Error('Department code already exists');
    }

    const newDepartment = createDepartmentFromForm(formData);
    const nextDepartments = [...departments, newDepartment];
    setDepartments(nextDepartments);
    persistDepartments(nextDepartments);

    return newDepartment;
  }, [departments, isDuplicateCode, isDuplicateId, persistDepartments]);

  const updateDepartment = useCallback((formData: DepartmentFormData) => {
    const validationErrors = validateDepartmentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (isDuplicateCode(formData.code, formData.id)) {
      throw new Error('Department code already exists');
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
  }, [isDuplicateCode, persistDepartments]);

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

  return {
    departments,
    filteredDepartments,
    selectedDepartments,
    filters,
    departmentTypes,
    isLoading,
    error,
    updateFilters,
    addDepartment,
    updateDepartment,
    deleteMultipleDepartments,
    toggleDepartmentSelection,
    clearSelection,
    getDepartmentById,
    resetToSampleData,
    exportData,
    getNewDepartmentId,
  };
}
