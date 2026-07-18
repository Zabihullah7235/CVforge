import React from 'react';
import { Check, Star, ShieldCheck, Heart, Eye } from 'lucide-react';
import { RESUME_TEMPLATES } from '../data/templates';
import { TemplateId } from '../types';

interface TemplatesViewProps {
  activeTemplateId: string;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  activeTemplateId,
  onSelectTemplate,
}) => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Select Your Professional CV Theme
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Pick a layout tailored to your specific industry. Switch templates at any time without losing your resume data!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {RESUME_TEMPLATES.map((tpl) => {
          const isActive = activeTemplateId === tpl.id;
          
          return (
            <div 
              key={tpl.id}
              className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between group ${
                isActive 
                  ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-md' 
                  : 'border-slate-200/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-center min-h-[180px] relative">
                
                {/* Visual Representation of Layout */}
                <div className={`w-36 h-48 bg-white border border-slate-200 rounded p-3.5 shadow-sm transform group-hover:scale-[1.03] transition duration-200 flex flex-col justify-between ${
                  tpl.id === 'modern' 
                    ? 'border-t-4 border-t-slate-600' 
                    : tpl.id === 'creative' 
                    ? 'border-l-4 border-l-emerald-600 font-sans' 
                    : tpl.id === 'classic'
                    ? 'border-t border-b border-slate-200 font-serif text-center'
                    : tpl.id === 'ats'
                    ? 'border border-slate-900 font-mono text-left bg-stone-50'
                    : 'border-l border-r border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="h-2 w-10 bg-slate-300 rounded mx-auto" style={{ margin: tpl.id === 'classic' ? '0 auto' : '' }} />
                    <div className="h-1.5 w-16 bg-slate-200 rounded mx-auto" style={{ margin: tpl.id === 'classic' ? '1px auto' : '' }} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded" />
                    <div className="h-1.5 w-full bg-slate-100 rounded" />
                    <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
                  </div>
                  <div className="flex gap-1 justify-between">
                    <div className="h-1.5 w-4 bg-slate-200 rounded" />
                    <div className="h-1.5 w-4 bg-slate-200 rounded" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <button
                    onClick={() => onSelectTemplate(tpl.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isActive ? 'Current Design' : 'Apply Layout'}</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">{tpl.name}</h3>
                  {isActive && (
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {tpl.description}
                </p>

                {/* Rating / Metatag details */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>5.0 rating</span>
                  </div>
                  <span className="text-slate-500">
                    {tpl.id === 'ats' ? 'Recommended for Portals' : 'Recommended for Hiring'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 mt-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
            <span>Need an ATS compliance guarantee?</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our <strong>ATS Clean</strong> template strips out all nested layouts, illustrations, and images to let automated recruitment index engines parse your technical certifications and work bullet points perfectly. Recommended for technical and corporate enterprise portals.
          </p>
        </div>
        <button
          onClick={() => onSelectTemplate('ats')}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shrink-0 cursor-pointer"
        >
          Select ATS Layout
        </button>
      </div>
    </div>
  );
};
