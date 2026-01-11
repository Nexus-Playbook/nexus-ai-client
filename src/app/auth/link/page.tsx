'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function LinkPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');
  
  const email = searchParams.get('email');
  const existingProvider = searchParams.get('existingProvider');
  const newProvider = searchParams.get('newProvider');

  useEffect(() => {
    if (!email || !existingProvider || !newProvider) {
      router.push('/login?error=Invalid linking request');
    }
  }, [email, existingProvider, newProvider, router]);

  const handleLinkAccounts = async () => {
    setError('');
    setIsLinking(true);

    try {
      // SECURITY: Use POST to prevent CSRF attacks (GET with state changes is vulnerable)
      // POST to collision-based linking endpoint which sets consent cookie and redirects to OAuth
      const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3001';
      const providerLower = newProvider?.toLowerCase() || '';
      const linkUrl = `${authApiUrl}/auth/${providerLower}/link/collision`;
      
      // Use form POST to follow redirect naturally (OAuth flow requires browser redirect)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = linkUrl;
      form.style.display = 'none';
      
      // Add email as hidden input for collision-based linking
      const emailInput = document.createElement('input');
      emailInput.type = 'hidden';
      emailInput.name = 'email';
      emailInput.value = email || '';
      form.appendChild(emailInput);
      
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError('Failed to link accounts. Please try again.');
      setIsLinking(false);
    }
  };

  const handleUseExisting = () => {
    // Redirect to login with the existing provider
    router.push(`/login?provider=${existingProvider}`);
  };

  if (!email) {
    return null;
  }

  const providerDisplayNames: Record<string, string> = {
    GOOGLE: 'Google',
    GITHUB: 'GitHub',
    EMAIL: 'Email/Password'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Link Accounts</h1>
          <p className="mt-2 text-sm text-gray-600">
            {email}
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This email is already registered with{' '}
              <span className="font-semibold">
                {providerDisplayNames[existingProvider || ''] || existingProvider}
              </span>
              .
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Would you like to link your{' '}
              <span className="font-semibold">
                {providerDisplayNames[newProvider || ''] || newProvider}
              </span>{' '}
              account for easier sign-in?
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleLinkAccounts}
            disabled={isLinking}
            className="w-full"
          >
            {isLinking ? 'Linking...' : `Link ${providerDisplayNames[newProvider || '']} Account`}
          </Button>

          <Button
            onClick={handleUseExisting}
            variant="outline"
            disabled={isLinking}
            className="w-full"
          >
            Sign in with {providerDisplayNames[existingProvider || '']} instead
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By linking accounts, you&apos;ll be able to sign in with either{' '}
            {providerDisplayNames[existingProvider || '']} or{' '}
            {providerDisplayNames[newProvider || '']}.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LinkPageContent />
    </Suspense>
  );
}
