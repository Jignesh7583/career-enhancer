import { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // <-- NEW IMPORT

const CoverLetter = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState(''); // <-- NEW STATE
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
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

  const handleGenerate = async () => {
    // Check if the user filled out all the required fields
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    if (!jobTitle || !companyName) {
      setError("Please enter the target Job Title and Company Name.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedLetter('');
    setCopied(false);

    // Package the file and the text data together
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);
    formData.append('company_name', companyName);
    
    // --> NEW: Append the job description (it's fine if it's empty)
    formData.append('job_description', jobDescription); 

    try {
      // Send the package to your Flask backend
      const response = await fetch('https://career-enhancer-us-backend.onrender.com/api/generate-cover-letter', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedLetter(data.cover_letter);
      } else {
        setError(data.error || "Failed to generate cover letter.");
      }
    } catch (err) {
      setError("Server error. Make sure your Flask backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function so users can easily copy the result
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI Cover Letter Generator</h2>
        <p className="text-slate-500">Instantly write a personalized cover letter tailored to your target job.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-fit space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Job Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Data Analyst" 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Company *</label>
            <input 
              type="text" 
              placeholder="e.g. Google" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* NEW JD INPUT FIELD */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Job Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">Paste the JD to tailor your letter and highlight matching skills.</p>
            <textarea 
              rows={4}
              placeholder="Paste job requirements here..." 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Resume *</label>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <UploadCloud size={20} className="text-blue-600 mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                {file ? file.name : "Click to attach PDF resume"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> Writing Letter...</>
            ) : (
              "Generate Cover Letter"
            )}
          </button>
        </div>

        {/* Right Column: Generated Output */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[500px]">
          
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Your Generated Letter
            </h3>
            {generatedLetter && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
              >
                {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 size={32} className="animate-spin text-blue-400" />
                <p className="text-sm">Reading your resume and drafting a tailored letter...</p>
              </div>
            ) : generatedLetter ? (
              /* NEW: Using ReactMarkdown so **bold** tags actually render nicely */
              <div className="text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none animate-in fade-in duration-500">
                <ReactMarkdown>{generatedLetter}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-sm text-center max-w-sm">
                  Fill out the details on the left and upload your resume to see the magic happen.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoverLetter;