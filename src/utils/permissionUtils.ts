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
  const groupPermission = (group.defaultPermissions[feature] as Record<string, boolean> | undefined)?.[action];
  return groupPermission ?? false;
}

/**
 * Gets all applicable actions for a feature
 */
export function getApplicableActions(feature: string): string[] {
  const permissionItem = PERMISSION_ITEMS.find(p => p.key === feature);
  return permissionItem ? Object.keys(permissionItem.permissions) : [];
}

/**
 * Creates a permission object with all permissions enabled
 * This is future-proof - when new permissions are added to PERMISSION_ITEMS,
 * they will automatically be included here
 */
export function createAllPermissionsEnabled(): Record<string, Record<string, boolean>> {
  const allPermissions: Record<string, Record<string, boolean>> = {};

  for (const permissionItem of PERMISSION_ITEMS) {
    allPermissions[permissionItem.key] = {};

    // Enable all actions that are defined for this permission item
    for (const [action, isApplicable] of Object.entries(permissionItem.permissions)) {
      // Only set to true if the action is applicable to this feature
      allPermissions[permissionItem.key][action] = isApplicable;
    }
  }

  return allPermissions;
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