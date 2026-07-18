import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Zap, 
  Check, 
  MessageSquare, 
  Download, 
  FileCheck,
  Eye,
  Crown
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../data/templates';
import { TemplateId } from '../types';

interface LandingPageProps {
  onCreateNewResume: () => void;
  onSelectTemplate: (templateId: TemplateId) => void;
  onOpenLogin: () => void;
  onNavigateTab: (tab: string) => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateNewResume,
  onSelectTemplate,
  onOpenLogin,
  onNavigateTab,
  isLoggedIn,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const stats = [
    { value: '172,000+', label: 'Resumes crafted today' },
    { value: '44%', label: 'Average salary increase' },
    { value: '0.4s', label: 'AI generation speed' },
    { value: '98.2%', label: 'ATS pass rate' }
  ];

  const testimonials = [
    {
      quote: "Using CVForge was incredibly easy. The AI writer helped me turn vague bullet points into strong business-oriented accomplishments. I landed 3 interviews in a week!",
      author: "Sarah Jenkins",
      role: "Product Marketing Manager",
      company: "Stripe",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
    },
    {
      quote: "The ATS template is a game changer. My previous resume was getting auto-rejected. After pasting my data into CVForge's ATS layout, I finally started getting replies.",
      author: "David Kim",
      role: "Lead DevOps Specialist",
      company: "Atlassian",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
    },
    {
      quote: "The built-in AI headshot generator saved me $150 on professional corporate photography. It generated a studio-lit profile photo that fits my resume perfectly.",
      author: "Mariana Silva",
      role: "Senior Consultant",
      company: "McKinsey & Co.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"
    }
  ];

  const plans = [
    {
      name: 'Basic',
      price: isAnnual ? 15 : 19,
      period: 'month',
      desc: 'Essential features to create a polished CV fast.',
      features: [
        '3–6 resumes per day',
        'Unlimited edits & modifications',
        'Basic Slate & Executive Classic templates',
        'High-quality PDF export',
        'Standard spellchecking & format guide',
      ],
      color: 'blue',
      popular: false
    },
    {
      name: 'Standard',
      price: isAnnual ? 22 : 29,
      period: 'month',
      desc: 'Our most popular plan, with full template and AI tools.',
      features: [
        '10–12 resumes per day',
        'Access to all 5 premium templates',
        'Priority AI resume enhancements',
        'Multiple exports (PDF + text)',
        'Built-in cover letter writer',
        'Live expert chat recommendations',
      ],
      color: 'emerald',
      popular: true
    },
    {
      name: 'Premium',
      price: isAnnual ? 38 : 49,
      period: 'month',
      desc: 'Complete portfolio management and executive tools.',
      features: [
        'Unlimited resumes created',
        'Unlimited real-time edits',
        'Access to all current & future templates',
        'Ultra-high quality AI Image Generation (4K)',
        'Multi-turn AI resume coaching chat',
        'Early access to beta layout releases',
        'Custom domain branding (future proof)',
      ],
      color: 'indigo',
      popular: false
    }
  ];

  const clientLogos = [
    { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Microsoft', url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_2012.svg' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      
      {/* HEADER HERO AREA */}
      <header className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white overflow-hidden py-16 px-6 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)]" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-bold mb-6 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Recruitment-Optimized CV Builder</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight">
            Create Modern{' '}
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              ATS-Friendly CVs
            </span>{' '}
            That Get You Hired
          </h1>

