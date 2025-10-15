import { useState, useRef } from 'react';
import { useUserContext } from '@/context/UserContext';
import type { User } from '@/types/user';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { exportToCSV, importFromCSV, type CSVConfig, type CSVRow } from '@/utils/csvUtils';

// User CSV configuration
export const userCSVConfig: CSVConfig<User> = {
  headers: ['Name', 'Email', 'Phone', 'Position', 'Department', 'Location', 'User Group'],
  filename: 'users.csv',
  transformToRow: (user: User): CSVRow => ({
	Name: user.name,
	Email: user.email,
	Phone: user.phone ?? '',
	Position: user.position ?? '',
	Department: user.department ?? '',
	Location: user.location ?? '',
	'User Group': user.groupId
  }),
  transformFromRow: (row: CSVRow) => {
	const errors: string[] = [];

	const name = row.Name.trim();
	const email = row.Email.trim();
	const phone = row.Phone.trim();
	const position = row.Position.trim();
	const department = row.Department.trim();
	const location = row.Location.trim();
	const groupId = row['User Group'].trim();

	if (!name) errors.push('Name is required');
	if (!email) errors.push('Email is required');
	if (!groupId) errors.push('User Group is required');

	const data: User = {
	  id: `user_${String(Date.now())}_${String(Math.random())}`, // Generate unique ID
	  name,
	  email,
	  phone: phone || undefined,
	  position: position || undefined,
	  department: department || undefined,
	  location: location || undefined,
	  groupId
	};

	return { data, errors };
  }
};

export const useMaintainUser = () => {
  const { users, groups, deleteUser, addUser, updateUser } = useUserContext();
	const { addToast } = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  

  /*** Add User ***/ 

	const handleAddUser = () => {
		setEditingUser(() => null);
		setIsModalOpen(() => true);
	};

  /*** Edit User ***/ 

	const handleEditUser = (user: User) => {
		setEditingUser(() => user);
		setIsModalOpen(() => true);
	};

  /*** Save Add/Edited User ***/ 

	const handleSaveUser = (userData: User, onSuccess?: () => void) => {
		try {
      if (editingUser) {
        // Update existing user
        updateUser(editingUser.id, userData);
        addToast({
        variant: 'success',
        title: 'Success',
        description: 'User updated successfully',
        });
      } else {
        // Add new user
        addUser(userData);
        addToast({
        variant: 'success',
        title: 'Success',
        description: 'User added successfully',
        });
      }
      setIsModalOpen(() => false);
      setEditingUser(() => null);
      onSuccess?.();
		} catch {
      addToast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to save user',
      });
		}
	};
  
  /*** Close Add/Edit Modal ***/ 
  
  const handleCloseModal = () => {
    setIsModalOpen(() => false);
    setEditingUser(() => null);
  };

  /*** Delete User ***/ 

  const handleDeleteClick = (user: User) => {
    setUserToDelete(() => user);
    setDeleteDialogOpen(() => true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete);
      setDeleteDialogOpen(() => false);
      setUserToDelete(() => null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(() => false);
    setUserToDelete(() => null);
  };

	const handleDeleteUser = (user: User) => {
		const success = deleteUser(user.id);
    if (success) {
      addToast({
        variant: 'success',
        title: 'Success',
        description: `User "${user.name}" deleted successfully.`,
      });
    } else {
      addToast({
        variant: 'error',
        title: 'Delete Failed',
        description: 'User delete failed',
      });
    }
	};

  /*** CSV Import/Export ***/ 

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

		const reader = new FileReader();
		reader.onload = (e) => {
		const csvText = e.target?.result as string;
		if (!csvText) return;

		const result = importFromCSV(csvText, userCSVConfig);

		if (result.errors.length > 0) {
			addToast({
			variant: 'error',
			title: 'Import Failed',
			description: `Import failed with ${String(result.errors.length)} error(s). Check console for details.`,
			});
			console.error('CSV Import Errors:', result.errors);
			return;
		}

		// Add imported users
		result.items.forEach((user) => {
			addUser(user);
		});

		addToast({
			variant: 'success',
			title: 'Import Successful',
			description: `Successfully imported ${String(result.items.length)} user(s).`,
		});
		};

		reader.readAsText(file);

		// Clear the input
		event.target.value = '';
	};
  
  const handleImportCSV = () => {
		fileInputRef.current?.click();
	};
  
  const handleExportCSV = () => {
		try {
		exportToCSV(users, userCSVConfig);
		addToast({
			variant: 'success',
			title: 'Export Successful',
			description: 'Users exported to CSV successfully.',
		});
		} catch {
		addToast({
			variant: 'error',
			title: 'Export Failed',
			description: 'Failed to export users to CSV.',
		});
		}
	};

	return {
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
	}
}