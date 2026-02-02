import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Production API URL - change this to your EC2 instance
export const API_BASE_URL = 'http://ec2-13-50-123-3.eu-north-1.compute.amazonaws.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('access_token');
  } catch {
    return null;
  }
};

// Market Requests API
export const marketRequestsAPI = {
  getMyRequests: async (params?: { status?: string; fulfillmentStatus?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/api/market-requests/my-requests', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/market-requests/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/market-requests', data);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.post(`/api/market-requests/${id}/cancel`);
    return response.data;
  },
};

// Documents API (KYC)
export const documentsAPI = {
  getMyDocuments: async () => {
    const response = await api.get('/api/documents/my-documents');
    return response.data;
  },

  uploadDocument: async (data: {
    documentType: string;
    documentNumber?: string;
    documentUrl: string;
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
  }) => {
    const response = await api.post('/api/documents/upload', data);
    return response.data;
  },
};

export const setToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync('access_token', token);
};

export const removeToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('access_token');
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('refresh_token');
  } catch {
    return null;
  }
};

export const setRefreshToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync('refresh_token', token);
};

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login to:', API_BASE_URL + '/api/v1/auth/login');
      const response = await api.post('/api/v1/auth/login', { email, password });
      console.log('Login response:', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.message);
      console.error('Login error response:', error.response?.data);
      throw error;
    }
  },
  
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: 'shipper' | 'carrier';
  }) => {
    // Split fullName into firstName and lastName for server compatibility
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    try {
      console.log('Attempting registration to:', API_BASE_URL + '/api/v1/auth/register');
      const response = await api.post('/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        phone: data.phone,
        role: data.role,
      });
      console.log('Register response:', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.message);
      console.error('Register error response:', error.response?.data);
      throw error;
    }
  },
  
  requestOtp: async (phone: string) => {
    const response = await api.post('/api/v1/auth/otp/request', { phone });
    return response.data;
  },
  
  verifyOtp: async (phone: string, otp: string) => {
    const response = await api.post('/api/v1/auth/otp/verify', { phone, otp });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
  
  logout: async () => {
    await removeToken();
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
  },
  
  googleLogin: async (googleAccessToken: string) => {
    const response = await api.post('/api/v1/auth/google', { accessToken: googleAccessToken });
    return response.data;
  },
};

// Loads API
export const loadsAPI = {
  _normalizeLoadsResponse: (responseData: any) => {
    const payload = responseData?.loads ?? responseData?.data ?? responseData;
    if (!Array.isArray(payload)) return [];
    // /api/v2/loads returns [{ load, shipper }]
    return payload.map((item: any) => {
      if (item?.load) {
        return {
          ...item.load,
          shipper: item.shipper,
        };
      }
      return item;
    });
  },

  getAll: async (params?: {
    origin?: string;
    destination?: string;
    cargoType?: string;
    minWeight?: number;
    maxWeight?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/api/v2/loads', { params });
    return {
      ...response.data,
      loads: loadsAPI._normalizeLoadsResponse(response.data),
    };
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/v2/loads/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/v2/loads', data);
    return response.data;
  },
  
  search: async (query: string) => {
    const response = await api.get('/api/v2/loads', { params: { search: query } });
    return {
      ...response.data,
      loads: loadsAPI._normalizeLoadsResponse(response.data),
    };
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    const response = await api.get('/api/bookings');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },
  
  getByTrackingNumber: async (trackingNumber: string) => {
    const response = await api.get(`/api/bookings/track/${trackingNumber}`);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/bookings/${id}/status`, { status });
    return response.data;
  },
};

// Quotes/Bids API
export const quotesAPI = {
  create: async (data: {
    loadId: number;
    carrierId?: number;
    quotedPrice: number;
    estimatedDays: number;
    message?: string;
    pickupDate?: string;
  }) => {
    const response = await api.post('/api/quotes', data);
    return response.data;
  },
  
  getByLoad: async (loadId: number) => {
    const response = await api.get(`/api/quotes/load/${loadId}`);
    return response.data;
  },
  
  accept: async (quoteId: number) => {
    const response = await api.post(`/api/quotes/${quoteId}/accept`);
    return response.data;
  },
  
  reject: async (quoteId: number) => {
    const response = await api.post(`/api/quotes/${quoteId}/reject`);
    return response.data;
  },
  
  getMyBids: async () => {
    const response = await api.get('/api/my-bids');
    return response.data;
  },
};

// Vehicles API
export const vehiclesAPI = {
  getAll: async () => {
    const response = await api.get('/api/vehicles');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/vehicles/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/vehicles', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/api/vehicles/${id}`, data);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (unreadOnly?: boolean) => {
    const response = await api.get('/api/notifications', {
      params: { unread_only: unreadOnly },
    });
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await api.get('/api/notifications/count');
    return response.data;
  },
  
  markAsRead: async (id: number) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.post('/api/notifications/read-all');
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getDashboard: async () => {
    const response = await api.get('/api/stats/dashboard');
    return response.data;
  },
  
  getPlatform: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export default api;
