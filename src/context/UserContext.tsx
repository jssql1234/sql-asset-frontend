import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';
import { createAllPermissionsEnabled } from '@/utils/permissionUtils';

// Generate all permissions enabled dynamically
const ALL_PERMISSIONS_ENABLED = createAllPermissionsEnabled();

// Mock data - in production this would come from API
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    groupId: 'admin',
  },
  {
    id: '2',
    name: 'Regular User',
    groupId: 'user',
  }
];

const MOCK_GROUPS: UserGroup[] = [
  {
    id: '-----',
    name: 'Default',
    description: 'Default',
    isDefault: true,
    defaultPermissions: ALL_PERMISSIONS_ENABLED
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access',
    isDefault: false,
    defaultPermissions: ALL_PERMISSIONS_ENABLED
  },
  {
    id: 'user',
    name: 'Regular User',
    description: 'Limited access',
    isDefault: false,
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

interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: UserGroup[];
  setCurrentUser: (user: User | null) => void;
  getUserGroup: (groupId: string) => UserGroup | undefined;
  getDefaultGroup: () => UserGroup | undefined;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateGroup: (groupId: string, updates: Partial<UserGroup>) => void;
  setDefaultGroup: (groupId: string) => void;
  addGroup: (group: Omit<UserGroup, 'isDefault'>) => void;
  deleteGroup: (groupId: string) => boolean; // Returns true if deleted, false if prevented
  assignUserToGroup: (userId: string, groupId: string) => void;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  groups: [],
  setCurrentUser: () => {},
  getUserGroup: () => undefined,
  getDefaultGroup: () => undefined,
  updateUser: () => {},
  updateGroup: () => {},
  setDefaultGroup: () => {},
  addGroup: () => {},
  deleteGroup: () => false,
  assignUserToGroup: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : MOCK_USERS[0]; // Default to admin for development
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mockUsers');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [groups, setGroups] = useState<UserGroup[]>(() => {
    const saved = localStorage.getItem('mockGroups');
    return saved ? JSON.parse(saved) : MOCK_GROUPS;
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

  const getUserGroup = (groupId: string): UserGroup | undefined => {
    return groups.find(g => g.id === groupId);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const updateGroup = (groupId: string, updates: Partial<UserGroup>) => {
    setGroups(prev => {
      // If setting isDefault to true, unset all other groups first
      if (updates.isDefault === true) {
        prev = prev.map(group => ({ ...group, isDefault: false }));
      }
      return prev.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      );
    });
  };

  const getDefaultGroup = (): UserGroup | undefined => {
    return groups.find(g => g.isDefault);
  };

  const setDefaultGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      isDefault: group.id === groupId
    })));
  };

  const addGroup = (groupData: Omit<UserGroup, 'isDefault'>) => {
    const newGroup: UserGroup = {
      ...groupData,
      isDefault: false // New groups are not default by default
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const deleteGroup = (groupId: string): boolean => {
    const groupToDelete = groups.find(g => g.id === groupId);
    if (!groupToDelete) return false;

    // Prevent deletion of default groups
    if (groupToDelete.isDefault) return false;

    // Remove the group
    setGroups(prev => prev.filter(g => g.id !== groupId));

    // Reassign users from deleted group to default group
    const defaultGroup = getDefaultGroup();
    if (defaultGroup) {
      setUsers(prev => prev.map(user =>
        user.groupId === groupId ? { ...user, groupId: defaultGroup.id } : user
      ));
    }

    return true;
  };

  const assignUserToGroup = (userId: string, groupId: string) => {
    updateUser(userId, { groupId });
  };

  const value: UserContextType = {
    currentUser,
    users,
    groups,
    setCurrentUser,
    getUserGroup,
    getDefaultGroup,
    updateUser,
    updateGroup,
    setDefaultGroup,
    addGroup,
    deleteGroup,
    assignUserToGroup,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
