"use client";

import { Search, Bell, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, profile } = useAuth();
  
  const displayName = profile?.displayName || user?.displayName || "Learner";
  const userLevel = profile?.level || 1;
  const preferredStyle = "Visual Learner"; // Default for now, can be dynamic later
  const photoURL = profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}&backgroundColor=e6ecea`;

  return (
    <header className="h-[56px] sm:h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-20">
      
      {/* Left side: hamburger + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — only on mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        {/* Search Bar — hidden on small mobile, visible on sm+ */}
        <div className="hidden sm:block flex-1 max-w-[600px]">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search for topics, courses, or flashcards..." 
              className="w-full bg-gray-50/50 border border-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary/30 transition-shadow text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6 ml-3 sm:ml-4 shrink-0">
        
        {/* Search icon on mobile (compact) */}
        <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Search size={20} />
        </button>

        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF7059] rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">{displayName}</div>
            <div className="text-[11px] text-gray-500 font-medium">
              Level {userLevel} • {preferredStyle}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-primary/10 overflow-hidden relative border border-gray-100 shrink-0">
            <img 
              src={photoURL} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
