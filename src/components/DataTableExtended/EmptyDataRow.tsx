/**
 * EmptyDataRow component for empty table states
 */

import { useTranslation } from 'react-i18next';
import { TableRow, TableCell } from '@/components/ui/components/Table';

interface EmptyDataRowProps {
  columnLength: number;
}

export function EmptyDataRow({ columnLength }: EmptyDataRowProps) {
  const { t } = useTranslation('common');
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnLength} className="text-onSurface text-center">
        {t('No records found. Add a new entry to get started.')}
      </TableCell>
    </TableRow>
  );
}
