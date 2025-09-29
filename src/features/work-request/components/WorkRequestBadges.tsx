import React from 'react';
import { Badge } from '@/components/ui/components/Badge';
import type { WorkRequest } from '@/types/work-request';

interface WorkRequestStatusBadgeProps {
  status: WorkRequest['status'];
  className?: string;
}

export const WorkRequestStatusBadge: React.FC<WorkRequestStatusBadgeProps> = ({
  status,
  className
}) => {
  const getStatusVariant = (status: WorkRequest['status']) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Approved':
        return 'blue';
      case 'Rejected':
        return 'red';
      default:
        return 'grey';
    }
  };

  return (
    <Badge
      text={status}
      variant={getStatusVariant(status)}
      className={className}
    />
  );
};
