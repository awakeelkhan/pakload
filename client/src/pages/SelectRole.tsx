import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Truck, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SelectRole() {
  const [, navigate] = useLocation();
  const { user, updateUser, socialLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Store tokens from URL on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token', accessToken);
      
      // Fetch user data
      fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(userData => {
          socialLogin(userData, accessToken);
        })
        .catch(err => console.error('Failed to fetch user:', err));
    }
  }, []);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        updateUser({ role: selectedRole });
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'shipper',
      title: 'Shipper',
      description: 'I need to ship goods and find carriers',
      icon: Package,
      color: 'blue',
    },
    {
      id: 'carrier',
      title: 'Carrier',
      description: 'I have trucks and want to find loads',
      icon: Truck,
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to PakLoad!</h2>
            <p className="mt-2 text-gray-600">
              {user?.firstName ? `Hi ${user.firstName}, ` : ''}Please select how you want to use PakLoad
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedRole === role.id
                    ? role.color === 'blue'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <role.icon
                  className={`w-12 h-12 mb-4 ${
                    selectedRole === role.id
                      ? role.color === 'blue'
                        ? 'text-blue-600'
                        : 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            You can change your role later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
