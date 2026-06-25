import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Editor from 'react-simple-wysiwyg';
import {
  Download, User, Briefcase, Code, GraduationCap, Plus, Trash2,
  ChevronDown, ChevronUp, Palette, Check, Eye, Layers, Sliders, UploadCloud,
  Mail, Phone, MapPin, ArrowUp, ArrowDown, Award, LayoutList
} from 'lucide-react';

/* ─────────────────────────────────────────────
   SAFE ICONS (To prevent Vercel crashes)
───────────────────────────────────────────── */
const LinkedInIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>);
const GitHubIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>);

/* ─────────────────────────────────────────────
   TEMPLATE DEFINITIONS
───────────────────────────────────────────── */
const TEMPLATES = [
  { id: 'harvard',   name: 'Minimalist Blueprint',   description: 'Classic serif, centered header',    accent: '#000000' },
  { id: 'data-pro',  name: 'Modern Tech Slate',      description: 'Clean sans-serif, left-aligned',    accent: '#333333' },
  { id: 'academic',  name: 'LaTeX (Academic)',       description: 'Pure two-column, no colors',        accent: '#777777' },
  { id: 'executive', name: 'Executive Vanguard',     description: 'Name left, links top-right',        accent: '#1E293B' },
];

const makeId = () => Math.random().toString(36).slice(2, 8);

/* ─────────────────────────────────────────────
   DEFAULT DATA 
───────────────────────────────────────────── */
const DEFAULT_FORM_DATA = {
  fullName: 'Joy Ryan',
  jobTitle: 'Software Engineer & AI Researcher',
  email: 'joyryan1234@gmail.com',
  phone: '+71 123-456-7890',
  location: '',
  linkedin: 'linkedin.com/in/joyryan1234',
  github: 'github.com/joyryan1234',
  website: '',
  summary: 'Results-driven Computer Science graduate with hands-on experience in full-stack web development, API engineering, and AI research. Proven track record of architecting scalable web applications using React, Python, and cloud tools.',
  
  experience: [
    {
      id: makeId(), role: 'Undergraduate Research Assistant', company: 'Texas A&M University', duration: 'June 2020 - Present', location: 'College Station, TX',
      bullets: '<ul><li>Developed a REST API using <b>FastAPI and PostgreSQL</b> to store data from learning management systems.</li><li>Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data.</li></ul>'
    },
    {
      id: makeId(), role: 'IT Support Specialist', company: 'Southwestern University', duration: 'Sep. 2018 - May 2020', location: 'Georgetown, TX',
      bullets: '<ul><li>Communicated with managers to set up campus computers and optimize internal networks.</li><li>Assessed and troubleshooted computer hardware and software problems brought by students, faculty and staff.</li></ul>'
    }
  ],
  
  education: [
    { id: makeId(), degree: 'Bachelor of Arts in Computer Science', institution: 'Southwestern University', year: 'Aug. 2018 - May 2021', location: 'Georgetown, TX', gpa: '3.9/4.0' },
    { 
      id: makeId(), 
      degree: 'Class XII (Senior Secondary)', 
      institution: 'Georgetown High School', 
      year: 'April 2017 - May 2018', 
      location: 'Georgetown, TX', 
      gpa: '92%' 
    }
  ],
  
  projects: [
    {
      id: makeId(), name: 'Gitlytics', tech: 'Python, Flask, React, PostgreSQL', date: 'June 2020',
      description: '<ul><li>Developed a full-stack web application with Flask serving a REST API and React as the frontend.</li><li>Visualized GitHub data to show collaboration and used Celery and Redis for asynchronous background tasks.</li></ul>'
    },
    {
      id: makeId(), name: 'Simple Paintball', tech: 'Java, Spigot API, Maven', date: 'May 2018 - May 2020',
      description: '<ul><li>Developed a Minecraft server plugin to entertain kids during free time for a previous job.</li><li>Published plugin to websites gaining 2K+ downloads and implemented continuous delivery using TravisCI.</li></ul>'
    }
  ],
  
  skills: '<b>Languages:</b> Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS\n<b>Frameworks:</b> React, Node.js, Flask, JUnit, FastAPI\n<b>Tools:</b> Git, Docker, TravisCI, Google Cloud Platform',
  
  certifications: [
    { id: makeId(), name: 'AWS Certified Solutions Architect - Associate', date: 'Jan 2025' },
    { id: makeId(), name: 'DeepLearning.AI TensorFlow Developer Certificate', date: 'Nov 2024' },
    { id: makeId(), name: 'Meta Back-End Developer Professional Certificate', date: 'Aug 2024' },
    { id: makeId(), name: '1st Place Winner - Global Hackathon', date: '2021' }
  ],
  
  sectionTitles: {
    summary: 'Professional Summary',
    experience: 'Experience',
    projects: 'Projects',
    skills: 'Technical Skills',
    education: 'Education',
    certifications: 'Certifications & Achievements'
  },
  
  sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications']
};
/* ─────────────────────────────────────────────
   GLOBAL CSS (Font size increased to fill page properly)
───────────────────────────────────────────── */
const richTextStyles = "text-[12px] leading-relaxed hyphens-none break-normal whitespace-normal text-gray-900 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1 [&>p]:mb-1.5 [&>ol]:list-decimal [&>ol]:pl-5";

