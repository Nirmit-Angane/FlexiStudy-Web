"use client";

import { mockUser } from "@/lib/mock-data";
import { Search, Bell } from "lucide-react";
import Image from "next/image";

export function Topbar() {
  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-[600px]">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search for topics, courses, or flashcards..." 
            className="w-full bg-gray-50/50 border border-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary/30 transition-shadow text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-4">
        
        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF7059] rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{mockUser.displayName}</div>
            <div className="text-[11px] text-gray-500 font-medium">
              Level {mockUser.level} • {mockUser.preferredStyle}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-primary/10 overflow-hidden relative border border-gray-100 shrink-0">
            {/* Using a placeholder avatar image simulating the one in the mockup */}
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=e6ecea" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
