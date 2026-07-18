import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  Layout, 
  Briefcase, 
  CreditCard, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenLogin,
  onNavigateTab,
  activeTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR' | 'DE'>('EN');
  const [isDark, setIsDark] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Initialize theme from system or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('cvforge_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cvforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cvforge_theme', 'light');
    }
  };

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' },
    { code: 'DE', name: 'Deutsch' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950 dark:border-slate-800 print:hidden transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            onNavigateTab('landing');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              CVForge
            </span>
            <span className="block text-[8px] text-slate-500 font-extrabold tracking-wider uppercase leading-none">
              SaaS Pro
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigateTab('templates')}
            className={`text-xs font-bold tracking-wide uppercase transition hover:text-blue-600 cursor-pointer ${
              activeTab === 'templates' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Templates
          </button>
          
          <button 
            onClick={() => onNavigateTab('pricing')}
            className={`text-xs font-bold tracking-wide uppercase transition hover:text-blue-600 cursor-pointer ${
              activeTab === 'pricing' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Pricing
          </button>

          <button 
            onClick={() => {
              onNavigateTab('landing');
              setTimeout(() => {
                const element = document.getElementById('features-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-xs font-bold tracking-wide uppercase transition hover:text-blue-600 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            Features
          </button>

          {currentUser && (
            <button 
              onClick={() => onNavigateTab('dashboard')}
              className={`text-xs font-bold tracking-wide uppercase transition hover:text-blue-600 cursor-pointer ${
                activeTab === 'dashboard' || activeTab === 'resumes' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Right Side Settings & Profile Controls */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer text-xs font-extrabold"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span>{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-28 rounded-xl border border-slate-200 bg-white shadow-lg dark:bg-slate-900 dark:border-slate-800 z-50 overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setLangDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold block"
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Display Area */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-extrabold text-slate-800 dark:text-white max-w-[80px] truncate leading-none">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-bold capitalize">
                    {currentUser.plan} Plan
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white shadow-lg dark:bg-slate-900 dark:border-slate-800 z-50 overflow-hidden py-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Profile Details</span>
                    <span className="block text-xs font-bold text-slate-800 dark:text-white truncate mt-0.5">{currentUser.fullName}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{currentUser.email}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      onNavigateTab('dashboard');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2"
                  >
                    <Layout className="w-4 h-4 text-slate-400" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('templates');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>CV Templates</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('pricing');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Billing & Upgrade</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 font-bold flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Responsive Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 space-y-3 shadow-inner">
          <button
            onClick={() => {
              onNavigateTab('templates');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-bold text-slate-700 dark:text-slate-300 text-sm"
          >
            Templates
          </button>
          
          <button
            onClick={() => {
              onNavigateTab('pricing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-bold text-slate-700 dark:text-slate-300 text-sm"
          >
            Pricing
          </button>

          <button
            onClick={() => {
              onNavigateTab('landing');
              setMobileMenuOpen(false);
              setTimeout(() => {
                const element = document.getElementById('features-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left py-2 font-bold text-slate-700 dark:text-slate-300 text-sm"
          >
            Features
          </button>

          {currentUser ? (
            <>
              <button
                onClick={() => {
                  onNavigateTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 font-bold text-slate-700 dark:text-slate-300 text-sm"
              >
                Dashboard
              </button>
              
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-white">{currentUser.fullName}</span>
                  <span className="block text-[10px] text-slate-400 capitalize">{currentUser.plan} membership</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-600 font-extrabold px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/25"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl text-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl text-center font-black bg-blue-600 text-white text-xs"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
