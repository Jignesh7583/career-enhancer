import { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, Target, CheckCircle, XCircle } from 'lucide-react';

const JobMatch = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid PDF file.");
      setFile(null);
    }
  };

  const handleMatch = async () => {
    if (!file) {
      setError("Please upload your resume.");
      return;
    }
    if (!jobDescription) {
      setError("Please paste the job description.");
      return;
    }
    
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

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || "Failed to analyze match.");
      }
    } catch (err) {
      setError("Server error. Make sure your Flask backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Resume vs. JD Matcher</h2>
        <p className="text-slate-500">Find out if your resume beats the ATS for a specific job.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Input Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col space-y-5 h-fit">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Job Description</label>
            <textarea 
              placeholder="Paste the full job description here..." 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 h-48 resize-none bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Resume</label>
            <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-purple-50 transition-colors"
            >
              <UploadCloud size={24} className="text-purple-600 mb-2" />
              <p className="text-sm text-slate-600 font-medium">{file ? file.name : "Click to attach PDF resume"}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <button 
            onClick={handleMatch}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <><Loader2 size={18} className="animate-spin" /> Analyzing Match...</> : <><Target size={18} /> Scan Resume vs JD</>}
          </button>
        </div>

        {/* Right: Results Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-700 mb-6 border-b border-slate-100 pb-4">Match Results</h3>
          
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Loader2 size={40} className="animate-spin text-purple-400" />
              <p className="text-sm">Running ATS simulation algorithm...</p>
            </div>
          ) : results ? (
            <div className="flex-1 animate-in fade-in duration-500 space-y-6">
              
              {/* Match Score */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-36 h-36 flex flex-col items-center justify-center rounded-full border-8 border-slate-100 border-t-purple-600 border-r-purple-600 border-b-purple-600 shadow-inner">
                  <span className="text-4xl font-bold text-slate-800">{results.match_score}%</span>
                  <span className="text-xs text-slate-500 font-medium">Match</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-purple-50 text-purple-800 rounded-xl text-sm font-medium border border-purple-100 text-center">
                {results.recommendation}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Keywords (Red) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <XCircle size={14} className="text-red-500" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.missing_keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-md border border-red-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Matched Keywords (Green) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <CheckCircle size={14} className="text-green-500" /> Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.matched_keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Target size={48} className="mb-4 opacity-20" />
              <p className="text-sm text-center max-w-xs">
                Paste a Job Description and upload your resume to see how well you match the role.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobMatch;