import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderGit, 
  Award, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Send, 
  Bot, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  Download,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  X,
  FileCheck
} from 'lucide-react';
import { ResumeData, WorkExperience, Education, Project, Certification, Language, CustomSection, CustomSectionItem, ChatMessage, TemplateId } from '../types';
import { AUTO_SUGGEST_SKILLS, RESUME_TEMPLATES } from '../data/templates';
import { ResumePreview } from './ResumePreview';
import { AIHeadshotGenerator } from './AIHeadshotGenerator';

interface BuilderViewProps {
  initialData: ResumeData;
  onSave: (data: ResumeData) => Promise<void>;
  currentUserPlan: string;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  initialData,
  onSave,
  currentUserPlan,
}) => {
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeAccordion, setActiveAccordion] = useState<string>('personal');
  const [skillInput, setSkillInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showImageGenerator, setShowImageGenerator] = useState<boolean>(false);
  const [isAtsActive, setIsAtsActive] = useState<boolean>(false);

  // AI Assistant trigger states
  const [isImprovingSummary, setIsImprovingSummary] = useState<boolean>(false);
  const [strengtheningExpId, setStrengtheningExpId] = useState<string | null>(null);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState<boolean>(false);

  // AI Coach Chat states
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'assistant', text: "Hello! I am your CVForge Career Coach. I can help you refine your summary, suggest key skills for your industry, review your achievements, or format your resume. Ask me anything!", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-save logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSave(data);
    }, 1500); // Autosave after 1.5s idle

    return () => clearTimeout(delayDebounce);
  }, [data]);

  // Scroll chatbot to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Handle skill suggestion search
  useEffect(() => {
    if (skillInput.trim()) {
      const filtered = AUTO_SUGGEST_SKILLS.filter(s => 
        s.toLowerCase().includes(skillInput.toLowerCase()) && 
        !data.skills.includes(s)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [skillInput, data.skills]);

  const updatePersonalInfo = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      },
      updatedAt: new Date().toISOString()
    }));
  };

  /* AI TRIGGERS */
  const handleImproveSummary = async () => {
    if (!data.personalInfo.summary.trim()) return;
    setIsImprovingSummary(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'improve_summary', text: data.personalInfo.summary })
      });
      const resData = await res.json();
      if (res.ok && resData.text) {
        updatePersonalInfo('summary', resData.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImprovingSummary(false);
    }
  };

  const handleStrengthenBullet = async (expId: string, currentDesc: string) => {
    if (!currentDesc.trim()) return;
    setStrengtheningExpId(expId);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'strengthen_bullet', text: currentDesc })
      });
      const resData = await res.json();
      if (res.ok && resData.text) {
        // Update specific experience description
        setData(prev => ({
          ...prev,
          experience: prev.experience.map(exp => 
            exp.id === expId ? { ...exp, description: resData.text } : exp
          ),
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStrengtheningExpId(null);
    }
  };

  const handleSuggestSkills = async () => {
    const title = data.personalInfo.professionalTitle || 'Software Engineer';
    setIsSuggestingSkills(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest_skills', text: title })
      });
      const resData = await res.json();
      if (res.ok && resData.text) {
        const skillsArray = resData.text.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        // Combine with unique skills
        setData(prev => ({
          ...prev,
          skills: Array.from(new Set([...prev.skills, ...skillsArray])),
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  /* CHAT SUBMIT */
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const history = [...chatMessages, userMsg];
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const resData = await res.json();
      if (res.ok && resData.text) {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: resData.text, timestamp: new Date().toLocaleTimeString() }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  /* LIST MULTI-ITEM OPERATIONS */

  // Experience
  const addExperience = () => {
    const newItem: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: ''
    };
    setData(prev => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Education
  const addEducation = () => {
    const newItem: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: ''
    };
    setData(prev => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Skills
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      setData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillName: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillName) }));
  };

  // Projects
  const addProject = () => {
    const newItem: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      url: '',
      technologies: []
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newItem] }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  // Certifications
  const addCertification = () => {
    const newItem: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      url: ''
    };
    setData(prev => ({ ...prev, certifications: [...prev.certifications, newItem] }));
  };

  const removeCertification = (id: string) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  // Languages
  const addLanguage = () => {
    const newItem: Language = {
      id: `lang-${Date.now()}`,
      name: '',
      level: 'Fluent'
    };
    setData(prev => ({ ...prev, languages: [...prev.languages, newItem] }));
  };

  const removeLanguage = (id: string) => {
    setData(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setData(prev => ({
      ...prev,
      languages: prev.languages.map(l => 
        l.id === id ? { ...l, [field]: value } : l
      )
    }));
  };

  // Custom Sections
  const addCustomSection = () => {
    const newItem: CustomSection = {
      id: `cust-${Date.now()}`,
      title: 'Additional Section',
      items: [
        {
          id: `custitem-${Date.now()}`,
          title: '',
          subtitle: '',
          date: '',
          description: ''
        }
      ]
    };
    setData(prev => ({ ...prev, customSections: [...prev.customSections, newItem] }));
  };

  const removeCustomSection = (id: string) => {
    setData(prev => ({ ...prev, customSections: prev.customSections.filter(s => s.id !== id) }));
  };

  const updateCustomSectionTitle = (id: string, title: string) => {
    setData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === id ? { ...s, title } : s
      )
    }));
  };

  const addCustomItem = (secId: string) => {
    const newItem: CustomSectionItem = {
      id: `custitem-${Date.now()}`,
      title: '',
      subtitle: '',
      date: '',
      description: ''
    };
    setData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === secId ? { ...s, items: [...s.items, newItem] } : s
      )
    }));
  };

  const removeCustomItem = (secId: string, itemId: string) => {
    setData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === secId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
      )
    }));
  };

  const updateCustomItem = (secId: string, itemId: string, field: keyof CustomSectionItem, value: string) => {
    setData(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => 
        s.id === secId ? {
          ...s,
          items: s.items.map(i => 
            i.id === itemId ? { ...i, [field]: value } : i
          )
        } : s
      )
    }));
  };

  const triggerExportPdf = () => {
    window.print();
  };

  const toggleAccordion = (tab: string) => {
    setActiveAccordion(prev => prev === tab ? '' : tab);
  };

  const changeTemplate = (templateId: TemplateId) => {
    setData(prev => ({ ...prev, templateId }));
  };

  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
      
      {/* LEFT FORM WORKSPACE COLUMN */}
      <div className="w-1/2 overflow-y-auto editor-pane border-r border-slate-200 p-6 space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-black text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none"
            />
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Autosaving Changes in Background</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition"
            >
              <Bot className="w-4 h-4 animate-bounce" />
              <span>AI Coach Chat</span>
            </button>
          </div>
        </div>

        {/* FORM SECTIONS ACCORDION */}
        <div className="space-y-3.5">
          
          {/* 1. PERSONAL DETAILS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('personal')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-blue-500" />
                <span>Personal & Contact Information</span>
              </span>
              {activeAccordion === 'personal' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'personal' && (
              <div className="p-5 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      value={data.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={data.personalInfo.professionalTitle}
                      onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      value={data.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                    <input
                      type="text"
                      value={data.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                    <input
                      type="text"
                      value={data.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Website</label>
                    <input
                      type="text"
                      value={data.personalInfo.website}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={data.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GitHub</label>
                    <input
                      type="text"
                      value={data.personalInfo.github}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Profile Picture Upload & Gen Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Photo URL</label>
                    <button
                      type="button"
                      onClick={() => setShowImageGenerator(!showImageGenerator)}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{showImageGenerator ? 'Hide AI Headshot Generator' : 'Generate with Gemini'}</span>
                    </button>
                  </div>

                  {showImageGenerator ? (
                    <AIHeadshotGenerator
                      currentPhotoUrl={data.personalInfo.photoUrl}
                      onPhotoSelected={(url) => updatePersonalInfo('photoUrl', url)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={data.personalInfo.photoUrl}
                      onChange={(e) => updatePersonalInfo('photoUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Professional Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Professional Summary</label>
                    <button
                      type="button"
                      onClick={handleImproveSummary}
                      disabled={isImprovingSummary || !data.personalInfo.summary.trim()}
                      className="bg-blue-50 text-blue-700 py-1 px-2 rounded font-bold text-[9px] uppercase flex items-center gap-1 hover:bg-blue-100 transition cursor-pointer disabled:opacity-50"
                    >
                      {isImprovingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Optimize summary with AI</span>
                    </button>
                  </div>
                  <textarea
                    value={data.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    className="w-full p-3 text-xs border border-slate-200 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. WORK EXPERIENCE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('experience')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-blue-500" />
                <span>Work Experience</span>
              </span>
              {activeAccordion === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'experience' && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Position / Title</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM"
                          disabled={exp.current}
                          value={exp.current ? '' : exp.endDate}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="San Francisco, CA"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-600 font-bold">I currently work here</label>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Achievements / Key Responsibilities</label>
                        <button
                          type="button"
                          onClick={() => handleStrengthenBullet(exp.id, exp.description)}
                          disabled={strengtheningExpId === exp.id || !exp.description.trim()}
                          className="bg-blue-50 text-blue-700 py-1 px-2 rounded font-bold text-[9px] uppercase flex items-center gap-1 hover:bg-blue-100 transition cursor-pointer disabled:opacity-50"
                        >
                          {strengtheningExpId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>AI Stronger Bullets</span>
                        </button>
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="• Rebuilt checkout portal increasing sales by 25%..."
                        className="w-full p-3 bg-white text-xs border border-slate-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addExperience}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Work Experience</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. EDUCATION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('education')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-blue-500" />
                <span>Education Background</span>
              </span>
              {activeAccordion === 'education' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'education' && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Degree</label>
                        <input
                          type="text"
                          placeholder="e.g. Master of Science"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Field of Study</label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM"
                          disabled={edu.current}
                          value={edu.current ? '' : edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-edu-${edu.id}`}
                        checked={edu.current}
                        onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor={`current-edu-${edu.id}`} className="text-xs text-slate-600 font-bold">I am currently enrolled</label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description / Honors (Optional)</label>
                      <input
                        type="text"
                        placeholder="Graduated summa cum laude. GPA 3.9..."
                        value={edu.description}
                        onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                        className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEducation}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education Record</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. SKILLS CHIPS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('skills')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-4.5 h-4.5 text-blue-500" />
                <span>Skills & Core Strengths</span>
              </span>
              {activeAccordion === 'skills' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'skills' && (
              <div className="p-5 border-t border-slate-100 space-y-4">
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                      placeholder="Add a skill (e.g. React, Python)"
                      className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    {/* Auto-suggestions list dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 mt-1 rounded-lg shadow-lg overflow-hidden divide-y divide-slate-100">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => addSkill(s)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* AI skills helper trigger */}
                <button
                  type="button"
                  onClick={handleSuggestSkills}
                  disabled={isSuggestingSkills}
                  className="w-full py-1.5 bg-blue-50 text-blue-800 font-bold text-xs rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                >
                  {isSuggestingSkills ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate skills for "{data.personalInfo.professionalTitle || 'My Title'}"</span>
                </button>

                {/* Active chips list */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {data.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs py-1 px-2.5 rounded-lg font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. PROJECTS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('projects')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <FolderGit className="w-4.5 h-4.5 text-blue-500" />
                <span>Projects Portfolio</span>
              </span>
              {activeAccordion === 'projects' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'projects' && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project Link / URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://github.com/..."
                          value={proj.url}
                          onChange={(e) => updateProject(proj.id, 'url', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                        className="w-full p-3 bg-white text-xs border border-slate-200 rounded-lg h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addProject}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. CERTIFICATIONS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('certifications')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-blue-500" />
                <span>Certifications & Credentials</span>
              </span>
              {activeAccordion === 'certifications' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'certifications' && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      onClick={() => removeCertification(cert.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Issued</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM"
                          value={cert.date}
                          onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Verification URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={cert.url}
                          onChange={(e) => updateCertification(cert.id, 'url', e.target.value)}
                          className="w-full py-1.5 px-3 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCertification}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certification</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. LANGUAGES */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('languages')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-blue-500" />
                <span>Languages</span>
              </span>
              {activeAccordion === 'languages' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'languages' && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      placeholder="e.g. English, French"
                      value={lang.name}
                      onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                      className="flex-1 py-1 px-2.5 bg-white text-xs border border-slate-200 rounded focus:outline-none"
                    />
                    
                    <select
                      value={lang.level}
                      onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                      className="py-1 px-2 bg-white text-xs border border-slate-200 rounded focus:outline-none"
                    >
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Professional">Professional</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>

                    <button
                      onClick={() => removeLanguage(lang.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addLanguage}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Language</span>
                </button>
              </div>
            )}
          </div>

          {/* 8. CUSTOM SECTIONS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('custom')}
              className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-blue-500" />
                <span>Custom Sections</span>
              </span>
              {activeAccordion === 'custom' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeAccordion === 'custom' && (
              <div className="p-5 border-t border-slate-100 space-y-6">
                {data.customSections.map((sec) => (
                  <div key={sec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      onClick={() => removeCustomSection(sec.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Section Header Title</label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => updateCustomSectionTitle(sec.id, e.target.value)}
                        className="w-full py-1.5 px-3 bg-white font-bold text-xs border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      {sec.items.map((item) => (
                        <div key={item.id} className="bg-white p-3.5 rounded-lg border relative space-y-3">
                          <button
                            onClick={() => removeCustomItem(sec.id, item.id)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateCustomItem(sec.id, item.id, 'title', e.target.value)}
                                className="w-full py-1 px-2.5 text-xs border border-slate-200 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subtitle (Optional)</label>
                              <input
                                type="text"
                                value={item.subtitle}
                                onChange={(e) => updateCustomItem(sec.id, item.id, 'subtitle', e.target.value)}
                                className="w-full py-1 px-2.5 text-xs border border-slate-200 rounded"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date / Period</label>
                              <input
                                type="text"
                                placeholder="e.g. 2021 - Present"
                                value={item.date}
                                onChange={(e) => updateCustomItem(sec.id, item.id, 'date', e.target.value)}
                                className="w-full py-1 px-2.5 text-xs border border-slate-200 rounded"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateCustomItem(sec.id, item.id, 'description', e.target.value)}
                              className="w-full p-2 text-xs border border-slate-200 rounded h-16 resize-none"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addCustomItem(sec.id)}
                        className="w-full py-1 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] rounded-lg border border-slate-200"
                      >
                        + Add Section Row
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCustomSection}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Custom Section Block</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT PREVIEW & TEMPLATE COLUMN */}
      <div className="w-1/2 overflow-y-auto preview-pane p-6 flex flex-col justify-between print:w-full print:p-0 print:bg-white print:overflow-visible h-screen sticky top-0">
        
        {/* Template Selector Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Template Style:</span>
            <select
              value={data.templateId}
              onChange={(e) => changeTemplate(e.target.value as TemplateId)}
              className="py-1 px-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-800 focus:outline-none"
            >
              {RESUME_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* ATS validation score simulation */}
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg py-1 px-2.5 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ATS Pass Score: 95%</span>
            </div>

            <button
              onClick={triggerExportPdf}
              className="bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE PREVIEW SHEET CONTAINER */}
        <div className="flex-1 overflow-y-auto rounded-xl resume-paper border border-slate-200 print:shadow-none print:border-0 bg-white">
          <ResumePreview data={data} />
        </div>
      </div>

      {/* CHATBOT DRAWER (Slides out on request) */}
      {chatOpen && (
        <div className="fixed top-0 right-0 w-80 bg-slate-900 border-l border-slate-850 h-screen shadow-2xl flex flex-col justify-between z-40 text-white animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-black tracking-tight">AI CVForge Coach</h4>
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Powered by Gemini 3.5</span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHAT BODY LIST */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[8px] text-slate-500 font-mono mt-1">{msg.timestamp}</span>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Coach is thinking...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* CHAT INPUT FORM */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask for writing tips, verbs, or details..."
              className="flex-1 bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2 flex items-center justify-center cursor-pointer transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
