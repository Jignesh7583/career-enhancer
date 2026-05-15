import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Target, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';

const Dashboard = () => {
  // Grab the logged-in user from Clerk
  const { user, isSignedIn, isLoaded } = useUser();
  
  // State to hold the data we fetch from MySQL
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect runs automatically when the Dashboard loads
  useEffect(() => {
    const fetchMyData = async () => {
      // If clerk is still loading, or the user is not logged in, stop here.
      if (!isLoaded || !isSignedIn) {
        setIsLoading(false);
        return;
      }

      try {
        // Ask Flask for the data belonging to this specific email
        const email = user.primaryEmailAddress.emailAddress;
        const response = await fetch(`http://localhost:5000/api/dashboard-data?email=${email}`);
        const data = await response.json();
        
        if (response.ok && data.has_data) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyData();
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Your Dashboard</h2>
        <p className="text-slate-500">Track your progress and AI insights.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500">Retrieving your data from memory...</p>
        </div>
      ) : !isSignedIn ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Please Log In</h3>
          <p className="text-slate-500">You must log in to view your saved dashboard data.</p>
        </div>
      ) : !dashboardData ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Welcome to Career Enhancer!</h3>
          <p className="text-slate-500 mb-6">You haven't analyzed a resume yet. Head over to the Resume tool to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          
          {/* Latest AI Score Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-2 bg-blue-500"></div>
            <h3 className="font-semibold text-slate-700 mb-6 w-full text-left">Latest Resume Score</h3>
            
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100 border-t-blue-600 border-r-blue-600 border-b-blue-600 mb-4">
              <span className="text-4xl font-bold text-slate-800">{dashboardData.latest_score}</span>
            </div>
            
            <p className="text-sm font-medium text-slate-800 truncate w-full text-center px-4">
              {dashboardData.file_name}
            </p>
            <p className="text-xs text-slate-500 mt-1">Saved to database</p>
          </div>

          {/* ATS Performance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="font-semibold text-slate-700 mb-4">ATS Compatibility</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Structure & Formatting
                </span>
                <span className="text-sm font-bold text-slate-800">{dashboardData.ats_score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${dashboardData.ats_score}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Your resume structure was successfully parsed. Aim for 80%+ to beat most robotic tracking systems.
              </p>
            </div>
          </div>

          {/* Activity Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="font-semibold text-slate-700 mb-4">Account Status</h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Free Tier Active</p>
                  <p className="text-xs text-slate-500">Gemini 2.5 Flash connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Database Synced</p>
                  <p className="text-xs text-slate-500">Data secured locally</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;