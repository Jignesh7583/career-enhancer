import { useState } from 'react';
import { Briefcase, AlertCircle, IndianRupee, TrendingUp, CheckCircle2, XCircle, ArrowRight, ChevronRight, BarChart } from 'lucide-react';

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('match'); // 'match', 'gap', 'salary'

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Job Intelligence</h2>
        <p className="text-slate-500">Discover your perfect roles, identify skill gaps, and predict your salary.</p>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('match')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'match' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Briefcase size={18} /> Job Match Predictor
        </button>
        <button 
          onClick={() => setActiveTab('gap')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'gap' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <AlertCircle size={18} /> Skill Gap Detector
        </button>
        <button 
          onClick={() => setActiveTab('salary')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'salary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <IndianRupee size={18} /> Salary Prediction
        </button>
      </div>

      {/* TAB CONTENT: JOB MATCH PREDICTOR */}
      {activeTab === 'match' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left Column: Match List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 px-2 pb-2 border-b border-slate-100">Top Predicted Roles</h3>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-slate-800">Data Analyst</h4>
                <span className="font-bold text-green-600">82%</span>
              </div>
              <p className="text-xs text-slate-500">High match based on SQL & Python skills</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-slate-700">Business Analyst</h4>
                <span className="font-bold text-green-500">74%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-slate-700">ML Engineer</h4>
                <span className="font-bold text-yellow-500">61%</span>
              </div>
            </div>
            
            <button className="w-full py-3 text-sm font-medium text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              View All Jobs
            </button>
          </div>

          {/* Right Column: Match Details */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Data Analyst</h3>
                <p className="text-sm text-slate-500">Why this role matches you</p>
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold text-lg border border-green-200">
                82% Match
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Strong match with your analytical skills (SQL, Excel).</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Relevant work experience highlights data extraction.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <TrendingUp size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <span>High demand in the current job market (+40% growth).</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Top Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center gap-1"><CheckCircle2 size={14}/> SQL</span>
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center gap-1"><CheckCircle2 size={14}/> Python</span>
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center gap-1"><CheckCircle2 size={14}/> Excel</span>
                  <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-1"><XCircle size={14}/> Power BI</span>
                  <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-1"><XCircle size={14}/> Statistics</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3">Recommended Next Steps to reach 90%</h4>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">Improve SQL (Advanced Queries)</span>
                    <button className="text-blue-600 font-semibold hover:underline">Learn</button>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">Learn Data Visualization (Tableau/Power BI)</span>
                    <button className="text-blue-600 font-semibold hover:underline">Learn</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SKILL GAP DETECTOR */}
      {activeTab === 'gap' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left Column: Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col space-y-5 h-fit">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Target Role</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer">
                <option>Data Analyst</option>
                <option>Data Scientist</option>
                <option>Business Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Current Level</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer">
                <option>Intermediate</option>
                <option>Beginner</option>
                <option>Advanced</option>
              </select>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 mt-4">
              <BarChart size={16} /> Analyze Skill Gap
            </button>
          </div>

          {/* Right Column: 3 Levels of Importance */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Skill Gap Analysis</h3>
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1 text-green-600"><div className="w-2 h-2 rounded-full bg-green-500"></div> You have</span>
                <span className="flex items-center gap-1 text-yellow-600"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Partial</span>
                <span className="flex items-center gap-1 text-red-600"><div className="w-2 h-2 rounded-full bg-red-500"></div> Missing</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Critical */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Critical Skills (Must Have)</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden flex">
                  <div className="bg-green-500 h-full w-[60%]"></div>
                  <div className="bg-red-500 h-full w-[40%]"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">SQL</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">Python</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">Excel</span>
                  <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium flex items-center gap-1">Statistics <AlertCircle size={12}/></span>
                </div>
              </div>

              {/* Important */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Important Skills</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden flex">
                  <div className="bg-red-500 h-full w-[100%]"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium flex items-center gap-1">Power BI <AlertCircle size={12}/></span>
                  <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium flex items-center gap-1">ETL <AlertCircle size={12}/></span>
                  <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium flex items-center gap-1">Data Modeling <AlertCircle size={12}/></span>
                </div>
              </div>

              {/* Optional */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Optional Skills</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-sm font-medium">Tableau</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-sm font-medium">R</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-sm font-medium">Machine Learning</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Improve Your Skills</h4>
                <p className="text-sm text-slate-600">Start learning to close your gap.</p>
              </div>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                View Courses <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SALARY PREDICTION */}
      {activeTab === 'salary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left Column: Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 mb-2">Estimate Market Value</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
              <input type="text" defaultValue="Data Scientist" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer">
                <option>2 Years</option>
                <option>Entry Level (0-1 Yrs)</option>
                <option>Senior (5+ Yrs)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" defaultValue="India" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 mt-4">
              Predict Salary <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Column: Prediction Output */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-center mb-8">
              <p className="text-slate-500 font-medium mb-2">Predicted Salary Range</p>
              <div className="flex items-center justify-center gap-2 text-4xl font-extrabold text-slate-800">
                <span className="text-green-500">₹8</span> – <span className="text-green-500">₹12</span> <span className="text-xl text-slate-500 mt-2">LPA</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Based on current Glassdoor & AmbitionBox market data</p>
            </div>

            {/* Visual Salary Range Graph Representation */}
            <div className="w-full max-w-md relative pt-6 pb-2">
              <div className="h-3 w-full bg-slate-100 rounded-full relative">
                <div className="absolute top-0 left-[20%] right-[40%] h-full bg-green-500 rounded-full opacity-50"></div>
                {/* Marker */}
                <div className="absolute top-1/2 left-[30%] -translate-y-1/2 w-5 h-5 bg-white border-4 border-green-600 rounded-full shadow-md z-10"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium">
                <span>₹5L</span>
                <span>₹10L</span>
                <span>₹15L</span>
                <span>₹20L+</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Jobs;