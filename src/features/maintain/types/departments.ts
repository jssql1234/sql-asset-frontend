export interface DepartmentTypeOption {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  typeId: string;
  manager: string;
  contact: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentFormData {
  id: string;
  name: string;
  typeId: string;
  manager: string;
  contact: string;
  description: string;
}

export interface DepartmentsFilters {
  search: string;
  typeId: string;
}

export interface DepartmentsState {
  departments: Department[];
  filteredDepartments: Department[];
  selectedDepartments: string[];
  filters: DepartmentsFilters;
  departmentTypes: DepartmentTypeOption[];
  isLoading: boolean;
  error: string | null;
}

export interface DepartmentValidationErrors {
  name?: string;
  typeId?: string;
}
