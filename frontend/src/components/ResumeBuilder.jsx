import { useState } from 'react';
import {
  Download, Loader2, User, Mail, Phone, Briefcase, Code, FileText,
  MapPin, Linkedin, Github, GraduationCap, Award, Plus, Trash2,
  ChevronDown, ChevronUp, Palette, Check, Eye, Layers
} from 'lucide-react';

/* ─────────────────────────────────────────────
   TEMPLATE DEFINITIONS
   Each template controls preview rendering style.
   The `id` is passed to the backend so it can
   apply the matching PDF layout server-side.
───────────────────────────────────────────── */
const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean single-column, ATS-optimised',
    accent: '#1e3a5f',
    badge: 'Most ATS-Safe',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with coloured sidebar',
    accent: '#0f766e',
    badge: 'Popular',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Understated elegance, lots of space',
    accent: '#374151',
    badge: null,
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong header, high visual impact',
    accent: '#7c3aed',
    badge: 'Creative Roles',
  },
];

/* ─────────────────────────────────────────────
   DEFAULT FORM STATE
   Empty so users fill in their own details.
   Structured arrays give a richer editing UX;
   they are serialised to plain text before the
   PDF API call so the backend stays unchanged.
───────────────────────────────────────────── */
const makeId = () => Math.random().toString(36).slice(2, 8);

const DEFAULT_FORM_DATA = {
  // Personal
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  website: '',
  // Sections
  summary: '',
  experience: [
    { id: makeId(), role: '', company: '', duration: '', bullets: '' },
  ],
  education: [
    { id: makeId(), degree: '', institution: '', year: '', gpa: '' },
  ],
  projects: [
    { id: makeId(), name: '', tech: '', description: '' },
  ],
  skills: '',
  certifications: '',
};

/* ─────────────────────────────────────────────
   HELPERS — serialise structured arrays →
   plain text for the existing PDF endpoint
───────────────────────────────────────────── */
const serialiseExperience = (list) =>
  list
    .filter((e) => e.role || e.company)
    .map((e) => {
      const header = [e.role, e.company, e.duration].filter(Boolean).join(' | ');
      const bullets = e.bullets
        ? e.bullets
            .split('\n')
            .filter(Boolean)
            .map((b) => `- ${b.replace(/^[-•]\s*/, '')}`)
            .join('\n')
        : '';
      return [header, bullets].filter(Boolean).join('\n');
    })
    .join('\n\n');

const serialiseEducation = (list) =>
  list
    .filter((e) => e.degree || e.institution)
    .map((e) => {
      const parts = [e.degree, e.institution, e.year, e.gpa ? `GPA: ${e.gpa}` : ''].filter(Boolean);
      return parts.join(' | ');
    })
    .join('\n');

const serialiseProjects = (list) =>
  list
    .filter((p) => p.name)
    .map((p) => {
      const header = [p.name, p.tech ? `(${p.tech})` : ''].filter(Boolean).join(' ');
      return [header, p.description].filter(Boolean).join('\n');
    })
    .join('\n\n');

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

/** Collapsible section wrapper */
const Section = ({ icon: Icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
          <Icon size={16} className="text-blue-600" />
          {title}
        </span>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2 bg-white space-y-3">{children}</div>}
    </div>
  );
};

/** Single text input */
const Field = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 placeholder-slate-300 transition"
    />
  </div>
);

/** Textarea */
const TextArea = ({ label, name, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 resize-none placeholder-slate-300 transition"
    />
  </div>
);

/* ─────────────────────────────────────────────
   LIVE PREVIEW RENDERERS — one per template
───────────────────────────────────────────── */

const ClassicPreview = ({ d }) => (
  <div className="bg-white w-full h-full p-6 text-[9px] font-serif leading-relaxed text-slate-800 overflow-hidden">
    <div className="text-center border-b-2 border-slate-800 pb-3 mb-3">
      <div className="text-lg font-bold tracking-wide">{d.fullName || 'Your Name'}</div>
      <div className="text-[8px] text-slate-600 mt-0.5 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
        {d.email && <span>{d.email}</span>}
        {d.phone && <span>• {d.phone}</span>}
        {d.location && <span>• {d.location}</span>}
        {d.linkedin && <span>• {d.linkedin}</span>}
      </div>
    </div>
    {d.summary && (
      <PreviewBlock title="PROFESSIONAL SUMMARY">
        <p>{d.summary}</p>
      </PreviewBlock>
    )}
    {d.experience.some((e) => e.role) && (
      <PreviewBlock title="EXPERIENCE">
        {d.experience.filter((e) => e.role).map((e) => (
          <div key={e.id} className="mb-1.5">
            <div className="font-bold">{e.role} {e.company && `— ${e.company}`}</div>
            {e.duration && <div className="text-slate-500 text-[7.5px]">{e.duration}</div>}
            {e.bullets && e.bullets.split('\n').filter(Boolean).map((b, i) => (
              <div key={i} className="pl-2">• {b.replace(/^[-•]\s*/, '')}</div>
            ))}
          </div>
        ))}
      </PreviewBlock>
    )}
    {d.education.some((e) => e.degree) && (
      <PreviewBlock title="EDUCATION">
        {d.education.filter((e) => e.degree).map((e) => (
          <div key={e.id} className="mb-1">
            <span className="font-bold">{e.degree}</span>{e.institution && `, ${e.institution}`}{e.year && ` (${e.year})`}
          </div>
        ))}
      </PreviewBlock>
    )}
    {d.skills && (
      <PreviewBlock title="SKILLS">
        <p>{d.skills}</p>
      </PreviewBlock>
    )}
    {d.certifications && (
      <PreviewBlock title="CERTIFICATIONS">
        <p>{d.certifications}</p>
      </PreviewBlock>
    )}
  </div>
);

const ModernPreview = ({ d }) => (
  <div className="bg-white w-full h-full flex text-[8.5px] overflow-hidden">
    {/* Sidebar */}
    <div className="w-28 flex-shrink-0 bg-teal-700 text-white p-3 flex flex-col gap-2.5">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-base font-bold mx-auto">
        {(d.fullName || 'Y').charAt(0)}
      </div>
      <div className="text-center text-[7.5px] font-semibold leading-tight">{d.fullName || 'Your Name'}</div>
      <div className="border-t border-white/30 pt-2 space-y-1 text-[7px] text-teal-100">
        {d.email && <div className="truncate">{d.email}</div>}
        {d.phone && <div>{d.phone}</div>}
        {d.location && <div>{d.location}</div>}
        {d.linkedin && <div className="truncate">{d.linkedin}</div>}
        {d.github && <div className="truncate">{d.github}</div>}
      </div>
      {d.skills && (
        <div className="border-t border-white/30 pt-2">
          <div className="font-bold text-[7.5px] mb-1 text-white uppercase tracking-wider">Skills</div>
          <div className="text-teal-100 text-[7px] leading-relaxed">{d.skills}</div>
        </div>
      )}
      {d.certifications && (
        <div className="border-t border-white/30 pt-2">
          <div className="font-bold text-[7.5px] mb-1 text-white uppercase tracking-wider">Certifications</div>
          <div className="text-teal-100 text-[7px] leading-relaxed">{d.certifications}</div>
        </div>
      )}
    </div>
    {/* Main */}
    <div className="flex-1 p-3 overflow-hidden space-y-2 text-slate-800 leading-relaxed">
      {d.summary && (
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-teal-700 border-b border-teal-200 pb-0.5 mb-1">Summary</div>
          <p>{d.summary}</p>
        </div>
      )}
      {d.experience.some((e) => e.role) && (
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-teal-700 border-b border-teal-200 pb-0.5 mb-1">Experience</div>
          {d.experience.filter((e) => e.role).map((e) => (
            <div key={e.id} className="mb-1.5">
              <div className="font-bold text-slate-900">{e.role}</div>
              <div className="text-[7.5px] text-teal-600">{[e.company, e.duration].filter(Boolean).join(' · ')}</div>
              {e.bullets && e.bullets.split('\n').filter(Boolean).map((b, i) => (
                <div key={i} className="pl-1.5 text-[7.5px]">• {b.replace(/^[-•]\s*/, '')}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {d.education.some((e) => e.degree) && (
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-teal-700 border-b border-teal-200 pb-0.5 mb-1">Education</div>
          {d.education.filter((e) => e.degree).map((e) => (
            <div key={e.id} className="mb-1">
              <div className="font-bold">{e.degree}</div>
              <div className="text-[7.5px] text-slate-500">{[e.institution, e.year].filter(Boolean).join(', ')}</div>
            </div>
          ))}
        </div>
      )}
      {d.projects.some((p) => p.name) && (
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-teal-700 border-b border-teal-200 pb-0.5 mb-1">Projects</div>
          {d.projects.filter((p) => p.name).map((p) => (
            <div key={p.id} className="mb-1">
              <div className="font-bold">{p.name} {p.tech && <span className="font-normal text-teal-600">({p.tech})</span>}</div>
              {p.description && <div className="text-[7.5px] text-slate-600">{p.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const MinimalPreview = ({ d }) => (
  <div className="bg-white w-full h-full p-8 text-[8.5px] text-slate-700 leading-relaxed overflow-hidden">
    <div className="mb-5">
      <div className="text-xl font-light text-slate-900 tracking-[0.1em] uppercase">{d.fullName || 'Your Name'}</div>
      <div className="flex flex-wrap gap-x-3 text-[7.5px] text-slate-400 mt-1">
        {d.email && <span>{d.email}</span>}
        {d.phone && <span>{d.phone}</span>}
        {d.location && <span>{d.location}</span>}
      </div>
    </div>
    {d.summary && (
      <div className="mb-4">
        <p className="text-slate-500 italic">{d.summary}</p>
      </div>
    )}
    {d.experience.some((e) => e.role) && (
      <div className="mb-4">
        <div className="text-[7px] uppercase tracking-[0.2em] text-slate-400 mb-2">Experience</div>
        {d.experience.filter((e) => e.role).map((e) => (
          <div key={e.id} className="mb-2 grid grid-cols-[1fr_auto] gap-2">
            <div>
              <div className="font-semibold text-slate-900">{e.role}</div>
              <div className="text-[7.5px] text-slate-500">{e.company}</div>
              {e.bullets && e.bullets.split('\n').filter(Boolean).map((b, i) => (
                <div key={i} className="text-[7.5px] text-slate-600">— {b.replace(/^[-•]\s*/, '')}</div>
              ))}
            </div>
            <div className="text-[7.5px] text-slate-400 whitespace-nowrap">{e.duration}</div>
          </div>
        ))}
      </div>
    )}
    {d.education.some((e) => e.degree) && (
      <div className="mb-4">
        <div className="text-[7px] uppercase tracking-[0.2em] text-slate-400 mb-2">Education</div>
        {d.education.filter((e) => e.degree).map((e) => (
          <div key={e.id} className="grid grid-cols-[1fr_auto] gap-2 mb-1">
            <div>
              <div className="font-semibold text-slate-900">{e.degree}</div>
              <div className="text-[7.5px] text-slate-500">{e.institution}</div>
            </div>
            <div className="text-[7.5px] text-slate-400">{e.year}</div>
          </div>
        ))}
      </div>
    )}
    {d.skills && (
      <div>
        <div className="text-[7px] uppercase tracking-[0.2em] text-slate-400 mb-2">Skills</div>
        <p className="text-slate-600">{d.skills}</p>
      </div>
    )}
  </div>
);

const BoldPreview = ({ d }) => (
  <div className="bg-white w-full h-full text-[8.5px] overflow-hidden">
    <div className="bg-violet-700 text-white px-6 py-4">
      <div className="text-lg font-black tracking-tight">{d.fullName || 'Your Name'}</div>
      <div className="flex flex-wrap gap-x-3 text-[7.5px] text-violet-200 mt-1">
        {d.email && <span>{d.email}</span>}
        {d.phone && <span>• {d.phone}</span>}
        {d.location && <span>• {d.location}</span>}
        {d.linkedin && <span>• {d.linkedin}</span>}
      </div>
    </div>
    <div className="px-6 py-4 space-y-3 text-slate-700 leading-relaxed">
      {d.summary && (
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-widest text-violet-600 mb-1">Profile</div>
          <p>{d.summary}</p>
        </div>
      )}
      {d.experience.some((e) => e.role) && (
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-widest text-violet-600 mb-1">Experience</div>
          {d.experience.filter((e) => e.role).map((e) => (
            <div key={e.id} className="mb-1.5 border-l-2 border-violet-200 pl-2">
              <div className="font-bold text-slate-900">{e.role} <span className="font-normal text-violet-500">@ {e.company}</span></div>
              {e.duration && <div className="text-[7px] text-slate-400 mb-0.5">{e.duration}</div>}
              {e.bullets && e.bullets.split('\n').filter(Boolean).map((b, i) => (
                <div key={i} className="text-[7.5px]">→ {b.replace(/^[-•]\s*/, '')}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {d.education.some((e) => e.degree) && (
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-widest text-violet-600 mb-1">Education</div>
          {d.education.filter((e) => e.degree).map((e) => (
            <div key={e.id} className="mb-1">
              <div className="font-bold">{e.degree}</div>
              <div className="text-[7.5px] text-slate-500">{[e.institution, e.year].filter(Boolean).join(' · ')}</div>
            </div>
          ))}
        </div>
      )}
      {d.skills && (
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-widest text-violet-600 mb-1">Skills</div>
          <div className="flex flex-wrap gap-1">
            {d.skills.split(',').map((s, i) => (
              <span key={i} className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded text-[7px] font-medium">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

/** PreviewBlock helper used by ClassicPreview */
const PreviewBlock = ({ title, children }) => (
  <div className="mb-2">
    <div className="text-[8px] font-bold uppercase tracking-widest border-b border-slate-700 pb-0.5 mb-1">{title}</div>
    {children}
  </div>
);

const PREVIEW_MAP = {
  classic: ClassicPreview,
  modern: ModernPreview,
  minimal: MinimalPreview,
  bold: BoldPreview,
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  /* ── scalar field change ── */
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── experience array helpers ── */
  const addExperience = () =>
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: makeId(), role: '', company: '', duration: '', bullets: '' }],
    }));
  const removeExperience = (id) =>
    setFormData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  const updateExperience = (id, field, value) =>
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  /* ── education array helpers ── */
  const addEducation = () =>
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { id: makeId(), degree: '', institution: '', year: '', gpa: '' }],
    }));
  const removeEducation = (id) =>
    setFormData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  const updateEducation = (id, field, value) =>
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  /* ── projects array helpers ── */
  const addProject = () =>
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: makeId(), name: '', tech: '', description: '' }],
    }));
  const removeProject = (id) =>
    setFormData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  const updateProject = (id, field, value) =>
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));

  /* ── PDF download ── */
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Serialise structured arrays → flat text for the existing backend
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        linkedin: formData.linkedin,
        github: formData.github,
        website: formData.website,
        summary: formData.summary,
        experience: serialiseExperience(formData.experience),
        education: serialiseEducation(formData.education),
        skills: formData.skills,
        certifications: formData.certifications,
        projects: serialiseProjects(formData.projects),
        template: selectedTemplate,           // ← new: backend can use this
      };

      const response = await fetch(
        'https://career-enhancer-us-backend.onrender.com/api/generate-resume-pdf',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${formData.fullName.replace(/\s+/g, '_') || 'My'}_ATS_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('PDF generation failed. Please check your server connection.');
      }
    } catch {
      alert('Cannot connect to the server. Is the Flask backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── tabs ── */
  const TABS = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'skills', label: 'Skills', icon: Code },
  ];

  const PreviewComponent = PREVIEW_MAP[selectedTemplate];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ATS Resume Builder</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Build a job-ready resume with live preview. Choose a template, fill your details, then download.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Download size={17} />
          )}
          {isGenerating ? 'Generating PDF…' : 'Download ATS Resume'}
        </button>
      </div>

      {/* ── Template Selector ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-blue-600" />
          <span className="font-semibold text-slate-800 text-sm">Choose Template</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                selectedTemplate === tpl.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              {/* Colour swatch */}
              <div
                className="w-full h-1.5 rounded-full mb-2"
                style={{ backgroundColor: tpl.accent }}
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">{tpl.name}</span>
                {selectedTemplate === tpl.id && (
                  <Check size={13} className="text-blue-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.description}</p>
              {tpl.badge && (
                <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {tpl.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="p-5 flex-1 space-y-4 overflow-y-auto">

            {/* ── Personal ── */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
                  <Field label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                  <Field label="Phone *" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91-XXXXXXXXXX" />
                  <Field label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State / Country" />
                  <Field label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/yourname" />
                  <Field label="GitHub URL" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/yourname" />
                  <div className="sm:col-span-2">
                    <Field label="Portfolio / Website" name="website" value={formData.website} onChange={handleChange} placeholder="yourportfolio.dev" />
                  </div>
                </div>
                <TextArea
                  label="Professional Summary *"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write 2–3 sentences about your role, top skills, and what you bring to the table…"
                />
              </div>
            )}

            {/* ── Experience ── */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                  <div key={exp.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Role #{idx + 1}
                      </span>
                      {formData.experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Job Title *" name="role" value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        placeholder="e.g. Data Analyst" />
                      <Field label="Company *" name="company" value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="Company Name" />
                      <div className="sm:col-span-2">
                        <Field label="Duration" name="duration" value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          placeholder="e.g. Jan 2023 – Present" />
                      </div>
                    </div>
                    <TextArea
                      label="Key Responsibilities / Achievements (one per line)"
                      name="bullets"
                      value={exp.bullets}
                      onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value)}
                      rows={4}
                      placeholder={"Built 4 dashboards in Power BI, cutting report time by 30%\nWrote Python scripts to automate data pipelines\nCollaborated with cross-functional teams of 8+ members"}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExperience}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Plus size={15} /> Add Another Role
                </button>
              </div>
            )}

            {/* ── Education ── */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div key={edu.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Qualification #{idx + 1}
                      </span>
                      {formData.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Degree / Qualification *" name="degree" value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="e.g. B.Tech Computer Science" />
                      <Field label="Institution *" name="institution" value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="University / College Name" />
                      <Field label="Year" name="year" value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        placeholder="e.g. 2024 or 2022–2024" />
                      <Field label="GPA / Percentage (optional)" name="gpa" value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="e.g. 8.4 / 10 or 85%" />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Plus size={15} /> Add Another Qualification
                </button>
              </div>
            )}

            {/* ── Projects ── */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {formData.projects.map((proj, idx) => (
                  <div key={proj.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Project #{idx + 1}
                      </span>
                      {formData.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProject(proj.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <Field label="Project Name *" name="name" value={proj.name}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                      placeholder="e.g. Sales Analytics Dashboard" />
                    <Field label="Tech Stack" name="tech" value={proj.tech}
                      onChange={(e) => updateProject(proj.id, 'tech', e.target.value)}
                      placeholder="e.g. Python, Power BI, PostgreSQL" />
                    <TextArea
                      label="Description"
                      name="description"
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      rows={3}
                      placeholder="What problem did it solve? What was your impact?" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProject}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Plus size={15} /> Add Another Project
                </button>
              </div>
            )}

            {/* ── Skills & Certs ── */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <TextArea
                  label="Core Skills (comma-separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Python, SQL, Power BI, Machine Learning, REST APIs, Git…"
                />
                <TextArea
                  label="Certifications & Achievements (one per line)"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  rows={4}
                  placeholder={"Google Data Analytics Professional Certificate – 2024\nMicrosoft Power BI Data Analyst – 2023\nHackerRank SQL (Gold Badge)"}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</span>
            <span className="ml-auto text-[11px] text-slate-400">
              Template: <span className="font-semibold text-slate-600 capitalize">{selectedTemplate}</span>
            </span>
          </div>
          <div className="bg-slate-200 rounded-2xl p-4 flex items-start justify-center flex-1 min-h-[640px] border border-slate-300 shadow-inner">
            <div
              className="bg-white shadow-xl overflow-hidden"
              style={{ width: '100%', maxWidth: '420px', aspectRatio: '1 / 1.414' }}
            >
              <PreviewComponent d={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;