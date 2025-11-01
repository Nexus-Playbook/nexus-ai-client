import { create } from 'zustand';
import { User, AuthTokens } from '@/types';
import { apiClient } from './api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const data = await apiClient.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Backend returns user in login response
      const userData = data.user;
      
      // Get user's teams to extract teamId
      const teams = await apiClient.getUserTeams();
      const primaryTeam = teams && teams.length > 0 ? teams[0] : null;
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.metadata?.name || userData.email,
        role: (userData.role || 'MEMBER').toLowerCase() as 'admin' | 'user',
        teamId: primaryTeam?.id || undefined,
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const data = await apiClient.register(email, password, name);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Backend returns user in signup response
      const userData = data.user;
      
      // Get user's teams (auto-created on signup)
      const teams = await apiClient.getUserTeams();
      const primaryTeam = teams && teams.length > 0 ? teams[0] : null;
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.metadata?.name || name,
        role: (userData.role || 'MEMBER').toLowerCase() as 'admin' | 'user',
        teamId: primaryTeam?.id || undefined,
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const userData = await apiClient.getCurrentUser();
      const teams = await apiClient.getUserTeams();
      const primaryTeam = teams && teams.length > 0 ? teams[0] : null;
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.metadata?.name || userData.email,
        role: (userData.role || 'MEMBER').toLowerCase() as 'admin' | 'user',
        teamId: primaryTeam?.id || undefined,
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      // Only log if it's not a "no token" scenario
      if (error?.response?.status !== 401) {
        console.error('Load user failed:', error);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

