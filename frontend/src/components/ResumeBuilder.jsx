import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Download, Loader2, User, Briefcase, Code, GraduationCap, Plus, Trash2,
  ChevronDown, ChevronUp, Palette, Check, Eye, Layers, Sliders, UploadCloud
} from 'lucide-react';

/* ─────────────────────────────────────────────
   TEMPLATE DEFINITIONS
───────────────────────────────────────────── */
const TEMPLATES = [
  { id: 'harvard', name: 'Harvard Classic', description: 'Template 1: ATS-Safe single column', accent: '#000000', badge: 'Most ATS-Safe' },
  { id: 'data-pro', name: 'Data Professional', description: 'Template 2: Clean & data-focused', accent: '#1e3a8a', badge: 'Popular' },
  { id: 'academic', name: 'Academic Two-Column', description: 'Template 3: LaTeX style with sidebar', accent: '#0f766e', badge: null },
  { id: 'executive', name: 'Executive Modern', description: 'Template 4: Balanced professional layout', accent: '#4338ca', badge: 'Creative Roles' },
];

const makeId = () => Math.random().toString(36).slice(2, 8);

const DEFAULT_FORM_DATA = {
  fullName: 'Jignesh Prajapat',
  email: 'jignesh@example.com',
  phone: '+91-XXXXXXXXXX',
  location: 'Jodhpur, Rajasthan',
  linkedin: 'linkedin.com/in/jignesh',
  github: 'github.com/jignesh',
  website: '',
  // Rich text fields initialized with HTML
  summary: '<p>Data Analyst with hands-on experience in <strong>Power BI, Python, and SQL</strong>. Skilled in translating raw data into actionable insights that support strategic business decisions.</p>',
  experience: [
    { id: makeId(), role: 'Data Analyst Intern', company: 'Bada Promotion Pvt. Ltd.', duration: 'May 2025 - Jun 2025', bullets: '<ul><li>Designed and built 4 dynamic dashboards using <strong>Power BI</strong>.</li><li>Enhanced decision-making processes through automated reporting.</li></ul>' },
  ],
  education: [
    { id: makeId(), degree: 'B.Tech in Computer Science', institution: 'JIET Group of Institutions', year: '2023 - 2027', gpa: '9.26 CGPA' },
  ],
  projects: [
    { id: makeId(), name: 'Resume Analyzer', tech: 'Python, Flask, NLP', description: '<p>Built an intelligent resume screening system using the Google Gemini API to parse and rank candidate profiles.</p>' },
  ],
  skills: 'Python (Pandas, NumPy), SQL (MySQL, Joins), Power BI, Tableau, Excel (Advanced)',
  certifications: 'Data Analytics Job Simulation - Deloitte\nOracle Cloud Infrastructure Certified AI Associate',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const Section = ({ icon: Icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors">
        <span className="flex items-center gap-2 font-semibold text-slate-800 text-sm"><Icon size={16} className="text-blue-600" />{title}</span>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2 bg-white space-y-3">{children}</div>}
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 placeholder-slate-300 transition" />
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>}
    <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 resize-none placeholder-slate-300 transition" />
  </div>
);

/* ─────────────────────────────────────────────
   LIVE PREVIEW RENDERERS
───────────────────────────────────────────── */

// Template 1: Harvard Classic
const HarvardClassic = ({ d, spacing }) => (
  <div className="p-10 text-[11px] font-serif text-black leading-snug bg-white h-full">
    <div className="text-center mb-4">
      <h1 className="text-3xl font-bold uppercase tracking-wide mb-1">{d.fullName}</h1>
      <div className="text-[11px] flex justify-center flex-wrap gap-2">
        {d.phone && <span>{d.phone} |</span>} {d.email && <span>{d.email} |</span>} {d.linkedin && <span>{d.linkedin} |</span>} {d.github && <span>{d.github}</span>}
      </div>
    </div>
    
    {d.education.length > 0 && (
      <div style={{ marginBottom: `${spacing}px` }}>
        <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">Education</h2>
        {d.education.map(e => (
          <div key={e.id} className="flex justify-between mb-1">
            <div><span className="font-bold">{e.institution}</span> {e.degree && `— ${e.degree}`}</div>
            <div className="text-right">{e.year} {e.gpa && `| ${e.gpa}`}</div>
          </div>
        ))}
      </div>
    )}

    {d.experience.length > 0 && (
      <div style={{ marginBottom: `${spacing}px` }}>
        <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">Experience</h2>
        {d.experience.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between font-bold text-[12px]">
              <span>{e.role}</span>
              <span>{e.duration}</span>
            </div>
            <div className="italic mb-1">{e.company}</div>
            <div className="pl-4 prose prose-sm max-w-none text-[11px] leading-snug list-disc" dangerouslySetInnerHTML={{ __html: e.bullets }} />
          </div>
        ))}
      </div>
    )}

    {d.projects.length > 0 && (
      <div style={{ marginBottom: `${spacing}px` }}>
        <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">Projects</h2>
        {d.projects.map(p => (
          <div key={p.id} className="mb-3">
            <div className="font-bold text-[12px]">{p.name} {p.tech && <span className="font-normal italic">| {p.tech}</span>}</div>
            <div className="prose prose-sm max-w-none text-[11px] leading-snug list-disc pl-4" dangerouslySetInnerHTML={{ __html: p.description }} />
          </div>
        ))}
      </div>
    )}

    {(d.skills || d.certifications) && (
      <div style={{ marginBottom: `${spacing}px` }}>
        <h2 className="text-[14px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">Technical Skills & Certifications</h2>
        {d.skills && <div className="mb-1"><strong>Skills:</strong> {d.skills}</div>}
        {d.certifications && <div className="whitespace-pre-line"><strong>Certifications:</strong> {d.certifications}</div>}
      </div>
    )}
  </div>
);

