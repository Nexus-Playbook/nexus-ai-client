'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/api-client';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated?: () => void;
}

export function CreateTeamModal({ isOpen, onClose, onTeamCreated }: CreateTeamModalProps) {
  const { loadTeams } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await apiClient.createTeam({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      setFormData({ name: '', description: '' });
      await loadTeams(); // Refresh teams list
      onTeamCreated?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Team Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Product Development Team"
          required
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of what this team does..."
          rows={3}
        />

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
            Create Team
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface TeamSwitcherProps {
  className?: string;
}

export function TeamSwitcher({ className = '' }: TeamSwitcherProps) {
  const { teams, currentTeam, switchTeam, user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTeamSwitch = (teamId: string) => {
    switchTeam(teamId);
    setIsOpen(false);
  };

  if (teams.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {currentTeam?.name.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
            <span className="font-medium">{currentTeam?.name || 'Select Team'}</span>
          </div>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">Your Teams</div>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSwitch(team.id)}
                  className={`w-full text-left px-2 py-2 rounded hover:bg-gray-50 flex items-center space-x-2 ${
                    currentTeam?.id === team.id ? 'bg-primary-50 text-primary-700' : ''
                  }`}
                >
                  <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{team.name}</div>
                    {team.description && (
                      <div className="text-xs text-gray-500 truncate">{team.description}</div>
                    )}
                  </div>
                </button>
              ))}
              
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-gray-50 flex items-center space-x-2 text-primary-600"
                >
                  <div className="w-6 h-6 border-2 border-dashed border-primary-300 rounded flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="font-medium">Create New Team</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}