export interface Asset {
  id: string;
  name: string;
  batchId?: string;
  quantity: number;
  description?: string;
  inactiveStartDate?: Date;
  inactiveEndDate?: Date;
  purchaseDate?: Date;
  acquireDate?: Date;
  category?: string;
  location?: string;
  remarks?: string;
}
