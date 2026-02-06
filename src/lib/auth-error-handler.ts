/**
 * Centralized Auth Error Handler
 * 
 * Handles authentication and authorization errors consistently across the app.
 * Provides user-friendly messages and appropriate redirects.
 */

import type { AxiosError } from 'axios';

export type AuthErrorType =
  | 'UNAUTHORIZED' // 401 - Not authenticated
  | 'FORBIDDEN' // 403 - Authenticated but insufficient permissions
  | 'EMAIL_NOT_VERIFIED' // Email verification required
  | 'PROVIDER_NOT_LINKED' // OAuth provider not linked
  | 'PROVIDER_ALREADY_LINKED' // OAuth provider already linked to different account
  | 'SESSION_EXPIRED' // Token expired
  | 'UNKNOWN'; // Other errors

export interface AuthErrorDetails {
  type: AuthErrorType;
  message: string;
  userMessage: string; // User-friendly message for UI
  redirectTo?: string; // Where to redirect the user
  action?: 'LOGIN' | 'VERIFY_EMAIL' | 'LINK_ACCOUNT' | 'CONTACT_SUPPORT';
}

/**
 * Type guard for error response data
 */
interface ErrorResponseData {
  code?: string;
  message?: string;
  email?: string;
  newProvider?: string;
  [key: string]: unknown;
}

/**
 * Parse and handle authentication errors
 */
export function handleAuthError(error: AxiosError | Error | unknown): AuthErrorDetails {
  // Type guard for AxiosError
  const isAxiosError = (err: unknown): err is AxiosError => {
    return typeof err === 'object' && err !== null && 'isAxiosError' in err;
  };

  // Type guard for error response data
  const isErrorData = (data: unknown): data is ErrorResponseData => {
    return typeof data === 'object' && data !== null;
  };

  // Handle HTTP status codes (AxiosError)
  if (isAxiosError(error) && error.response) {
    const status = error.response.status;
    const data = isErrorData(error.response.data) ? error.response.data : {};

    // 401 Unauthorized
    if (status === 401) {
      // Check if it's a specific auth error with code
      if (data.code === 'SESSION_EXPIRED' || data.message?.includes('expired')) {
        return {
          type: 'SESSION_EXPIRED',
          message: data.message || 'Your session has expired',
          userMessage: 'Your session has expired. Please log in again.',
          redirectTo: '/login',
          action: 'LOGIN',
        };
      }

      return {
        type: 'UNAUTHORIZED',
        message: data.message || 'Authentication required',
        userMessage: 'Please log in to continue.',
        redirectTo: '/login',
        action: 'LOGIN',
      };
    }

    // 403 Forbidden
    if (status === 403) {
      // Check for email verification requirement
      if (data.code === 'EMAIL_NOT_VERIFIED') {
        return {
          type: 'EMAIL_NOT_VERIFIED',
          message: data.message || 'Email verification required',
          userMessage: 'Please verify your email address to access this feature.',
          redirectTo: '/verify-email',
          action: 'VERIFY_EMAIL',
        };
      }

      return {
        type: 'FORBIDDEN',
        message: data.message || 'Insufficient permissions',
        userMessage: `You don't have permission to access this resource.`,
        redirectTo: '/dashboard',
      };
    }

    // OAuth-specific errors (usually 400)
    if (data.code === 'PROVIDER_NOT_LINKED') {
      return {
        type: 'PROVIDER_NOT_LINKED',
        message: data.message || 'OAuth provider not linked',
        userMessage: `Would you like to link your ${data.newProvider || 'OAuth'} account?`,
        redirectTo: `/auth/link?email=${encodeURIComponent(data.email || '')}&provider=${data.newProvider || ''}`,
        action: 'LINK_ACCOUNT',
      };
    }

    if (data.code === 'PROVIDER_ALREADY_LINKED') {
      return {
        type: 'PROVIDER_ALREADY_LINKED',
        message: data.message || 'OAuth provider already linked',
        userMessage: data.message || 'This account is already linked to another user.',
        action: 'CONTACT_SUPPORT',
      };
    }
  }

  // Network errors (AxiosError without response)
  if (isAxiosError(error) && error.request && !error.response) {
    return {
      type: 'UNKNOWN',
      message: 'Network error',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // Unknown errors
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return {
    type: 'UNKNOWN',
    message: errorMessage,
    userMessage: 'Something went wrong. Please try again.',
  };
}

/**
 * Centralized error notification (can integrate with toast/notification system)
 */
export function notifyAuthError(errorDetails: AuthErrorDetails) {
  // TODO: Integrate with your notification system (toast, modal, etc.)
  console.error('[Auth Error]', errorDetails.type, errorDetails.message);
  
  // For now, just log to console
  // In production, you'd use a toast library like react-hot-toast, sonner, etc.
  // toast.error(errorDetails.userMessage);
}

/**
 * Handle redirect after auth error
 */
export function redirectAfterAuthError(errorDetails: AuthErrorDetails) {
  if (errorDetails.redirectTo && typeof window !== 'undefined') {
    // Save current URL for redirect after login
    if (errorDetails.action === 'LOGIN') {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        sessionStorage.setItem('auth_redirect_after_login', currentPath);
      }
    }

    // Perform redirect
    window.location.href = errorDetails.redirectTo;
  }
}
