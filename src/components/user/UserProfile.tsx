'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { UserAvatar, RoleBadge } from '@/components/ui/RoleComponents';
import { User, Gender } from '@/types';

interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => void;
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  const { updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phoneNumber: user.phoneNumber || '',
    gender: user.gender || '',
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const updateData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        gender: (formData.gender || undefined) as Gender | undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      await updateProfile(updateData);
      setIsEditing(false);
      onUpdate?.(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    });
    setError('');
    setIsEditing(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  const formatGender = (gender: Gender | undefined) => {
    if (!gender) return user.oauthProvider ? '-' : 'Not provided';
    return gender.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Profile</span>
            </Button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center space-x-4">
              <UserAvatar user={user} size="lg" />
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <RoleBadge role={user.role} type="system" />
                  {user.oauthProvider && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {user.oauthProvider} Connected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900">{formatPhoneNumber(user.phoneNumber)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <p className="text-gray-900">{formatGender(user.gender)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <p className="text-gray-900">{formatDate(user.dateOfBirth)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>

              {user.lastLogin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-gray-900">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Account Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Account Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />

              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
                ]}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}