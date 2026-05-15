import { useState, useRef } from 'react';
import { UploadCloud, FileText, TrendingUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { user, isLoaded, isSignedIn } = useUser();
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

  const handleUpload = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

   const formData = new FormData();
   formData.append('file', file);

// Add User Data so the backend knows who is uploading!
   if (isSignedIn) {
     formData.append('email', user.primaryEmailAddress.emailAddress);
     formData.append('name', user.fullName);
}

    try {
      // Sending the file to your Flask backend!
      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || "Failed to analyze resume.");
      }
    } catch (err) {
      setError("Server error. Make sure your Flask backend is running on port 5000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Resume Analyzer</h2>
        <p className="text-slate-500">Upload your PDF resume to get instant AI-powered insights.</p>
      </div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Left Panel: Upload Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-fit">
          <h3 className="font-semibold text-slate-700 mb-4">Upload Resume</h3>
          
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />

          <div 
            onClick={() => fileInputRef.current.click()}
            className="flex-1 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={24} />
            </div>
            <p className="font-medium text-slate-700 mb-1">Click to select your resume</p>
            <p className="text-xs text-slate-500 mb-4">PDF only (Max 5MB)</p>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium shadow-sm pointer-events-none">
              Choose File
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {file && (
            <div className="mt-4 flex flex-col gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-green-600" />
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-green-600">Ready to analyze</p>
                </div>
              </div>
              <button 
                onClick={handleUpload}
                disabled={isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><Loader2 size={16} className="animate-spin" /> Analyzing via AI...</>
                ) : (
                  "Analyze Now"
                )}
              </button>
            </div>
          )}
        </div>

        {/* 2. Main Panel: Score & Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-fit">
          <h3 className="font-semibold text-slate-700 mb-6">Your Resume Score</h3>
          
          {results ? (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100 border-t-blue-600 border-r-blue-600 border-b-blue-600 mb-4">
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-800">{results.overall_score}</span>
                  <span className="text-sm text-slate-500 block">/100</span>
                </div>
              </div>
              <p className="text-sm font-medium text-blue-600 mb-8">AI Analysis Complete</p>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-medium">ATS Compatibility</span>
                  <span className="font-bold text-slate-800">{results.ats_score}/100</span>
                </div>
                
                {results.missing_skills && results.missing_skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {results.missing_skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded border border-red-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-sm text-center">Upload your resume to see your AI-generated score and breakdown.</p>
            </div>
          )}
        </div>

        {/* 3. Right Panel: Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-700 mb-4">AI Suggestions</h3>
          
          {results && results.suggestions ? (
            <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {results.suggestions.map((suggestion, index) => (
                <div key={index} className="flex gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                  <div className="mt-0.5 text-purple-600 bg-white shadow-sm p-1.5 rounded-lg h-fit shrink-0">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{suggestion}</p>
                  </div>
                </div>
              ))}
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                Apply Improvements to Resume
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 text-center py-12">
              Awaiting resume data to generate personalized improvement strategies.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalyzer;