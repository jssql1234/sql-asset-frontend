import type { Location, LocationFormData, LocationTypeOption, LocationValidationErrors } from '../types/locations';

const ID_PREFIX = 'LOC';

export function generateLocationId(existingLocations: Location[]): string {
  const highestNumber = existingLocations
    .map(location => location.id)
    .filter(id => id.startsWith(ID_PREFIX))
    .map(id => parseInt(id.replace(ID_PREFIX, ''), 10))
    .filter(number => !Number.isNaN(number))
    .reduce((max, number) => Math.max(max, number), 0);

  const nextNumber = highestNumber + 1;
  return `${ID_PREFIX}${String(nextNumber).padStart(3, '0')}`;
}

export function formatLocationDate(dateString: string): string {
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

export function getLocationTypeName(typeId: string, locationTypes: LocationTypeOption[]): string {
  const matchedType = locationTypes.find(type => type.id === typeId);
  return matchedType ? matchedType.name : 'Unknown';
}

export function filterLocations(
  locations: Location[],
  searchTerm: string,
  categoryId: string,
  locationTypes: LocationTypeOption[]
): Location[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return locations.filter(location => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      location.id.toLowerCase().includes(normalizedSearch) ||
      location.name.toLowerCase().includes(normalizedSearch) ||
      location.address.toLowerCase().includes(normalizedSearch) ||
      location.contactPerson.toLowerCase().includes(normalizedSearch) ||
      location.contactDetails.toLowerCase().includes(normalizedSearch) ||
      getLocationTypeName(location.categoryId, locationTypes).toLowerCase().includes(normalizedSearch);

    const matchesCategory = categoryId === '' || location.categoryId === categoryId;

    return matchesSearch && matchesCategory;
  });
}

export function createLocationFromForm(
  formData: LocationFormData,
  existingLocation?: Location
): Location {
  const timestamp = new Date().toISOString();

  if (existingLocation) {
    return {
      ...existingLocation,
      name: formData.name,
      address: formData.address,
      categoryId: formData.categoryId,
      contactPerson: formData.contactPerson,
      contactDetails: formData.contactDetails,
      updatedAt: timestamp,
    };
  }

  return {
    id: formData.id,
    name: formData.name,
    address: formData.address,
    categoryId: formData.categoryId,
    contactPerson: formData.contactPerson,
    contactDetails: formData.contactDetails,
    status: 'Active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function validateLocationForm(formData: LocationFormData): LocationValidationErrors {
  const errors: LocationValidationErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Location name is required';
  }

  if (!formData.categoryId.trim()) {
    errors.categoryId = 'Location type is required';
  }

  return errors;
}
