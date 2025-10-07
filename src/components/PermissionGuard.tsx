import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionAction } from '@/types/permission';

interface PermissionGuardProps {
  feature: string;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  feature,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  return hasPermission(feature, action) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;