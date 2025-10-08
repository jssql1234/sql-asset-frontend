import React, { useState } from "react";
import { PERMISSION_ITEMS, PERMISSION_DISPLAY_NAMES, PERMISSION_GROUPS } from "@/types/permission";
import { Button } from "@/components/ui/components";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/components/Table";

interface PermissionEditorProps {
  selectedGroup: string | null;
  draftPermissions: Record<string, Partial<Record<string, boolean>>>;
  hasUnsavedChanges: boolean;
  onUpdatePermission: (feature: string, action: string, value: boolean) => void;
  onSave: () => void;
  onReset: () => void;
  onGrantSelected: () => void;
  onRevokeSelected: () => void;
  onGrantAll: () => void;
  onRevokeAll: () => void;
  isAdminGroup?: boolean;
}

const PermissionEditor: React.FC<PermissionEditorProps> = ({
  selectedGroup,
  draftPermissions,
  hasUnsavedChanges,
  onUpdatePermission,
  onSave,
  onReset,
  onGrantSelected,
  onRevokeSelected,
  onGrantAll,
  onRevokeAll,
  isAdminGroup = false,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(() => (new Set([])));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => (new Set([])));

  const togglePermissionSelection = (permissionKey: string) => {
    const newSelection = new Set(selectedPermissions);
    if (newSelection.has(permissionKey)) {
      newSelection.delete(permissionKey);
    } else {
      newSelection.add(permissionKey);
    }
    setSelectedPermissions(() => newSelection);
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(() => newExpanded);
  };

  if (!selectedGroup) return null;

  return (
    <div className="space-y-4">
      {isAdminGroup && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
          🔒 Admin group permissions cannot be modified. This group has full system access and is managed automatically.
        </div>
      )}
      {hasUnsavedChanges && (
        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
          ⚠️ You have unsaved changes
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="text-center w-48">Permission</TableHead>
            <TableHead rowSpan={2} className="text-center">Execute</TableHead>
            <TableHead colSpan={3} className="text-center bg-blue-50">Entry</TableHead>
            <TableHead colSpan={4} className="text-center bg-green-50">Report</TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-center bg-blue-50">New</TableHead>
            <TableHead className="text-center bg-blue-50">Edit</TableHead>
            <TableHead className="text-center bg-blue-50">Delete</TableHead>
            <TableHead className="text-center bg-green-50">Process</TableHead>
            <TableHead className="text-center bg-green-50">Print</TableHead>
            <TableHead className="text-center bg-green-50">Preview</TableHead>
            <TableHead className="text-center bg-green-50">Export</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSION_GROUPS.map(permGroup => {
            const groupPermissions = PERMISSION_ITEMS.filter(item =>
              permGroup.permissions.includes(item.key)
            );
            const isExpanded = expandedGroups.has(permGroup.id);

            return (
              <React.Fragment key={permGroup.id}>
                {/* Group Header Row */}
                <TableRow
                  className={`cursor-pointer hover:bg-gray-50 ${selectedPermissions.size > 0 && groupPermissions.some(item => selectedPermissions.has(item.key)) ? 'bg-blue-50' : ''}`}
                  onClick={() => {toggleGroupExpansion(permGroup.id)}}
                >
                  <TableCell colSpan={9} className="font-medium">
                    <div className="flex items-center justify-start gap-2">
                      <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                      <span className="font-medium">{permGroup.name}</span>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Permission Rows */}
                {isExpanded && groupPermissions.map(item => {
                  const isSelected = selectedPermissions.has(item.key);

                  return (
                    <TableRow
                      key={item.key}
                      className={`cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const cell = target.closest('td');
                        // Don't trigger row selection if clicking in a cell that contains a checkbox
                        if (cell && !cell.querySelector('input[type="checkbox"]')) {
                          togglePermissionSelection(item.key);
                        }
                      }}
                    >
                      <TableCell className="font-medium pl-8">
                        {PERMISSION_DISPLAY_NAMES[item.key]}
                      </TableCell>
                      {/* Execute */}
                      <TableCell
                        className="text-center cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.execute !== undefined) {
                            const currentValue = draftPermissions[item.key]?.execute ?? false;
                            onUpdatePermission(item.key, 'execute', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.execute !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.execute ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'execute', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      {/* Entry Actions */}
                      <TableCell
                        className="text-center bg-blue-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.entryNew !== undefined) {
                            const currentValue = draftPermissions[item.key]?.entryNew ?? false;
                            onUpdatePermission(item.key, 'entryNew', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.entryNew !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.entryNew ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'entryNew', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell
                        className="text-center bg-blue-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.entryEdit !== undefined) {
                            const currentValue = draftPermissions[item.key]?.entryEdit ?? false;
                            onUpdatePermission(item.key, 'entryEdit', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.entryEdit !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.entryEdit ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'entryEdit', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell
                        className="text-center bg-blue-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.entryDelete !== undefined) {
                            const currentValue = draftPermissions[item.key]?.entryDelete ?? false;
                            onUpdatePermission(item.key, 'entryDelete', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.entryDelete !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.entryDelete ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'entryDelete', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      {/* Report Actions */}
                      <TableCell
                        className="text-center bg-green-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.reportProcess !== undefined) {
                            const currentValue = draftPermissions[item.key]?.reportProcess ?? false;
                            onUpdatePermission(item.key, 'reportProcess', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.reportProcess !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.reportProcess ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'reportProcess', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell
                        className="text-center bg-green-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.reportPrint !== undefined) {
                            const currentValue = draftPermissions[item.key]?.reportPrint ?? false;
                            onUpdatePermission(item.key, 'reportPrint', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.reportPrint !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.reportPrint ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'reportPrint', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell
                        className="text-center bg-green-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.reportPreview !== undefined) {
                            const currentValue = draftPermissions[item.key]?.reportPreview ?? false;
                            onUpdatePermission(item.key, 'reportPreview', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.reportPreview !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.reportPreview ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'reportPreview', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell
                        className="text-center bg-green-50/30 cursor-pointer"
                        onClick={() => {
                          if (!isAdminGroup && item.permissions.reportExport !== undefined) {
                            const currentValue = draftPermissions[item.key]?.reportExport ?? false;
                            onUpdatePermission(item.key, 'reportExport', !currentValue);
                          }
                        }}
                      >
                        {item.permissions.reportExport !== undefined ? (
                          <input
                            type="checkbox"
                            checked={draftPermissions[item.key]?.reportExport ?? false}
                            disabled={isAdminGroup}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdatePermission(item.key, 'reportExport', e.target.checked);
                            }}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-between">
        <div className="flex gap-2">
          <Button
            onClick={onGrantSelected}
            disabled={selectedPermissions.size === 0 || isAdminGroup}
            variant="secondary"
          >
            Grant
          </Button>
          <Button
            onClick={onRevokeSelected}
            disabled={selectedPermissions.size === 0 || isAdminGroup}
            variant="secondary"
          >
            Revoke
          </Button>
          <Button onClick={onGrantAll} variant="primary" disabled={isAdminGroup}>
            Grant All
          </Button>
          <Button onClick={onRevokeAll} variant="outline" disabled={isAdminGroup}>
            Revoke All
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasUnsavedChanges || isAdminGroup}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!hasUnsavedChanges || isAdminGroup}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionEditor;