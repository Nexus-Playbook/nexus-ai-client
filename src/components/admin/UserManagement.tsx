'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { UserAvatar, RoleBadge } from '@/components/ui/RoleComponents';
import { RefreshCw } from 'lucide-react';
import { User } from '@/types';

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className = '' }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button
          onClick={loadUsers}
          className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-500 mb-4">
          Total Users: {users.length}
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4 flex-1">
                <UserAvatar user={user} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <RoleBadge role={user.role} type="system" size="sm" />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  {user.phoneNumber && (
                    <p className="text-xs text-gray-400">{user.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.oauthProvider && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {user.oauthProvider}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-400">
                  <div>Joined: {formatDate(user.createdAt)}</div>
                  <div>Last: {formatDate(user.lastLogin)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No users found.
          </div>
        )}
      </div>
    </Card>
  );
}