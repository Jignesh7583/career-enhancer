import { useState } from 'react';
import { Download, Loader2, User, Mail, Phone, Briefcase, Code, FileText } from 'lucide-react';

const ResumeBuilder = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Jignesh Prajapat',
    email: 'jigneshprajapat7583@gmail.com',
    phone: '+91-6377688732',
    summary: 'Highly motivated Data Analyst with a proven track record of designing interactive dashboards and delivering actionable insights.',
    experience: 'Data Analyst Intern at Bada Promotion Pvt. Ltd.\n- Designed and built 4 dynamic dashboards using Power BI.\n- Improved decision-making processes for management.',
    skills: 'Python (Pandas, NumPy, Flask), SQL, Power BI, Excel, Data Modeling, Machine Learning'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://career-enhancer-us-backend.onrender.com/api/generate-resume-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Handle the incoming PDF file stream
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'My_ATS_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        alert('Failed to generate PDF. Is Flask running?');
      }
    } catch (error) {
      alert('Cannot connect to server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ATS Resume Builder</h2>
          <p className="text-slate-500">Fill in your details below and download a perfectly formatted, ATS-friendly PDF.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
          {isGenerating ? 'Generating PDF...' : 'Download ATS Resume'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="text-blue-600" size={20} /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
          </div>

          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 pt-4">
            <FileText className="text-blue-600" size={20} /> Professional Summary
          </h3>
          <textarea name="summary" value={formData.summary} onChange={handleChange} rows="3" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50 resize-none"></textarea>

          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 pt-4">
            <Briefcase className="text-blue-600" size={20} /> Experience & Projects
          </h3>
          <textarea name="experience" value={formData.experience} onChange={handleChange} rows="5" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50 resize-none"></textarea>

          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 pt-4">
            <Code className="text-blue-600" size={20} /> Core Skills
          </h3>
          <textarea name="skills" value={formData.skills} onChange={handleChange} rows="3" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50 resize-none"></textarea>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-slate-100 rounded-2xl p-8 flex justify-center border border-slate-200">
          <div className="bg-white w-full max-w-lg aspect-[1/1.4] shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center text-slate-900">{formData.fullName || 'Your Name'}</h1>
            <p className="text-center text-xs text-slate-600 mt-1">{formData.email} | {formData.phone}</p>
            
            {formData.summary && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-800 pb-1 mb-2">Summary</h2>
                <p className="text-xs text-slate-700 leading-relaxed">{formData.summary}</p>
              </div>
            )}

            {formData.experience && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-800 pb-1 mb-2">Experience</h2>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{formData.experience}</p>
              </div>
            )}

            {formData.skills && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-800 pb-1 mb-2">Skills</h2>
                <p className="text-xs text-slate-700 leading-relaxed">{formData.skills}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;