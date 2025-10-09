import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';
import { createContext } from 'react';

export interface UserContextType {
  currentUser: User | null;
  users: User[];
  groups: UserGroup[];
  setCurrentUser: (user: User | null) => void;
  getUserGroup: (groupId: string) => UserGroup | undefined;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateGroup: (groupId: string, updates: Partial<UserGroup>) => void;
  addGroup: (group: UserGroup) => void;
  deleteGroup: (groupId: string) => boolean; // Returns true if deleted, false if prevented (admin cannot be deleted)
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
  updateUser: () => {
    console.warn('UserContext: updateUser called outside provider');
  },
  updateGroup: () => {
    console.warn('UserContext: updateGroup called outside provider');
  },
  addGroup: () => {
    console.warn('UserContext: addGroup called outside provider');
  },
  deleteGroup: () => {
    console.warn('UserContext: deleteGroup called outside provider');
    return false;
  },
  assignUserToGroup: () => {
    console.warn('UserContext: assignUserToGroup called outside provider');
  },
});



