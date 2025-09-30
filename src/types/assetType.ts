export interface Asset {
  id: string;
  batchId: string;
  name: string;
  group: string;
  description: string;
  acquireDate: string;
  purchaseDate: string;
  cost: number;
  qty: number;
  active: boolean;
}
