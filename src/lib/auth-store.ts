import { create } from 'zustand';
import { User, AuthTokens, RegisterData, LoginCredentials, Team } from '@/types';
import { apiClient } from './api-client';

interface AuthState {
  user: User | null;
  teams: Team[];
  currentTeam: Team | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadTeams: () => Promise<void>;
  switchTeam: (teamId: string) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  teams: [],
  currentTeam: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.login(credentials.email, credentials.password);
      const { accessToken, refreshToken, user } = response;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ user, isAuthenticated: true, isLoading: false });
      
      // Load teams after successful login
      await get().loadTeams();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await apiClient.register(data);
      const { accessToken, refreshToken, user } = response;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ user, isAuthenticated: true, isLoading: false });
      
      // Load teams after successful registration (auto-created team)
      await get().loadTeams();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, teams: [], currentTeam: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const profile = await apiClient.getProfile();
      const user = profile.user;
      
      set({ user, isAuthenticated: true, isLoading: false });
      
      // Load teams
      await get().loadTeams();
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error('Load user failed:', error);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, teams: [], currentTeam: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadTeams: async () => {
    try {
      const teams = await apiClient.getUserTeams();
      const currentTeam = teams.length > 0 ? teams[0] : null;
      
      set({ teams, currentTeam });
    } catch (error) {
      console.error('Load teams failed:', error);
      set({ teams: [], currentTeam: null });
    }
  },

  switchTeam: (teamId: string) => {
    const { teams } = get();
    const team = teams.find(t => t.id === teamId);
    if (team) {
      set({ currentTeam: team });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const updatedUser = await apiClient.updateProfile(data);
      set({ user: updatedUser });
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },
}));

