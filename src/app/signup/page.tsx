'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Card } from '@/components/ui/Card';
import { SignupForm } from '@/components/auth/SignupForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { RegisterData } from '@/types';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (data: RegisterData) => {
    setError('');
    setIsLoading(true);

    try {
      await register(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } })
        : null;
      const errorMessage = error?.response?.data?.message || 'Registration failed. Please try again.';
      
      // Check if it's an OAuth email collision error
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.code === 'EMAIL_EXISTS_OAUTH') {
          // Redirect to link page or show helpful message
          const provider = parsed.existingProvider?.toLowerCase() || 'oauth';
          setError(
            `This email is already registered with ${parsed.existingProvider}. ` +
            `Please sign in with ${parsed.existingProvider} or use the OAuth button above to link your account.`
          );
          return;
        }
      } catch {
        // Not a JSON error, use the message as-is
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nexus AI</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new account
          </p>
        </div>

        {/* OAuth Buttons */}
        <OAuthButtons />

        {/* Signup Form */}
        <SignupForm
          onSubmit={handleRegister}
          isLoading={isLoading}
          error={error}
        />

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}