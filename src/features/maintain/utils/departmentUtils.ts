import type {
  Department,
  DepartmentFormData,
  DepartmentTypeOption,
  DepartmentValidationErrors,
} from '../types/departments';

const ID_PREFIX = 'DEPT';

export function generateDepartmentId(existingDepartments: Department[]): string {
  const highestNumber = existingDepartments
    .map(department => department.id)
    .filter(id => id.startsWith(ID_PREFIX))
    .map(id => parseInt(id.replace(ID_PREFIX, ''), 10))
    .filter(number => !Number.isNaN(number))
    .reduce((max, number) => Math.max(max, number), 0);

  const nextNumber = highestNumber + 1;
  return `${ID_PREFIX}${String(nextNumber).padStart(3, '0')}`;
}

export function formatDepartmentDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDepartmentTypeName(typeId: string, departmentTypes: DepartmentTypeOption[]): string {
  const matchedType = departmentTypes.find(type => type.id === typeId);
  return matchedType ? matchedType.name : 'Unknown';
}

export function filterDepartments(
  departments: Department[],
  searchTerm: string,
  typeId: string,
  departmentTypes: DepartmentTypeOption[],
): Department[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return departments.filter(department => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      department.id.toLowerCase().includes(normalizedSearch) ||
      department.code.toLowerCase().includes(normalizedSearch) ||
      department.name.toLowerCase().includes(normalizedSearch) ||
      department.manager.toLowerCase().includes(normalizedSearch) ||
      department.contact.toLowerCase().includes(normalizedSearch) ||
      department.description.toLowerCase().includes(normalizedSearch) ||
      getDepartmentTypeName(department.typeId, departmentTypes).toLowerCase().includes(normalizedSearch);

    const matchesType = typeId === '' || department.typeId === typeId;

    return matchesSearch && matchesType;
  });
}

export function normalizeDepartmentCode(code: string): string {
  return code.trim().toUpperCase();
}

export function createDepartmentFromForm(
  formData: DepartmentFormData,
  existingDepartment?: Department,
): Department {
  const timestamp = new Date().toISOString();
  const normalizedCode = normalizeDepartmentCode(formData.code);

  if (existingDepartment) {
    return {
      ...existingDepartment,
      code: normalizedCode,
      name: formData.name,
      typeId: formData.typeId,
      manager: formData.manager,
      contact: formData.contact,
      description: formData.description,
      updatedAt: timestamp,
    };
  }

  return {
    id: formData.id,
    code: normalizedCode,
    name: formData.name,
    typeId: formData.typeId,
    manager: formData.manager,
    contact: formData.contact,
    description: formData.description,
    status: 'Active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function validateDepartmentForm(formData: DepartmentFormData): DepartmentValidationErrors {
  const errors: DepartmentValidationErrors = {};

  if (!formData.code.trim()) {
    errors.code = 'Department code is required';
  }

  if (!formData.name.trim()) {
    errors.name = 'Department name is required';
  }

  if (!formData.typeId.trim()) {
    errors.typeId = 'Department type is required';
  }

  return errors;
}
