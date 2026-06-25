import { useState, useRef } from 'react';
import {
  UploadCloud, Loader2, AlertCircle, Target,
  CheckCircle, XCircle, TrendingUp, Lightbulb,
  HelpCircle, ArrowRight, Shield, Star,
  Briefcase, GraduationCap, FolderGit2
} from 'lucide-react';

/* ════════════════════════════════════════════════
   SCORE RING
════════════════════════════════════════════════ */
const ScoreRing = ({ score }) => {
  const safeScore = Math.min(Math.max(Number(score) || 0, 0), 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safeScore / 100) * circ;
  const color =
    safeScore >= 85 ? '#16a34a'
    : safeScore >= 65 ? '#9333ea'
    : '#dc2626';

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
      <text x="70" y="64" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1e293b">
        {safeScore}%
      </text>
      <text x="70" y="83" textAnchor="middle" fontSize="12" fill="#64748b">
        Match
      </text>
    </svg>
  );
};

/* ════════════════════════════════════════════════
   VERDICT HELPERS
════════════════════════════════════════════════ */
const getVerdictKey = (verdict, score) => {
  if (typeof verdict === 'string') {
    if (verdict.toLowerCase().includes('strong'))   return 'Strong Match';
    if (verdict.toLowerCase().includes('moderate')) return 'Moderate Match';
    if (verdict.toLowerCase().includes('weak'))     return 'Weak Match';
  }
  // derive from score if verdict string is missing / unexpected
  if (score >= 85) return 'Strong Match';
  if (score >= 65) return 'Moderate Match';
  return 'Weak Match';
};

const verdictStyles = {
  'Strong Match':   { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  icon: '✅', desc: 'Great! Your resume matches well with the job description. You have good chances of passing the ATS screening.' },
  'Moderate Match': { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  icon: '⚠️', desc: 'Your resume partially matches the role. Optimize missing keywords to raise your ATS score.' },
  'Weak Match':     { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    icon: '❌', desc: 'Your resume needs significant improvement to pass ATS screening for this role.' },
};

/* ════════════════════════════════════════════════
   SUB-SCORE CARD
════════════════════════════════════════════════ */
const SubCard = ({ Icon, label, value, accent }) => {
  const display = (value !== undefined && value !== null && value !== '') ? `${value}%` : '—';
  return (
    <div className="flex flex-col items-center gap-1 flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-0">
      <Icon size={15} className={accent} />
      <span className="text-[10px] text-slate-500 font-semibold text-center leading-tight">{label}</span>
      <span className="text-lg font-bold text-slate-800">{display}</span>
    </div>
  );
};

/* ════════════════════════════════════════════════
   SECTION WRAPPER
════════════════════════════════════════════════ */
const Section = ({ Icon, title, iconColor, bg, border, children }) => (
  <div className={`rounded-xl border p-4 ${bg} ${border}`}>
    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
      <Icon size={13} className={iconColor} />
      {title}
    </h4>
    {children}
  </div>
);

