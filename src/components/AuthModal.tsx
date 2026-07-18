import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [plan, setPlan] = useState<'free' | 'basic' | 'standard' | 'premium'>('free');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    // Check ban simulation
    if (email.toLowerCase().includes('spam') || email.toLowerCase().includes('ban')) {
      setError('This email address has been flagged and suspended for violating our terms of service.');
      return;
    }

    // Simulate login / signup
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      fullName: isSignUp ? fullName : email.split('@')[0],
      plan: plan,
      isBanned: false,
      createdAt: new Date().toISOString(),
      resumesCreatedTodayCount: 0,
      lastResumeCreatedDate: new Date().toISOString()
    };

    setSuccess(isSignUp ? 'Account registered successfully!' : 'Logged in successfully!');
    
    setTimeout(() => {
      onLoginSuccess(mockUser);
      onClose();
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setError('');
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: email || 'zabihullah7235@gmail.com',
      fullName: fullName || 'Zabihullah',
      plan: 'premium', // google login auto awards premium in our beautiful mock
      isBanned: false,
      createdAt: new Date().toISOString(),
      resumesCreatedTodayCount: 0,
      lastResumeCreatedDate: new Date().toISOString()
    };
    setSuccess('Signed in with Google successfully!');
    setTimeout(() => {
      onLoginSuccess(mockUser);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100 transition-all transform scale-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? 'Create your CVForge Account' : 'Welcome back to CVForge'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              {isSignUp ? 'Build professional, high-scoring resumes in minutes' : 'Access your saved resumes and resume templates'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Subscription tier</label>
                <select
                  value={plan}
                  onChange={(e: any) => setPlan(e.target.value)}
                  className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free Tier (1 CV / day)</option>
                  <option value="basic">Basic Tier ($19/mo)</option>
                  <option value="standard">Standard Tier ($29/mo)</option>
                  <option value="premium">Premium Tier ($49/mo)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200/50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSignUp ? 'Register & Begin Building' : 'Sign In'}</span>
            </button>
          </form>

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
            {/* Google Vector Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.33 1.139 15.54 0 12.24 0 5.582 0 0 5.37 0 12s5.582 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline font-bold"
            >
              {isSignUp ? 'Sign In Instead' : 'Register Here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
