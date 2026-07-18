import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const {
    personalInfo,
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    customSections = [],
    templateId
  } = data;

  const getTemplateStyles = () => {
    switch (templateId) {
      case 'modern':
        return {
          container: 'bg-white text-slate-800 font-sans p-8 shadow-sm border border-slate-100 max-w-[21cm] min-h-[29.7cm] mx-auto print:border-0 print:shadow-none print:p-0',
          headerBg: 'border-b-4 border-slate-600 pb-4 mb-6',
          name: 'text-3xl font-bold text-slate-900 tracking-tight',
          title: 'text-lg font-medium text-slate-600 uppercase tracking-wider mt-1',
          sectionHeader: 'text-lg font-bold text-slate-800 border-b-2 border-slate-200 pb-1 mb-3 mt-6 uppercase tracking-wide',
          companyName: 'font-semibold text-slate-800',
          bulletPoint: 'text-sm text-slate-600 leading-relaxed mb-1',
          skillTag: 'bg-slate-100 text-slate-800 px-3 py-1 rounded text-xs font-medium',
        };
      case 'classic':
        return {
          container: 'bg-white text-neutral-900 font-serif p-10 shadow-sm border border-neutral-100 max-w-[21cm] min-h-[29.7cm] mx-auto print:border-0 print:shadow-none print:p-0',
          headerBg: 'text-center pb-6 mb-6 border-b border-neutral-300',
          name: 'text-4xl font-normal text-neutral-950 tracking-normal',
          title: 'text-md italic text-neutral-700 tracking-wide mt-2',
          sectionHeader: 'text-md font-bold text-neutral-900 border-b border-neutral-800 pb-1 mb-4 mt-6 uppercase tracking-wider',
          companyName: 'font-bold text-neutral-900',
          bulletPoint: 'text-sm text-neutral-800 leading-relaxed mb-1',
          skillTag: 'border border-neutral-300 text-neutral-900 px-2.5 py-0.5 rounded-sm text-xs font-medium',
        };
      case 'creative':
        return {
          container: 'bg-white text-stone-800 font-sans p-8 shadow-sm border border-emerald-50 max-w-[21cm] min-h-[29.7cm] mx-auto print:border-0 print:shadow-none print:p-0',
          headerBg: 'bg-emerald-800 text-white p-6 -mx-8 -mt-8 mb-6 rounded-b-xl',
          name: 'text-3xl font-extrabold text-white tracking-tight',
          title: 'text-sm font-semibold text-emerald-200 uppercase tracking-widest mt-1',
          sectionHeader: 'text-lg font-bold text-emerald-800 border-l-4 border-emerald-600 pl-2 mb-3 mt-6 uppercase tracking-wide',
          companyName: 'font-bold text-stone-900',
          bulletPoint: 'text-sm text-stone-600 leading-relaxed mb-1',
          skillTag: 'bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100',
        };
      case 'ats':
        return {
          container: 'bg-white text-black font-mono p-8 max-w-[21cm] min-h-[29.7cm] mx-auto print:p-0',
          headerBg: 'pb-4 mb-4 border-b border-black',
          name: 'text-2xl font-bold text-black uppercase',
          title: 'text-sm font-semibold text-black mt-1 uppercase',
          sectionHeader: 'text-sm font-bold text-black border-b border-black pb-0.5 mb-2 mt-4 uppercase',
          companyName: 'font-bold text-black',
          bulletPoint: 'text-xs text-black leading-normal mb-1',
          skillTag: 'text-xs border-r border-black pr-2 mr-2 last:border-r-0 last:pr-0',
        };
      case 'minimal':
        return {
          container: 'bg-white text-neutral-700 font-sans p-10 shadow-sm border border-stone-100 max-w-[21cm] min-h-[29.7cm] mx-auto print:border-0 print:shadow-none print:p-0',
          headerBg: 'pb-6 mb-6',
          name: 'text-3xl font-light text-neutral-900 tracking-tight',
          title: 'text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1.5',
          sectionHeader: 'text-xs font-bold text-neutral-900 tracking-widest uppercase border-b border-neutral-100 pb-2 mb-3 mt-6',
          companyName: 'font-semibold text-neutral-950',
          bulletPoint: 'text-xs text-neutral-600 leading-relaxed mb-1',
          skillTag: 'bg-neutral-50 text-neutral-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border border-neutral-100',
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div id="cv-preview-sheet" className={styles.container}>
      {/* HEADER SECTION */}
      <div className={styles.headerBg}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {personalInfo.photoUrl && templateId !== 'ats' && (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 print:w-14 print:h-14"
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <h1 className={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
              <p className={styles.title}>{personalInfo.professionalTitle || 'Your Professional Title'}</p>
            </div>
          </div>

          <div className="text-right text-xs space-y-1 text-slate-500 font-mono print:text-[10px]">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
            <div className="flex flex-wrap md:justify-end gap-x-2 gap-y-0.5">
              {personalInfo.website && <span className="hover:underline">{personalInfo.website}</span>}
              {personalInfo.linkedin && <span className="hover:underline">{personalInfo.linkedin}</span>}
              {personalInfo.github && <span className="hover:underline">{personalInfo.github}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {personalInfo.summary && (
        <div>
          <h2 className={styles.sectionHeader}>Professional Summary</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line print:text-xs">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* WORK EXPERIENCE */}
      {experience.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Work Experience</h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div>
                    <span className={styles.companyName}>{exp.company}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="font-medium text-slate-700">{exp.position}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.location && `(${exp.location})`}
                  </div>
                </div>
                <div className="text-sm whitespace-pre-line text-slate-600 print:text-xs">
                  {exp.description.split('\n').map((line, index) => (
                    <p key={index} className={styles.bulletPoint}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-slate-800">{edu.institution}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="font-medium text-slate-700">
                      {edu.degree} in {edu.fieldOfStudy}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate} {edu.location && `(${edu.location})`}
                  </div>
                </div>
                {edu.description && (
                  <p className="text-xs text-slate-500 mt-1 italic">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) =>
              templateId === 'ats' ? (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ) : (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Projects</h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{proj.name}</span>
                    {proj.url && (
                      <span className="text-xs text-blue-500 hover:underline font-mono">
                        {proj.url}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 print:text-xs leading-relaxed">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-100">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATIONS */}
      {certifications.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Certifications</h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                <div>
                  <span className="font-bold text-slate-800">{cert.name}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-600">{cert.issuer}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  {cert.date}
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Verify
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LANGUAGES */}
      {languages.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Languages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {languages.map((lang) => (
              <div key={lang.id} className="text-sm bg-slate-50 border border-slate-100 p-2 rounded">
                <div className="font-bold text-slate-800">{lang.name}</div>
                <div className="text-xs text-slate-500">{lang.level}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM SECTIONS */}
      {customSections.map((sec) => (
        <div key={sec.id}>
          <h2 className={styles.sectionHeader}>{sec.title}</h2>
          <div className="space-y-3">
            {sec.items.map((item) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-slate-800">{item.title}</span>
                    {item.subtitle && (
                      <>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="font-medium text-slate-600">{item.subtitle}</span>
                      </>
                    )}
                  </div>
                  {item.date && (
                    <div className="text-xs text-slate-500 font-mono">{item.date}</div>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-slate-600 print:text-xs mt-1 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
