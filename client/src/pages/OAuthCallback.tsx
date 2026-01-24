import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const { socialLogin } = useAuth();

  useEffect(() => {
    // Get tokens from URL params
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // Fetch user data and login
      fetchUserAndLogin(accessToken);
    } else {
      // No tokens, redirect to signin
      navigate('/signin?error=oauth_failed');
    }
  }, []);

  const fetchUserAndLogin = async (accessToken: string) => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Update auth context with socialLogin
        socialLogin(userData, accessToken);
        navigate('/dashboard');
      } else {
        navigate('/signin?error=oauth_failed');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      navigate('/signin?error=oauth_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="text-gray-600 mt-2">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}