// Template 3: Academic Two-Column
const AcademicTwoColumn = ({ d, spacing }) => (
  <div className="flex bg-white h-full text-[11px] font-sans text-slate-800">
    <div className="w-1/3 bg-slate-100 p-6 border-r border-slate-200">
      <h1 className="text-3xl font-black text-teal-800 mb-4 leading-tight">{d.fullName}</h1>
      <div className="space-y-2 mb-6 text-[10px]">
        {d.email && <div>{d.email}</div>}
        {d.phone && <div>{d.phone}</div>}
        {d.location && <div>{d.location}</div>}
        {d.linkedin && <div className="truncate">{d.linkedin}</div>}
      </div>
      
      {d.skills && (
        <div style={{ marginBottom: `${spacing}px` }}>
          <h2 className="font-bold text-teal-800 uppercase tracking-widest mb-2 border-b border-teal-200 pb-1">Skills</h2>
          <p className="leading-relaxed">{d.skills}</p>
        </div>
      )}
      {d.certifications && (
        <div style={{ marginBottom: `${spacing}px` }}>
          <h2 className="font-bold text-teal-800 uppercase tracking-widest mb-2 border-b border-teal-200 pb-1">Certifications</h2>
          <p className="leading-relaxed whitespace-pre-wrap">{d.certifications}</p>
        </div>
      )}
    </div>

    <div className="w-2/3 p-6">
      {d.summary && (
        <div style={{ marginBottom: `${spacing}px` }}>
          <h2 className="font-bold text-teal-800 uppercase tracking-widest mb-2 border-b border-teal-200 pb-1">Profile</h2>
          <div className="prose prose-sm max-w-none text-[11px] leading-relaxed" dangerouslySetInnerHTML={{ __html: d.summary }} />
        </div>
      )}

      {d.experience.length > 0 && (
        <div style={{ marginBottom: `${spacing}px` }}>
          <h2 className="font-bold text-teal-800 uppercase tracking-widest mb-2 border-b border-teal-200 pb-1">Experience</h2>
          {d.experience.map(e => (
            <div key={e.id} className="mb-3">
              <div className="font-bold text-[12px] text-slate-900">{e.role}</div>
              <div className="text-teal-700 font-semibold mb-1">{e.company} | {e.duration}</div>
              <div className="prose prose-sm max-w-none text-[11px] leading-relaxed pl-3 list-disc" dangerouslySetInnerHTML={{ __html: e.bullets }} />
            </div>
          ))}
        </div>
      )}

      {d.education.length > 0 && (
        <div style={{ marginBottom: `${spacing}px` }}>
          <h2 className="font-bold text-teal-800 uppercase tracking-widest mb-2 border-b border-teal-200 pb-1">Education</h2>
          {d.education.map(e => (
            <div key={e.id} className="mb-2">
              <div className="font-bold text-[12px] text-slate-900">{e.degree}</div>
              <div>{e.institution} | {e.year} {e.gpa && `| ${e.gpa}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Fallbacks mapping to templates for seamless integration
const DataProPreview = ({ d, spacing }) => <HarvardClassic d={d} spacing={spacing} />;
const ExecutivePreview = ({ d, spacing }) => <AcademicTwoColumn d={d} spacing={spacing} />;

const PREVIEW_MAP = {
  'harvard': HarvardClassic,
  'data-pro': DataProPreview,
  'academic': AcademicTwoColumn,
  'executive': ExecutivePreview,
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('harvard');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Formatting Sliders
  const [scale, setScale] = useState(100);
  const [spacing, setSpacing] = useState(16);

  // Print PDF Ref
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${formData.fullName.replace(/\s+/g, '_') || 'My'}_ATS_Resume`,
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRichText = (name, value) => setFormData({ ...formData, [name]: value });

  // Arrays
  const addExperience = () => setFormData({ ...formData, experience: [...formData.experience, { id: makeId(), role: '', company: '', duration: '', bullets: '' }] });
  const removeExperience = (id) => setFormData({ ...formData, experience: formData.experience.filter(e => e.id !== id) });
  const updateExperience = (id, field, value) => setFormData({ ...formData, experience: formData.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const addEducation = () => setFormData({ ...formData, education: [...formData.education, { id: makeId(), degree: '', institution: '', year: '', gpa: '' }] });
  const removeEducation = (id) => setFormData({ ...formData, education: formData.education.filter(e => e.id !== id) });
  const updateEducation = (id, field, value) => setFormData({ ...formData, education: formData.education.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const addProject = () => setFormData({ ...formData, projects: [...formData.projects, { id: makeId(), name: '', tech: '', description: '' }] });
  const removeProject = (id) => setFormData({ ...formData, projects: formData.projects.filter(p => p.id !== id) });
  const updateProject = (id, field, value) => setFormData({ ...formData, projects: formData.projects.map(p => p.id === id ? { ...p, [field]: value } : p) });

  const TABS = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'skills', label: 'Skills', icon: Code },
  ];

  const PreviewComponent = PREVIEW_MAP[selectedTemplate];
  const quillModules = { toolbar: [['bold', 'italic', 'underline'], [{'list': 'bullet'}]] };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Advanced ATS Builder</h2>
          <p className="text-slate-500 text-sm mt-0.5">Live rich-text editing, auto-scaling, and instant PDF download.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert("Upload feature coming soon! Send your PDF to admin@career-enhancer.com")} className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <UploadCloud size={16} /> Suggest a Template
          </button>
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            <Download size={17} /> Download PDF
          </button>
        </div>
      </div>

      {/* ── Magic Formatting Sliders ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <Sliders size={18} className="text-slate-400" />
          <div className="flex-1">
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              Fit to Page (Scale) <span>{scale}%</span>
            </label>
            <input type="range" min="70" max="100" value={scale} onChange={(e) => setScale(e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <Layers size={18} className="text-slate-400" />
          <div className="flex-1">
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              Section Spacing <span>{spacing}px</span>
            </label>
            <input type="range" min="4" max="32" value={spacing} onChange={(e) => setSpacing(e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>
      </div>

      {/* ── Template Selector ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-blue-600" />
          <span className="font-semibold text-slate-800 text-sm">Choose Template</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" onClick={() => setSelectedTemplate(tpl.id)} className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${selectedTemplate === tpl.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
              <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: tpl.accent }} />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">{tpl.name}</span>
                {selectedTemplate === tpl.id && <Check size={13} className="text-blue-600 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.description}</p>
              {tpl.badge && <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{tpl.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* LEFT — Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[850px]">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === id ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <div className="p-5 flex-1 space-y-4 overflow-y-auto">
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} />
                  <Field label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} />
                  <Field label="Phone *" name="phone" value={formData.phone} onChange={handleChange} />
                  <Field label="Location" name="location" value={formData.location} onChange={handleChange} />
                  <Field label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                  <Field label="GitHub URL" name="github" value={formData.github} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <Field label="Portfolio / Website" name="website" value={formData.website} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Professional Summary (Rich Text)</label>
                  <ReactQuill theme="snow" value={formData.summary} onChange={(val) => handleRichText('summary', val)} modules={quillModules} className="bg-white" />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                  <div key={exp.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role #{idx + 1}</span>
                      {formData.experience.length > 1 && (
                        <button type="button" onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Job Title *" name="role" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                      <Field label="Company *" name="company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                      <div className="sm:col-span-2">
                        <Field label="Duration" name="duration" value={exp.duration} onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)} placeholder="e.g. Jan 2023 – Present" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Key Responsibilities (Rich Text)</label>
                      <ReactQuill theme="snow" value={exp.bullets} onChange={(val) => updateExperience(exp.id, 'bullets', val)} modules={quillModules} className="bg-white" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addExperience} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <Plus size={15} /> Add Another Role
                </button>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div key={edu.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qualification #{idx + 1}</span>
                      {formData.education.length > 1 && (
                        <button type="button" onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Degree / Qualification *" name="degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                      <Field label="Institution *" name="institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
                      <Field label="Year" name="year" value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} />
                      <Field label="GPA / Percentage" name="gpa" value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addEducation} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600">
                  <Plus size={15} /> Add Another Qualification
                </button>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {formData.projects.map((proj, idx) => (
                  <div key={proj.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project #{idx + 1}</span>
                      {formData.projects.length > 1 && (
                        <button type="button" onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      )}
                    </div>
                    <Field label="Project Name *" name="name" value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} />
                    <Field label="Tech Stack" name="tech" value={proj.tech} onChange={(e) => updateProject(proj.id, 'tech', e.target.value)} />
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description (Rich Text)</label>
                      <ReactQuill theme="snow" value={proj.description} onChange={(val) => updateProject(proj.id, 'description', val)} modules={quillModules} className="bg-white" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addProject} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600">
                  <Plus size={15} /> Add Another Project
                </button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <TextArea label="Core Skills (comma-separated)" name="skills" value={formData.skills} onChange={handleChange} rows={3} />
                <TextArea label="Certifications & Achievements (one per line)" name="certifications" value={formData.certifications} onChange={handleChange} rows={4} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</span>
          </div>
          <div className="bg-slate-200 rounded-2xl p-4 flex justify-center border border-slate-300 shadow-inner overflow-hidden h-[850px] relative">
            
            {/* Inner Wrapper for Scaling */}
            <div className="absolute top-4" style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
              
              {/* Actual Printable Component. Aspect Ratio is forced to A4 dimensions (210x297) */}
              <div ref={componentRef} className="bg-white shadow-xl overflow-hidden" style={{ width: '210mm', minHeight: '297mm' }}>
                <PreviewComponent d={formData} spacing={spacing} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;