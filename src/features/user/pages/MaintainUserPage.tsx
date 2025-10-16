import React from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { UserGroupModal } from '../components/UserGroupModal';
import TabHeader from '@/components/TabHeader';
import { ExportFile, Upload } from '@/assets/icons';
import { useMaintainUser } from '../hooks/useMaintainUser';
import { useMaintainUserGroup } from '../hooks/useMaintainUserGroup';
import DeleteUserConfirmationDialog from '../components/DeleteUserConfirmationDialog';
import { LocationFormModal } from '@/features/maintain/components/LocationFormModal';
import { useLocations } from '@/features/maintain/hooks/useLocations';

const MaintainUserPage: React.FC = () => {
  
  const {
    users,
    groups,
    fileInputRef,
    isModalOpen,
    editingUser,
    deleteDialogOpen,
    userToDelete,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    handleCloseModal,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
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

  const {
    isModalOpen: isLocationModalOpen,
    setIsModalOpen: setIsLocationModalOpen,
    editingLocation,
    setEditingLocation,
    handleAddLocation,
    handleSaveLocation,
    locations
  } = useLocations();

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
            onDelete={handleDeleteClick}
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
        onCreateLocation={handleAddLocation}
      />

      <DeleteUserConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name ?? ''}
      />

      <UserGroupModal
        open={isGroupModalOpen}
        onOpenChange={handleCloseGroupModal}
        editingGroup={null}
        onSave={handleSaveGroup}
      />

      <LocationFormModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleSaveLocation}
        editingLocation={editingLocation}
        existingLocations={locations}
      />

    </SidebarHeader>
  );
};

export default MaintainUserPage;