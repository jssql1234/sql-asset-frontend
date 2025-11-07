import type {
  Customer,
  CustomerFormData,
  CustomerValidationErrors,
} from '../types/customers';

const CODE_PREFIX = 'CUST';

export function generateCustomerCode(existingCustomers: Customer[]): string {
  const highestNumber = existingCustomers
    .map(customer => customer.code)
    .filter(code => code.startsWith(CODE_PREFIX))
    .map(code => parseInt(code.replace(CODE_PREFIX, ''), 10))
    .filter(number => !Number.isNaN(number))
    .reduce((max, number) => Math.max(max, number), 0);

  const nextNumber = highestNumber + 1;
  return `${CODE_PREFIX}${String(nextNumber).padStart(3, '0')}`;
}

export function formatCustomerDate(dateString: string): string {
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

export function filterCustomers(
  customers: Customer[],
  searchTerm: string,
): Customer[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return customers.filter(customer => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      customer.name.toLowerCase().includes(normalizedSearch) ||
      customer.code.toLowerCase().includes(normalizedSearch) ||
      customer.contactPerson.toLowerCase().includes(normalizedSearch) ||
      customer.email.toLowerCase().includes(normalizedSearch) ||
      customer.phone.toLowerCase().includes(normalizedSearch);

    return matchesSearch;
  });
}

export function createCustomerFromForm(
  formData: CustomerFormData,
  existingCustomer?: Customer,
): Customer {
  const timestamp = new Date().toISOString();

  if (existingCustomer) {
    return {
      ...existingCustomer,
      name: formData.name,
      code: formData.code,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      updatedAt: timestamp,
    };
  }

  return {
    name: formData.name,
    code: formData.code,
    contactPerson: formData.contactPerson,
    email: formData.email,
    phone: formData.phone,
    status: formData.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCustomerForm(formData: CustomerFormData): CustomerValidationErrors {
  const errors: CustomerValidationErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Customer Name is required.';
  }

  if (!formData.code.trim()) {
    errors.code = 'Customer Code is required.';
  }

  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!formData.status) {
    errors.status = 'Status is required.';
  }

  return errors;
}

