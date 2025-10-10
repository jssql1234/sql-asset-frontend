export type SparePartStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';

export interface SparePart {
  id: string;
  name: string;
  description: string;
  category: string;
  stockQty: number;
  lowStockThreshold: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  operationalStatus: 'Active' | 'Discontinued';
}

export interface SparePartFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  stockQty: number;
  lowStockThreshold: number;
  unitPrice: number;
  supplier: string;
  location: string;
  operationalStatus: 'Active' | 'Discontinued';
}

export interface SparePartsFilters {
  search: string;
  category: string;
  status: string;
}

export interface SparePartsState {
  spareParts: SparePart[];
  filteredSpareParts: SparePart[];
  selectedSpareParts: string[];
  filters: SparePartsFilters;
  isLoading: boolean;
  error: string | null;
}

export interface SparePartValidationErrors {
  id?: string;
  name?: string;
  category?: string;
  stockQty?: string;
  lowStockThreshold?: string;
  unitPrice?: string;
  operationalStatus?: string;
}
