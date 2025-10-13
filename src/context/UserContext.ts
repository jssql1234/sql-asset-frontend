import type { User } from '@/types/user';
import type { UserGroup } from '@/types/user-group';
import { createContext, use } from 'react';

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

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () : UserContextType => {
  const context = use(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}