import { use } from 'react';
import { UserContext, type UserContextType } from '@/context/UserContext';
import { hasPermission } from '@/utils/permissionUtils';
import type { PermissionAction } from '@/types/permission';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const context = use(UserContext) as UserContextType | undefined;
  if (!(context)) {
    throw new Error('usePermissions must be used within a UserProvider');
  }
  const { currentUser, getUserGroup } = context;

  const checkPermission = (feature: string, action: PermissionAction): boolean => {
    if (!currentUser) return false;

    const group = getUserGroup(currentUser.groupId);
    if (!group) return false;

    return hasPermission(group, feature, action);
  };

  const hasAnyPermission = (permissions: { feature: string; action: PermissionAction }[]): boolean => {
    return permissions.some(({ feature, action }) => checkPermission(feature, action));
  };

  const hasAllPermissions = (permissions: { feature: string; action: PermissionAction }[]): boolean => {
    return permissions.every(({ feature, action }) => checkPermission(feature, action));
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}