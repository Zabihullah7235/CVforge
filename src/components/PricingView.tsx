import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Sparkles, Loader2, ArrowRight, HelpCircle, Lock, CreditCard, Globe, X, AlertCircle, CheckCircle2, FileText, Send, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface PricingViewProps {
  currentUser: User | null;
  onUpgradeSuccess: (newPlan: 'free' | 'basic' | 'pro' | 'business' | 'enterprise' | 'standard' | 'premium') => void;
  onOpenLogin: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  currentUser,
  onUpgradeSuccess,
  onOpenLogin,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  
  // Paddle specific checkout states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showFailureScreen, setShowFailureScreen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paddleConfig, setPaddleConfig] = useState<any>(null);

  // Form states for Paddle simulation/sandbox mode
  const [billingCountry, setBillingCountry] = useState('US');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('');
  const [simulateFail, setSimulateFail] = useState(false);

  // Fetch Paddle config on mount
  useEffect(() => {
    fetch('/api/paddle/config')
      .then(res => res.json())
      .then(data => setPaddleConfig(data))
      .catch(err => console.error('Error fetching Paddle config:', err));
  }, []);

  const handleCheckout = async (plan: 'basic' | 'pro' | 'business' | 'enterprise') => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setIsCheckingOut(plan);

    try {
      const token = localStorage.getItem('cvforge_token');
      const response = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          plan,
          billing: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Paddle checkout failed.');
      }

      setCheckoutData(data);
      setCardName(currentUser.fullName || '');

      // Check if real Paddle.js checkout should be triggered or sandbox overlay
      if ((window as any).Paddle && paddleConfig && !paddleConfig.isDemoMode) {
        // Real Paddle checkout integration
        (window as any).Paddle.Initialize({
          token: paddleConfig.clientToken,
          environment: paddleConfig.environment,
          eventCallback: function(event: any) {
            console.log('[PADDLE EVENT CALLBACK]', event);
            if (event.name === 'checkout.completed') {
              // Trigger success callbacks
              onUpgradeSuccess(plan);
              setShowSuccessScreen(true);
            } else if (event.name === 'checkout.error' || event.name === 'checkout.failed') {
              setShowFailureScreen(true);
            }
          }
        });

        (window as any).Paddle.Checkout.open({
          items: [{
            priceId: data.priceId,
            quantity: 1
          }],
          customer: {
            email: currentUser.email,
            name: currentUser.fullName
          },
          customData: {
            plan,
            billing: isAnnual ? 'annual' : 'monthly'
          },
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            successUrl: `${window.location.origin}/?payment=success&plan=${plan}`,
          }
        });
        setIsCheckingOut(null);
      } else {
        // Fall back to our stunning pixel-perfect interactive simulation overlay
        setTimeout(() => {
          setIsCheckingOut(null);
          setShowCheckoutModal(true);
        }, 800);
      }

    } catch (error: any) {
      console.error('Paddle Checkout error:', error);
      alert(error.message || 'Paddle subscription engine currently offline.');
      setIsCheckingOut(null);
    }
  };

  const handleCompleteSimulation = async () => {
    if (!checkoutData) return;
    setIsProcessingPayment(true);

    if (simulateFail) {
      // Handle simulated payment failure immediately
      setTimeout(() => {
        setIsProcessingPayment(false);
        setShowCheckoutModal(false);
        setShowFailureScreen(true);
      }, 1500);
      return;
    }

    try {
      const response = await fetch('/api/paddle/simulate-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'transaction.completed',
          email: currentUser?.email,
          plan: checkoutData.plan,
          billing: checkoutData.billing,
          amount: checkoutData.price
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Simulating webhook failed');
      }

      setTimeout(() => {
        setIsProcessingPayment(false);
        setShowCheckoutModal(false);
        onUpgradeSuccess(checkoutData.plan);
        setShowSuccessScreen(true);
      }, 1500);

    } catch (err: any) {
      console.error('Simulation error:', err);
      setIsProcessingPayment(false);
      alert('Internal Simulation error: ' + err.message);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      period: 'forever',
      desc: 'Simple, quick resume template sandbox.',
      features: [
        'Exactly 1 resume document limit',
        'Can edit your document once daily',
        'Modern slate template access only',
        'Basic print format capabilities',
        '10 monthly Gemini AI assistance credits'
      ],
      cta: 'Active Subscription',
      available: currentUser?.plan === 'free' || !currentUser,
    },
    {
      id: 'basic',
      name: 'Basic Builder',
      price: isAnnual ? 15 : 19,
      period: 'month',
      desc: 'Upgrade document limits and template accessibility.',
      features: [
        'Up to 6 resumes active concurrently',
        'Unlimited real-time edits',
        'Access 3 key templates (Modern, Classic, ATS)',
        'Standard PDF download formats',
        '100 monthly Gemini AI assistance credits'
      ],
      cta: 'Purchase Basic',
      available: currentUser?.plan !== 'basic',
    },
    {
      id: 'pro',
      name: 'Professional Pro',
      price: isAnnual ? 22 : 29,
      period: 'month',
      desc: 'Unlock elite custom templates and rich AI optimization tools.',
      features: [
        'Up to 12 resumes active concurrently',
        'Access all 5 professional templates',
        'Gemini AI Professional Bullet Strengthener',
        'Multi-format export (PDF, ATS, and JSON)',
        '500 monthly Gemini AI assistance credits'
      ],
      cta: 'Unlock Pro Tier',
      available: currentUser?.plan !== 'pro' && currentUser?.plan !== 'standard',
    },
    {
      id: 'business',
      name: 'Business Leader',
      price: isAnnual ? 38 : 49,
      period: 'month',
      desc: 'Enterprise templates, continuous cover-letter, and team audits.',
      features: [
        'Unlimited resumes created and saved',
        'Access to present & future layouts',
        'Gemini career counselor chatbot mentor',
        'Paddle direct billing & invoice downloads',
        '1,000 monthly Gemini AI assistance credits'
      ],
      cta: 'Expand to Business',
      available: currentUser?.plan !== 'business' && currentUser?.plan !== 'premium',
    },
    {
      id: 'enterprise',
      name: 'Enterprise VIP',
      price: isAnnual ? 75 : 99,
      period: 'month',
      desc: 'Full-turn AI headshot generation and early access beta tools.',
      features: [
        'Unlimited resumes generated and hosted',
        'All templates + custom tailored grids',
        'Gemini 3 Pro Image Headshot generator',
        'Priority API speed limits & VIP chat help',
        'Unlimited Gemini AI assistance credits'
      ],
      cta: 'Go Enterprise VIP',
      available: currentUser?.plan !== 'enterprise',
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          SaaS Subscriptions & Packages
        </h2>
        <p className="text-slate-500 text-xs">
          Invest in your professional identity with premium Paddle-secured billing designed for structural career growth.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {plans.map((p) => {
          // Check active state
          const isCurrent = currentUser?.plan === p.id || (!currentUser && p.id === 'free') ||
            (currentUser?.plan === 'standard' && p.id === 'pro') ||
            (currentUser?.plan === 'premium' && p.id === 'business');
          
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-5 border text-left flex flex-col justify-between transition relative ${
                p.id === 'pro'
                  ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-md scale-[1.01]'
                  : 'border-slate-200'
              }`}
            >
              {p.id === 'pro' && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-400">
                  Best Value
                </span>
              )}

              <div>
                <h3 className="font-extrabold text-slate-900 text-xs">{p.name}</h3>
                <p className="text-slate-500 text-[9px] leading-relaxed mt-1 h-8">{p.desc}</p>
                
                <div className="my-4">
                  <span className="text-2xl font-black text-slate-950">${p.price}</span>
                  <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider ml-1">
                    / {p.period}
                  </span>
                </div>

                <ul className="space-y-2 border-t border-slate-100 pt-4">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[10px] text-slate-600 leading-normal">
                      <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  <div className="w-full text-center py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-slate-200 uppercase tracking-wide">
                    Active Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckout(p.id as any)}
                    disabled={isCheckingOut !== null}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer text-center flex items-center justify-center gap-1 disabled:opacity-50 ${
                      p.id === 'pro'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCheckingOut === p.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Initializing...</span>
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

      {/* SECURED PADDLE COMPLIANCE CARD */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
          <span>Secured SaaS Subscriptions via Paddle Billing</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500 leading-relaxed">
          <div className="space-y-2">
            <p>
              We process subscription agreements via <strong>Paddle Billing</strong>, the industry-leading Merchant of Record. Payments are fully secure, adhering to PCI-DSS Level 1 compliance structures.
            </p>
            <p>
              <strong>Developer API Status:</strong> {paddleConfig?.isDemoMode ? (
                <span className="text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 border border-amber-100 rounded text-[10px]">
                  Simulated Sandbox Active (Zero-Setup Preview)
                </span>
              ) : (
                <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded text-[10px]">
                  Real Paddle Integration Online
                </span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2 text-[11px]">
            <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Paddle Webhook Endpoint</span>
            </h5>
            <p className="font-mono bg-slate-50 p-2 rounded text-[10px] break-all border text-slate-600">
              POST /api/paddle/webhook
            </p>
            <p className="text-slate-400">
              The endpoint validates incoming cryptographic Paddle headers to synchronize real-time renewals, cancellations, failures, and updates.
            </p>
          </div>
        </div>
      </div>

      {/* PADDLE CHECKOUT MODAL (STUNNING GRAPHICAL INTERFACE) */}
      {showCheckoutModal && checkoutData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-indigo-900 p-6 text-white relative">
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-black uppercase tracking-widest mb-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Paddle Secure Checkout</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Upgrade to CVForge {checkoutData.plan.toUpperCase()}</h3>
              <p className="text-indigo-200 text-xs mt-1">Merchant of Record transaction processed by Paddle Billing.</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              
              {/* Order summary */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    CVForge {checkoutData.plan.toUpperCase()} Tier
                  </span>
                  <span className="text-slate-400 capitalize text-[10px] font-bold">
                    Billing: {checkoutData.billing} cycle
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 block">${checkoutData.price}.00</span>
                  <span className="text-slate-400 text-[10px]">USD / cycle</span>
                </div>
              </div>

              {/* Secure simulated form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Cardholder Name
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      Secure Card Details
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-medium"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Expiry
                      </label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-medium text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        CVV
                      </label>
                      <input 
                        type="password" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-medium text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Country selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Billing Country
                  </label>
                  <div className="relative">
                    <select
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
                    >
                      <option value="US">United States (US)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="CA">Canada (CA)</option>
                      <option value="AU">Australia (AU)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="FR">France (FR)</option>
                    </select>
                    <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Simulated Payment Fail Trigger (For testing failures gracefully) */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex gap-2 items-start text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <span className="font-extrabold text-[10px] block">Paddle Sandbox Test Options</span>
                      <span className="text-[9px] text-amber-700">Simulate a failed billing transaction to evaluate error handling policies.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulateFail(!simulateFail)}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition ${
                      simulateFail 
                        ? 'bg-amber-600 border-amber-500 text-white' 
                        : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {simulateFail ? 'FAIL ACTIVE' : 'SIMULATE FAIL'}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleCompleteSimulation}
                disabled={isProcessingPayment}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Paddle Transaction...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize Secure Payment via Paddle (${checkoutData.price}.00)</span>
                  </>
                )}
              </button>
            </div>

            {/* Secure Footer compliance */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 select-none">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>SSL Secured Checkout (256-Bit)</span>
              </span>
              <span>Paddle Merchant Partner</span>
            </div>
          </div>
        </div>
      )}

      {/* PADDLE CHECKOUT SUCCESS POPUP */}
      {showSuccessScreen && checkoutData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center mx-auto text-3xl font-bold">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Upgrade Successful!</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thank you! Your transaction has been securely captured by Paddle Billing. Your account is upgraded to <strong>{checkoutData.plan.toUpperCase()}</strong> tier.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-150 text-[11px] font-medium space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-slate-700 uppercase font-bold">{checkoutData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billed Cycle:</span>
                <span className="text-slate-700 capitalize font-bold">{checkoutData.billing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Charged:</span>
                <span className="text-slate-900 font-extrabold">${checkoutData.price}.00 USD</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowSuccessScreen(false);
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Return to Dashboard Workspace
              </button>
              <p className="text-[10px] text-slate-400">
                A copy of your itemized invoice receipt has been dispatched to your email address.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PADDLE CHECKOUT FAILURE POPUP */}
      {showFailureScreen && checkoutData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full border border-rose-200 flex items-center justify-center mx-auto text-3xl font-bold">
              <AlertCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Paddle Transaction Failed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unfortunately, Paddle Billing was unable to process this subscription agreement. Your account remains on the <strong>{currentUser?.plan.toUpperCase() || 'FREE'}</strong> tier.
              </p>
            </div>

            <div className="bg-rose-50/50 rounded-xl p-4 text-left border border-rose-100 text-rose-800 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-extrabold block">Possible Causes:</span>
                <span className="text-[10px] leading-normal block text-rose-700">Insufficent card funds, fraud flags by the issuing bank, invalid expiry date, or network communication timeouts between processors.</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowFailureScreen(false);
                  setShowCheckoutModal(true);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                <span>Retry Payment Securely</span>
              </button>
              <button
                onClick={() => setShowFailureScreen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancel & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

