import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'email' ? { email } : { phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset instructions');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('forgotPassword.checkInbox', 'Check Your Inbox')}
          </h2>
          <p className="text-gray-600 mb-6">
            {method === 'email'
              ? t('forgotPassword.emailSent', 'We have sent password reset instructions to your email address.')
              : t('forgotPassword.smsSent', 'We have sent a verification code to your phone number.')}
          </p>
          <Link href="/signin">
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
              {t('forgotPassword.backToSignIn', 'Back to Sign In')}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link href="/signin" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('forgotPassword.backToSignIn', 'Back to Sign In')}
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('forgotPassword.title', 'Forgot Password?')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('forgotPassword.subtitle', "No worries, we'll send you reset instructions.")}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                method === 'email'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('auth.email', 'Email')}
            </button>
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                method === 'phone'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('auth.phone', 'Phone')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {method === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.emailAddress', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="ahmed@example.com"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phoneNumber', 'Phone Number')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading
                ? t('forgotPassword.sending', 'Sending...')
                : t('forgotPassword.resetPassword', 'Reset Password')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('forgotPassword.rememberPassword', 'Remember your password?')}{' '}
            <Link href="/signin" className="text-green-600 hover:underline font-semibold">
              {t('auth.signIn', 'Sign In')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
