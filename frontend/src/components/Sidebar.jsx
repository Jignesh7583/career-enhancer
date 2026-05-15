import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PenTool, 
  Briefcase, 
  GraduationCap, 
  LineChart, 
  Bot, 
  Users,
  FileEdit 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Resume', path: '/resume', icon: <FileText size={20} /> },
    { name: 'Resume Builder', path: '/builder', icon: <FileEdit size={20} /> },
    { name: 'Cover Letter', path: '/cover-letter', icon: <PenTool size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Learning', path: '/learning', icon: <GraduationCap size={20} /> },
    { name: 'Insights', path: '/insights', icon: <LineChart size={20} /> },
    { name: 'AI Assistant', path: '/ai-assistant', icon: <Bot size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <LineChart className="text-blue-600" size={24} />
          CareerEnhancer
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Career Tools
        </p>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            For Organizations
          </p>
          <Link
            to="/recruiters"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors font-medium"
          >
            <Users size={20} />
            For Recruiters
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;