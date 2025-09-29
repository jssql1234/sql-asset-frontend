import { useState, useEffect } from 'react';
import type { User } from '@/types/work-request';

const TEST_USERS: User[] = [
  { name: 'John Smith', department: 'Production' },
  { name: 'Sarah Davis', department: 'Warehouse' },
  { name: 'Tom Wilson', department: 'Quality Control' },
  { name: 'Lisa Brown', department: 'Production' },
  { name: 'Mike Chen', department: 'Maintenance' },
  { name: 'Guest', department: 'N/A' }
];

export const useUserManagement = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<User>(TEST_USERS[0]);

  useEffect(() => {
    setCurrentUser(TEST_USERS[currentUserIndex]);
  }, [currentUserIndex]);

  const changeTestUser = () => {
    const nextIndex = (currentUserIndex + 1) % TEST_USERS.length;
    setCurrentUserIndex(nextIndex);
  };

  const isGuestUser = currentUser.name === 'Guest';

  const getUserDisplayText = () => {
    return isGuestUser ? 'Guest User' : `${currentUser.name} (${currentUser.department})`;
  };

  return {
    currentUser,
    changeTestUser,
    isGuestUser,
    getUserDisplayText,
  };
};