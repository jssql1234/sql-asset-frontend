export interface Asset {
  id: string;
  name: string;
  group: string;
  description: string;
  acquireDate: string;
  purchaseDate: string;
  cost: number;
  qty: number;
  quantityPerUnit: number;
  active: boolean;
  inactiveStart?: string;
  inactiveEnd?: string;




 // Allowance Tab
  caAssetGroup?: string;
  allowanceClass?: string;
  subClass?: string;
  iaRate?: string;
  aaRate?: string;
  aca?: boolean;
  extraCheckbox?: boolean;
  extraCommercial?: boolean;
  extraNewVehicle?: boolean;
  manualQE?: boolean;
  qeValue?: string;
  residualExpenditure?: string;
  selfUsePercentage?: string;
  rentedApportionPercentage?: string;



  // Hire Purchase Tab
  hpStartDate?: string;
  hpInstalment?: string;
  hpDeposit?: string;
  hpInterest?: number;
  hpFinance?: string;

  //Depreciation Tab
  depreciationMethod?: string;
  depreciationFrequency?: string;
  usefulLife?: number;
  residualValue?: string;
  depreciationRate?: string;
  totalDepreciation?: string;
  

  // Serial Numbers Tab
  serialNumbers?: SerialNumberData[];

  // Allocation Tab
  branch?: string;
  department?: string;
  location?: string;
  personInCharge?: string;
  allocationNotes?: string;

  // Warranty Tab
  warrantyProvider?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyNotes?: string;

  [key: string]: any;
}

export interface SerialNumberData {
  serial: string;
  remark?: string;
}