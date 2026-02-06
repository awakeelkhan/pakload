import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface AuthGuardOptions {
  redirectTo?: string;
  showAlert?: boolean;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  
  const { redirectTo = '/signin', showAlert = true } = options;

  const requireAuth = (callback?: () => void): boolean => {
    if (!isAuthenticated) {
      if (showAlert) {
        alert(t('auth.loginRequired', 'Please sign in to continue'));
      }
      navigate(redirectTo);
      return false;
    }
    if (callback) {
      callback();
    }
    return true;
  };

  const requireRole = (requiredRole: string | string[], callback?: () => void): boolean => {
    if (!isAuthenticated) {
      if (showAlert) {
        alert(t('auth.loginRequired', 'Please sign in to continue'));
      }
      navigate(redirectTo);
      return false;
    }
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user?.role || !roles.includes(user.role)) {
      if (showAlert) {
        alert(t('auth.unauthorized', 'You do not have permission to perform this action'));
      }
      return false;
    }
    
    if (callback) {
      callback();
    }
    return true;
  };

  return {
    isAuthenticated,
    user,
    requireAuth,
    requireRole,
  };
}

export default useAuthGuard;
