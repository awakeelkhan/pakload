import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authAPI, setToken, setRefreshToken, removeToken } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'shipper' | 'carrier' | 'admin';
  companyName?: string;
  rating?: number;
  totalRatings?: number;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'shipper' | 'carrier';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google OAuth Client IDs from Google Cloud Console
const GOOGLE_CLIENT_ID = '989798491523-c632kf1kvdpjrpflr75ds0988at8tp.apps.googleusercontent.com'; // Web client ID
const GOOGLE_ANDROID_CLIENT_ID = ''; // Android client ID (create in Google Console for production)
const GOOGLE_IOS_CLIENT_ID = ''; // iOS client ID (create in Google Console for production)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    redirectUri: 'https://auth.expo.io/@anonymous/pakload',
  });

  useEffect(() => {
    loadUser();
  }, []);

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    }
  }, [response]);

  const loadUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Try to refresh user data from API
      try {
        const profile = await authAPI.getProfile();
        if (profile) {
          setUser(profile);
          await SecureStore.setItemAsync('user', JSON.stringify(profile));
        }
      } catch (error) {
        // Token might be expired, user will need to login again
        console.log('Could not refresh user profile');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.accessToken) {
        await setToken(response.accessToken);
      }
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      
      const userData = response.user || response;
      setUser(userData);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    try {
      const response = await authAPI.verifyOtp(phone, otp);
      
      if (response.accessToken) {
        await setToken(response.accessToken);
      }
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      
      const userData = response.user || response;
      setUser(userData);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'OTP verification failed');
    }
  };

  const handleGoogleToken = async (googleAccessToken: string) => {
    try {
      // Send Google token to backend for verification and user creation/login
      const response = await authAPI.googleLogin(googleAccessToken);
      
      if (response.accessToken) {
        await setToken(response.accessToken);
      }
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      
      const userData = response.user || response;
      setUser(userData);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Google login failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      throw new Error('Google login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      
      if (response.accessToken) {
        await setToken(response.accessToken);
      }
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      
      const userData = response.user || response;
      setUser(userData);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state even if API call fails
      await removeToken();
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authAPI.getProfile();
      if (profile) {
        setUser(profile);
        await SecureStore.setItemAsync('user', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithOtp,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
