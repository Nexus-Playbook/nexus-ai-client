import axios, { AxiosInstance, AxiosError } from 'axios';

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
    // Note: For OAuth users, tokens are in httpOnly cookies (sent automatically)
    // This interceptor handles legacy localStorage tokens for backward compatibility
    this.taskClient.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // If no token in localStorage, cookies will be sent automatically via withCredentials
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add auth interceptor for auth client (for protected routes)
    this.authClient.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && !config.url?.includes('/login') && !config.url?.includes('/signup')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // OAuth users: cookies sent automatically via withCredentials
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    this.taskClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosError['config'] & { _retry?: boolean };
        
        // Prevent infinite retry loop
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Token expired, try to refresh
          const refreshed = await this.refreshAccessToken();
          if (refreshed && originalRequest) {
            // Update the auth header with new token
            originalRequest.headers.Authorization = `Bearer ${this.getAccessToken()}`;
            // Retry the original request
            return this.taskClient.request(originalRequest);
          }
          
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            console.error('Token refresh failed, redirecting to login');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get access token from httpOnly cookie (server handles this automatically)
   * For OAuth flows, cookies are set by backend
   * @deprecated - Tokens now in httpOnly cookies, not localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Legacy fallback: Check localStorage for backward compatibility
    // This will be empty for OAuth users (cookies only)
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  /**
   * Refresh tokens using httpOnly cookies
   * Backend reads refreshToken from cookie automatically
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      // No need to send refreshToken in body - it's in httpOnly cookie
      // Backend will read it via cookie-parser middleware
      const response = await this.authClient.post('/auth/refresh', {});
      
      // Backend sets new accessToken cookie in response
      // No need to store in localStorage anymore
      return response.status === 200;
    } catch {
      // Refresh failed - cookies expired or invalid
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

  async logout() {
    // Check both storage locations for refresh token
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await this.authClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }
    // Clear tokens from both storage locations regardless
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }

  async getUserTeams() {
    const response = await this.authClient.get('/teams');
    return response.data;
  }

  async createTeam(data: { name: string; description?: string }) {
    const response = await this.authClient.post('/teams', data);
    return response.data;
  }

  async getTeamMembers(teamId: string) {
    const response = await this.authClient.get(`/teams/${teamId}/members`);
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

