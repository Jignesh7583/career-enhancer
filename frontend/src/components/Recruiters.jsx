import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Trophy, AlertCircle, FileText } from 'lucide-react';

const Recruiters = () => {
  // 1. State for managing the Popup Window and Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // 2. Handle selecting MULTIPLE files
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length > 0) {
      setFiles(validFiles);
      setError(null);
    } else {
      setError("Please select valid PDF files.");
    }
  };

  // 3. Send everything to your Flask Backend
  const handleBulkUpload = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste the Job Description.");
      return;
    }
    if (files.length === 0) {
      setError("Please select at least one resume.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Package the JD and ALL files together
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    files.forEach(file => {
      formData.append('files', file); 
    });

    try {
      const response = await fetch('https://career-enhancer-us-backend.onrender.com/api/bulk-screen', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setLeaderboard(data.leaderboard);
        setIsModalOpen(false); // Close popup on success
      } else {
        setError(data.error || "Failed to analyze resumes.");
      }
    } catch (err) {
      setError("Server error. Make sure your Flask backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Reset the form when opening/closing
  const openModal = () => {
    setIsModalOpen(true);
    setLeaderboard(null); // Clear previous results
    setFiles([]);
    setJobDescription('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Recruiter Panel</h2>
          <p className="text-slate-500">Streamline your hiring with AI-powered candidate matching and resume screening.</p>
        </div>
        {/* THE BUTTON IS NOW WIRED UP! */}
        <button 
          onClick={openModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <UploadCloud size={18} /> Bulk Upload Resumes
        </button>
      </div>

      {/* If we have results, show the Leaderboard! */}
      {leaderboard ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-500" size={28} />
            <h3 className="text-xl font-bold text-slate-800">AI Candidate Leaderboard</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-sm text-slate-600">
                  <th className="py-3 px-4 font-semibold">Rank</th>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold text-center">AI Match Score</th>
                  <th className="py-3 px-4 font-semibold">Key Strength</th>
                  <th className="py-3 px-4 font-semibold">Filename</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((candidate, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">{candidate.candidate_name}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${candidate.match_score >= 80 ? 'bg-green-100 text-green-700' : candidate.match_score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {candidate.match_score}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">{candidate.key_strength}</td>
                    <td className="py-4 px-4 text-xs text-slate-400">{candidate.filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setLeaderboard(null)} className="mt-6 text-sm text-purple-600 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      ) : (
        /* The Original Dashboard View (Hidden when leaderboard is showing) */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-slate-500 text-sm font-medium mb-2">Total Resumes</h4>
            <p className="text-3xl font-bold text-slate-800">1,248</p>
            <p className="text-xs text-green-500 font-medium mt-2">+18% this week</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-slate-500 text-sm font-medium mb-2">Shortlisted</h4>
            <p className="text-3xl font-bold text-slate-800">312</p>
            <p className="text-xs text-green-500 font-medium mt-2">+12% this week</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-slate-500 text-sm font-medium mb-2">Interviews</h4>
            <p className="text-3xl font-bold text-slate-800">128</p>
            <p className="text-xs text-green-500 font-medium mt-2">+8% this week</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-slate-500 text-sm font-medium mb-2">Hired</h4>
            <p className="text-3xl font-bold text-slate-800">45</p>
            <p className="text-xs text-green-500 font-medium mt-2">+5% this week</p>
          </div>
        </div>
      )}

      {/* --- THE MODAL POPUP --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">New Bulk Screening</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Job Description</label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the requirements and responsibilities here..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 h-32 resize-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Resumes (PDFs)</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple // THIS ALLOWS SELECTING MULTIPLE FILES
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <UploadCloud size={32} className="text-purple-600 mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">Click to browse files</p>
                  <p className="text-xs text-slate-500">Hold Ctrl or Shift to select multiple PDFs</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                    <FileText size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-slate-700">{files.length} files selected ready for AI processing</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isAnalyzing}
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkUpload}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><Loader2 size={16} className="animate-spin" /> Screening {files.length} Candidates...</>
                ) : (
                  "Start AI Screening"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Recruiters;