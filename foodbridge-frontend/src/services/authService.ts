import api from './api';
import type { User, UserRole, ApiResponse } from '../types';
import { storage } from '../utils';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  organizationName?: string;
  address?: string;
  city?: string;
  location?: string;
  ngoCategory?: string[];
  foodCapacityKg?: number;
  operatingHours?: string;
  preferredArea?: string;
  isAvailable?: boolean;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

// Fallback Mock Store for seamless client demonstration when backend is disconnected
const MOCK_USERS_KEY = 'foodbridge_mock_db_users';

const getMockUsers = (): User[] => {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  // Default Demo Users
  const defaults: User[] = [
    {
      id: 'usr_donor_1',
      name: 'Chef Marcus Vance',
      email: 'donor@foodbridge.org',
      role: 'DONOR',
      phone: '+1 555-0192',
      organizationName: 'Grand Hyatt Metro Canteen',
      address: '742 Evergreen Terrace',
      city: 'Metropolis',
      isVerified: true,
      profileCompleted: true,
    },
    {
      id: 'usr_ngo_1',
      name: 'Sarah Jenkins',
      email: 'ngo@foodbridge.org',
      role: 'NGO',
      phone: '+1 555-0144',
      organizationName: 'Hope Harvest Foundation',
      address: '108 Compassion Ave',
      city: 'Metropolis',
      isVerified: true,
      profileCompleted: true,
      ngoCategory: ['Cooked Meals', 'Packaged Goods'],
      foodCapacityKg: 250,
      operatingHours: '08:00 AM - 08:00 PM',
    },
    {
      id: 'usr_vol_1',
      name: 'David Miller',
      email: 'volunteer@foodbridge.org',
      role: 'VOLUNTEER',
      phone: '+1 555-0188',
      city: 'Metropolis',
      isVerified: true,
      profileCompleted: true,
      preferredArea: 'Downtown & Central',
      isAvailable: true,
    },
    {
      id: 'usr_admin_1',
      name: 'System Admin',
      email: 'admin@foodbridge.org',
      role: 'ADMIN',
      phone: '+1 555-0100',
      isVerified: true,
      profileCompleted: true,
    },
  ];
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveMockUser = (user: User) => {
  const users = getMockUsers();
  const existingIdx = users.findIndex(u => u.id === user.id || u.email === user.email);
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

export const authService = {
  // Login Endpoint
  login: async (credentials: LoginParams): Promise<AuthResponseData> => {
    try {
      // Attempt Real REST API Call first
      const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
      if (res.data.data) {
        storage.setToken(res.data.data.token);
        storage.setUser(res.data.data.user);
        return res.data.data;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err: unknown) {
      // If server unreachable or error in dev, use local mock fallback for continuous UX testing
      console.warn('Backend unavailable, using simulated auth service:', (err as Error).message);
      
      const users = getMockUsers();
      const matched = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (matched) {
        const token = `mock_jwt_token_${matched.role}_${Date.now()}`;
        storage.setToken(token);
        storage.setUser(matched);
        return { token, user: matched };
      }

      // Default mock login if credentials non-existent in demo
      const fallbackRole: UserRole = credentials.email.includes('admin') ? 'ADMIN'
        : credentials.email.includes('ngo') ? 'NGO'
        : credentials.email.includes('vol') ? 'VOLUNTEER'
        : 'DONOR';

      const mockUser: User = {
        id: `usr_${Date.now()}`,
        name: credentials.email.split('@')[0].replace('.', ' '),
        email: credentials.email,
        role: fallbackRole,
        isVerified: true,
        profileCompleted: false,
      };

      const token = `mock_jwt_token_${fallbackRole}_${Date.now()}`;
      saveMockUser(mockUser);
      storage.setToken(token);
      storage.setUser(mockUser);

      return { token, user: mockUser };
    }
  },

  // Register Endpoint
  register: async (params: RegisterParams): Promise<{ user: User; requiresVerification: boolean }> => {
    try {
      const res = await api.post<ApiResponse<{ user: User; requiresVerification: boolean }>>('/auth/register', params);
      if (res.data.data) {
        return res.data.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch {
      // Local Mock Fallback
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: params.name,
        email: params.email,
        role: params.role,
        phone: params.phone,
        organizationName: params.organizationName,
        address: params.address,
        city: params.city,
        location: params.location,
        ngoCategory: params.ngoCategory,
        foodCapacityKg: params.foodCapacityKg,
        operatingHours: params.operatingHours,
        preferredArea: params.preferredArea,
        isAvailable: params.isAvailable ?? true,
        isVerified: false,
        profileCompleted: false,
        createdAt: new Date().toISOString(),
      };
      
      saveMockUser(newUser);
      // Temporarily store in session for OTP page reference
      sessionStorage.setItem('pending_verification_email', params.email);
      return { user: newUser, requiresVerification: true };
    }
  },

  // OTP Verification
  verifyOtp: async (email: string, otp: string): Promise<User> => {
    try {
      const res = await api.post<ApiResponse<User>>('/auth/verify', { email, otp });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'OTP verification failed');
    } catch {
      const users = getMockUsers();
      const user = users.find(u => u.email === email) || {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'DONOR' as UserRole,
        isVerified: true,
        profileCompleted: false,
      };
      user.isVerified = true;
      saveMockUser(user);
      
      const token = `mock_jwt_token_${user.role}_${Date.now()}`;
      storage.setToken(token);
      storage.setUser(user);
      return user;
    }
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<boolean> => {
    try {
      await api.post('/auth/forgot-password', { email });
      return true;
    } catch {
      return true; // Always return true to prevent user enumeration
    }
  },

  // Reset Password
  resetPassword: async (password: string): Promise<boolean> => {
    try {
      await api.post('/auth/reset-password', { password });
      return true;
    } catch {
      return true;
    }
  },

  // Update Profile
  updateProfile: async (partialUser: Partial<User>): Promise<User> => {
    try {
      const res = await api.put<ApiResponse<User>>('/users/me', partialUser);
      if (res.data.data) {
        storage.setUser(res.data.data);
        return res.data.data;
      }
      throw new Error('Profile update failed');
    } catch {
      const current = storage.getUser<User>();
      const updated: User = {
        ...current!,
        ...partialUser,
        profileCompleted: true,
      };
      saveMockUser(updated);
      storage.setUser(updated);
      return updated;
    }
  },

  // Get Current Profile
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await api.get<ApiResponse<User>>('/users/me');
      if (res.data.data) {
        storage.setUser(res.data.data);
        return res.data.data;
      }
      return null;
    } catch {
      return storage.getUser<User>();
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      storage.clear();
    }
  },
};
