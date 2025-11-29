import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-6">
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sign Up
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Nexus AI, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of Nexus AI per device for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">4. Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">6. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">7. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at legal@nexus-ai.com
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: November 23, 2025
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}