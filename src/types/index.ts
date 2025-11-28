export type UserRole = 'OWNER' | 'ADMIN' | 'TEAM_LEAD' | 'DEVELOPER' | 'TESTER' | 'MEMBER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type OAuthProvider = 'GOOGLE' | 'GITHUB';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  oauthProvider?: OAuthProvider;
  oauthId?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  assignedTasks?: Task[];
}

export type TeamPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type TeamMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  roleInTeam: TeamMemberRole;
  assignedBy: string;
  joinedAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  plan: TeamPlan;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  billingCustomerId?: string;
  members?: TeamMember[];
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
  due_date?: string; // ISO date string
  start_date?: string; // ISO date string
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
  due_date?: string; // ISO date string
  start_date?: string; // ISO date string
  estimated_hours?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  termsAccepted: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  oauthProvider?: OAuthProvider;
  createdAt: string;
  lastLogin?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamMemberRole;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
}

