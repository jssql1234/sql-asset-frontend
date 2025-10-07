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

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: string[]; // Array of permission keys
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
    key: "viewItemCategory",
    permissions: {
      execute: true
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
  }
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'groupA',
    name: 'Asset Management',
    permissions: ['maintainItem', 'viewItemCategory']
  },
  {
    id: 'groupB',
    name: 'User Management',
    permissions: ['maintainUser']
  },
  {
    id: 'groupC',
    name: 'Reporting',
    permissions: [] // Empty for now
  }
];

export const PERMISSION_DISPLAY_NAMES: Record<string, string> = {
  maintainItem: "Maintain Item",
  maintainUser: "Maintain User",
  viewItemCategory: "View Item Category"
};