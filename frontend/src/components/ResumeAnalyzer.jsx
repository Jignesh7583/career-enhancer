import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  ArrowUp,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // States for the Apply button
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const { user, isLoaded, isSignedIn } = useUser();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === 'application/pdf' ||
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      setFile(selectedFile);
      setError(null);
      setResults(null);
      setAppliedSuccess(false);
    } else {
      setError('Please select a valid PDF or DOCX file.');
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    if (
      droppedFile.type === 'application/pdf' ||
      droppedFile.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setFile(droppedFile);
      setError(null);
      setResults(null);
      setAppliedSuccess(false);
    } else {
      setError('Please select a valid PDF or DOCX file.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setAppliedSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    if (isSignedIn && isLoaded) {
      formData.append('email', user.primaryEmailAddress?.emailAddress);
      formData.append('name', user.fullName || 'Unknown User');
    }

    try {
      const response = await fetch(
        'https://career-enhancer-us-backend.onrender.com/api/upload-resume',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to analyze resume.');
      }
    } catch (err) {
      setError('Server error. Make sure your Flask backend is running on port 5000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyImprovements = () => {
    setIsApplying(true);

    // Simulating applying updates to the resume builder
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);

      // Reset button after 3 seconds
      setTimeout(() => setAppliedSuccess(false), 3000);
    }, 1500);
  };

  // ---- derived display helpers ----
  const overall = results?.overall_score ?? 0;
  const potential = results?.potential_score ?? overall;

  const gaugeDeg = results ? (overall / 100) * 360 : 0;

  const metricBadge = (score) => {
    if (typeof score !== 'number') return { label: '--', cls: 'bg-slate-100 text-slate-400' };
    if (score >= 80) return { label: 'Good', cls: 'bg-emerald-100 text-emerald-700' };
    if (score >= 65) return { label: 'Fair', cls: 'bg-amber-100 text-amber-700' };
    if (score >= 50) return { label: 'Avg', cls: 'bg-orange-100 text-orange-700' };
    return { label: 'Low', cls: 'bg-red-100 text-red-700' };
  };

  const severityIcon = (severity) => {
    if (severity === 'high')
      return (
        <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={16} className="text-red-500" />
        </span>
      );
    if (severity === 'low')
      return (
        <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
          <Info size={16} className="text-indigo-500" />
        </span>
      );
    return (
      <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
        <AlertCircle size={16} className="text-orange-500" />
      </span>
    );
  };

  // Sort suggestions by score_impact (High to Low), defensively handling missing values
  const sortedSuggestions = results?.suggestions
    ? [...results.suggestions].sort(
        (a, b) => (b.score_impact ?? 0) - (a.score_impact ?? 0)
      )
    : [];

  const metrics = [
    {
      key: 'format',
      label: 'Format',
      icon: <FileText size={16} />,
      score: results?.format_score,
    },
    {
      key: 'skills',
      label: 'Skills Match',
      icon: <Sparkles size={16} />,
      score: results?.skills_match_score,
    },
    {
      key: 'experience',
      label: 'Experience',
      icon: <RefreshCw size={16} />,
      score: results?.experience_score,
    },
    {
      key: 'impact',
      label: 'Impact',
      icon: <ArrowUp size={16} />,
      score: results?.impact_score,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Resume Analyzer</h2>
        <p className="text-slate-500 mt-1">
          Upload your resume to receive an AI-powered ATS analysis and actionable improvement
          suggestions.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN (span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Upload Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {!file && (
              <div
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="group border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center cursor-pointer hover:bg-indigo-50 transition-colors"
              >
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UploadCloud size={26} />
                </div>
                <p className="font-bold text-slate-800 mb-1">Drag &amp; Drop Resume</p>
                <p className="text-sm text-slate-500 mb-4">
                  Supported formats: PDF, DOCX (Max 5MB)
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current.click();
                  }}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {file && (
              <div className="flex items-center justify-between gap-3 p-3 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {results ? 'Last analyzed: just now' : 'Ready to analyze'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isAnalyzing}
                  className="shrink-0 flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} /> {results ? 'Re-analyze' : 'Analyze'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900">AI Suggestions</h3>
              </div>

              {results ? (
                <button
                  onClick={handleApplyImprovements}
                  disabled={isApplying || appliedSuccess}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    appliedSuccess
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Applying...
                    </>
                  ) : appliedSuccess ? (
                    <>
                      <CheckCircle size={14} /> Applied!
                    </>
                  ) : (
                    'Apply Top Fixes'
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                  Filter by: Impact (High to Low)
                </div>
              )}
            </div>

            <div className="p-5 space-y-4 max-h-[560px] overflow-y-auto">
              {results && sortedSuggestions.length > 0 ? (
                sortedSuggestions.map((s, index) => (
                  <div
                    key={index}
                    className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2.5">
                        {severityIcon(s.severity)}
                        <h4 className="font-bold text-slate-900 leading-snug pt-1">{s.title}</h4>
                      </div>
                      {typeof s.score_impact === 'number' && (
                        <span className="shrink-0 flex items-center gap-1 bg-indigo-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          <ArrowUp size={12} /> +{s.score_impact} Score
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 mb-3 pl-[42px]">{s.description}</p>

                    {s.type === 'keywords' && Array.isArray(s.keywords) && s.keywords.length > 0 && (
                      <div className="pl-[42px] flex flex-wrap gap-2">
                        {s.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100"
                          >
                            <Plus size={11} /> {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {s.type !== 'keywords' && (s.current || s.suggested) && (
                      <div className="pl-[42px] space-y-2">
                        {s.current && (
                          <div className="bg-red-50 border-l-4 border-red-300 rounded-r-lg px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-0.5">
                              Current:
                            </p>
                            <p className="text-sm text-slate-600 italic">"{s.current}"</p>
                          </div>
                        )}
                        {s.suggested && (
                          <div className="bg-indigo-50 border-l-4 border-indigo-300 rounded-r-lg px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-0.5 flex items-center gap-1">
                              <Sparkles size={10} /> Suggested:
                            </p>
                            <p className="text-sm text-slate-700 italic">"{s.suggested}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : results ? (
                <div className="text-center py-10 text-sm text-slate-400">
                  No suggestions returned for this resume.
                </div>
              ) : (
                // empty / placeholder skeleton state (kept identical structurally)
                [0, 1, 2].map((i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                        <div className="h-4 bg-slate-100 rounded w-2/3 mt-1.5" />
                      </div>
                      <div className="h-5 w-16 bg-slate-100 rounded-full shrink-0" />
                    </div>
                    <div className="pl-[42px] space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-10 bg-slate-50 rounded-lg w-full mt-2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Score & Metrics (span 1) */}
        <div className="flex flex-col gap-6">
          {/* Overall ATS Score */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-red-400 via-amber-400 to-indigo-600" />
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-5">Overall ATS Score</h3>

              <div className="flex items-center justify-center mb-6">
                <div
                  className="relative w-40 h-40 rounded-full flex items-center justify-center"
                  style={{
                    background: results
                      ? `conic-gradient(#4338ca ${gaugeDeg}deg, #e2e8f0 ${gaugeDeg}deg)`
                      : '#e2e8f0',
                  }}
                >
                  <div className="absolute w-[120px] h-[120px] bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900">
                      {results ? overall : '--'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium text-slate-500">Current Score</span>
                  <span className="text-base font-bold text-slate-900">
                    {results ? overall : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100">
                  <span className="text-sm font-semibold text-indigo-700 flex items-center gap-1.5">
                    <Sparkles size={14} /> Potential Score
                  </span>
                  <span className="text-base font-bold text-indigo-700">
                    {results ? potential : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m) => {
              const badge = results ? metricBadge(m.score) : null;
              const hasScore = results && typeof m.score === 'number';
              return (
                <div
                  key={m.key}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                      {m.icon}
                    </div>
                    {badge ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    ) : (
                      <span className="h-4 w-8 bg-slate-100 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className="text-xl font-extrabold text-slate-900">
                    {hasScore ? (
                      <>
                        {m.score}
                        <span className="text-xs font-semibold text-slate-400">/100</span>
                      </>
                    ) : (
                      <span className="text-slate-300">--</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Keyword Match */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Keyword Match</h3>
              {results && (
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  View All
                </button>
              )}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Matched (Found In Resume)
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {results
                ? (results.matched_skills?.length > 0
                    ? results.matched_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded border border-emerald-100"
                        >
                          <CheckCircle size={12} /> {skill}
                        </span>
                      ))
                    : <span className="text-xs text-slate-400">No strong matches found.</span>)
                : [0, 1, 2].map((i) => (
                    <span key={i} className="h-6 w-16 bg-slate-100 rounded" />
                  ))}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2">
              Missing (Critical For Role)
            </p>
            <div className="flex flex-wrap gap-2">
              {results
                ? (results.missing_skills?.length > 0
                    ? results.missing_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded border border-red-100"
                        >
                          <XCircle size={12} /> {skill}
                        </span>
                      ))
                    : <span className="text-xs text-slate-400">No critical gaps found.</span>)
                : [0, 1].map((i) => (
                    <span key={i} className="h-6 w-20 bg-slate-100 rounded" />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;