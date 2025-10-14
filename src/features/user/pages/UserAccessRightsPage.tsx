import React, { useState, useMemo } from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import { useUserContext } from "@/context/UserContext";
import { PERMISSION_ITEMS } from "@/types/permission";
import { Card } from "@/components/ui/components";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import PermissionEditor from "../components/PermissionEditor";
import TabHeader from "@/components/TabHeader";

const UserAccessRightsPage: React.FC = () => {
  const { groups, updateGroup } = useUserContext();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<Partial<Record<string, Partial<Record<string, boolean>>>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Convert groups to SearchableDropdown format
  const groupItems = useMemo(() => groups.map(group => ({
    id: group.id,
    label: group.name,
  })), [groups]);

  // Initialize draft permissions when group changes
  const initializeDraftPermissions = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setDraftPermissions(() => ({ ...group.defaultPermissions }));
      setHasUnsavedChanges(() => false);
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
    setHasUnsavedChanges(() => true);
  };

  // Save draft permissions to actual group
  const savePermissions = () => {
    if (!selectedGroup) return;
    updateGroup(selectedGroup, { defaultPermissions: { ...draftPermissions } });
    setHasUnsavedChanges(() => false);
  };

  // Reset draft permissions to last saved state
  const resetPermissions = () => {
    if (!selectedGroup) return;
    initializeDraftPermissions(selectedGroup);
  };

  const grantSelectedPermissions = (selectedPermissions: Set<string>) => {
    if (!selectedGroup) return;

    setDraftPermissions((prev) => {
      const updatedPermissions = { ...prev };

      selectedPermissions.forEach(permissionKey => {
        const item = PERMISSION_ITEMS.find(item => item.key === permissionKey);
        if (item !== undefined) {
          const itemPermissions = updatedPermissions[item.key] ??= {};
          Object.keys(item.permissions).forEach(action => {
            itemPermissions[action] = true;
          });
        }
      })

      return updatedPermissions;
    });

    setHasUnsavedChanges(() => true);
  };

  const revokeSelectedPermissions = (selectedPermissions: Set<string>) => {
    if (!selectedGroup) return;

    setDraftPermissions((prev) => {
      const updatedPermissions = { ...prev };

      selectedPermissions.forEach(permissionKey => {
        const item = PERMISSION_ITEMS.find(item => item.key === permissionKey);
        if (item !== undefined) {
          const itemPermissions = updatedPermissions[item.key] ??= {};
          Object.keys(item.permissions).forEach(action => {
            itemPermissions[action] = false;
          });
        }
      })

      return updatedPermissions;
    })

    setHasUnsavedChanges(() => true);
  };

  const grantAllPermissions = () => {
    if (!selectedGroup) return;

    setDraftPermissions((prev) => {
      const updatedPermissions = { ...prev };

      PERMISSION_ITEMS.forEach(item => {
        const itemPermissions = updatedPermissions[item.key] ??= {};
        Object.keys(item.permissions).forEach(action => {
          itemPermissions[action] = true;
        });
      });

      return updatedPermissions;
    })

    setHasUnsavedChanges(() => true);
  };

  const revokeAllPermissions = () => {
    if (!selectedGroup) return;

    setDraftPermissions((prev) => {
      const updatedPermissions = { ...prev };

      PERMISSION_ITEMS.forEach(item => {
        const itemPermissions = updatedPermissions[item.key] ??= {};
        Object.keys(item.permissions).forEach(action => {
          itemPermissions[action] = false;
        });
      });

      return updatedPermissions;
    })

    setHasUnsavedChanges(() => true);
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tools" },
        { label: "User Access Rights Assignment" },
      ]}
    >
      <TabHeader
        title="User Access Rights Assignment"
        subtitle="Maintain Permissions for Each User Groups"
      />
      <div className="space-y-6">
        {/* Group Selection */}
        <Card className="p-4 flex flex-start gap-4">
          <h2 className="text-lg font-semibold self-center">Select Group</h2>
          <SearchableDropdown
            items={groupItems}
            selectedId={selectedGroup ?? undefined}
            onSelect={(groupId) => {
              setSelectedGroup(() => groupId);
              initializeDraftPermissions(groupId);
            }}
            placeholder="Select a group..."
            className="min-w-[250px]"
          />
        </Card>

        {/* Group Permission Editor */}
        {selectedGroup && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Edit Permissions for Group: {groups.find(g => g.id === selectedGroup)?.name}
              </h2>
            </div>

            <PermissionEditor
              selectedGroup={selectedGroup}
              draftPermissions={draftPermissions}
              hasUnsavedChanges={hasUnsavedChanges}
              onUpdatePermission={updateDraftPermission}
              onSave={savePermissions}
              onReset={resetPermissions}
              onGrantSelected={grantSelectedPermissions}
              onRevokeSelected={revokeSelectedPermissions}
              onGrantAll={grantAllPermissions}
              onRevokeAll={revokeAllPermissions}
              isAdminGroup={selectedGroup === 'admin'}
            />
          </Card>
        )}
      </div>
    </SidebarHeader>
  );
};

export default UserAccessRightsPage;
