import React, { useRef } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { UserTable } from '../components/UserTable';
import TabHeader from '@/components/TabHeader';
import { ExportFile, Upload } from '@/assets/icons';
import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/components/ui/components/Toast/useToast';
import type { User } from '@/types/user';

const MaintainUserPage: React.FC = () => {
  const { users, groups, deleteUser } = useUserContext();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUser = () => {
    // TODO: Implement add user modal
    addToast({
      variant: 'info',
      title: 'Add User',
      description: 'Add user functionality will be implemented in Phase 2.',
    });
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user modal
    addToast({
      variant: 'info',
      title: 'Edit User',
      description: `Edit functionality for "${user.name}" will be implemented in Phase 2.`,
    });
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(user.id);
      addToast({
        variant: 'success',
        title: 'User Deleted',
        description: `User "${user.name}" has been deleted successfully.`,
      });
    }
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    addToast({
      variant: 'info',
      title: 'Export Feature',
      description: 'CSV export functionality will be implemented in Phase 2.',
    });
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      addToast({
        variant: 'error',
        title: 'Invalid File',
        description: 'Please select a CSV file',
      });
      return;
    }

    // TODO: Implement CSV import
    addToast({
      variant: 'info',
      title: 'Import Feature',
      description: 'CSV import functionality will be implemented in Phase 2.',
    });

    // Clear the input
    event.target.value = '';
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain User" },
      ]}
    >
      <TabHeader
        title="Maintain User"
        actions={[
          {
            icon: <ExportFile className="h-4 w-4" />,
            label: "Export CSV",
            variant: 'outline',
            className: 'h-9 px-4 py-2',
            onAction: handleExportCSV
          },
          {
            icon: <Upload className="h-4 w-4" />,
            label: "Import CSV",
            variant: 'outline',
            className: 'h-9 px-4 py-2',
            onAction: handleImportCSV
          },
          {
            label: "Add User",
            className: 'h-9 px-4 py-2',
            onAction: handleAddUser
          }
        ]}
      />

      <div className="flex flex-col h-full">
        {/* Hidden file input for CSV import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Users Table */}
        <div className="flex-1">
          <UserTable
            users={users}
            groups={groups.map(g => ({ id: g.id, name: g.name }))}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MaintainUserPage;