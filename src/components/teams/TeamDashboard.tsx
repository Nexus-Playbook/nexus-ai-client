'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Team, TeamMember, TeamMemberRole, User } from '@/types';
import { RoleBadge } from '@/components/ui/RoleComponents';

interface TeamDashboardProps {
  team: Team;
  onTeamUpdate?: (team: Team) => void;
}

export function TeamDashboard({ team, onTeamUpdate }: TeamDashboardProps) {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' as TeamMemberRole });
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user && members.find(m => m.userId === user.id)?.roleInTeam === 'OWNER';
  const isAdminOrOwner = user && ['OWNER', 'ADMIN'].includes(members.find(m => m.userId === user.id)?.roleInTeam || '');

  useEffect(() => {
    loadMembers();
  }, [team.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const teamMembers = team.members || await apiClient.getTeamMembers(team.id);
      setMembers(teamMembers);
    } catch (error) {
      console.error('Failed to load team members:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setInviting(true);
    setError('');

    try {
      await apiClient.inviteTeamMember(team.id, {
        email: inviteForm.email,
        role: inviteForm.role,
      });
      
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'MEMBER' });
      await loadMembers(); // Refresh members list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TeamMemberRole) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      await apiClient.updateTeamMemberRole(team.id, member.userId, newRole);
      await loadMembers(); // Refresh members list
    } catch (error) {
      console.error('Failed to update member role:', error);
      setError('Failed to update member role');
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemoving(true);
    setError('');

    try {
      await apiClient.removeTeamMember(team.id, memberToRemove.userId);
      setShowRemoveModal(false);
      setMemberToRemove(null);
      await loadMembers(); // Refresh members list
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      setError(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500">
              {members.length} member{members.length !== 1 ? 's' : ''} • {team.plan} plan
            </p>
            {team.description && (
              <p className="text-sm text-gray-600 mt-1">{team.description}</p>
            )}
          </div>
          
          {isAdminOrOwner && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Invite Member</span>
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Team Members</h4>
          
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <RoleBadge role={member.roleInTeam} type="team" size="sm" />
                  </div>
                </div>

                {isOwner && member.userId !== user?.id && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={member.roleInTeam}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMemberRole)}
                      options={[
                        { value: 'MEMBER', label: 'Member' },
                        { value: 'ADMIN', label: 'Admin' },
                      ]}
                      className="w-24"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="colleague@company.com"
            required
          />

          <Select
            label="Role"
            value={inviteForm.role}
            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as TeamMemberRole })}
            options={[
              { value: 'MEMBER', label: 'Member - Basic access' },
              { value: 'ADMIN', label: 'Admin - Can manage members' },
            ]}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              isLoading={inviting}
              className="flex-1"
            >
              Send Invitation
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setMemberToRemove(null);
        }}
        title="Remove Team Member"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Confirm Removal</h4>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove <strong>{memberToRemove?.user.name}</strong> from the team?
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            This action cannot be undone. The member will lose access to all team projects and data.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={confirmRemoveMember}
              isLoading={removing}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Member
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRemoveModal(false);
                setMemberToRemove(null);
                setError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}