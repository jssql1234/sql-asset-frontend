import { PERMISSION_ITEMS } from '@/types/permission';
import type { PermissionAction } from '@/types/permission';
import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';

/**
 * Merges group default permissions with user overrides
 */
export function getEffectivePermissions(user: User, group: UserGroup): Record<string, Record<string, boolean>> {
  const effective: Record<string, Record<string, boolean>> = {};

  // Start with group defaults
  Object.entries(group.defaultPermissions).forEach(([feature, actions]) => {
    effective[feature] = { ...actions };
  });

  // Apply user overrides
  if (user.permissionOverrides) {
    Object.entries(user.permissionOverrides).forEach(([feature, actions]) => {
      if (!effective[feature]) {
        effective[feature] = {};
      }
      Object.assign(effective[feature], actions);
    });
  }

  return effective;
}

/**
 * Checks if a user has permission for a specific feature and action
 */
export function hasPermission(
  user: User,
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

  // Get effective permissions
  const effectivePermissions = getEffectivePermissions(user, group);

  // Check if user has this permission
  const userPermission = effectivePermissions[feature]?.[action];
  return userPermission === true;
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