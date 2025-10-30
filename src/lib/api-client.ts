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
    });

    this.taskClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:3002',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor for task client
    this.taskClient.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    this.taskClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
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
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await this.authClient.post('/auth/refresh', { refreshToken });
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.authClient.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, name: string) {
    const response = await this.authClient.post('/auth/signup', { email, password, name });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.authClient.get('/users/me');
    return response.data;
  }

  async getUserTeams() {
    const response = await this.authClient.get('/teams');
    return response.data;
  }

  // Task endpoints
  async getTasks(teamId: string, projectId?: string) {
    // Use kanban endpoint which returns tasks organized by status
    const response = await this.taskClient.get('/tasks/kanban');
    return response.data;
  }

  async getTask(id: string) {
    const response = await this.taskClient.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: any) {
    console.log('API Client creating task with:', data);
    const response = await this.taskClient.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: any) {
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

  async createProject(data: any) {
    const response = await this.taskClient.post('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: any) {
    const response = await this.taskClient.patch(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.taskClient.delete(`/projects/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();

