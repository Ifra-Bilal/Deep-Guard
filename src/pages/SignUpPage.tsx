import React, { useState } from 'react';
import { PageType, UserProfile } from '../types';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { apiSignup, apiVerifyEmail, apiResendVerification } from '../utils/api';

interface SignUpPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification Screen State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiSignup({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });

      setIsSubmitting(false);
      setIsVerifying(true);
      if (response.verificationCode) {
        setVerificationCode(response.verificationCode);
        setVerificationNotice(`Verification code generated for ${response.email}: ${response.verificationCode}`);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  // Email Verification Submission
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError('Please enter your verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiVerifyEmail({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim(),
      });

      setIsSubmitting(false);
      onLoginSuccess(result.user);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Invalid or expired verification code.');
    }
  };

  // Resend Verification Email
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

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-[#050B1A]">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="rounded-2xl bg-[#0B1628] border border-slate-700/80 p-8 shadow-2xl relative">
          
          {/* Top Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 mb-4">
              <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            
            {!isVerifying ? (
              <>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Create Your Account
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Start verifying digital media with confidence.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Verify Your Email
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Please verify your email to continue.
                </p>
              </>
            )}
          </div>

          {/* Validation / Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Resend Notification */}
          {resendStatus && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* STEP 1: REGISTRATION FORM */}
          {!isVerifying ? (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    required
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07111F] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          ) : (
            /* STEP 2: EMAIL VERIFICATION STEP */
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              
              <div className="p-4 rounded-xl bg-[#07111F] border border-blue-500/30 text-center">
                <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">
                  We sent a 6-digit verification code to:
                </p>
                <p className="text-sm font-bold text-white mt-0.5">{email}</p>
              </div>

              {verificationNotice && (
                <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-500/40 text-cyan-300 text-xs text-center font-mono">
                  {verificationNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="verify-code-input">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="verify-code-input"
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
                id="verify-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  onClick={() => setIsVerifying(false)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to edit</span>
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

          {/* Footer Link to Login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              id="signup-to-login-link"
              onClick={() => onNavigate('login')}
              className="font-semibold text-cyan-400 hover:underline"
            >
              Sign In
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
