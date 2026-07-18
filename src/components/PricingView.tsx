import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Loader2, ArrowRight, HelpCircle } from 'lucide-react';
import { User } from '../types';

interface PricingViewProps {
  currentUser: User | null;
  onUpgradeSuccess: (newPlan: 'free' | 'basic' | 'standard' | 'premium') => void;
  onOpenLogin: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  currentUser,
  onUpgradeSuccess,
  onOpenLogin,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  const handleCheckout = async (plan: 'basic' | 'standard' | 'premium') => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setIsCheckingOut(plan);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billing: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const data = await response.json();

      // Simulate clean popup checkout & success payment trigger
      setTimeout(() => {
        setIsCheckingOut(null);
        onUpgradeSuccess(plan);
        alert(`Success! Mock Stripe Checkout Complete. You have been successfully upgraded to the CVForge ${plan.toUpperCase()} tier!`);
      }, 1500);

    } catch (error) {
      console.error('Checkout error:', error);
      setIsCheckingOut(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      period: 'forever',
      desc: 'Simple, quick, and offline-first CV building.',
      features: [
        'Exactly 1 resume per day limit',
        'Can edit the resume exactly once',
        'Standard Slate template only',
        'Basic print options',
      ],
      cta: 'Current Subscription',
      available: currentUser?.plan === 'free' || !currentUser,
    },
    {
      id: 'basic',
      name: 'Basic',
      price: isAnnual ? 15 : 19,
      period: 'month',
      desc: 'Supercharge your formatting and edit boundaries.',
      features: [
        '3–6 resumes per day creation',
        'Unlimited real-time edits',
        'Access 3 key layouts (Slate, Classic, ATS)',
        'Standard PDF download formats',
        'Standard spellchecking suggestions',
      ],
      cta: 'Purchase Basic Tier',
      available: currentUser?.plan !== 'basic',
    },
    {
      id: 'standard',
      name: 'Standard Pro',
      price: isAnnual ? 22 : 29,
      period: 'month',
      desc: 'Advanced recruiter tools and full custom template libraries.',
      features: [
        '10–12 resumes per day creation',
        'Access to all 5 professional templates',
        'Priority Gemini AI Bullet Optimizer',
        'Multi-format export (PDF + Plain Text)',
        'Live expert chat recommendations',
      ],
      cta: 'Upgrade to Standard Pro',
      available: currentUser?.plan !== 'standard',
    },
    {
      id: 'premium',
      name: 'Premium Expert',
      price: isAnnual ? 38 : 49,
      period: 'month',
      desc: 'Complete portfolio solutions and AI headshot automation.',
      features: [
        'Unlimited resumes generated',
        'Unlimited edits and duplicates',
        'Access to all present & future template layouts',
        'Gemini 3 Pro high-quality Image Generator (4K)',
        'Full-turn Gemini career chatbot advisor',
        'Early access to beta templates & formatting blocks',
      ],
      cta: 'Unlock Premium VIP',
      available: currentUser?.plan !== 'premium',
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          SaaS Subscriptions & Packages
        </h2>
        <p className="text-slate-500 text-xs">
          Invest in your professional identity with a plan designed for structural career growth.
        </p>

        {/* Annual Discount Toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-xs font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly Billing</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-blue-600 p-1 flex items-center transition relative cursor-pointer"
          >
            <div className={`w-4 h-4 rounded-full bg-white transition transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${isAnnual ? 'text-blue-600' : 'text-slate-400'}`}>
            <span>Annual Billing (Save 25%)</span>
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-200">
              Promo
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = currentUser?.plan === p.id || (!currentUser && p.id === 'free');
          
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-6 border text-left flex flex-col justify-between transition relative ${
                p.id === 'standard'
                  ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-md scale-[1.02]'
                  : 'border-slate-200'
              }`}
            >
              {p.id === 'standard' && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-400">
                  Best Value
                </span>
              )}

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                <p className="text-slate-500 text-[10px] leading-relaxed mt-1">{p.desc}</p>
                
                <div className="my-5">
                  <span className="text-3xl font-black text-slate-950">${p.price}</span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">
                    / {p.period}
                  </span>
                </div>

                <ul className="space-y-2.5 border-t border-slate-100 pt-5">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[11px] text-slate-600 leading-normal">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <div className="w-full text-center py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-slate-200 uppercase tracking-wide">
                    Active Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckout(p.id as any)}
                    disabled={isCheckingOut !== null}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      p.id === 'standard'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    } disabled:opacity-50`}
                  >
                    {isCheckingOut === p.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking out...</span>
                      </>
                    ) : (
                      <>
                        <span>{p.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STRIPE AND PAYMENT COMPLIANCE NOTES */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
          <span>Secured Sandbox Subscriptions via Stripe</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500 leading-relaxed">
          <div className="space-y-2">
            <p>
              Stripe checkout uses a secured off-site gateway callback interface. Payment tokens are generated and authorized in full isolation, compliant with PCI-DSS level 1 security protocols.
            </p>
            <p>
              <strong>Developer Notice:</strong> This preview integrates mock sandbox callbacks. Actual production keys should be configured inside your server-side environment parameters.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2 text-[11px]">
            <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Stripe Webhook Endpoints</span>
            </h5>
            <p className="font-mono bg-slate-50 p-2 rounded text-[10px] break-all border text-slate-600">
              POST /api/stripe/webhook
            </p>
            <p className="text-slate-400">
              The webhook validates incoming Stripe payload hashes to automatically activate relevant user plan parameters in the system's cloud database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
