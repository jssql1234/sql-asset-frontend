import React from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { UserGroupModal } from '../components/UserGroupModal';
import TabHeader from '@/components/TabHeader';
import { ExportFile, Upload } from '@/assets/icons';
import { useMaintainUser } from '../hooks/useMaintainUser';
import { useMaintainUserGroup } from '../hooks/useMaintainUserGroup';

const MaintainUserPage: React.FC = () => {
  
  const {
    users,
    groups,
    fileInputRef,
    isModalOpen,
    editingUser,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    handleDeleteUser,
    handleCloseModal,
    handleExportCSV,
    handleImportCSV,
    handleFileChange,
  } = useMaintainUser();

  const {
    isModalOpen: isGroupModalOpen,
    handleAddGroup,
    handleCloseModal: handleCloseGroupModal,
    handleSaveGroup,
  } = useMaintainUserGroup();

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

      {/* Modals */}
      <UserModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveUser}
        onCreateGroup={handleAddGroup}
      />
      <UserGroupModal
        open={isGroupModalOpen}
        onOpenChange={handleCloseGroupModal}
        editingGroup={null}
        onSave={handleSaveGroup}
      />

    </SidebarHeader>
  );
};

export default MaintainUserPage;