/* ════════════════════════════════════════════════
   SAFE ARRAY HELPER
════════════════════════════════════════════════ */
const safeArr = (v) => (Array.isArray(v) && v.length > 0 ? v : null);

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const JobMatch = () => {
  const [file, setFile]                     = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [results, setResults]               = useState(null);
  const [error, setError]                   = useState(null);
  const fileInputRef                        = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setError(null); }
    else { setError('Please select a valid PDF file.'); setFile(null); }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMatch = async () => {
    if (!file)                 return setError('Please upload your resume.');
    if (!jobDescription.trim()) return setError('Please paste the job description.');

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      const res  = await fetch(
        'https://career-enhancer-us-backend.onrender.com/api/match-resume',
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (res.ok) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to analyze match.');
      }
    } catch {
      setError('Server error. Make sure your Flask backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Derived verdict values ─────────────── */
  const verdictKey  = results ? getVerdictKey(results.ats_verdict, results.match_score ?? 0) : null;
  const verdictCfg  = verdictKey ? verdictStyles[verdictKey] : null;
  const scoreNum    = Number(results?.match_score) || 0;

  /* ── RENDER ─────────────────────────────── */
  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto' }} className="space-y-6">

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Resume v/s JD Matcher</h2>
        <p className="text-slate-500 text-sm">Find out if your resume beats the ATS for a specific job.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">

          {/* Step 1 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center select-none">1</span>
                Paste Job Description
              </label>
              <span className="text-[11px] text-slate-400">Paste the full JD below</span>
            </div>
            <textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400
                         h-44 resize-none bg-slate-50"
            />
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center select-none">2</span>
                Upload Resume
              </label>
              <span className="text-[11px] text-slate-400">PDF format only</span>
            </div>
            <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-xl
                         flex flex-col items-center justify-center p-6 text-center
                         cursor-pointer hover:bg-purple-50 transition-colors"
            >
              <UploadCloud size={26} className="text-purple-500 mb-2" />
              {file ? (
                <>
                  <p className="text-sm text-slate-700 font-semibold">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF · {(file.size / 1024).toFixed(0)} KB</p>
                  <button onClick={handleRemove} className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-semibold underline">
                    Remove file
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">Click to attach PDF resume</p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleMatch}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl
                       text-sm font-semibold transition-colors shadow-sm
                       flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAnalyzing
              ? <><Loader2 size={18} className="animate-spin" /> Analyzing Match…</>
              : <><Target size={18} /> Analyze ATS Match</>}
          </button>

          <p className="text-center text-xs text-slate-400">
            🔒 Your data is secure and will not be shared with anyone.
          </p>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

          {/* Loading */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
              <Loader2 size={42} className="animate-spin text-purple-400" />
              <p className="text-sm">Running ATS simulation algorithm…</p>
            </div>
          )}

          {/* Empty state */}
          {!isAnalyzing && !results && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Target size={50} className="mb-4 opacity-20" />
              <p className="text-sm text-center max-w-xs">
                Paste a Job Description and upload your resume to see how well you match the role.
              </p>
            </div>
          )}

          {/* Results */}
          {!isAnalyzing && results && (
            <div className="space-y-5">

              {/* Report header */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Star size={14} className="text-purple-500" />
                <h3 className="font-bold text-slate-700 text-base">ATS Analysis Report</h3>
              </div>

              {/* ── Score + Verdict row ─────────────── */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ScoreRing score={scoreNum} />

                {/* Verdict card */}
                <div className={`flex-1 w-full rounded-xl border p-4 ${verdictCfg?.bg} ${verdictCfg?.border}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Shield size={10} /> ATS Verdict
                  </p>
                  <p className={`text-xl font-bold ${verdictCfg?.text}`}>
                    {verdictCfg?.icon} {verdictKey}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{verdictCfg?.desc}</p>
                  {results.ats_pass_rate && (
                    <p className="text-xs font-semibold text-slate-700 mt-3">
                      Estimated ATS Pass Rate:{' '}
                      <span className={`font-bold ${verdictCfg?.text}`}>{results.ats_pass_rate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Sub-scores ──────────────────────── */}
              <div className="flex gap-2">
                <SubCard Icon={TrendingUp}    label="Skills Match"     value={results.skills_match}     accent="text-purple-500" />
                <SubCard Icon={Briefcase}     label="Experience Match" value={results.experience_match} accent="text-blue-500"   />
                <SubCard Icon={GraduationCap} label="Education Match"  value={results.education_match}  accent="text-green-500"  />
                <SubCard Icon={FolderGit2}    label="Projects Match"   value={results.projects_match}   accent="text-orange-500" />
              </div>

              {/* ── Strengths + Skill Gap ───────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Section Icon={CheckCircle} title="Top Strengths" iconColor="text-green-500" bg="bg-green-50" border="border-green-100">
                  {safeArr(results.top_strengths) ? (
                    <ul className="space-y-1.5">
                      {results.top_strengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-green-800 font-medium">
                          <CheckCircle size={13} className="text-green-500 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-slate-400 italic">No strengths data returned.</p>}
                </Section>

                <Section Icon={XCircle} title="Skill Gap Analysis" iconColor="text-red-500" bg="bg-red-50" border="border-red-100">
                  {safeArr(results.skill_gap) ? (
                    <ul className="space-y-1.5">
                      {results.skill_gap.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-red-800 font-medium">
                          <XCircle size={13} className="text-red-400 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-slate-400 italic">No skill gaps detected.</p>}
                </Section>
              </div>

              {/* ── AI Recommendations ──────────────── */}
              {safeArr(results.recommendations) && (
                <Section Icon={Lightbulb} title="AI Recommendations" iconColor="text-purple-500" bg="bg-purple-50" border="border-purple-100">
                  <p className="text-[11px] text-slate-500 mb-2">
                    To improve your match score and ATS compatibility, consider the following:
                  </p>
                  <ul className="space-y-1.5">
                    {results.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* ── Interview Questions ──────────────── */}
              {safeArr(results.interview_questions) && (
                <Section Icon={HelpCircle} title="Generated Interview Questions" iconColor="text-blue-500" bg="bg-blue-50" border="border-blue-100">
                  <ol className="space-y-1.5 list-none">
                    {results.interview_questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="font-bold text-blue-500 shrink-0">{i + 1}.</span>{q}
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* ── Resume Improvements + ATS Verdict card ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {safeArr(results.resume_improvements) && (
                  <Section Icon={Lightbulb} title="Resume Improvement Suggestions" iconColor="text-amber-500" bg="bg-amber-50" border="border-amber-100">
                    <div className="space-y-3">
                      {results.resume_improvements.map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="text-xs bg-white border border-amber-200 rounded-lg p-2 text-slate-600">
                            <span className="inline-block bg-slate-200 text-slate-600 text-[9px] font-bold rounded px-1.5 py-0.5 mb-1">Current</span>
                            <p className="italic">"{item.current}"</p>
                          </div>
                          <div className="flex justify-center">
                            <ArrowRight size={13} className="text-amber-400" />
                          </div>
                          <div className="text-xs bg-white border border-green-200 rounded-lg p-2 text-slate-700">
                            <span className="inline-block bg-green-100 text-green-700 text-[9px] font-bold rounded px-1.5 py-0.5 mb-1">Suggested</span>
                            <p>"{item.suggested}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Bottom ATS Verdict card */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between
                  ${verdictCfg?.bg} ${verdictCfg?.border}`}
                >
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Shield size={10} /> ATS Verdict
                    </p>
                    <p className={`text-lg font-bold ${verdictCfg?.text}`}>
                      {verdictKey} {verdictCfg?.icon}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] text-slate-500 font-medium">Estimated ATS Pass Rate</p>
                    <p className={`text-2xl font-bold ${verdictCfg?.text}`}>
                      {results.ats_pass_rate
                        ?? `${scoreNum}% – ${Math.min(scoreNum + 5, 100)}%`}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatch;