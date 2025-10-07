export type PermissionAction =
  | 'execute'
  | 'entryNew'
  | 'entryEdit'
  | 'entryDelete'
  | 'reportProcess'
  | 'reportPrint'
  | 'reportPreview'
  | 'reportExport';

export interface PermissionItem {
  key: string;
  permissions: Record<string, boolean>;
}

export const PERMISSION_ITEMS: PermissionItem[] = [
  {
    key: "maintainItem",
    permissions: {
      execute: true,
      entryNew: true,
      entryEdit: true,
      entryDelete: true,
      reportProcess: true,
      reportPrint: true,
      reportPreview: true,
      reportExport: true
    }
  },
  {
    key: "maintainUser",
    permissions: {
      execute: false,
      entryNew: false,
      entryEdit: false,
      entryDelete: false,
      reportProcess: false,
      reportPrint: false,
      reportPreview: false,
      reportExport: false
    }
  },
  {
    key: "viewItemCategory",
    permissions: {
      execute: true
    }
  }
];

export const PERMISSION_DISPLAY_NAMES: Record<string, string> = {
  maintainItem: "Maintain Item",
  maintainUser: "Maintain User",
  viewItemCategory: "View Item Category"
};