export interface LocationTypeOption {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  categoryId: string;
  contactPerson: string;
  contactDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFormData {
  id: string;
  name: string;
  address: string;
  categoryId: string;
  contactPerson: string;
  contactDetails: string;
}

export interface LocationsFilters {
  search: string;
  categoryId: string;
}

export interface LocationsState {
  locations: Location[];
  filteredLocations: Location[];
  selectedLocations: string[];
  filters: LocationsFilters;
  locationTypes: LocationTypeOption[];
  isLoading: boolean;
  error: string | null;
}

export interface LocationValidationErrors {
  name?: string;
}
