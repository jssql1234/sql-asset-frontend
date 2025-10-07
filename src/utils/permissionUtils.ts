import { PERMISSION_ITEMS } from '@/types/permission';
import type { PermissionAction } from '@/types/permission';
import type { UserGroup } from '@/types/user-group';

/**
 * Checks if a user has permission for a specific feature and action
 * Users get permissions directly from their assigned group
 */
export function hasPermission(
  group: UserGroup,
  feature: string,
  action: PermissionAction
): boolean {
  // Find the permission item to check if action is applicable
  const permissionItem = PERMISSION_ITEMS.find(p => p.key === feature);
  if (!permissionItem) return false;

  // Check if action is applicable to this feature
  const actionAllowed = permissionItem.permissions[action];
  if (actionAllowed === undefined) return false; // Action not applicable

  // Check group permissions
  const groupPermission = group.defaultPermissions[feature]?.[action];
  return groupPermission === true;
}

/**
 * Gets all applicable actions for a feature
 */
export function getApplicableActions(feature: string): string[] {
  const permissionItem = PERMISSION_ITEMS.find(p => p.key === feature);
  return permissionItem ? Object.keys(permissionItem.permissions) : [];
}

/**
 * Validates permission structure
 */
export function validatePermissions(permissions: Record<string, Record<string, boolean>>): boolean {
  // Check that all features exist in registry
  for (const feature of Object.keys(permissions)) {
    const permissionItem = PERMISSION_ITEMS.find(p => p.key === feature);
    if (!permissionItem) return false;

    // Check that all actions are applicable
    for (const action of Object.keys(permissions[feature])) {
      if (!(action in permissionItem.permissions)) return false;
    }
  }
  return true;
}