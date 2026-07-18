import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, X, ShieldAlert, CheckCircle, Globe, Phone, User as UserIcon, RefreshCw, KeyRound } from 'lucide-react';
import { User } from '../types';
import { auth } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  
  // Registration and login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'business' | 'enterprise'>('free');

  // Forgot / Reset password fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field Validations
    if (authMode === 'login') {
      if (!email || !password) {
        setError('Please enter both your email address and password.');
        return;
      }
    } else if (authMode === 'signup') {
      if (!fullName || !username || !email || !password || !confirmPassword) {
        setError('All required fields (*) must be provided.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify passwords.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long for security.');
        return;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }
    } else if (authMode === 'forgot') {
      if (!email) {
        setError('Please specify your registered email address.');
        return;
      }
    } else if (authMode === 'reset') {
      if (!resetToken || !newPassword) {
        setError('Both the reset token and new password are required.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authMode === 'signup') {
        const result = await auth.createUserWithEmailAndPassword(
          email,
          password,
          fullName,
          username,
          country,
          phone
        );
        
        setSuccess('Welcome to CVForge! Verification mail has been dispatched.');
        setTimeout(() => {
          onLoginSuccess(result.customProfile, result.token);
          onClose();
        }, 1500);

      } else if (authMode === 'login') {
        const result = await auth.signInWithEmailAndPassword(email, password);
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onLoginSuccess(result.customProfile, result.token);
          onClose();
        }, 1000);

      } else if (authMode === 'forgot') {
        const result = await auth.sendPasswordResetEmail(email);
        setSuccess('Password reset link generated! We have copied the token to the form below.');
        setTimeout(() => {
          setResetToken(result.resetToken || '');
          setAuthMode('reset');
          setSuccess('');
        }, 3000);

      } else if (authMode === 'reset') {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetToken, newPassword })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Password reset failed.');
        }
        setSuccess('Password successfully reset! You can now log in.');
        setTimeout(() => {
          setAuthMode('login');
          setSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const emailVal = email || 'zabihullah7235@gmail.com';
      const nameVal = fullName || 'Zabihullah Master';
      const result = await auth.signInWithPopupGoogle(emailVal, nameVal);

      setSuccess('Google account synchronized successfully!');
      setTimeout(() => {
        onLoginSuccess(result.customProfile, result.token);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Google Auth Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-slate-100 transition-all my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 max-h-[85vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {authMode === 'signup' && 'Create your CVForge Account'}
              {authMode === 'login' && 'Welcome back to CVForge'}
              {authMode === 'forgot' && 'Forgot Password'}
              {authMode === 'reset' && 'Reset your Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              {authMode === 'signup' && 'Register now to build professional, high-scoring resumes'}
              {authMode === 'login' && 'Access your resumes, metrics, and templates'}
              {authMode === 'forgot' && 'Request a secure verification code to reset access'}
              {authMode === 'reset' && 'Choose a strong, unique password'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* LOGIN & SIGNUP BOTH NEED EMAIL */}
            {authMode !== 'reset' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* LOGIN & SIGNUP BOTH NEED PASSWORD (EXCEPT FORGOT) */}
            {(authMode === 'login' || authMode === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setAuthMode('forgot');
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* SIGNUP SPECIFIC FIELDS */}
            {authMode === 'signup' && (
              <div className="space-y-4 pt-1 border-t border-slate-100 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Globe className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="United States"
                        className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subscription Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={plan}
                      onChange={(e: any) => setPlan(e.target.value)}
                      className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="free">Free Tier (1 CV limit)</option>
                      <option value="basic">Basic ($19/mo)</option>
                      <option value="pro">Pro ($29/mo)</option>
                      <option value="business">Business ($49/mo)</option>
                      <option value="enterprise">Enterprise ($99/mo)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* RESET PASSWORD FIELDS */}
            {authMode === 'reset' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reset Verification Token <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste your generated token here"
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Choose New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200/50 disabled:bg-blue-400"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>
                {authMode === 'login' && 'Sign In'}
                {authMode === 'signup' && 'Register & Begin Building'}
                {authMode === 'forgot' && 'Generate Reset Token'}
                {authMode === 'reset' && 'Update Password'}
              </span>
            </button>
          </form>

          {/* GOOGLE INTEGRATION DIVISION */}
          {(authMode === 'login' || authMode === 'signup') && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white px-2">
                  Or Connect With
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.33 1.139 15.54 0 12.24 0 5.582 0 0 5.37 0 12s5.582 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          <div className="mt-6 text-center text-xs">
            {authMode === 'login' && (
              <>
                <span className="text-slate-500">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setAuthMode('signup');
                  }}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Register Here
                </button>
              </>
            )}

            {authMode === 'signup' && (
              <>
                <span className="text-slate-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setAuthMode('login');
                  }}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Sign In Instead
                </button>
              </>
            )}

            {(authMode === 'forgot' || authMode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setAuthMode('login');
                }}
                className="text-blue-600 hover:underline font-bold text-xs"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
