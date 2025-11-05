import type {
  ServiceProvider,
  ServiceProviderFormData,
  ServiceProviderTypeOption,
  ServiceProviderValidationErrors,
} from '../types/serviceProvider';


const ID_PREFIX = 'XXX';

export function generateServiceProviderId(existingServiceProvider: ServiceProvider[]): string {
  const highestNumber = existingServiceProvider
    .map(serviceProvider => serviceProvider.id)
    .filter(id => id.startsWith(ID_PREFIX))
    .map(id => parseInt(id.replace(ID_PREFIX, ''), 10))
    .filter(number => !Number.isNaN(number))
    .reduce((max, number) => Math.max(max, number), 0);

  const nextNumber = highestNumber + 1;
  return `${ID_PREFIX}${String(nextNumber).padStart(3, '0')}`;
}

export function generateServiceProviderCode(
  type: string, 
  existingServiceProviders: ServiceProvider[]
): string {
  const filteredProviders = existingServiceProviders.filter(
    provider => provider.code.startsWith(type)
  );
  
  const nextNumber = filteredProviders.length + 1;
  return `${type}${String(nextNumber).padStart(3, '0')}`;
}


export function formatServiceProviderDate(dateString: string): string {
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

export function getServiceProviderTypeName(code: string, serviceProviderTypes: ServiceProviderTypeOption[]): string {
  const matchedType = serviceProviderTypes.find(type => type.id === code);
  return matchedType ? matchedType.name : 'Unknown';
}

export function filterServiceProvider(
  serviceProvider: ServiceProvider[],
  searchTerm: string,
  code: string,
  serviceProviderTypes: ServiceProviderTypeOption[],
): ServiceProvider[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return serviceProvider.filter(serviceProvider => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      (serviceProvider.id?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.name?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.code?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.description?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.contactPerson?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.email?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.phone?.toLowerCase() || '').includes(normalizedSearch) ||
      (serviceProvider.contractEndDate?.toLowerCase() || '').includes(normalizedSearch) ||  
      (serviceProvider.createdAt?.toLowerCase() || '').includes(normalizedSearch);
          
      getServiceProviderTypeName(serviceProvider.code, serviceProviderTypes).toLowerCase().includes(normalizedSearch);

    const matchesType = !code || serviceProvider.code === code;

    return matchesSearch && matchesType;
  });
}

export function createServiceProviderFromForm(
  formData: ServiceProviderFormData,
  existingServiceProvider?: ServiceProvider,
): ServiceProvider {
  const timestamp = new Date().toISOString();

  if (existingServiceProvider) {
    return {
      ...existingServiceProvider,
      name: formData.name,
      code: formData.code,
      description: formData.description,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      contractEndDate: formData.contractEndDate,
      status: formData.status,
      createdAt: timestamp,
    };
  }

  return {
    id: formData.id,
      name: formData.name,
      code: formData.code,
      description: formData.description,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      contractEndDate: formData.contractEndDate,
      status: formData.status,
      createdAt: timestamp,
  };
}

export function validateServiceProviderForm(formData: ServiceProviderFormData): ServiceProviderValidationErrors {
  const errors: ServiceProviderValidationErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Service Provider name is required';
  }

    if (!formData.status.trim()) {
    errors.status = 'Status type is required';
  }

  return errors;
}
