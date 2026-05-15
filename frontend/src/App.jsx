import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ResumeJDMatch from './components/ResumeJDMatch';
import ResumeBuilder from './components/ResumeBuilder';
import CoverLetter from './components/CoverLetter';
import Jobs from './components/Jobs';
import Learning from './components/Learning';
import Insights from './components/Insights';
import AIAssistant from './components/AIAssistant';
import Recruiters from './components/Recruiters';
import JobMatch from './components/JobMatch';

function App() {
  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/jobs" element={<JobMatch />} />
              <Route path="/recruiters" element={<Recruiters />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/cover-letter" element={<CoverLetter />} />
              <Route path="/jobs" element={<Jobs />} />
              {/* This points the root URL to your Dashboard */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/builder" element={<ResumeBuilder />} />
              <Route path="/jd-match" element={<ResumeJDMatch />} />
              <Route path="/resume" element={<ResumeAnalyzer />} />
              <Route path="/resume" element={
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                  <h2 className="text-2xl font-bold text-slate-700">Resume Analyzer</h2>
                  <p className="text-slate-500 mt-2">Upload interface coming soon...</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;