export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  team_id: string;
  created_by: string;
  settings?: any;
  task_count?: number;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 1 | 2 | 3 | 4 | 5; // 1=Critical, 2=High, 3=Medium, 4=Low, 5=Lowest

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id?: string;
  team_id: string;
  assignee_id?: string;
  created_by: string;
  labels?: string[];
  tags?: string[];
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  position: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: string;
  assignee_id?: string;
  labels?: string[];
  tags?: string[];
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  labels?: string[];
  tags?: string[];
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

