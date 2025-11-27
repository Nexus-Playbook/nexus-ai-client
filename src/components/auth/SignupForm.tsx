'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { RegisterData, Gender } from '@/types';

interface SignupFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function SignupForm({ onSubmit, isLoading, error }: SignupFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    gender: undefined,
    dateOfBirth: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up data - remove empty optional fields
    const cleanData = {
      ...formData,
      phoneNumber: formData.phoneNumber || undefined,
      gender: formData.gender || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
    };

    await onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          error={errors.name}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@example.com"
          error={errors.email}
          required
        />
      </div>

      <Input
        label="Password *"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="••••••••"
        error={errors.password}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phoneNumber || ''}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+1 (555) 123-4567"
          error={errors.phoneNumber}
        />

        <Select
          label="Gender"
          value={formData.gender || ''}
          onChange={(e) => setFormData({ ...formData, gender: (e.target.value as Gender) || undefined })}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
            { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
          ]}
          error={errors.gender}
        />
      </div>

      <Input
        label="Date of Birth"
        type="date"
        value={formData.dateOfBirth || ''}
        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        error={errors.dateOfBirth}
      />

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={formData.termsAccepted}
          onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
          className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I accept the{' '}
          <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.termsAccepted && (
        <p className="text-sm text-red-600">{errors.termsAccepted}</p>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
      >
        Create Account
      </Button>
    </form>
  );
}