import { Bell, Search } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  // This grabs the real user's information from Clerk!
  const { user } = useUser();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      
      {/* Left Side: Welcome Message */}
      <div className="flex items-center gap-4">
        <SignedIn>
          <h2 className="text-lg font-semibold text-slate-800">
            Welcome back, {user?.firstName}! 👋
          </h2>
        </SignedIn>
        <SignedOut>
          <h2 className="text-lg font-semibold text-slate-800">
            Welcome to Career Enhancer! 🚀
          </h2>
        </SignedOut>
      </div>

      {/* Right Side: Search, Notifications, and Profile */}
      <div className="flex items-center gap-5">
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none text-sm text-slate-600 w-48"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative text-slate-500 hover:text-blue-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* CLERK AUTHENTICATION UI */}
        <div className="flex items-center gap-3">
          <SignedOut>
            {/* Shows a beautiful login popup if they are logged out */}
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                Log In
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            {/* Shows their real profile picture and a dropdown menu if logged in */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

      </div>
    </header>
  );
};

export default Navbar;