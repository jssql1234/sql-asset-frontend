import React, { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';
import { createAllPermissionsEnabled } from '@/utils/permissionUtils';
import { UserContext, type UserContextType } from './UserContext';

const ALL_PERMISSIONS_ENABLED = createAllPermissionsEnabled();

// Mock data - in production this would come from API
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    groupId: 'admin',
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@company.com',
    groupId: 'user',
  }
];

const MOCK_GROUPS: UserGroup[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access - cannot be deleted',
    defaultPermissions: ALL_PERMISSIONS_ENABLED
  },
  {
    id: 'user',
    name: 'Regular User',
    description: 'Limited access',
    defaultPermissions: {
      maintainItem: {
        execute: true,
        entryNew: false,
        entryEdit: false,
        entryDelete: false,
        reportProcess: true,
        reportPrint: true,
        reportPreview: true,
        reportExport: false
      },
      viewItemCategory: {
        execute: true
      }
    }
  }
];

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) as User : MOCK_USERS[0]; // Default to admin for development
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mockUsers');
    return saved ? JSON.parse(saved) as User[] : MOCK_USERS;
  });

  const [groups, setGroups] = useState<UserGroup[]>(() => {
    const saved = localStorage.getItem('mockGroups');
    return saved ? JSON.parse(saved) as UserGroup[] : MOCK_GROUPS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mockUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mockGroups', JSON.stringify(groups));
  }, [groups]);

  const getUserGroup = useCallback((groupId: string): UserGroup | undefined => {
    return groups.find(g => g.id === groupId);
  }, [groups]);

  const addUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, []);

  const deleteUser = useCallback((userId: string): boolean => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    return true;
  }, []);

  const getUsersByGroup = useCallback((groupId: string): User[] => {
    return users.filter(user => user.groupId === groupId);
  }, [users]);

  const updateGroup = useCallback((groupId: string, updates: Partial<UserGroup>) => {
    // Prevent updating admin permissions
    if (groupId === 'admin' && updates.defaultPermissions) {
      // Admin permissions cannot be modified
      const { ...otherUpdates } = updates;
      updates = otherUpdates;
    }

    setGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    ));
  }, []);

  const addGroup = useCallback((group: UserGroup) => {
    setGroups(prev => [...prev, group]);
  }, []);

  const deleteGroup = useCallback((groupId: string): { success: boolean; assignedUsers?: User[] } => {
    // Prevent deletion of admin group
    if (groupId === 'admin') return { success: false };

    // Check for assigned users
    const assignedUsers = users.filter(u => u.groupId === groupId);
    if (assignedUsers.length > 0) {
      return { success: false, assignedUsers };
    }

    // Remove the group
    setGroups(prev => prev.filter(g => g.id !== groupId));

    return { success: true };
  }, [users]);

  const assignUserToGroup = useCallback((userId: string, groupId: string) => {
    updateUser(userId, { groupId });
  }, [updateUser]);

  const value: UserContextType = useMemo(() => ({
    currentUser,
    users,
    groups,
    setCurrentUser,
    getUserGroup,
    addUser,
    updateUser,
    deleteUser,
    getUsersByGroup,
    updateGroup,
    addGroup,
    deleteGroup,
    assignUserToGroup,
  }), [currentUser, users, groups, setCurrentUser, getUserGroup, addUser, updateUser, deleteUser, getUsersByGroup, updateGroup, addGroup, deleteGroup, assignUserToGroup]);

  return (
    <UserContext value={value}>
      {children}
    </UserContext>
  );
};

export default UserProvider;