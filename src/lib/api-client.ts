import axios, { AxiosInstance, AxiosError } from 'axios';
import { handleAuthError, notifyAuthError, redirectAfterAuthError } from './auth-error-handler';

class ApiClient {
  private authClient: AxiosInstance;
  private taskClient: AxiosInstance;

  constructor() {
    this.authClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending/receiving httpOnly cookies
    });

    this.taskClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:3002',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending/receiving httpOnly cookies
    });

    // Add auth interceptor for task client
    // Tokens are in httpOnly cookies - sent automatically via withCredentials
    this.taskClient.interceptors.request.use(
      (config) => {
        // Cookies sent automatically, no need to add headers
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add auth interceptor for auth client
    // Tokens are in httpOnly cookies - sent automatically via withCredentials
    this.authClient.interceptors.request.use(
      (config) => {
        // Cookies sent automatically, no need to add headers
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh and error handling
    this.taskClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosError['config'] & { _retry?: boolean };
        
        // Prevent infinite retry loop
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Token expired, try to refresh (uses httpOnly cookies)
          const refreshed = await this.refreshAccessToken();
          if (refreshed && originalRequest) {
            // Retry the original request (new cookie set by refresh endpoint)
            return this.taskClient.request(originalRequest);
          }
          
          // Refresh failed - handle with centralized error handler
          const errorDetails = handleAuthError(error);
          notifyAuthError(errorDetails);
          redirectAfterAuthError(errorDetails);
        } else {
          // Non-401 errors or retry failed - handle with centralized handler
          const errorDetails = handleAuthError(error);
          notifyAuthError(errorDetails);
          
          // Only redirect for auth-specific errors
          if (errorDetails.redirectTo) {
            redirectAfterAuthError(errorDetails);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh tokens using httpOnly cookies
   * Backend reads refreshToken from cookie and sets new cookies
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await this.authClient.post('/auth/refresh', {});
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.authClient.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    termsAccepted: boolean;
  }) {
    const response = await this.authClient.post('/auth/signup', data);
    return response.data;
  }

  async getProfile() {
    const response = await this.authClient.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: {
    name?: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
  }) {
    const response = await this.authClient.patch('/users/me', data);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.authClient.get('/users/me');
    return response.data;
  }

  // Fix #8: Add users management API endpoint
  async getAllUsers() {
    const response = await this.authClient.get('/users');
    return response.data;
  }

  // OAuth methods
  async loginWithGoogle() {
    // Redirect to Google OAuth
    window.location.href = `${this.authClient.defaults.baseURL}/auth/google`;
  }

  async loginWithGitHub() {
    // Redirect to GitHub OAuth
    window.location.href = `${this.authClient.defaults.baseURL}/auth/github`;
  }

  // Linked providers methods
  async getLinkedProviders() {
    const response = await this.authClient.get('/api/auth/linked-providers');
    return response.data;
  }

  async linkProvider(userId: string, provider: 'GOOGLE' | 'GITHUB') {
    // Mark that this is user-initiated linking (for error handling)
    sessionStorage.setItem('oauth_linking_initiated', 'true');
    // SECURITY: POST request prevents CSRF attacks (GET with state changes is vulnerable)
    // userId comes from JWT session on backend, not from frontend
    const providerLower = provider.toLowerCase();
    const linkUrl = `${this.authClient.defaults.baseURL}/api/auth/${providerLower}/link`;
    
    // Use form POST to follow redirect naturally (OAuth flow requires browser redirect)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = linkUrl;
    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
  }

  async unlinkProvider(provider: 'GOOGLE' | 'GITHUB') {
    const response = await this.authClient.post('/api/auth/unlink-provider', { provider });
    return response.data;
  }

  async logout() {
    // Logout with cookie-based authentication
    try {
      await this.authClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getUserTeams() {
    const response = await this.authClient.get('/teams');
    return response.data;
  }

  async createTeam(data: { name: string; description?: string }) {
    const response = await this.authClient.post('/teams', data);
    return response.data;
  }

  async inviteTeamMember(teamId: string, data: { email: string; role: string }) {
    const response = await this.authClient.post(`/teams/${teamId}/invite`, data);
    return response.data;
  }

  async updateTeamMemberRole(teamId: string, userId: string, role: string) {
    const response = await this.authClient.patch(`/teams/${teamId}/members/${userId}`, { role });
    return response.data;
  }

  async removeTeamMember(teamId: string, userId: string) {
    const response = await this.authClient.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  }

  // Task endpoints
  async getTasks(projectId?: string) {
    // Use kanban endpoint which returns tasks organized by status
    const params = projectId ? `?project_id=${projectId}` : '';
    const response = await this.taskClient.get(`/tasks/kanban${params}`);
    return response.data;
  }

  async getTask(id: string) {
    const response = await this.taskClient.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: number;
    assignee_id?: string;
    project_id?: string;
    labels?: string[];
    due_date?: string;
  }) {
    // team_id is extracted from JWT token by backend, not sent in body
    console.log('API Client creating task with:', data);
    const response = await this.taskClient.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: number;
    assignee_id: string;
    position: number;
  }>) {
    const response = await this.taskClient.patch(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await this.taskClient.delete(`/tasks/${id}`);
    return response.data;
  }

  // Project endpoints
  async getProjects(teamId: string) {
    const response = await this.taskClient.get(`/projects?teamId=${teamId}`);
    return response.data;
  }

  async getProject(id: string) {
    const response = await this.taskClient.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: {
    name: string;
    description?: string;
  }) {
    // team_id is extracted from JWT token by backend, not sent in body
    const response = await this.taskClient.post('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<{
    name: string;
    description: string;
  }>) {
    const response = await this.taskClient.patch(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.taskClient.delete(`/projects/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();

