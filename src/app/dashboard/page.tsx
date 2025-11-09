'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LogOut, RefreshCw } from 'lucide-react';
import { Project } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, loadUser } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadProjects = async () => {
    if (!user?.teamId) return;
    
    try {
      setIsLoadingProjects(true);
      const data = await apiClient.getProjects(user.teamId);
      setProjects(data);
      
      // Auto-select first project if none selected or current selection doesn't exist
      if (data.length > 0 && (!selectedProjectId || !data.find((p: Project) => p.id === selectedProjectId))) {
        setSelectedProjectId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (user?.teamId) {
      loadProjects();
    }
  }, [user?.teamId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const projectOptions = projects.map(p => ({ value: p.id, label: p.name }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Nexus AI</h1>
              {projects.length > 0 && (
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={projectOptions}
                  className="w-64"
                />
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.name}</span>
                <span className="mx-2">•</span>
                <span className="text-gray-400">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingProjects ? (
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : selectedProjectId && user.teamId ? (
          <KanbanBoard
            teamId={user.teamId}
            projectId={selectedProjectId}
          />
        ) : projects.length > 0 && user.teamId ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Select a project to view tasks</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No projects found. Create one to get started!</p>
            <Button onClick={async () => {
              if (!user.teamId) return;
              try {
                setIsLoadingProjects(true);
                
                // Generate unique name to avoid conflicts
                const timestamp = Date.now();
                const uniqueId = Math.random().toString(36).substr(2, 5);
                const newProject = await apiClient.createProject({
                  name: `My Project ${uniqueId}`,
                  description: 'Getting started with Nexus AI',
                });
                
                 // Reload projects list and select the new one
                 await loadProjects();
                 setSelectedProjectId(newProject.id);
              } catch (error: any) {
                console.error('Failed to create project:', error);
                
                // If 409, project exists - just reload the list
                if (error?.response?.status === 409) {
                  console.log('Project name conflict, reloading list...');
                  await loadProjects();
                } else {
                  alert(`Failed to create project: ${error?.response?.data?.message || error.message}`);
                }
              } finally {
                setIsLoadingProjects(false);
              }
            }}>
              Create Project
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

