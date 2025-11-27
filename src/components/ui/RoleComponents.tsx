'use client';

import { User, UserRole } from '@/types';

interface PermissionGateProps {
  children: React.ReactNode;
  user: User | null;
  requiredRoles?: UserRole[];
  requiredTeamRoles?: string[];
  fallback?: React.ReactNode;
  teamMemberRole?: string;
}

// Permission hierarchy - higher index = more permissions
const ROLE_HIERARCHY: UserRole[] = ['MEMBER', 'TESTER', 'DEVELOPER', 'TEAM_LEAD', 'ADMIN', 'OWNER'];
const TEAM_ROLE_HIERARCHY = ['MEMBER', 'ADMIN', 'OWNER'];

export function PermissionGate({ 
  children, 
  user, 
  requiredRoles = [], 
  requiredTeamRoles = [],
  teamMemberRole,
  fallback = null 
}: PermissionGateProps) {
  if (!user) {
    return <>{fallback}</>;
  }

  // Check system role permissions
  if (requiredRoles.length > 0) {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role);
    const hasRequiredSystemRole = requiredRoles.some(role => {
      const requiredRoleIndex = ROLE_HIERARCHY.indexOf(role);
      return userRoleIndex >= requiredRoleIndex;
    });

    if (!hasRequiredSystemRole) {
      return <>{fallback}</>;
    }
  }

  // Check team role permissions
  if (requiredTeamRoles.length > 0 && teamMemberRole) {
    const userTeamRoleIndex = TEAM_ROLE_HIERARCHY.indexOf(teamMemberRole);
    const hasRequiredTeamRole = requiredTeamRoles.some(role => {
      const requiredTeamRoleIndex = TEAM_ROLE_HIERARCHY.indexOf(role);
      return userTeamRoleIndex >= requiredTeamRoleIndex;
    });

    if (!hasRequiredTeamRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

interface RoleBadgeProps {
  role: UserRole | string;
  type?: 'system' | 'team';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RoleBadge({ role, type = 'system', size = 'md', className = '' }: RoleBadgeProps) {
  const getSystemRoleColor = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TEAM_LEAD': return 'bg-green-100 text-green-800 border-green-200';
      case 'DEVELOPER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TESTER': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEMBER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTeamRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MEMBER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const colorClass = type === 'system' 
    ? getSystemRoleColor(role as UserRole)
    : getTeamRoleColor(role);

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {role.replace('_', ' ')}
    </span>
  );
}

interface UserAvatarProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showEmail?: boolean;
  className?: string;
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  showName = false, 
  showEmail = false,
  className = '' 
}: UserAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0`}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className={`${sizeClasses[size]} rounded-full object-cover`}
          />
        ) : (
          <span className="text-white font-medium">
            {getInitials(user.name)}
          </span>
        )}
      </div>
      
      {(showName || showEmail) && (
        <div className="min-w-0 flex-1">
          {showName && (
            <p className="font-medium text-gray-900 truncate">{user.name}</p>
          )}
          {showEmail && user.email && (
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          )}
        </div>
      )}
    </div>
  );
}