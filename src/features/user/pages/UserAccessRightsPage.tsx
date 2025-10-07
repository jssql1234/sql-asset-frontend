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
  const { users, groups, assignUserToGroup, updateGroup } = useContext(UserContext);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([]));

  const handleGroupPermissionChange = (
    groupId: string,
    feature: string,
    action: string,
    value: boolean
  ) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedPermissions = {
        ...group.defaultPermissions,
        [feature]: {
          ...group.defaultPermissions[feature],
          [action]: value
        }
      };
      updateGroup(groupId, { defaultPermissions: updatedPermissions });
    }
  };

  const handleUserGroupChange = (userId: string, newGroupId: string) => {
    assignUserToGroup(userId, newGroupId);
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
    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return;

    const updatedPermissions = { ...group.defaultPermissions };

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

    updateGroup(selectedGroup, { defaultPermissions: updatedPermissions });
  };

  const revokeSelectedPermissions = () => {
    if (!selectedGroup) return;
    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return;

    const updatedPermissions = { ...group.defaultPermissions };

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

    updateGroup(selectedGroup, { defaultPermissions: updatedPermissions });
  };

  const grantAllPermissions = () => {
    if (!selectedGroup) return;
    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return;

    const updatedPermissions = { ...group.defaultPermissions };

    PERMISSION_ITEMS.forEach(item => {
      if (!updatedPermissions[item.key]) {
        updatedPermissions[item.key] = {};
      }
      Object.keys(item.permissions).forEach(action => {
        updatedPermissions[item.key][action] = true;
      });
    });

    updateGroup(selectedGroup, { defaultPermissions: updatedPermissions });
  };

  const revokeAllPermissions = () => {
    if (!selectedGroup) return;
    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return;

    const updatedPermissions = { ...group.defaultPermissions };

    PERMISSION_ITEMS.forEach(item => {
      if (!updatedPermissions[item.key]) {
        updatedPermissions[item.key] = {};
      }
      Object.keys(item.permissions).forEach(action => {
        updatedPermissions[item.key][action] = false;
      });
    });

    updateGroup(selectedGroup, { defaultPermissions: updatedPermissions });
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
                    onClick={() => setSelectedGroup(group.id)}
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
            <h2 className="text-lg font-semibold mb-4">
              Edit Permissions for Group: {groups.find(g => g.id === selectedGroup)?.name}
            </h2>

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
                        const group = groups.find(g => g.id === selectedGroup);
                        const isSelected = selectedPermissions.has(item.key);

                        return (
                          <TableRow
                            key={item.key}
                            className={`cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                            onClick={() => togglePermissionSelection(item.key)}
                          >
                            <TableCell className="font-medium pl-8">
                              {PERMISSION_DISPLAY_NAMES[item.key]}
                            </TableCell>
                            {/* Execute */}
                            <TableCell
                              className="text-center cursor-pointer hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.execute !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.execute ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'execute', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.execute !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.execute ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleGroupPermissionChange(
                                      selectedGroup,
                                      item.key,
                                      'execute',
                                      e.target.checked
                                    );
                                  }}
                                />
                              ) : null}
                            </TableCell>
                            {/* Entry Actions */}
                            <TableCell
                              className="text-center bg-blue-50/30 cursor-pointer hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.entryNew !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.entryNew ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'entryNew', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.entryNew !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.entryNew ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleGroupPermissionChange(
                                      selectedGroup,
                                      item.key,
                                      'entryNew',
                                      e.target.checked
                                    );
                                  }}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-blue-50/30 cursor-pointer hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.entryEdit !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.entryEdit ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'entryEdit', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.entryEdit !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.entryEdit ?? false}
                                  onChange={(e) => handleGroupPermissionChange(
                                    selectedGroup,
                                    item.key,
                                    'entryEdit',
                                    e.target.checked
                                  )}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-blue-50/30 cursor-pointer hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.entryDelete !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.entryDelete ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'entryDelete', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.entryDelete !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.entryDelete ?? false}
                                  onChange={(e) => handleGroupPermissionChange(
                                    selectedGroup,
                                    item.key,
                                    'entryDelete',
                                    e.target.checked
                                  )}
                                />
                              ) : null}
                            </TableCell>
                            {/* Report Actions */}
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.reportProcess !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.reportProcess ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'reportProcess', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportProcess !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.reportProcess ?? false}
                                  onChange={(e) => handleGroupPermissionChange(
                                    selectedGroup,
                                    item.key,
                                    'reportProcess',
                                    e.target.checked
                                  )}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.reportPrint !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.reportPrint ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'reportPrint', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportPrint !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.reportPrint ?? false}
                                  onChange={(e) => handleGroupPermissionChange(
                                    selectedGroup,
                                    item.key,
                                    'reportPrint',
                                    e.target.checked
                                  )}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.reportPreview !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.reportPreview ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'reportPreview', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportPreview !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.reportPreview ?? false}
                                  onChange={(e) => handleGroupPermissionChange(
                                    selectedGroup,
                                    item.key,
                                    'reportPreview',
                                    e.target.checked
                                  )}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell
                              className="text-center bg-green-50/30 cursor-pointer hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && item.permissions.reportExport !== undefined) {
                                  const currentValue = group?.defaultPermissions?.[item.key]?.reportExport ?? false;
                                  handleGroupPermissionChange(selectedGroup, item.key, 'reportExport', !currentValue);
                                }
                              }}
                            >
                              {item.permissions.reportExport !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={group?.defaultPermissions?.[item.key]?.reportExport ?? false}
                                  onChange={(e) => handleGroupPermissionChange(
                                    selectedGroup,
                                    item.key,
                                    'reportExport',
                                    e.target.checked
                                  )}
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
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2 justify-end">
              <Button
                onClick={grantSelectedPermissions}
                disabled={selectedPermissions.size === 0}
                variant="secondary"
              >
                Grant Selected
              </Button>
              <Button
                onClick={revokeSelectedPermissions}
                disabled={selectedPermissions.size === 0}
                variant="secondary"
              >
                Revoke Selected
              </Button>
              <Button onClick={grantAllPermissions} variant="primary">
                Grant All
              </Button>
              <Button onClick={revokeAllPermissions} variant="outline">
                Revoke All
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AssetLayout>
  );
};

export default UserAccessRightsPage;
