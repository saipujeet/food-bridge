// Storage Keys
const TOKEN_KEY = 'foodbridge_jwt_token';
const USER_KEY = 'foodbridge_user_data';

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),

  getUser: <T>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser: <T>(user: T): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: (): void => localStorage.removeItem(USER_KEY),

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Password Strength Checker
export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label: PasswordStrength['label'] = 'Very Weak';
  if (score === 2) label = 'Weak';
  else if (score === 3) label = 'Medium';
  else if (score === 4) label = 'Strong';
  else if (score === 5) label = 'Very Strong';

  return {
    score,
    label,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
};

// Format time remaining
export const formatTimeRemaining = (expiryHours: number = 4, createdAtStr: string): string => {
  const created = new Date(createdAtStr).getTime();
  const expiryTime = created + expiryHours * 60 * 60 * 1000;
  const now = new Date().getTime();
  const diffMs = expiryTime - now;

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
};

// Simple Email Regex Validation
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Simple Phone Regex Validation
export const isValidPhone = (phone: string): boolean => {
  return /^\+?[0-9\s\-()]{7,15}$/.test(phone);
};