          <p className="text-slate-300 text-base md:text-xl max-w-2xl mt-6 font-medium leading-relaxed">
            Easily build, customize, and refine your professional CV and download your job-winning resume in premium PDF format. Optimized to pass through recruiter scanning systems effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={onCreateNewResume}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create My Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onCreateNewResume}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Use Premium Template</span>
            </button>
          </div>

          {/* Trust Signal / Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-16 border-t border-slate-800/80 pt-12 w-full max-w-5xl">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Logos */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              Our graduates are hired at world-leading giants
            </span>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-45 grayscale contrast-150 hover:opacity-75 transition-opacity">
              {clientLogos.map((logo, index) => (
                <img
                  key={index}
                  src={logo.url}
                  alt={logo.name}
                  className="h-6 object-contain"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* CORE FEATURES SECTION */}
      <section className="py-20 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            How CVForge Propels Your Career
          </h2>
          <p className="text-slate-500 mt-3 text-sm font-medium">
            Forget struggling with margin padding, formatting tables, and finding appropriate action words.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Fluid Preview</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Witness your resume render instantly in beautiful vector grids as you type. Changes are saved automatically so you never lose progress.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Super-Fast Gemini Assistants</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Struggling to describe a task? Leverage our low-latency Gemini 3.1 model to strengthen bullet achievements or auto-suggest target industry skills.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">100% ATS Optimized Layouts</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Our designs are rigorously stress-tested against leading parser software to guarantee your metrics and content are extracted with pristine accuracy.
            </p>
          </div>
        </div>
      </section>

      {/* TEMPLATE GALLERY SHOWCASE */}
      <section className="py-20 bg-slate-100/60 border-y border-slate-200/60 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase text-blue-600 font-extrabold tracking-widest block mb-2">
                Beautiful Layout options
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Designed by Recruitment Experts
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('templates')}
              className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>View All 5 Templates</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RESUME_TEMPLATES.slice(0, 3).map((tpl) => (
              <div 
                key={tpl.id} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm group hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-center min-h-[160px] relative">
                  
                  {/* Mock styled thumbnail */}
                  <div className={`w-36 h-48 bg-white border border-slate-200 rounded p-3 shadow-sm transform group-hover:scale-[1.03] transition duration-200 flex flex-col justify-between ${
                    tpl.id === 'modern' ? 'border-t-4 border-t-slate-600' : tpl.id === 'creative' ? 'border-l-4 border-l-emerald-600' : 'border-t-2 border-t-indigo-600'
                  }`}>
                    <div className="space-y-1">
                      <div className="h-2 w-10 bg-slate-300 rounded" />
                      <div className="h-1.5 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-slate-100 rounded" />
                      <div className="h-1.5 w-full bg-slate-100 rounded" />
                      <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2 w-4 bg-slate-200 rounded" />
                      <div className="h-2 w-4 bg-slate-200 rounded" />
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                    <button
                      onClick={() => onSelectTemplate(tpl.id)}
                      className="bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1 hover:bg-blue-700 shadow shadow-blue-500/25 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Use Design</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-extrabold text-slate-900 text-sm">{tpl.name}</h3>
                  <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED TESTIMONIALS */}
      <section className="py-20 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase text-blue-600 font-extrabold tracking-widest block mb-2">
            Success Stories
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Approved by Over 250,000 Job Seekers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
              <div>
                {/* Rating stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs italic leading-relaxed">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 mt-8 border-t border-slate-100 pt-5">
                <img
                  src={test.avatar}
                  alt={test.author}
                  className="w-10 h-10 rounded-full object-cover border"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{test.author}</h4>
                  <p className="text-[10px] text-slate-500">
                    {test.role} at <strong className="text-slate-700">{test.company}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TOGGLE PLANS */}
      <section id="pricing" className="py-20 bg-slate-900 text-white px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-[10px] uppercase text-blue-400 font-extrabold tracking-widest block mb-2">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            An Investment in Your Future
          </h2>
          <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">
            Choose a plan that fits your job search. Save up to 25% with annual pricing.
          </p>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-10 mb-16">
            <span className={`text-xs font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly Billing</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-blue-600 p-1 flex items-center transition relative cursor-pointer"
            >
              <div className={`w-4 h-4 rounded-full bg-white transition transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isAnnual ? 'text-blue-400' : 'text-slate-400'}`}>
              <span>Annual Saver</span>
              <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-emerald-500/25">
                Save 25%
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <div 
                key={i} 
                className={`rounded-2xl p-8 border text-left flex flex-col justify-between transition-all duration-200 ${
                  p.popular 
                    ? 'bg-slate-850 border-blue-500/60 shadow-xl relative scale-105 md:scale-[1.03]' 
                    : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                {p.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400 flex items-center gap-1 shadow">
                    <Crown className="w-3 h-3" />
                    <span>Most Popular Choice</span>
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black">{p.name} Plan</h3>
                  <p className="text-slate-400 text-[10px] leading-relaxed mt-2">{p.desc}</p>
                  
                  <div className="my-6">
                    <span className="text-4xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      ${p.price}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider ml-1">
                      / {p.period}
                    </span>
                  </div>

                  <ul className="space-y-3.5 border-t border-slate-800/80 pt-6">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onOpenLogin();
                      } else {
                        onNavigateTab('pricing');
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition cursor-pointer text-center ${
                      p.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    Select {p.name} Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-6 lg:px-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white tracking-tight text-sm">CVForge</span>
          </div>

          <div className="text-xs font-medium max-w-md leading-relaxed">
            CVForge is an advanced document creation platform powered by DeepMind-grade AI systems. We assist job applicants in achieving interview callbacks.
          </div>

          <div className="text-xs">
            © 2026 CVForge Inc. All rights reserved. Built with pride.
          </div>
        </div>
      </footer>
    </div>
  );
};
