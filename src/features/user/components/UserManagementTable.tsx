import React, { useState } from 'react';
import { use } from 'react';
import { UserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/components';

interface UserManagementTableProps {
  onEditUser?: (userId: string) => void;
  onEditGroup?: (groupId: string) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  onEditUser,
  onEditGroup
}) => {
  const { users, groups } = use(UserContext);
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'users' ? 'primary' : 'secondary'}
          onClick={() => {setActiveTab('users')}}
        >
          Users
        </Button>
        <Button
          variant={activeTab === 'groups' ? 'primary' : 'secondary'}
          onClick={() => {setActiveTab('groups')}}
        >
          Groups
        </Button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">
                  Group: {groups.find(g => g.id === user.groupId)?.name ?? user.groupId}
                </div>
              </div>
              <Button
                size="small"
                onClick={() => onEditUser?.(user.id)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => (
            <div key={group.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{group.name}</div>
                <div className="text-sm text-gray-600">{group.description}</div>
              </div>
              <Button
                size="small"
                onClick={() => onEditGroup?.(group.id)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;