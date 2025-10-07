import React, { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { PERMISSION_ITEMS, PERMISSION_DISPLAY_NAMES } from "@/types/permission";
import { Card } from "@/components/ui/components";

const UserAccessRightsPage: React.FC = () => {
  const { users, groups, updateUser, updateGroup } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handlePermissionChange = (
    targetId: string,
    feature: string,
    action: string,
    value: boolean,
    isGroup: boolean
  ) => {
    if (isGroup) {
      const group = groups.find(g => g.id === targetId);
      if (group) {
        const updatedPermissions = {
          ...group.defaultPermissions,
          [feature]: {
            ...group.defaultPermissions[feature],
            [action]: value
          }
        };
        updateGroup(targetId, { defaultPermissions: updatedPermissions });
      }
    } else {
      const user = users.find(u => u.id === targetId);
      if (user) {
        const updatedOverrides = {
          ...user.permissionOverrides,
          [feature]: {
            ...user.permissionOverrides?.[feature],
            [action]: value
          }
        };
        updateUser(targetId, { permissionOverrides: updatedOverrides });
      }
    }
  };

  return (
    <AssetLayout activeSidebarItem="user-access-rights">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Access Rights Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Section */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <div className="space-y-2">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedUser === user.id ? 'border-primary bg-primary/10' : 'border-outline'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-onSurfaceVariant">
                    Group: {groups.find(g => g.id === user.groupId)?.name || user.groupId}
                  </div>
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

        {/* Permission Editor */}
        {(selectedUser || selectedGroup) && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Edit Permissions for {selectedUser ?
                users.find(u => u.id === selectedUser)?.name :
                groups.find(g => g.id === selectedGroup)?.name
              }
            </h2>

            <div className="space-y-4">
              {PERMISSION_ITEMS.map(item => (
                <div key={item.key} className="border rounded p-4">
                  <h3 className="font-medium mb-2">{PERMISSION_DISPLAY_NAMES[item.key]}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(item.permissions).map(([action, _]) => {
                      const targetId = selectedUser || selectedGroup || '';
                      const isGroup = !!selectedGroup;
                      const currentPermissions = isGroup
                        ? groups.find(g => g.id === targetId)?.defaultPermissions
                        : users.find(u => u.id === targetId)?.permissionOverrides;

                      const currentValue = currentPermissions?.[item.key]?.[action] ?? false;

                      return (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={currentValue}
                            onChange={(e) => handlePermissionChange(
                              targetId,
                              item.key,
                              action,
                              e.target.checked,
                              isGroup
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
