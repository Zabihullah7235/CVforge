import React from 'react';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Copy, 
  Download, 
  Edit, 
  Calendar,
  Sparkles,
  Search,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { ResumeData, User } from '../types';

interface DashboardViewProps {
  resumes: ResumeData[];
  currentUser: User | null;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onOpenLogin: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resumes,
  currentUser,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateNew,
  onOpenLogin,
  onNavigateTab
}) => {
  const isFreePlan = !currentUser || currentUser.plan === 'free';
  const resumeLimitReached = isFreePlan && resumes.length >= 1;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header section with welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {currentUser ? currentUser.fullName : 'Guest'}!
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Build, edit, duplicate, or export your optimized corporate resumes seamlessly.
          </p>
        </div>

        {currentUser ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
            <div className="text-left">
              <span className="block text-[9px] uppercase font-black text-blue-500 tracking-wider">Account Active</span>
              <span className="block text-xs font-bold text-slate-800 capitalize">{currentUser.plan} Membership</span>
            </div>
            {isFreePlan && (
              <button
                onClick={() => onNavigateTab('pricing')}
                className="bg-blue-600 hover:bg-blue-750 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Upgrade</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Sign In to Unlock Cloud Sync
          </button>
        )}
      </div>

      {/* PLAN LIMIT CARD */}
      {resumeLimitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Free Plan Limit Reached (1 CV Limit)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your free tier account allows exactly 1 saved resume. Upgrade your membership to unlock unlimited resume creation, unlimited edits, and access premium templates.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('pricing')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shrink-0"
          >
            Unlock All Premium Layouts
          </button>
        </div>
      )}

      {/* Grid of Resumes */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-extrabold text-slate-400">
          My Saved Resumes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Create New Resume button block */}
          <button
            onClick={onCreateNew}
            disabled={resumeLimitReached}
            className={`h-[240px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center gap-3 transition-all ${
              resumeLimitReached
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 group cursor-pointer'
            }`}
          >
            <div className={`p-4 rounded-full transition-transform ${
              resumeLimitReached ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 group-hover:scale-105'
            }`}>
              {resumeLimitReached ? <Lock className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <span className="block font-bold text-sm">
                {resumeLimitReached ? 'Resume Limit Reached' : 'Create New Resume'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">
                {resumeLimitReached ? 'Upgrade plan to save more' : 'Start with a fresh professional template'}
              </span>
            </div>
          </button>

          {/* List of previously saved resumes */}
          {resumes.map((resume) => (
            <div 
              key={resume.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between h-[240px]"
            >
              <div className="p-5 flex items-start gap-3.5">
                <div className={`p-3 rounded-xl ${
                  resume.templateId === 'ats' 
                    ? 'bg-slate-100 text-slate-700' 
                    : resume.templateId === 'creative'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>

                <div className="space-y-1 overflow-hidden">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">{resume.title}</h4>
                  <span className="inline-block bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-semibold capitalize">
                    {resume.templateId} Layout
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-150 flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(resume.id)}
                    className="p-2 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 bg-white transition cursor-pointer"
                    title="Edit Resume"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDuplicate(resume.id)}
                    disabled={resumeLimitReached}
                    className="p-2 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-lg border border-slate-200 bg-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onDelete(resume.id)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 bg-white transition cursor-pointer"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK INSPIRATION BOARD */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-1/10 -translate-y-1/10 opacity-10">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="max-w-xl space-y-3 relative z-10">
          <span className="bg-white/15 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/10 tracking-wider">
            CV Writing Tips
          </span>
          <h4 className="text-lg md:text-xl font-bold tracking-tight">Need help tailoring your resume?</h4>
          <p className="text-xs text-blue-100 leading-relaxed">
            Our templates are meticulously reviewed. For maximum recruitment success, try our "ATS Clean" layout if you are submitting to automated corporate portals. For agencies and creative positions, "Modern Slate" or "Creative Emerald" excels in grabbing physical attention.
          </p>
          <button
            onClick={() => onNavigateTab('templates')}
            className="mt-2 text-white hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Explore all layouts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
