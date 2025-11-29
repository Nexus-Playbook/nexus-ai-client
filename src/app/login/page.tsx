'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LoginCredentials } from '@/types';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials: LoginCredentials) => {
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
            Sign in to your account
          </p>
        </div>

        {/* OAuth Buttons */}
        <OAuthButtons />

        {/* Login Form */}
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />

        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}

