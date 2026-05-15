import { useState } from 'react';
import { BookOpen, Search, Loader2, Target, Code, PlayCircle, Award } from 'lucide-react';

const Learning = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setRoadmapData(null);

    try {
      const response = await fetch('http://localhost:5000/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic })
      });

      const data = await response.json();

      if (response.ok) {
        setRoadmapData(data);
      } else {
        setError(data.error || "Failed to generate roadmap.");
      }
    } catch (err) {
      setError("Server error. Make sure Flask is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Upskilling & Learning</h2>
        <p className="text-slate-500">Missing a skill on your resume? Let AI build you a custom roadmap and suggest courses.</p>
      </div>

      {/* Search Bar Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleGenerate} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to learn? (e.g. Python, Power BI, Machine Learning)"
              className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-slate-50"
              disabled={isGenerating}
            />
          </div>
          <button 
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Planning...</> : "Generate Roadmap"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* Results Area */}
      {isGenerating ? (
         <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <Loader2 size={48} className="animate-spin text-blue-400 mb-4" />
           <p>Designing a comprehensive 5-step curriculum and finding courses for {topic}...</p>
         </div>
      ) : roadmapData ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* THE 5-STEP ROADMAP SECTION */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <Target className="text-blue-600" /> Your Roadmap for: <span className="text-blue-600">{roadmapData.topic}</span>
            </h3>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              {roadmapData.roadmap.map((step, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Timeline Circle */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
                    {step.step}
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 border border-slate-100 p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-2">{step.title}</h4>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{step.description}</p>
                    
                    <div className="bg-white p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                      <Code size={16} className="text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-blue-800 uppercase mb-1">Practice Project</p>
                        <p className="text-sm text-slate-700">{step.practice_project}</p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* THE NEW RECOMMENDED COURSES SECTION */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Award className="text-blue-600" /> Recommended Courses
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roadmapData.courses && roadmapData.courses.map((course, index) => (
                <div key={index} className="border border-slate-100 bg-slate-50 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                  <PlayCircle className="text-blue-500 mb-3" size={24} />
                  <h4 className="font-bold text-slate-800 text-sm mb-2 flex-1">{course.title}</h4>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                      {course.platform}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${course.price.toLowerCase() === 'free' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {course.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-100">
          <BookOpen size={48} className="mb-4 opacity-20" />
          <p className="text-sm text-center max-w-sm">Type a skill you want to learn above, and AI will build you a practical, project-based roadmap.</p>
        </div>
      )}

    </div>
  );
};

export default Learning;