import { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, Activity, Users, Loader2 } from 'lucide-react';

const Insights = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/insights');
        const result = await response.json();
        
        if (response.ok) {
          setData(result);
        } else {
          setError(result.error || "Failed to load insights");
        }
      } catch (err) {
        setError("Cannot connect to server. Is Flask running?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p>Crunching platform analytics and market trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center border border-red-100 max-w-2xl mx-auto mt-10">
        <p className="font-semibold">Oops! {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Platform Insights & Market Trends</h2>
        <p className="text-slate-500">Live data analytics based on platform usage and industry demand.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Resumes Analyzed</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.platform_stats.total_analyzed}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average ATS Score</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.platform_stats.average_ats}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Overall AI Score</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.platform_stats.average_overall}/100</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 className="text-blue-600" size={20} /> Most Common Missing Skills
          </h3>
          <div className="space-y-5">
            {data.top_missing_skills.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-slate-700">{item.skill}</span>
                  <span className="text-slate-500">{item.gap_percentage}% of users missing</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.gap_percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} /> Fastest Growing Roles
          </h3>
          <div className="space-y-4">
            {data.hiring_trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                <div>
                  <h4 className="font-bold text-slate-800">{trend.role}</h4>
                  <p className="text-xs text-slate-500 mt-1">Based on recent job postings</p>
                </div>
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                  <TrendingUp size={16} /> +{trend.growth}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Insights;