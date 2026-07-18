import React from 'react';
import { 
  Briefcase, 
  Layout, 
  CreditCard, 
  User, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Sparkles,
  FileText
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenLogin,
}) => {
  const isAdmin = currentUser?.email === 'zabihullah7235@gmail.com';

  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: Layout },
    { id: 'resumes', label: 'My Resumes', icon: FileText },
    { id: 'templates', label: 'CV Templates', icon: Briefcase },
    { id: 'pricing', label: 'Pricing Plans', icon: CreditCard },
  ];

  return (
    <aside className="w-64 glass-sidebar text-slate-800 shrink-0 flex flex-col justify-between h-screen sticky top-0 print:hidden">
      <div className="p-6">
        {/* Logo / Brand */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 cursor-pointer mb-8 group"
        >
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">
              CVForge
            </h1>
            <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">
              Resume Builder
            </span>
          </div>
        </div>

        {/* User Info Card */}
        {currentUser ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[8px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider ${
                    currentUser.plan === 'premium' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : currentUser.plan === 'standard'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : currentUser.plan === 'basic'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {currentUser.plan} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 mb-6 cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Save Resume</span>
          </button>
        )}

        {/* Menu Navigation */}
        <nav className="space-y-1">
          <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">
            Main Features
          </span>
          
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin tab (only shown forzabihullah7235@gmail.com) */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-200 mt-4 space-y-1">
              <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">
                Systems Control
              </span>
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-6 border-t border-slate-200">
        {currentUser ? (
          <button
            onClick={onLogout}
            className="w-full py-2 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        ) : (
          <div className="text-center text-[10px] text-slate-400">
            © 2026 CVForge. Built for success.
          </div>
        )}
      </div>
    </aside>
  );
};
