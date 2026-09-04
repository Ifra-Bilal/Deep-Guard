import React, { useState } from 'react';
import { PageType, UserProfile } from '../types';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { 
  apiLogin, 
  apiForgotPassword, 
  apiResetPassword, 
  apiVerifyEmail, 
  apiResendVerification 
} from '../utils/api';

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

type LoginViewMode = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<LoginViewMode>('LOGIN');

  // Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot / Reset Password State
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiLogin({
        email: email.trim().toLowerCase(),
        password,
      });

      setIsSubmitting(false);

      if (res.emailUnverified) {
        setViewMode('VERIFY_EMAIL');
        if (res.verificationCode) {
          setVerificationCode(res.verificationCode);
          setVerificationNotice(`Verification code: ${res.verificationCode}`);
        }
        setError('Please verify your email first.');
        return;
      }

      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Email or password is incorrect.');
    }
  };

  // 2. Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiForgotPassword(email.trim().toLowerCase());
      setIsSubmitting(false);
      setSuccessMessage('Password reset link has been sent to your email.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setResetNotice(`Password reset code: ${res.resetToken}`);
      }
      setViewMode('RESET_PASSWORD');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  // 3. Handle Reset Password Confirmation
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!resetToken.trim()) {
      setError('Please enter your reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiResetPassword({
        token: resetToken.trim(),
        newPassword,
        confirmPassword: confirmNewPassword,
      });

      setIsSubmitting(false);
      setSuccessMessage(res.message || 'Password reset successfully. You can now log in with your new password.');
      setPassword('');
      setViewMode('LOGIN');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to reset password.');
    }
  };

  // 4. Handle Verify Email Submit
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError('Please enter your verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiVerifyEmail({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim(),
      });

      setIsSubmitting(false);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Invalid or expired verification code.');
    }
  };

  // 5. Handle Resend Verification
  const handleResendVerification = async () => {
    setError(null);
    setResendStatus(null);
    try {
      const res = await apiResendVerification(email.trim().toLowerCase());
      setResendStatus('A new verification email has been sent.');
      if (res.verificationCode) {
        setVerificationCode(res.verificationCode);
        setVerificationNotice(`New verification code: ${res.verificationCode}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    }
  };

  // 6. Quick Demo Login Buttons (Using real database credentials to show authentic separation!)
  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiLogin({ email: demoEmail, password: demoPass });
      setIsSubmitting(false);
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-[#050B1A]">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="rounded-2xl bg-[#0B1628] border border-slate-700/80 p-8 shadow-2xl relative">
          
          {/* Top Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 mb-4">
              <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            {viewMode === 'LOGIN' && (
              <>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Verify what you see. Trust what you know.
                </p>
              </>
            )}

            {viewMode === 'FORGOT_PASSWORD' && (
              <>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Reset Password
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Enter your email to receive a password reset code.
                </p>
              </>
            )}

            {viewMode === 'RESET_PASSWORD' && (
              <>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Set New Password
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Create a new secure password for your account.
                </p>
              </>
            )}

            {viewMode === 'VERIFY_EMAIL' && (
              <>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Email Verification
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Please verify your email to continue.
                </p>
              </>
            )}
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Resend Status */}
          {resendStatus && (
            <div className="mb-6 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/50 text-cyan-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 1: STANDARD LOGIN FORM */}
          {/* ============================================================ */}
          {viewMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMessage(null);
                      setViewMode('FORGOT_PASSWORD');
                    }}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#07111F] border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs text-slate-300">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo 1-Click Login (Pre-seeded DB Accounts) */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[11px] font-mono text-slate-400 text-center mb-2">
                  Instant Test Accounts (Strict History Separation):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('alex.morgan@deepguard.ai', 'Investigator123!')}
                    className="py-2 px-2.5 rounded-lg text-xs font-semibold text-cyan-300 bg-blue-950/60 border border-blue-500/30 hover:bg-blue-900/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Alex Morgan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('sarah.connor@deepguard.ai', 'Investigator123!')}
                    className="py-2 px-2.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Sarah Connor</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: FORGOT PASSWORD REQUEST */}
          {/* ============================================================ */}
          {viewMode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="forgot-email">
                  Enter Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setViewMode('LOGIN');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: RESET PASSWORD CONFIRMATION */}
          {/* ============================================================ */}
          {viewMode === 'RESET_PASSWORD' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              
              {resetNotice && (
                <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-500/40 text-cyan-300 text-xs text-center font-mono">
                  {resetNotice}
                </div>
              )}

              {/* Reset Token Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="reset-token-input">
                  Password Reset Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-token-input"
                    type="text"
                    required
                    placeholder="Enter reset code"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="new-password-input">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="new-password-input"
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="confirm-new-password-input">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-new-password-input"
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save New Password & Sign In</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setViewMode('LOGIN');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: VERIFY EMAIL SCREEN (Triggered if unverified on login) */}
          {/* ============================================================ */}
          {viewMode === 'VERIFY_EMAIL' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              
              <div className="p-4 rounded-xl bg-[#07111F] border border-blue-500/30 text-center">
                <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">
                  Please verify your email to continue:
                </p>
                <p className="text-sm font-bold text-white mt-0.5">{email}</p>
              </div>

              {verificationNotice && (
                <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-500/40 text-cyan-300 text-xs text-center font-mono">
                  {verificationNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-verify-code">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="login-verify-code"
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm font-mono text-center tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Email & Continue</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setViewMode('LOGIN');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Email</span>
                </button>
              </div>

            </form>
          )}

          {/* Footer Link to Sign Up */}
          {viewMode === 'LOGIN' && (
            <div className="mt-6 text-center text-xs text-slate-400">
              Don’t have an account?{' '}
              <button
                id="login-to-signup-link"
                onClick={() => onNavigate('signup')}
                className="font-semibold text-cyan-400 hover:underline"
              >
                Create one
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
