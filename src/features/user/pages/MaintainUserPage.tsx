import React, { useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { UserGroupModal } from '../components/UserGroupModal';
import TabHeader from '@/components/TabHeader';
import SelectDropdown from '@/components/SelectDropdown';
import type { SelectDropdownOption } from '@/components/SelectDropdown';
import { ExportFile, Upload } from '@/assets/icons';
import { useMaintainUser } from '../hooks/useMaintainUser';
import { useMaintainUserGroup } from '../hooks/useMaintainUserGroup';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { LocationFormModal } from '@/features/maintain/components/LocationFormModal';
import { useLocations } from '@/features/maintain/hooks/useLocations';
import { useDepartments } from '@/features/maintain/hooks/useDepartments';
import { DepartmentFormModal } from '@/features/maintain/components/DepartmentFormModal';

const MaintainUserPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'>('csv');

  const exportOptions: SelectDropdownOption[] = [
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'txt', label: 'TXT' },
    { value: 'pdf', label: 'PDF' },
  ];

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
    handleExportData,
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
    locations,
    isModalOpen: isLocationModalOpen,
    setIsModalOpen: setIsLocationModalOpen,
    editingLocation,
    setEditingLocation,
    handleAddLocation,
    handleSaveLocation,
  } = useLocations();

  const {
    departments,
    departmentTypes,
    isModalOpen: isDepartmentModalOpen,
    setIsModalOpen: setIsDepartmentModalOpen,
    editingDepartment,
    setEditingDepartment,
    handleAddDepartment,
    handleSaveDepartment
  } = useDepartments();

  return (
    <AppLayout>
      <TabHeader
        title="Maintain User"
        customActions={
          <div className="flex items-center gap-2">
            <SelectDropdown
              value={selectedFormat}
              onChange={(value) => { setSelectedFormat(value as 'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'); }}
              options={exportOptions}
              placeholder="Select format"
              buttonVariant="outline"
              buttonSize="sm"
              className="min-w-[100px]"
            />
            <button
              type="button"
              onClick={() => { handleExportData(selectedFormat); }}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
              title={`Export as ${selectedFormat.toUpperCase()}`}
            >
              <ExportFile className="w-4 h-4" />
              Export Data
            </button>
            <button
              type="button"
              onClick={handleImportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
              title="Import CSV"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              type="button"
              onClick={handleAddUser}
              className="px-3 py-2 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover"
            >
              Add User
            </button>
          </div>
        }
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
        onCreateDepartment={handleAddDepartment}
        locations={locations}
        departments={departments}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={userToDelete?.name ?? ''}
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

      <DepartmentFormModal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        onSave={handleSaveDepartment}
        editingDepartment={editingDepartment}
        existingDepartments={departments}
        departmentTypes={departmentTypes}
      />

    </AppLayout>
  );
};

export default MaintainUserPage;
