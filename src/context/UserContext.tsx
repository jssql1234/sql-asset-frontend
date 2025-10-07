import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';

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
    id: 'admin',
    name: 'Administrator',
    description: 'Full access',
    defaultPermissions: {
      maintainItem: {
        execute: true,
        entryNew: true,
        entryEdit: true,
        entryDelete: true,
        reportProcess: true,
        reportPrint: true,
        reportPreview: true,
        reportExport: true
      },
      maintainUser: {
        execute: true,
        entryNew: true,
        entryEdit: true,
        entryDelete: true,
        reportProcess: true,
        reportPrint: true,
        reportPreview: true,
        reportExport: true
      },
      viewItemCategory: {
        execute: true
      }
    }
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

interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: UserGroup[];
  setCurrentUser: (user: User | null) => void;
  getUserGroup: (groupId: string) => UserGroup | undefined;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateGroup: (groupId: string, updates: Partial<UserGroup>) => void;
  assignUserToGroup: (userId: string, groupId: string) => void;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  groups: [],
  setCurrentUser: () => {},
  getUserGroup: () => undefined,
  updateUser: () => {},
  updateGroup: () => {},
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
    setGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    ));
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
    updateUser,
    updateGroup,
    assignUserToGroup,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};