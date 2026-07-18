import React from 'react';
import { ShieldCheck, Lock, Sparkles, Mail, KeyRound } from 'lucide-react';
import { User } from '../types';

interface ProtectedViewProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onNavigateTab?: (tab: string) => void;
  premiumRequired?: boolean;
  verifiedRequired?: boolean;
  children: React.ReactNode;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({
  currentUser,
  onOpenLogin,
  onNavigateTab,
  premiumRequired = false,
  verifiedRequired = false,
  children
}) => {
  // 1. Authentication Check
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[70vh] bg-slate-50 text-center animate-fade-in">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Workspace Access Locked</h2>
        <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
          The requested dashboard, templates, and resume building resources require a secure authenticated session.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Secure Log In</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Email Verification Check
  if (verifiedRequired && currentUser.isVerified === false) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[70vh] bg-slate-50 text-center animate-fade-in">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100 animate-pulse">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Verify Your Account</h2>
        <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
          We sent a secure verification email to <strong className="text-slate-700">{currentUser.email}</strong>. 
          Please click the confirmation link in that email to activate premium capabilities.
        </p>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs text-left max-w-md mb-8 leading-normal">
          🔒 <strong className="font-semibold">Security Requirement:</strong> Standard verification prevents bot registrations and protects your personal document data against scraping attempts.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/auth/verify-email', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cvforge_token')}`
                  },
                  body: JSON.stringify({ email: currentUser.email })
                });
                if (res.ok) {
                  alert('✉ Verification email dispatched successfully! Please inspect your spam or inbox folders.');
                } else {
                  alert('Verification request throttled. Please try again in 1 minute.');
                }
              } catch (e) {
                alert('Connection failure. Could not contact secure verification services.');
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>Resend Verification Mail</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Premium Plan Upgrade Check
  if (premiumRequired && currentUser.plan === 'free') {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[70vh] bg-slate-50 text-center animate-fade-in">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-purple-100">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Premium Feature Locked</h2>
        <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
          Accessing multiple parallel templates, our advanced AI content analyzer, and corporate-optimized layouts requires a Pro or Premium license.
        </p>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('pricing')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>View Premium Upgrade Options</span>
          </button>
        )}
      </div>
    );
  }

  // 4. Authorized Access
  return <>{children}</>;
};
