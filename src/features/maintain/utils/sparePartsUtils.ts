import type { SparePart, SparePartFormData, SparePartStatus, SparePartValidationErrors } from '../types/spareParts';

/**
 * Calculate stock status based on quantity and threshold
 */
export function calculateStockStatus(stockQty: number, lowStockThreshold: number, operationalStatus: string): SparePartStatus {
  if (operationalStatus === 'Discontinued') {
    return 'Discontinued';
  }

  if (stockQty === 0) {
    return 'Out of Stock';
  } else if (stockQty <= lowStockThreshold) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

/**
 * Validate spare part form data
 */
export function validateSparePartForm(formData: SparePartFormData): SparePartValidationErrors {
  const errors: SparePartValidationErrors = {};

  // Validate required fields
  if (!formData.id.trim()) {
    errors.id = 'Part ID is required';
  }

  if (!formData.name.trim()) {
    errors.name = 'Part Name is required';
  }

  // Validate numeric fields
  if (formData.stockQty < 0 || !Number.isInteger(formData.stockQty)) {
    errors.stockQty = 'Stock Quantity must be a non-negative integer';
  }

  if (formData.lowStockThreshold < 0 || !Number.isInteger(formData.lowStockThreshold)) {
    errors.lowStockThreshold = 'Low Stock Threshold must be a non-negative integer';
  }

  if (formData.unitPrice < 0) {
    errors.unitPrice = 'Unit Price must be non-negative';
  }

  return errors;
}

/**
 * Generate a new spare part ID
 */
export function generateSparePartId(existingParts: SparePart[]): string {
  const maxId = existingParts
    .map(part => part.id)
    .filter(id => id.startsWith('SP'))
    .map(id => parseInt(id.substring(2)))
    .filter(num => !isNaN(num))
    .reduce((max, num) => Math.max(max, num), 0);

  return `SP${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Filter spare parts based on search and filter criteria
 */
export function filterSpareParts(
  spareParts: SparePart[],
  searchTerm: string,
  categoryFilter: string,
  statusFilter: string
): SparePart[] {
  return spareParts.filter(part => {
    const matchesSearch =
      !searchTerm ||
      part.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryFilter || part.category === categoryFilter;

    const status = calculateStockStatus(part.stockQty, part.lowStockThreshold, part.operationalStatus);
    const matchesStatus = !statusFilter || status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

/**
 * Get unique categories from spare parts list
 */
export function getUniqueCategories(spareParts: SparePart[]): string[] {
  const categories = spareParts.map(part => part.category).filter(Boolean);
  return [...new Set(categories)].sort();
}

/**
 * Get unique statuses from spare parts list
 */
export function getUniqueStatuses(spareParts: SparePart[]): SparePartStatus[] {
  const statuses = spareParts.map(part =>
    calculateStockStatus(part.stockQty, part.lowStockThreshold, part.operationalStatus)
  );
  return [...new Set(statuses)].sort();
}

/**
 * Check if a spare part ID already exists
 */
export function isDuplicateSparePartId(spareParts: SparePart[], id: string, excludeId?: string): boolean {
  return spareParts.some(part => part.id === id && part.id !== excludeId);
}

/**
 * Create a new spare part object from form data
 */
export function createSparePartFromForm(formData: SparePartFormData): SparePart {
  return {
    id: formData.id,
    name: formData.name,
    description: formData.description,
    category: formData.category,
    stockQty: formData.stockQty,
    lowStockThreshold: formData.lowStockThreshold,
    unitPrice: formData.unitPrice,
    supplier: formData.supplier,
    location: formData.location,
    lastUpdated: new Date().toISOString().split('T')[0],
    operationalStatus: formData.operationalStatus,
  };
}
