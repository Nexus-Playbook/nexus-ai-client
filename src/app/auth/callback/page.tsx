'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        router.push('/login?error=' + encodeURIComponent(error));
        return;
      }

      if (token && refreshToken) {
        // Store tokens from OAuth callback
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Load user data
        try {
          await loadUser();
          router.push('/dashboard');
        } catch (error) {
          console.error('Failed to load user after OAuth:', error);
          router.push('/login?error=Failed to complete authentication');
        }
      } else {
        router.push('/login?error=Invalid authentication response');
      }
    };

    handleAuthCallback();
  }, [searchParams, router, loadUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}