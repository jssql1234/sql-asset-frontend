import React, { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { PERMISSION_ITEMS, PERMISSION_DISPLAY_NAMES, PERMISSION_GROUPS } from "@/types/permission";
import { Button } from "@/components/ui/components";
import { Card } from "@/components/ui/components";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { ChevronDown } from "@/assets/icons";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/components/Table";

const UserAccessRightsPage: React.FC = () => {
  const { groups, updateGroup } = useContext(UserContext);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([]));
  const [draftPermissions, setDraftPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize draft permissions when group changes
  const initializeDraftPermissions = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setDraftPermissions({ ...group.defaultPermissions });
      setHasUnsavedChanges(false);
    }
  };

  // Update draft permissions
  const updateDraftPermission = (feature: string, action: string, value: boolean) => {
    setDraftPermissions(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [action]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save draft permissions to actual group
  const savePermissions = () => {
    if (!selectedGroup) return;
    updateGroup(selectedGroup, { defaultPermissions: { ...draftPermissions } });
    setHasUnsavedChanges(false);
  };

  // Reset draft permissions to last saved state
  const resetPermissions = () => {
    if (!selectedGroup) return;
    initializeDraftPermissions(selectedGroup);
  };


  const togglePermissionSelection = (permissionKey: string) => {
    const newSelection = new Set(selectedPermissions);
    if (newSelection.has(permissionKey)) {
      newSelection.delete(permissionKey);
    } else {
      newSelection.add(permissionKey);
    }
    setSelectedPermissions(newSelection);
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const grantSelectedPermissions = () => {
    if (!selectedGroup) return;

    const updatedPermissions = { ...draftPermissions };

    selectedPermissions.forEach(permissionKey => {
      const item = PERMISSION_ITEMS.find(p => p.key === permissionKey);
      if (item) {
        if (!updatedPermissions[permissionKey]) {
          updatedPermissions[permissionKey] = {};
        }
        Object.keys(item.permissions).forEach(action => {
          updatedPermissions[permissionKey][action] = true;
        });
      }
    });

    setDraftPermissions(updatedPermissions);
    setHasUnsavedChanges(true);
  };

  const revokeSelectedPermissions = () => {
    if (!selectedGroup) return;

    const updatedPermissions = { ...draftPermissions };

    selectedPermissions.forEach(permissionKey => {
      const item = PERMISSION_ITEMS.find(p => p.key === permissionKey);
      if (item) {
        if (!updatedPermissions[permissionKey]) {
          updatedPermissions[permissionKey] = {};
        }
        Object.keys(item.permissions).forEach(action => {
          updatedPermissions[permissionKey][action] = false;
        });
      }
    });

    setDraftPermissions(updatedPermissions);
    setHasUnsavedChanges(true);
  };

  const grantAllPermissions = () => {
    if (!selectedGroup) return;

    const updatedPermissions = { ...draftPermissions };

    PERMISSION_ITEMS.forEach(item => {
      if (!updatedPermissions[item.key]) {
        updatedPermissions[item.key] = {};
      }
      Object.keys(item.permissions).forEach(action => {
        updatedPermissions[item.key][action] = true;
      });
    });

    setDraftPermissions(updatedPermissions);
    setHasUnsavedChanges(true);
  };

  const revokeAllPermissions = () => {
    if (!selectedGroup) return;

    const updatedPermissions = { ...draftPermissions };

    PERMISSION_ITEMS.forEach(item => {
      if (!updatedPermissions[item.key]) {
        updatedPermissions[item.key] = {};
      }
      Object.keys(item.permissions).forEach(action => {
        updatedPermissions[item.key][action] = false;
      });
    });

    setDraftPermissions(updatedPermissions);
    setHasUnsavedChanges(true);
  };

  return (
    <AssetLayout activeSidebarItem="user-access-rights">
      <div className="space-y-6">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
          {/* Users Section */}
          {/* <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-onSurfaceVariant">
                      Current Group: {groups.find(g => g.id === user.groupId)?.name || user.groupId}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="small">
                        Change Group <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {groups.map(group => (
                        <DropdownMenuItem
                          key={group.id}
                          onClick={() => handleUserGroupChange(user.id, group.id)}
                        >
                          {group.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </Card> */}

          {/* Groups Section */}
          <Card className="p-4 flex flex-start gap-4">
            <h2 className="text-lg font-semibold self-center">Select Group</h2>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="justify-between">
                  {selectedGroup ? groups.find(g => g.id === selectedGroup)?.name : 'Select a group...'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit">
                {groups.map(group => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      initializeDraftPermissions(group.id);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="font-medium">{group.name}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        {/* </div> */}

        {/* Group Permission Editor */}
        {selectedGroup && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Edit Permissions for Group: {groups.find(g => g.id === selectedGroup)?.name}
              </h2>
              {hasUnsavedChanges && (
                <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
                  ⚠️ You have unsaved changes
                </div>
              )}
            </div>

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
                        onClick={() => toggleGroupExpansion(permGroup.id)}
                      >
                        <TableCell colSpan={9} className="font-medium">
                          <div className="flex items-center justify-start gap-2">
                            <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                            <span className="font-medium">{permGroup.name}</span>
                            {/* {groupPermissions.length > 0 && (
                              <span className="text-sm text-gray-500">
                                {groupPermissions.length} permission{groupPermissions.length !== 1 ? 's' : ''}
                              </span>
                            )} */}
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
                                if (item.permissions.execute !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.execute ?? false;
                                  updateDraftPermission(item.key, 'execute', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.execute !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.execute ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'execute', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            {/* Entry Actions */}
                            <TableCell
                              className="text-center bg-blue-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.entryNew !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.entryNew ?? false;
                                  updateDraftPermission(item.key, 'entryNew', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.entryNew !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.entryNew ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'entryNew', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-blue-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.entryEdit !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.entryEdit ?? false;
                                  updateDraftPermission(item.key, 'entryEdit', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.entryEdit !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.entryEdit ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'entryEdit', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-blue-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.entryDelete !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.entryDelete ?? false;
                                  updateDraftPermission(item.key, 'entryDelete', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.entryDelete !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.entryDelete ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'entryDelete', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            {/* Report Actions */}
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.reportProcess !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.reportProcess ?? false;
                                  updateDraftPermission(item.key, 'reportProcess', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportProcess !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.reportProcess ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'reportProcess', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.reportPrint !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.reportPrint ?? false;
                                  updateDraftPermission(item.key, 'reportPrint', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportPrint !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.reportPrint ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'reportPrint', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.reportPreview !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.reportPreview ?? false;
                                  updateDraftPermission(item.key, 'reportPreview', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportPreview !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.reportPreview ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'reportPreview', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer"
                              onClick={() => {
                                if (item.permissions.reportExport !== undefined) {
                                  const currentValue = draftPermissions?.[item.key]?.reportExport ?? false;
                                  updateDraftPermission(item.key, 'reportExport', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportExport !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={draftPermissions?.[item.key]?.reportExport ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDraftPermission(item.key, 'reportExport', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
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
                  onClick={grantSelectedPermissions}
                  disabled={selectedPermissions.size === 0}
                  variant="secondary"
                >
                  Grant
                </Button>
                <Button
                  onClick={revokeSelectedPermissions}
                  disabled={selectedPermissions.size === 0}
                  variant="secondary"
                >
                  Revoke
                </Button>
                <Button onClick={grantAllPermissions} variant="primary">
                  Grant All
                </Button>
                <Button onClick={revokeAllPermissions} variant="outline">
                  Revoke All
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetPermissions}
                  disabled={!hasUnsavedChanges}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={savePermissions}
                  disabled={!hasUnsavedChanges}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AssetLayout>
  );
};

export default UserAccessRightsPage;
