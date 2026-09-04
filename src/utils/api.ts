import { ScanResult, UserProfile, DashboardStats } from '../types';

const TOKEN_KEY = 'deepguard_auth_token';
const USER_KEY = 'deepguard_auth_user';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to set auth token:', e);
  }
}

export function getStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.error('Failed to set stored user:', e);
  }
}

export function clearAuthSession(): void {
  setAuthToken(null);
  setStoredUser(null);
}

// Common headers helper
function getHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// 1. Sign Up
export async function apiSignup(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string; email: string; verificationCode?: string }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to create account.');
  }
  return body;
}

// 2. Verify Email
export async function apiVerifyEmail(data: {
  email: string;
  code: string;
}): Promise<{ success: boolean; token: string; user: UserProfile; message: string }> {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Verification failed.');
  }

  if (body.token) {
    setAuthToken(body.token);
    setStoredUser(body.user);
  }
  return body;
}

// 3. Resend Verification
export async function apiResendVerification(email: string): Promise<{ success: boolean; message: string; verificationCode?: string }> {
  const res = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to resend verification.');
  }
  return body;
}

// 4. Login
export async function apiLogin(credentials: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
  emailUnverified?: boolean;
  email?: string;
  verificationCode?: string;
}> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const body = await res.json();
  if (!res.ok) {
    if (res.status === 403 && body.emailUnverified) {
      return {
        success: false,
        error: body.error || 'Please verify your email first.',
        emailUnverified: true,
        email: body.email,
        verificationCode: body.verificationCode,
      };
    }
    throw new Error(body.error || 'Email or password is incorrect.');
  }

  if (body.token) {
    setAuthToken(body.token);
    setStoredUser(body.user);
  }
  return body;
}

// 5. Forgot Password
export async function apiForgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to request password reset.');
  }
  return body;
}

// 6. Reset Password
export async function apiResetPassword(data: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to reset password.');
  }
  return body;
}

// 7. Get Current User Info
export async function apiGetMe(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
      }
      return null;
    }
    const body = await res.json();
    if (body.user) {
      setStoredUser(body.user);
      return body.user;
    }
    return null;
  } catch {
    return getStoredUser();
  }
}

// ==========================================
// USER HISTORY API (Database-Backed & Authenticated)
// ==========================================

export async function apiGetHistory(): Promise<ScanResult[]> {
  const token = getAuthToken();
  if (!token) return [];

  const res = await fetch('/api/history', {
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthSession();
      return [];
    }
    throw new Error('Failed to load analysis history from server.');
  }

  const body = await res.json();
  return body.scans || [];
}

export async function apiSaveHistory(scan: ScanResult): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  const res = await fetch('/api/history', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(scan),
  });

  if (!res.ok) {
    console.warn('Could not save history to database:', await res.text());
  }
}

export async function apiDeleteHistory(id: string): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  const res = await fetch(`/api/history/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return res.ok;
}

export async function apiClearAllHistory(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  const res = await fetch('/api/history', {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return res.ok;
}

export function calculateDashboardStats(scans: ScanResult[]): DashboardStats {
  if (scans.length === 0) {
    return {
      totalScans: 0,
      authenticCount: 0,
      deepfakesCount: 0,
      averageConfidence: 0,
    };
  }

  const totalScans = scans.length;
  const authenticCount = scans.filter(
    (s) => s.verdict === 'REAL_NATURAL' || s.verdict === 'AUTHENTIC' || s.verdict === 'REAL_PHOTOGRAPH'
  ).length;
  const deepfakesCount = scans.filter(
    (s) => s.verdict === 'AI_GENERATED' || s.verdict === 'DEEPFAKE_DETECTED' || s.verdict === 'MANIPULATED'
  ).length;
  const sumConfidence = scans.reduce((acc, curr) => acc + (curr.confidenceScore || 90), 0);
  const averageConfidence = Number((sumConfidence / totalScans).toFixed(1));

  return {
    totalScans,
    authenticCount,
    deepfakesCount,
    averageConfidence,
  };
}
