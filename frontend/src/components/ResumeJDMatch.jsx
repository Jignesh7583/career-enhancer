import { CheckCircle2, XCircle, FileText, Briefcase, Zap } from 'lucide-react';

const ResumeJDMatch = () => {
  return (
    <div className="space-y-6">
      
      {/* Header & Match Score */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resume vs Job Description Match</h2>
          <p className="text-slate-500">Compare your resume with the job description to find skill gaps.</p>
        </div>
        
        {/* Match Score Badge */}
        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Match Score</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-4 border-green-100 border-t-green-500">
            <span className="font-bold text-slate-800">65%</span>
          </div>
          <span className="font-semibold text-green-600 text-sm">Good Match</span>
        </div>
      </div>

      {/* Split Screen Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Resume */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              Your Resume
            </h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">Change Resume</button>
          </div>
          <textarea
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[300px]"
            defaultValue="ARJUN SHARMA\nDATA ANALYST\n\nSUMMARY\nData analyst with 2+ years of experience in SQL, Python, Power BI, and Tableau. Passionate about deriving insights and solving business problems.\n\nEXPERIENCE\nData Analyst | ABC Company\n- Analyzed sales data and improved reporting efficiency by 30%..."
          />
        </div>

        {/* Right: Job Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="text-purple-500" size={20} />
              Job Description
            </h3>
            <button className="text-sm text-purple-600 font-medium hover:underline">Change JD</button>
          </div>
          <textarea
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none min-h-[300px]"
            placeholder="Paste the job description here..."
            defaultValue="Requirements:\n- Proficient in Python and SQL for data extraction and analysis.\n- Experience with AWS and Docker is a plus.\n- Strong data visualization skills using Tableau or Power BI.\n- Excellent problem-solving skills and statistics knowledge."
          />
          <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
            <Zap size={16} /> Analyze Match
          </button>
        </div>

      </div>

      {/* Analysis Results: Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Matching Skills (Green) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-green-500" /> 
            Matching Skills (5)
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Python', 'SQL', 'Power BI', 'Tableau', 'Data Analysis'].map(skill => (
              <span key={skill} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills (Red) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <XCircle size={20} className="text-red-500" /> 
            Missing Skills (3)
          </h4>
          <div className="flex flex-wrap gap-2">
            {['AWS', 'Docker', 'Statistics'].map(skill => (
              <span key={skill} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ResumeJDMatch;