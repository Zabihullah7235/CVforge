import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { BuilderView } from './components/BuilderView';
import { TemplatesView } from './components/TemplatesView';
import { PricingView } from './components/PricingView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { INITIAL_RESUME_DATA } from './data/templates';
import { ResumeData, User, TemplateId } from './types';
import { Sparkles, CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  
  // Modals & UI States
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load user session and resumes from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cvforge_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error(e);
      }
    }

    const savedResumes = localStorage.getItem('cvforge_resumes');
    if (savedResumes) {
      try {
        const parsedResumes = JSON.parse(savedResumes);
        setResumes(parsedResumes);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial mock resume
      const defaultId = 'res-default';
      const defaultResume = INITIAL_RESUME_DATA(defaultId, 'Alex Carter – Resume');
      setResumes([defaultResume]);
      localStorage.setItem('cvforge_resumes', JSON.stringify([defaultResume]));
    }
  }, []);

  // Fetch from in-memory backend endpoint as primary cloud-sync, with local persistence fallback
  const syncWithCloud = async (userId: string) => {
    try {
      const res = await fetch(`/api/resumes?userId=${userId}`);
      if (res.ok) {
        const cloudResumes = await res.json();
        if (cloudResumes.length > 0) {
          // Fill default resume's template data if needed
          const processed = cloudResumes.map((cr: any) => {
            if (!cr.data || Object.keys(cr.data).length === 0) {
              return { ...cr, ...INITIAL_RESUME_DATA(cr.id, cr.title) };
            }
            return { id: cr.id, title: cr.title, templateId: cr.templateId, updatedAt: cr.updatedAt, ...cr.data };
          });
          setResumes(processed);
          localStorage.setItem('cvforge_resumes', JSON.stringify(processed));
        }
      }
    } catch (e) {
      console.warn('Sync failed, falling back to client-side database.', e);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('cvforge_user', JSON.stringify(user));
    showToast('success', `Welcome back, ${user.fullName}! Sessions synchronized.`);
    syncWithCloud(user.id);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cvforge_user');
    showToast('success', 'Logged out successfully.');
    setActiveTab('landing');
  };

  const handleUpgradeSuccess = (plan: 'free' | 'basic' | 'standard' | 'premium') => {
    if (currentUser) {
      const updatedUser: User = { ...currentUser, plan };
      setCurrentUser(updatedUser);
      localStorage.setItem('cvforge_user', JSON.stringify(updatedUser));
      showToast('success', `Congratulations! Account upgraded to ${plan.toUpperCase()} tier!`);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  /* RESUME CRUD ACTIONS */

  const handleCreateNewResume = () => {
    // Check limits on free plan
    const isFree = !currentUser || currentUser.plan === 'free';
    if (isFree && resumes.length >= 1) {
      showToast('error', 'Free tier account limit of 1 resume reached. Upgrade to make more!');
      setActiveTab('pricing');
      return;
    }

    const newId = `res-${Date.now()}`;
    const freshResume = INITIAL_RESUME_DATA(newId, `My New CV (${new Date().toLocaleDateString()})`);
    
    const updated = [...resumes, freshResume];
    setResumes(updated);
    localStorage.setItem('cvforge_resumes', JSON.stringify(updated));
    setActiveResumeId(newId);

    // Sync to Express backend
    if (currentUser) {
      fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          title: freshResume.title,
          templateId: freshResume.templateId,
          userId: currentUser.id,
          data: freshResume
        })
      });
    }

    showToast('success', 'Created a fresh optimized resume template!');
  };

  const handleSaveResume = async (updatedData: ResumeData) => {
    const updated = resumes.map(r => r.id === updatedData.id ? updatedData : r);
    setResumes(updated);
    localStorage.setItem('cvforge_resumes', JSON.stringify(updated));

    // Sync to backend API
    if (currentUser) {
      try {
        await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updatedData.id,
            title: updatedData.title,
            templateId: updatedData.templateId,
            userId: currentUser.id,
            data: updatedData
          })
        });
      } catch (e) {
        console.warn('API sync deferred.', e);
      }
    }
  };

  const handleDuplicateResume = (id: string) => {
    const isFree = !currentUser || currentUser.plan === 'free';
    if (isFree && resumes.length >= 1) {
      showToast('error', 'Limit of 1 resume reached on free plan. Upgrade to duplicate!');
      return;
    }

    const original = resumes.find(r => r.id === id);
    if (original) {
      const dupId = `res-${Date.now()}`;
      const duplicate: ResumeData = {
        ...original,
        id: dupId,
        title: `${original.title} (Copy)`,
        updatedAt: new Date().toISOString()
      };

      const updated = [...resumes, duplicate];
      setResumes(updated);
      localStorage.setItem('cvforge_resumes', JSON.stringify(updated));

      if (currentUser) {
        fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: dupId,
            title: duplicate.title,
            templateId: duplicate.templateId,
            userId: currentUser.id,
            data: duplicate
          })
        });
      }

      showToast('success', 'Duplicated resume successfully.');
    }
  };

  const handleDeleteResume = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this resume? This cannot be undone.');
    if (!confirmed) return;

    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    localStorage.setItem('cvforge_resumes', JSON.stringify(updated));

    if (currentUser) {
      try {
        await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Backend deletion deferred.', e);
      }
    }

    showToast('success', 'Resume deleted successfully.');
  };

  const handleSelectTemplateDirectly = (templateId: TemplateId) => {
    // Modify active resume or create new with this template
    if (resumes.length > 0) {
      const active = resumes[0];
      const updated = { ...active, templateId };
      handleSaveResume(updated);
      setActiveResumeId(active.id);
      showToast('success', `Applied template styling: ${templateId}`);
    } else {
      handleCreateNewResume();
    }
  };

  // Find active resume
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans">
      
      {/* SIDEBAR NAVIGATION (hidden in landing tab) */}
      {activeTab !== 'landing' && (
        <Sidebar
          activeTab={activeResumeId ? 'resumes' : activeTab}
          setActiveTab={(tab) => {
            setActiveResumeId(null);
            setActiveTab(tab);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenLogin={() => setAuthOpen(true)}
        />
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 overflow-hidden flex flex-col justify-between print:overflow-visible">
        
        {/* TOP STATUS BAR BAR (only if not in landing) */}
        {activeTab !== 'landing' && (
          <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-xs">CVForge Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-extrabold text-xs capitalize">
                {activeResumeId ? `Editing "${activeResume.title}"` : `${activeTab} Management`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveResumeId(null);
                  setActiveTab('landing');
                }}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Back to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* COMPONENT VIEWS PORT */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          {activeResumeId ? (
            <BuilderView
              initialData={activeResume}
              onSave={handleSaveResume}
              currentUserPlan={currentUser?.plan || 'free'}
            />
          ) : (
            <>
              {activeTab === 'landing' && (
                <LandingPage
                  onCreateNewResume={() => {
                    if (resumes.length > 0) {
                      setActiveResumeId(resumes[0].id);
                    } else {
                      handleCreateNewResume();
                    }
                  }}
                  onSelectTemplate={handleSelectTemplateDirectly}
                  onOpenLogin={() => setAuthOpen(true)}
                  onNavigateTab={(tab) => {
                    setActiveResumeId(null);
                    setActiveTab(tab);
                  }}
                  isLoggedIn={!!currentUser}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  resumes={resumes}
                  currentUser={currentUser}
                  onEdit={(id) => setActiveResumeId(id)}
                  onDuplicate={handleDuplicateResume}
                  onDelete={handleDeleteResume}
                  onCreateNew={handleCreateNewResume}
                  onOpenLogin={() => setAuthOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'resumes' && (
                <DashboardView
                  resumes={resumes}
                  currentUser={currentUser}
                  onEdit={(id) => setActiveResumeId(id)}
                  onDuplicate={handleDuplicateResume}
                  onDelete={handleDeleteResume}
                  onCreateNew={handleCreateNewResume}
                  onOpenLogin={() => setAuthOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'templates' && (
                <TemplatesView
                  activeTemplateId={activeResume?.templateId || 'modern'}
                  onSelectTemplate={(templateId) => {
                    handleSelectTemplateDirectly(templateId);
                    if (resumes.length > 0) {
                      setActiveResumeId(resumes[0].id);
                    }
                  }}
                />
              )}

              {activeTab === 'pricing' && (
                <PricingView
                  currentUser={currentUser}
                  onUpgradeSuccess={handleUpgradeSuccess}
                  onOpenLogin={() => setAuthOpen(true)}
                />
              )}

              {activeTab === 'admin' && (
                <AdminView currentUser={currentUser} />
              )}
            </>
          )}
        </div>
      </main>

      {/* AUTH POPUP MODAL */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* FLOATING SUCCESS / ERROR TOAST CONTAINER */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom duration-200">
          <div className={`p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-900/95 border-emerald-500/30 text-emerald-100'
              : 'bg-red-900/95 border-red-500/30 text-red-100'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-xs font-bold leading-normal">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
