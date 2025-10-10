import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';
import { createContext } from 'react';

export interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: UserGroup[];
  setCurrentUser: (user: User | null) => void;
  getUserGroup: (groupId: string) => UserGroup | undefined;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => boolean;
  getUsersByGroup: (groupId: string) => User[];
  updateGroup: (groupId: string, updates: Partial<UserGroup>) => void;
  addGroup: (group: UserGroup) => void;
  deleteGroup: (groupId: string) => { success: boolean; assignedUsers?: User[] };
  assignUserToGroup: (userId: string, groupId: string) => void;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  groups: [],
  setCurrentUser: () => {
    console.warn('UserContext: setCurrentUser called outside provider');
  },
  getUserGroup: () => {
    console.warn('UserContext: getUserGroup called outside provider');
    return undefined;
  },
  addUser: () => {
    console.warn('UserContext: addUser called outside provider');
  },
  updateUser: () => {
    console.warn('UserContext: updateUser called outside provider');
  },
  deleteUser: () => {
    console.warn('UserContext: deleteUser called outside provider');
    return false;
  },
  getUsersByGroup: () => {
    console.warn('UserContext: getUsersByGroup called outside provider');
    return [];
  },
  updateGroup: () => {
    console.warn('UserContext: updateGroup called outside provider');
  },
  addGroup: () => {
    console.warn('UserContext: addGroup called outside provider');
  },
  deleteGroup: () => {
    console.warn('UserContext: deleteGroup called outside provider');
    return { success: false };
  },
  assignUserToGroup: () => {
    console.warn('UserContext: assignUserToGroup called outside provider');
  },
});



