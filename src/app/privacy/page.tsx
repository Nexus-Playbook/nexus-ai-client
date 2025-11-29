import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function PrivacyPage() {
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account, update your profile, or contact us.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not share, sell, rent, or trade your personal information with third parties for commercial purposes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">7. Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@nexus-ai.com
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