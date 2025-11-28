'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TeamDashboard } from '@/components/teams/TeamDashboard';
import { TeamSwitcher } from '@/components/teams/TeamSwitcher';
import { UserProfile } from '@/components/user/UserProfile';
import { UserManagement } from '@/components/admin/UserManagement';
import { PermissionGate, UserAvatar } from '@/components/ui/RoleComponents';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { LogOut, RefreshCw, Users, User as UserIcon, FolderOpen, Settings } from 'lucide-react';
import { Project } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, teams, currentTeam, isAuthenticated, isLoading, logout, loadUser } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'team' | 'profile' | 'users'>('tasks');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadProjects = async () => {
    if (!currentTeam?.id) {
      console.log('No current team ID, clearing projects');
      setProjects([]);
      setSelectedProjectId('');
      setIsLoadingProjects(false);
      return;
    }
    
    try {
      setIsLoadingProjects(true);
      console.log('Loading projects for team:', currentTeam.id);
      const data = await apiClient.getProjects(currentTeam.id);
      console.log('Projects loaded:', data);
      setProjects(data);
      
      // Auto-select first project if none selected or current selection doesn't exist
      if (data.length > 0 && (!selectedProjectId || !data.find((p: Project) => p.id === selectedProjectId))) {
        setSelectedProjectId(data[0].id);
        console.log('Auto-selected project:', data[0].id);
      } else if (data.length === 0) {
        setSelectedProjectId('');
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
      setSelectedProjectId('');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentTeam?.id]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam?.id || !projectForm.name.trim()) return;

    setCreatingProject(true);
    try {
      // Fix #9: Remove teamId from request body - API handles this via URL path
      await apiClient.createProject({
        name: projectForm.name.trim(),
        description: projectForm.description.trim() || undefined,
      });
      
      setProjectForm({ name: '', description: '' });
      setShowCreateProject(false);
      await loadProjects();
    } catch (error: any) {
      console.error('Failed to create project:', error);
      alert(`Failed to create project: ${error?.response?.data?.message || error.message}`);
    } finally {
      setCreatingProject(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const projectOptions = projects.map(p => ({ value: p.id, label: p.name }));

  // Fix #8: Create tabs array with conditional Users tab for admins/owners
  const baseTabs = [
    { id: 'tasks', label: 'Tasks', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const tabs = user && ['OWNER', 'ADMIN'].includes(user.role) 
    ? [...baseTabs, { id: 'users', label: 'Users', icon: Settings }] 
    : baseTabs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900">Nexus AI</h1>
              
              {/* Team Switcher */}
              {teams.length > 0 && (
                <TeamSwitcher className="w-64" />
              )}
              
              {/* Project Selector - Only show on tasks tab */}
              {activeTab === 'tasks' && projects.length > 0 && (
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: '', label: 'Select Project' },
                    ...projectOptions
                  ]}
                  className="w-48"
                />
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Create Project Button - Show only for team members */}
              {activeTab === 'tasks' && currentTeam?.id && (
                <Button 
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Project
                </Button>
              )}
              
              <UserAvatar user={user} showName showEmail size="sm" />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'tasks' | 'team' | 'profile' | 'users')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tasks' && (
          <>
            {!currentTeam ? (
              // No team selected - show appropriate message based on role
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {user?.role === 'MEMBER' ? (
                  <>
                    <p className="text-gray-600 mb-4">No tasks available.</p>
                    <p className="text-sm text-gray-500">You need to be part of a team to see and work on tasks.</p>
                    <p className="text-sm text-gray-500 mt-2">Contact your administrator to be added to a team.</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">No tasks to manage yet.</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">To get started with task management:</p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        <li>• Create or join a team</li>
                        <li>• Set up projects within your team</li>
                        <li>• Start creating and assigning tasks</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ) : isLoadingProjects ? (
              <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : selectedProjectId && currentTeam?.id ? (
              <KanbanBoard
                teamId={currentTeam.id}
                projectId={selectedProjectId}
              />
            ) : projects.length > 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Select a project to view its tasks</p>
                <p className="text-sm text-gray-500">Choose a project from the dropdown above to see and manage its tasks.</p>
              </div>
            ) : (
              // No projects in team
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {user?.role === 'MEMBER' ? (
                  <>
                    <p className="text-gray-600 mb-4">No tasks assigned yet.</p>
                    <p className="text-sm text-gray-500">Your team needs to create projects and assign tasks before you can see them here.</p>
                    <p className="text-sm text-gray-500 mt-2">Check back later or contact your team lead for task assignments.</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">No projects created yet.</p>
                    <p className="text-sm text-gray-500 mb-4">Create your first project to start organizing and tracking tasks for your team.</p>
                    <Button 
                      onClick={() => setShowCreateProject(true)}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      Create First Project
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'team' && (
          <>
            {currentTeam ? (
              <TeamDashboard team={currentTeam} />
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {user?.role === 'MEMBER' ? (
                  <>
                    <p className="text-gray-600 mb-4">No team to manage.</p>
                    <p className="text-sm text-gray-500">You need to be part of a team to access team management features.</p>
                    <p className="text-sm text-gray-500 mt-2">Ask your administrator to invite you to a team.</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">No team selected for management.</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Team management features include:</p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        <li>• View and manage team members</li>
                        <li>• Invite new team members</li>
                        <li>• Assign roles and permissions</li>
                        <li>• Monitor team activity</li>
                      </ul>
                      <p className="text-sm text-gray-500 mt-3">Create a team to start managing your workspace.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <UserProfile user={user} />
        )}

        {activeTab === 'users' && user && ['OWNER', 'ADMIN'].includes(user.role) && (
          <UserManagement />
        )}
      </main>

      {/* Project Creation Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            type="text"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            placeholder="e.g., Website Redesign"
            required
            autoFocus
          />

          <Textarea
            label="Description (Optional)"
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            placeholder="Brief description of the project..."
            rows={3}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              isLoading={creatingProject}
              className="flex-1"
            >
              Create Project
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateProject(false);
                setProjectForm({ name: '', description: '' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