const hasContent = (d, id) => {
  if (id === 'summary') return !!d.summary;
  if (id === 'skills') return !!d.skills;
  if (['experience', 'education', 'projects', 'certifications'].includes(id)) return d[id].length > 0;
  return false;
};

/* ─────────────────────────────────────────────
   TEMPLATE 1: HARVARD (1 Column)
───────────────────────────────────────────── */
const HarvardClassic = ({ d, spacing }) => {
  const renderSection = (id) => {
    if (!hasContent(d, id)) return null;
    const title = <h2 className="text-[14px] font-bold uppercase border-b-[1.5px] border-black pb-0.5 mb-3">{d.sectionTitles[id]}</h2>;

    return (
      <div key={id} style={{ marginBottom: `${spacing}px` }}>
        {title}
        {id === 'summary' && <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: d.summary }} />}
        {id === 'skills' && <div className="whitespace-pre-wrap leading-relaxed text-[12px]" dangerouslySetInnerHTML={{ __html: d.skills.replace(/\n/g, '<br/>') }} />}
        
        {id === 'experience' && d.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between font-bold text-[12.5px]"><span>{e.role}</span><span className="font-normal">{e.duration}</span></div>
            <div className="flex justify-between italic text-[12.5px] mb-1.5"><span>{e.company}</span><span className="font-normal">{e.location}</span></div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: e.bullets }} />
          </div>
        ))}

        {id === 'projects' && d.projects.map(p => (
          <div key={p.id} className="mb-4">
            <div className="flex justify-between font-bold text-[12.5px]"><span>{p.name} {p.tech && <span className="font-normal italic">| {p.tech}</span>}</span><span className="font-normal">{p.date}</span></div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: p.description }} />
          </div>
        ))}

        {id === 'education' && d.education.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between font-bold text-[12.5px]"><span>{e.institution}</span><span className="font-normal">{e.location}</span></div>
            <div className="flex justify-between italic text-[12.5px]"><span>{e.degree}</span><span className="font-normal">{e.year}</span></div>
          </div>
        ))}

        {id === 'certifications' && d.certifications.map(c => (
          <div key={c.id} className="flex justify-between text-[12px] mb-1.5">
            <span>{c.name}</span><span>{c.date}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-10 text-[12px] font-serif text-black bg-white h-full hyphens-none">
      <div className="text-center mb-6">
        <h1 className="text-[34px] font-normal mb-1 leading-none">{d.fullName}</h1>
        <div className="text-[12.5px] mt-2">{[d.phone, d.email, d.linkedin, d.github].filter(Boolean).join(' | ')}</div>
        {d.jobTitle && <div className="text-[14px] font-bold mt-2">{d.jobTitle}</div>}
      </div>
      {d.sectionOrder.map(id => renderSection(id))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TEMPLATE 2: DATA PRO (2 Column)
───────────────────────────────────────────── */
const DataProfessional = ({ d, spacing }) => {
  const renderSection = (id) => {
    if (!hasContent(d, id)) return null;
    const title = <h2 className="text-[14px] font-bold uppercase text-gray-900 mb-3 tracking-wide border-b border-gray-300 pb-1">{d.sectionTitles[id]}</h2>;

    return (
      <div key={id} style={{ marginBottom: `${spacing}px` }}>
        {title}
        {id === 'summary' && <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: d.summary }} />}
        {id === 'skills' && <div className="whitespace-pre-wrap leading-relaxed text-[11.5px]" dangerouslySetInnerHTML={{ __html: d.skills.replace(/\n/g, '<br/>') }} />}
        
        {id === 'experience' && d.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between items-baseline"><span className="font-bold text-[12.5px]">{e.role}</span><span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap ml-2">{e.duration}</span></div>
            <div className="flex justify-between text-gray-600 text-[11.5px] italic mb-1.5"><span>{e.company}</span><span>{e.location}</span></div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: e.bullets }} />
          </div>
        ))}

        {id === 'projects' && d.projects.map(p => (
          <div key={p.id} className="mb-4">
            <div className="flex justify-between items-baseline"><span className="font-bold text-[12.5px]">{p.name}</span><span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap ml-2">{p.date}</span></div>
            {p.tech && <div className="text-[11px] text-gray-500 font-semibold mb-1.5">{p.tech}</div>}
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: p.description }} />
          </div>
        ))}

        {id === 'education' && d.education.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between items-baseline"><span className="font-bold text-[12.5px]">{e.degree}</span><span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap ml-2">{e.year}</span></div>
            <div className="flex justify-between text-gray-600 text-[11.5px]"><span>{e.institution} {e.gpa && `· ${e.gpa}`}</span><span>{e.location}</span></div>
          </div>
        ))}

        {id === 'certifications' && d.certifications.map(c => (
          <div key={c.id} className="flex justify-between mb-1.5 text-[11.5px] text-gray-800">
            <span>{c.name}</span><span>{c.date}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-10 text-[12px] font-sans text-black bg-white h-full hyphens-none">
      <div className="mb-6 border-b-[1.5px] border-black pb-4">
        <h1 className="text-[32px] font-bold text-gray-900 uppercase tracking-wide leading-none">{d.fullName}</h1>
        {d.jobTitle && <div className="text-[12.5px] font-bold mt-2 uppercase text-gray-700">{d.jobTitle}</div>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600 mt-3 font-medium">
          {d.location && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400" />{d.location}</span>}
          {d.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" />{d.phone}</span>}
          {d.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" />{d.email}</span>}
          {d.linkedin && <div>{d.linkedin}</div>}
          {d.github && <div>{d.github}</div>}
          {d.location && <div>{d.location}</div>}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          {d.sectionOrder.filter(id => ['experience', 'projects', 'education'].includes(id)).map(renderSection)}
        </div>
        <div className="col-span-4">
          {d.sectionOrder.filter(id => ['summary', 'skills', 'certifications'].includes(id)).map(renderSection)}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TEMPLATE 3: ACADEMIC LATEX (2 Column)
───────────────────────────────────────────── */
const AcademicTwoColumn = ({ d, spacing }) => {
  const renderSection = (id) => {
    if (!hasContent(d, id)) return null;
    const title = <h2 className="text-[13px] font-bold uppercase tracking-wider mb-3 border-b border-black pb-1">{d.sectionTitles[id]}</h2>;

    return (
      <div key={id} style={{ marginBottom: `${spacing}px` }}>
        {title}
        {id === 'summary' && <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: d.summary }} />}
        {id === 'skills' && <div className="whitespace-pre-wrap text-[11px] leading-relaxed break-normal" dangerouslySetInnerHTML={{ __html: d.skills.replace(/\n/g, '<br/>') }} />}
        
        {id === 'experience' && d.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between items-baseline mb-0.5"><div className="font-bold text-[12px]">{e.role}</div><div className="text-[10.5px] font-semibold">{e.duration}</div></div>
            <div className="flex justify-between italic text-gray-700 mb-1.5 text-[11.5px]"><span>{e.company}</span><span>{e.location}</span></div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: e.bullets }} />
          </div>
        ))}

        {id === 'projects' && d.projects.map(p => (
          <div key={p.id} className="mb-4">
            <div className="flex justify-between items-baseline mb-0.5"><div className="font-bold text-[12px]">{p.name} {p.tech && <span className="font-normal italic">| {p.tech}</span>}</div><div className="text-[10.5px] font-semibold">{p.date}</div></div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: p.description }} />
          </div>
        ))}

        {id === 'education' && d.education.map(e => (
          <div key={e.id} className="mb-3">
            <div className="font-bold text-[12px]">{e.degree}</div>
            <div className="flex justify-between text-gray-700 text-[11.5px] mt-0.5"><span>{e.institution} {e.gpa && `| ${e.gpa}`}</span><span>{e.year}</span></div>
          </div>
        ))}

        {id === 'certifications' && d.certifications.map(c => (
          <div key={c.id} className="mb-1.5 text-[11px] flex justify-between">
            <span>{c.name}</span><span>{c.date}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 bg-white h-full text-[12px] font-sans text-black p-10 gap-8 hyphens-none">
      <div className="col-span-4 border-r border-gray-300 pr-6">
        <h1 className="text-[28px] font-normal uppercase mb-3 leading-tight">{d.fullName}</h1>
        {d.jobTitle && <div className="text-[12px] font-bold mb-6 uppercase">{d.jobTitle}</div>}
        
        <div style={{ marginBottom: `${spacing}px` }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wider mb-3 border-b border-black pb-1">Contact</h2>
          <div className="space-y-2 text-[11px] break-normal font-medium">
            {d.phone && <div>{d.phone}</div>}
            {d.email && <div>{d.email}</div>}
            {d.linkedin && <div>{d.linkedin}</div>}
            {d.github && <div>{d.github}</div>}
            {d.location && <div>{d.location}</div>}
          </div>
        </div>
        {d.sectionOrder.filter(id => ['skills', 'certifications'].includes(id)).map(renderSection)}
      </div>

      <div className="col-span-8">
        {d.sectionOrder.filter(id => ['summary', 'experience', 'projects', 'education'].includes(id)).map(renderSection)}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TEMPLATE 4: EXECUTIVE 
   Name on Left, Stacked Links on Top-Right
───────────────────────────────────────────── */
const ExecutiveModern = ({ d, spacing }) => {
  const renderSection = (id) => {
    if (!hasContent(d, id)) return null;
    const title = <h2 className="text-[14px] font-bold uppercase border-b-[1.5px] border-black pb-1 mb-3 tracking-wide">{d.sectionTitles[id]}</h2>;

    return (
      <div key={id} style={{ marginBottom: `${spacing}px` }}>
        {title}
        {id === 'summary' && <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: d.summary }} />}
        {id === 'skills' && <div className="whitespace-pre-wrap text-[12px] leading-relaxed break-normal" dangerouslySetInnerHTML={{ __html: d.skills.replace(/\n/g, '<br/>') }} />}
        
        {id === 'experience' && d.experience.map(e => (
          <div key={e.id} className="mb-4">
            <div className="flex justify-between font-bold text-[12.5px] mb-0.5">
              <span>{e.role}</span>
              <span className="font-normal">{e.duration}</span>
            </div>
            <div className="flex justify-between text-[12px] mb-1.5 text-gray-700 font-semibold">
              <span>{e.company}</span>
              <span>{e.location}</span>
            </div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: e.bullets }} />
          </div>
        ))}

        {id === 'projects' && d.projects.map(p => (
          <div key={p.id} className="mb-4">
            <div className="flex justify-between font-bold text-[12.5px] mb-0.5">
              <span>{p.name}</span>
              <span className="font-normal">{p.date}</span>
            </div>
            <div className="text-[11.5px] mb-1.5 italic text-gray-600 font-medium">{p.tech}</div>
            <div className={richTextStyles} dangerouslySetInnerHTML={{ __html: p.description }} />
          </div>
        ))}

        {id === 'education' && d.education.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between font-bold text-[12.5px] mb-0.5">
              <span>{e.institution}</span>
              <span className="font-normal">{e.location}</span>
            </div>
            <div className="flex justify-between text-[12px] text-gray-700">
              <span>{e.degree} {e.gpa && ` | ${e.gpa}`}</span>
              <span>{e.year}</span>
            </div>
          </div>
        ))}

        {id === 'certifications' && d.certifications.map(c => (
          <div key={c.id} className="flex justify-between text-[12px] mb-1.5">
            <span>{c.name}</span><span>{c.date}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-10 text-[12px] font-sans text-black bg-white h-full hyphens-none">
      {/* HEADER: Split 60/40 and vertically centered */}
      <div className="flex items-center mb-4">
        
        {/* LEFT SIDE: Name & Title (Takes up 60% of width) */}
        <div className="w-[65%] flex flex-col justify-center pr-4">
          <h1 className="text-[34px] font-bold uppercase tracking-wider text-gray-900 leading-none">{d.fullName}</h1>
          {d.jobTitle && <div className="text-[14px] font-bold mt-2 text-gray-800">{d.jobTitle}</div>}
        </div>
        
        {/* RIGHT SIDE: Contacts (Takes up 40% of width, perfectly left-aligned inside) */}
        <div className="w-[40%] flex flex-col items-start gap-1.5 text-[11px] text-gray-800 font-medium">
          {d.phone && <span className="flex items-center gap-2"><Phone size={12} className="text-gray-500 shrink-0" /> <span>{d.phone}</span></span>}
          {d.email && <span className="flex items-center gap-2"><Mail size={12} className="text-gray-500 shrink-0" /> <span>{d.email}</span></span>}
          {d.linkedin && <span className="flex items-center gap-2"><LinkedInIcon /> <span>{d.linkedin}</span></span>}
          {d.github && <span className="flex items-center gap-2"><GitHubIcon /> <span>{d.github}</span></span>}
          {d.location && <span className="flex items-center gap-2"><MapPin size={12} className="text-gray-500 shrink-0" /> <span>{d.location}</span></span>}
        </div>

      </div>
      
      {d.sectionOrder.map(id => renderSection(id))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PREVIEW MAP
───────────────────────────────────────────── */
const PREVIEW_MAP = {
  'harvard':   HarvardClassic,
  'data-pro':  DataProfessional,
  'academic':  AcademicTwoColumn,
  'executive': ExecutiveModern,
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS (FORM UI)
───────────────────────────────────────────── */
const Field = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 transition" />
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 resize-none transition" />
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [activeTab, setActiveTab] = useState('layout');

  const [scale, setScale] = useState(70);
  const [spacing, setSpacing] = useState(20); // Increased default spacing for fuller pages

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${formData.fullName.replace(/\s+/g, '_') || 'Resume'}`,
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const moveSection = (index, direction) => {
    const newOrder = [...formData.sectionOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setFormData({ ...formData, sectionOrder: newOrder });
  };

  const handleTitleChange = (id, newTitle) => {
    setFormData({ ...formData, sectionTitles: { ...formData.sectionTitles, [id]: newTitle } });
  };

  const addExperience = () => setFormData({ ...formData, experience: [...formData.experience, { id: makeId(), role: '', company: '', duration: '', location: '', bullets: '' }] });
  const removeExperience = (id) => setFormData({ ...formData, experience: formData.experience.filter(e => e.id !== id) });
  const updateExperience = (id, field, value) => setFormData({ ...formData, experience: formData.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const addEducation = () => setFormData({ ...formData, education: [...formData.education, { id: makeId(), degree: '', institution: '', year: '', location: '', gpa: '' }] });
  const removeEducation = (id) => setFormData({ ...formData, education: formData.education.filter(e => e.id !== id) });
  const updateEducation = (id, field, value) => setFormData({ ...formData, education: formData.education.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const addProject = () => setFormData({ ...formData, projects: [...formData.projects, { id: makeId(), name: '', tech: '', date: '', description: '' }] });
  const removeProject = (id) => setFormData({ ...formData, projects: formData.projects.filter(p => p.id !== id) });
  const updateProject = (id, field, value) => setFormData({ ...formData, projects: formData.projects.map(p => p.id === id ? { ...p, [field]: value } : p) });

  const addCert = () => setFormData({ ...formData, certifications: [...formData.certifications, { id: makeId(), name: '', date: '' }] });
  const removeCert = (id) => setFormData({ ...formData, certifications: formData.certifications.filter(c => c.id !== id) });
  const updateCert = (id, field, value) => setFormData({ ...formData, certifications: formData.certifications.map(c => c.id === id ? { ...c, [field]: value } : c) });

  const TABS = [
    { id: 'layout', label: 'Layout & Titles', icon: LayoutList },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  const PreviewComponent = PREVIEW_MAP[selectedTemplate] || PREVIEW_MAP['harvard'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Advanced ATS Builder</h2>
          <p className="text-slate-500 text-sm mt-0.5">Live rich-text editing, drag-and-drop sections, and pure HTML rendering.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2">
            <Download size={17} /> Download Resume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <Sliders size={18} className="text-slate-400" />
          <div className="flex-1">
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">Fit to Page (Scale) <span>{scale}%</span></label>
            <input type="range" min="50" max="100" value={scale} onChange={(e) => setScale(e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <Layers size={18} className="text-slate-400" />
          <div className="flex-1">
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">Section Spacing <span>{spacing}px</span></label>
            <input type="range" min="4" max="32" value={spacing} onChange={(e) => setSpacing(e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-blue-600" />
          <span className="font-semibold text-slate-800 text-sm">Choose Template Layout</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" onClick={() => setSelectedTemplate(tpl.id)} className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${selectedTemplate === tpl.id ? 'border-gray-800 bg-gray-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
              <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: tpl.accent }} />
              <div className="flex items-center justify-between"><span className="font-semibold text-sm text-slate-800">{tpl.name}</span>{selectedTemplate === tpl.id && <Check size={13} className="text-gray-800 flex-shrink-0" />}</div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[850px]">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === id ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <div className="p-5 flex-1 space-y-4 overflow-y-auto">
            
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-2">Use the arrows to reorder how sections appear on your resume. You can also rename the section headers here!</p>
                {formData.sectionOrder.map((sectionId, idx) => (
                  <div key={sectionId} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-blue-600 disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button onClick={() => moveSection(idx, 'down')} disabled={idx === formData.sectionOrder.length - 1} className="text-slate-400 hover:text-blue-600 disabled:opacity-30"><ArrowDown size={16} /></button>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{sectionId} section</label>
                      <input 
                        type="text" 
                        value={formData.sectionTitles[sectionId]} 
                        onChange={(e) => handleTitleChange(sectionId, e.target.value)} 
                        className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} />
                  <Field label="Target Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Data Analyst | Python, SQL" />
                  <Field label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} />
                  <Field label="Phone *" name="phone" value={formData.phone} onChange={handleChange} />
                  <Field label="Location" name="location" value={formData.location} onChange={handleChange} />
                  <Field label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <Field label="GitHub URL" name="github" value={formData.github} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Professional Summary (Rich Text)</label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden [&_.rsw-editor]:min-h-[120px] [&_.rsw-toolbar]:bg-slate-50 [&_.rsw-toolbar]:border-b [&_.rsw-toolbar]:border-slate-200">
                    <Editor value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                  <div key={exp.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role #{idx + 1}</span>
                      {formData.experience.length > 1 && (<button type="button" onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Job Title *" name="role" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                      <Field label="Company *" name="company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                      <Field label="Duration" name="duration" value={exp.duration} onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)} />
                      <Field label="Location" name="location" value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} placeholder="e.g. Remote, NY" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Responsibilities (Rich Text)</label>
                      <div className="border border-slate-200 rounded-lg overflow-hidden [&_.rsw-editor]:min-h-[120px] [&_.rsw-toolbar]:bg-slate-50 [&_.rsw-toolbar]:border-b [&_.rsw-toolbar]:border-slate-200">
                        <Editor value={exp.bullets} onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addExperience} className="w-full flex justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:text-blue-600"><Plus size={15} /> Add Another Role</button>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div key={edu.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qual #{idx + 1}</span>
                      {formData.education.length > 1 && (<button type="button" onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Degree" name="degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                      <Field label="Institution" name="institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
                      <Field label="Year" name="year" value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} />
                      <Field label="Location" name="location" value={edu.location} onChange={(e) => updateEducation(edu.id, 'location', e.target.value)} />
                      <div className="sm:col-span-2">
                        <Field label="GPA / CGPA" name="gpa" value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addEducation} className="w-full flex justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:text-blue-600"><Plus size={15} /> Add Qualification</button>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {formData.projects.map((proj, idx) => (
                  <div key={proj.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project #{idx + 1}</span>
                      {formData.projects.length > 1 && (<button type="button" onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>)}
                    </div>
                    <Field label="Project Name" name="name" value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Tech Stack" name="tech" value={proj.tech} onChange={(e) => updateProject(proj.id, 'tech', e.target.value)} />
                      <Field label="Date / Duration" name="date" value={proj.date} onChange={(e) => updateProject(proj.id, 'date', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description (Rich Text)</label>
                      <div className="border border-slate-200 rounded-lg overflow-hidden [&_.rsw-editor]:min-h-[120px] [&_.rsw-toolbar]:bg-slate-50 [&_.rsw-toolbar]:border-b [&_.rsw-toolbar]:border-slate-200">
                        <Editor value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addProject} className="w-full flex justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:text-blue-600"><Plus size={15} /> Add Project</button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Core Technical Skills (HTML Supported)</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden [&_.rsw-editor]:min-h-[150px] [&_.rsw-toolbar]:bg-slate-50 [&_.rsw-toolbar]:border-b [&_.rsw-toolbar]:border-slate-200">
                   <Editor value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
                </div>
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-4">
                {formData.certifications.map((cert, idx) => (
                  <div key={cert.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry #{idx + 1}</span>
                      {formData.certifications.length > 1 && (<button type="button" onClick={() => removeCert(cert.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Certificate / Achievement Name *" name="name" value={cert.name} onChange={(e) => updateCert(cert.id, 'name', e.target.value)} />
                      <Field label="Date / Year" name="date" value={cert.date} onChange={(e) => updateCert(cert.id, 'date', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addCert} className="w-full flex justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:text-blue-600"><Plus size={15} /> Add Certificate / Achievement</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</span>
          </div>

          <div className="bg-slate-200 rounded-2xl py-8 flex justify-center border border-slate-300 shadow-inner overflow-y-auto h-[850px] relative custom-scrollbar">
            <div className="w-full flex justify-center" style={{ height: `${297 * (scale / 100)}mm` }}>
              <div style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}>
                <div ref={componentRef} className="bg-white shadow-xl overflow-hidden" style={{ width: '210mm', minHeight: '297mm' }}>
                  <PreviewComponent d={formData} spacing={spacing} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;