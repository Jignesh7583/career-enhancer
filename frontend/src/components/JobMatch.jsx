import { useState, useRef } from 'react';
import {
  UploadCloud, FileText, Loader2, AlertCircle, Target,
  CheckCircle, XCircle, Zap, TrendingUp, Briefcase,
  GraduationCap, FolderOpen, HelpCircle, Lightbulb, ArrowRight, Lock
} from 'lucide-react';

// The bottom row panels (Resume Improvements / Interview Questions) are both
// data-driven and can vary in length, so they get a fixed height and scroll
// internally once content exceeds it. The top-left "Upload" panel is fixed
// content (it never grows), so it is left to size naturally — the ATS report
// panel on the right then stretches to match it via CSS grid (`items-stretch`)
// and scrolls internally on its own if its content ends up taller.
const BOTTOM_PANEL_HEIGHT = 380;  // Resume Improvements <-> Interview Questions

const JobMatch = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  /* ─── Handlers ─── */
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') { setFile(f); setError(null); }
    else { setError('Please select a valid PDF file.'); setFile(null); }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMatch = async () => {
    if (!file) { setError('Please upload your resume.'); return; }
    if (!jobDescription.trim()) { setError('Please paste the job description.'); return; }
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('https://career-enhancer-us-backend.onrender.com/api/match-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) setResults(data.results);
      else setError(data.error || 'Failed to analyze match.');
    } catch {
      setError('Server error. Make sure your Flask backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ─── Verdict config (score hero only) ─── */
  const getVerdict = (score) => {
    if (score >= 85) return {
      label: 'Strong Match', emoji: '✅', textColor: 'text-green-600',
      desc: 'Great! Your resume matches well with the job description. Good chances of passing ATS screening.',
    };
    if (score >= 65) return {
      label: 'Moderate Match', emoji: '⚠️', textColor: 'text-amber-600',
      desc: 'Your resume partially matches this role. Consider optimizing it to improve your ATS score.',
    };
    return {
      label: 'Weak Match', emoji: '❌', textColor: 'text-red-600',
      desc: 'Your resume has significant gaps for this role. Major updates are needed to pass ATS screening.',
    };
  };

  /* ─── Circular SVG ring ─── */
  const ScoreRing = ({ score }) => {
    const r = 50, circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
      <div className="relative w-[120px] h-[120px] shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke="#7c3aed" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold text-slate-800 leading-none">{score}%</span>
          <span className="text-[11px] text-slate-400 font-medium mt-1">Match</span>
        </div>
      </div>
    );
  };

  /* ─── Sub-score mini card ─── */
  const MiniCard = ({ Icon, color, label, value }) => (
    <div className="flex-1 flex flex-col items-center bg-white border border-slate-100 rounded-xl p-3 shadow-sm min-w-0">
      <Icon size={14} className={`${color} mb-1`} />
      <span className={`text-[19px] font-bold leading-tight ${color}`}>{value}%</span>
      <span className="text-[9px] text-slate-500 text-center leading-tight mt-0.5">{label}</span>
    </div>
  );

  const verdict = results ? getVerdict(results.match_score) : null;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">

      {/* ══════════════ PAGE HEADER — sits above both panels, not inside either card ══════════════ */}
      <div className="flex items-start gap-3 px-1">
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Job Fit Analysis</h2>
          <p className="text-[15px] text-slate-500 mt-0.5 leading-relaxed">
            Upload your resume, analyze ATS compatibility, identify skill gaps, and improve
            your chances of getting hired.
          </p>
        </div>
      </div>

      {/* ══════════════ TOP ROW — both panels locked to the same height ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-4 items-stretch">

        {/* ── LEFT: Form panel — natural height, no scrolling, content is fixed ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">

          {/* Step 1 — Job Description */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-[22px] h-[22px] rounded-md bg-purple-50 border border-purple-200
                              flex items-center justify-center shrink-0">
                <FileText size={11} className="text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">1. Paste Job Description</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 ml-7">Paste the full job description below</p>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-44 resize-none bg-slate-50 border border-slate-200 rounded-xl
                         px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400
                         focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-300
                         overflow-y-auto"
            />
          </div>

          {/* Step 2 — Resume Upload */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-[22px] h-[22px] rounded-md bg-purple-50 border border-purple-200
                              flex items-center justify-center shrink-0">
                <UploadCloud size={11} className="text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">2. Upload Resume</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 ml-7">Upload your latest resume (PDF format)</p>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {file ? (
              <div className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-xl
                              p-4 flex flex-col items-center text-center">
                <UploadCloud size={24} className="text-purple-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700 break-all">{file.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF • {(file.size / 1024).toFixed(0)} KB
                </p>
                <button
                  onClick={handleRemoveFile}
                  className="mt-2 text-xs font-semibold text-purple-600 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-xl
                           p-6 flex flex-col items-center cursor-pointer hover:bg-purple-50 transition-colors"
              >
                <UploadCloud size={24} className="text-purple-500 mb-2" />
                <p className="text-sm text-slate-600 font-medium">Click to attach PDF resume</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100
                            rounded-xl text-xs text-red-600">
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleMatch}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700
                       disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold
                       text-sm py-3 rounded-xl transition-colors shadow-sm"
          >
            {isAnalyzing
              ? <><Loader2 size={16} className="animate-spin" /> Analyzing Match...</>
              : <><Target size={16} /> Analyze ATS Match</>}
          </button>

          {/* Security note */}
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock size={10} /> Your data is secure and will not be shared with anyone.
          </p>
        </div>

        {/* ── RIGHT: Score + Sub-scores + Strengths/Gaps — stretches to match the left panel's height, scrolls internally if its own content is taller ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-y-auto">

          {/* Loading */}
          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 size={36} className="animate-spin text-purple-400" />
              <p className="text-sm">Running ATS simulation algorithm...</p>
            </div>
          )}

          {/* Results */}
          {!isAnalyzing && results && (
            <div className="flex flex-col gap-4">

              {/* Panel header */}
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-purple-500" />
                <h3 className="font-bold text-slate-800">ATS Analysis Report</h3>
              </div>

              {/* Score hero */}
              <div className="flex items-center gap-5 bg-slate-50 rounded-2xl p-4">
                <ScoreRing score={results.match_score} />
                <div className="flex-1">
                  <p className={`text-xl font-bold flex items-center gap-1.5 mb-1 ${verdict.textColor}`}>
                    {verdict.label} <span className="text-lg">{verdict.emoji}</span>
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">{verdict.desc}</p>
                </div>
              </div>

              {/* Sub-score row */}
              <div className="flex gap-2">
                <MiniCard Icon={Zap}           color="text-purple-600" label="Skills Match"     value={results.skills_match     ?? 0} />
                <MiniCard Icon={Briefcase}     color="text-blue-500"   label="Experience Match" value={results.experience_match  ?? 0} />
                <MiniCard Icon={GraduationCap} color="text-green-500"  label="Education Match"  value={results.education_match   ?? 0} />
                <MiniCard Icon={FolderOpen}    color="text-orange-500" label="Projects Match"   value={results.projects_match    ?? 0} />
              </div>

              {/* Top Strengths + Skill Gap — each list scrolls on its own if it ever grows past 5 items */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-green-700 flex items-center gap-1.5 mb-3">
                    <TrendingUp size={13} /> Top Strengths
                  </h4>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {(results.top_strengths || []).slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" /> {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-3">
                    <XCircle size={13} /> Skill Gap Analysis
                  </h4>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {(results.skill_gap || []).slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Empty state */}
          {!isAnalyzing && !results && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Target size={44} className="mb-4 opacity-20" />
              <p className="text-sm text-center max-w-xs leading-relaxed">
                Paste a Job Description and upload your resume to see your ATS Analysis Report.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ BOTTOM ROW — Full width, only when results, both panels locked to the same height ══════════════ */}
      {!isAnalyzing && results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

          {/* Resume Improvement Suggestions */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col"
            style={{ height: BOTTOM_PANEL_HEIGHT }}
          >
            <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-4 shrink-0">
              <Lightbulb size={15} className="text-amber-500" />
              Resume Improvement Suggestions
            </h4>
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 min-h-0">
              {(results.resume_improvements || []).slice(0, 5).map((imp, i) => (
                <div
                  key={i}
                  className={i > 0 ? 'border-t border-slate-100 pt-4' : ''}
                >
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600
                                   text-[9px] font-bold rounded mb-1.5">
                    Current
                  </span>
                  <p className="text-[11px] text-slate-500 italic mb-2 leading-relaxed">
                    "{imp.current}"
                  </p>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ArrowRight size={10} className="text-slate-400 shrink-0" />
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-600
                                     text-[9px] font-bold rounded">
                      Suggested Improvement
                    </span>
                  </div>
                  <p className="text-[11px] text-green-700 font-semibold italic leading-relaxed">
                    "{imp.suggested}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Interview Questions */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col"
            style={{ height: BOTTOM_PANEL_HEIGHT }}
          >
            <h4 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-4 shrink-0">
              <HelpCircle size={15} className="text-blue-500" />
              Generated Interview Questions
            </h4>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0">
              {(results.interview_questions || []).slice(0, 5).map((q, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px]
                                   font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {q}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default JobMatch;