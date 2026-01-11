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
      const success = searchParams.get('success');
      const error = searchParams.get('error');
      const linked = searchParams.get('linked');
      const provider = searchParams.get('provider');
      const providerAlreadyLinked = searchParams.get('code') === 'PROVIDER_ALREADY_LINKED';
      const providerAlreadyLinkedMessage = searchParams.get('message');

      // Handle provider already linked to different user
      if (providerAlreadyLinked && providerAlreadyLinkedMessage) {
        // Check if this was user-initiated linking (from profile)
        const wasUserInitiated = sessionStorage.getItem('oauth_linking_initiated') === 'true';
        
        if (wasUserInitiated) {
          // Store error for UserProfile to display
          sessionStorage.setItem('oauth_link_error', providerAlreadyLinkedMessage);
          sessionStorage.removeItem('oauth_linking_initiated');
          router.push('/dashboard?tab=profile');
        } else {
          // Collision-based linking - redirect to login
          router.push(`/login?error=${encodeURIComponent(providerAlreadyLinkedMessage)}`);
        }
        return;
      }

      if (error) {
        console.error('OAuth error:', error);
        router.push('/login?error=' + encodeURIComponent(error));
        return;
      }

      if (success === 'true') {
        // Tokens are in httpOnly cookies - just load user
        try {
          await loadUser();
          
          // If this was a user-initiated linking, store success message
          if (linked === 'true' && provider) {
            const providerName = provider === 'GOOGLE' ? 'Google' : provider === 'GITHUB' ? 'GitHub' : provider;
            sessionStorage.setItem('oauth_link_success', `Successfully linked your ${providerName} account! You can now sign in with ${providerName}.`);
            sessionStorage.removeItem('oauth_linking_initiated');
          }
          
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