import React, { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { PERMISSION_ITEMS, PERMISSION_DISPLAY_NAMES } from "@/types/permission";
import { Button } from "@/components/ui/components";
import { Card } from "@/components/ui/components";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { ChevronDown } from "@/assets/icons";

const UserAccessRightsPage: React.FC = () => {
  const { users, groups, assignUserToGroup, updateGroup } = useContext(UserContext);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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

  return (
    <AssetLayout activeSidebarItem="user-access-rights">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Access Rights Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Section */}
          <Card className="p-4">
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
          </Card>

          {/* Groups Section */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Groups</h2>
            <div className="space-y-2">
              {groups.map(group => (
                <div
                  key={group.id}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedGroup === group.id ? 'border-primary bg-primary/10' : 'border-outline'
                  }`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-onSurfaceVariant">{group.description}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Group Permission Editor */}
        {selectedGroup && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Edit Permissions for Group: {groups.find(g => g.id === selectedGroup)?.name}
            </h2>

            <div className="space-y-4">
              {PERMISSION_ITEMS.map(item => (
                <div key={item.key} className="border rounded p-4">
                  <h3 className="font-medium mb-2">{PERMISSION_DISPLAY_NAMES[item.key]}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(item.permissions).map(([action, _]) => {
                      const group = groups.find(g => g.id === selectedGroup);
                      const currentValue = group?.defaultPermissions?.[item.key]?.[action] ?? false;

                      return (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={currentValue}
                            onChange={(e) => handleGroupPermissionChange(
                              selectedGroup,
                              item.key,
                              action,
                              e.target.checked
                            )}
                          />
                          <span className="text-sm capitalize">{action}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AssetLayout>
  );
};

export default UserAccessRightsPage;
