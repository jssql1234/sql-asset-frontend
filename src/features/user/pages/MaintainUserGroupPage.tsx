import { AppLayout } from '@/layout/sidebar/AppLayout';
import { UserGroupTable } from '../components/UserGroupTable';
import { UserGroupModal } from '../components/UserGroupModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useMaintainUserGroup } from '../hooks/useMaintainUserGroup';
import { ExportFile, Upload } from '@/assets/icons';
import TabHeader from '@/components/TabHeader';

const MaintainUserGroupPage: React.FC = () => {

  const {
    groups,
    isModalOpen,
    editingGroup,
    fileInputRef,
    deleteDialogOpen,
    groupToDelete,
    handleAddGroup,
    handleEditGroup,
    handleSaveGroup,
    handleCloseModal,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleExportCSV,
    handleImportCSV,
    handleFileChange
  } = useMaintainUserGroup();

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain User Group" },
      ]}
    >

      <TabHeader
        title="Maintain User Group"
        // subtitle="Maintain User Groups"
        actions={[
          {
            icon: <ExportFile className="h-4 w-4" />,
            label: "Export CSV",
            variant: 'outline',
            className: 'h-9 px-4 py-2',
            onAction: handleExportCSV
          } , {
            icon: <Upload className="h-4 w-4" />,
            label: "Import CSV",
            variant: 'outline',
            className: 'h-9 px-4 py-2',
            onAction: handleImportCSV
          } , {
            label: "Add Group",
            className: 'h-9 px-4 py-2',
            onAction: handleAddGroup
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

        {/* Groups Table */}
        <div className="flex-1">
          <UserGroupTable
            groups={groups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Add/Edit Modal */}
        <UserGroupModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          editingGroup={editingGroup}
          onSave={handleSaveGroup}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={groupToDelete?.name ?? ''}
          itemType="user group"
        />
      </div>
      
    </AppLayout>
  );
};

export default MaintainUserGroupPage;
