"use client";

import { useState } from "react";
import { mockLessons } from "@/lib/mock-data";
import { Search, Filter, Clock, MoreVertical } from "lucide-react";

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("In Progress");

  const tabs = ["All Courses", "In Progress", "Completed", "Saved"];

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-500">Resume your learning journey or explore new topics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#3D8B71] w-full md:w-[240px]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-px">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-[15px] font-medium transition-colors border-b-2 relative top-px ${
              activeTab === tab 
                ? "text-[#3D8B71] border-[#3D8B71]" 
                : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Mock Data HardCoded for visual fidelity */}
        
        {/* Math Course */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
          <div className="h-36 bg-[#5B60E6] relative p-5 flex flex-col items-start justify-between overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="flex w-full justify-between items-start z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-sm tracking-wider uppercase">Mathematics</span>
              <button className="text-white/80 hover:text-white"><MoreVertical size={18} /></button>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-[#5B60E6] transition-colors">Advanced Algebra</h3>
            <p className="text-[14px] text-gray-500 mb-4 line-clamp-2 flex-1">Master quadratic equations, polynomials, and complex functions through visual learning.</p>
            
            <div className="flex items-center gap-4 text-[12px] text-gray-500 font-medium mb-6">
              <span className="flex items-center gap-1.5"><Clock size={14} /> 2h 15m left</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">Module 4 of 8</span>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold text-gray-900 mb-2.5">
                <span>Resume: Quadratic Equations</span>
                <span className="text-[#5B60E6]">65%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5B60E6] rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <button className="w-full mt-6 bg-[#5B60E6]/10 text-[#5B60E6] hover:bg-[#5B60E6]/20 font-semibold py-2.5 rounded-xl transition-colors text-[14px]">
              Continue Learning
            </button>
          </div>
        </div>

        {/* Science Course */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
          <div className="h-36 bg-[#F5A623] relative p-5 flex flex-col items-start justify-between overflow-hidden">
            <div className="absolute right-0 top-6 w-24 h-24 bg-white/20 rotate-45 transform translate-x-4"></div>
            <div className="flex w-full justify-between items-start z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-sm tracking-wider uppercase">Science</span>
              <button className="text-white/80 hover:text-white"><MoreVertical size={18} /></button>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-[#F5A623] transition-colors">Cell Biology</h3>
            <p className="text-[14px] text-gray-500 mb-4 line-clamp-2 flex-1">Explore the building blocks of life, from cell structures to mitosis and meiosis.</p>
            
            <div className="flex items-center gap-4 text-[12px] text-gray-500 font-medium mb-6">
              <span className="flex items-center gap-1.5"><Clock size={14} /> 4h 30m left</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">Module 2 of 5</span>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold text-gray-900 mb-2.5">
                <span>Resume: Mitosis & Meiosis</span>
                <span className="text-[#F5A623]">32%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#F5A623] rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            <button className="w-full mt-6 bg-[#F5A623]/10 text-[#F5A623] hover:bg-[#F5A623]/20 font-semibold py-2.5 rounded-xl transition-colors text-[14px]">
              Continue Learning
            </button>
          </div>
        </div>

        {/* Tech Course */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
          <div className="h-36 bg-[#3D8B71] relative p-5 flex flex-col items-start justify-between overflow-hidden">
            <div className="absolute right-0 bottom-0 w-full h-full bg-gradient-to-tr from-transparent to-white/20"></div>
            <div className="flex w-full justify-between items-start z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-sm tracking-wider uppercase">Technology</span>
              <button className="text-white/80 hover:text-white"><MoreVertical size={18} /></button>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-[#3D8B71] transition-colors">Python Basics</h3>
            <p className="text-[14px] text-gray-500 mb-4 line-clamp-2 flex-1">Learn fundamental programming concepts using Python through practical, hands-on examples.</p>
            
            <div className="flex items-center gap-4 text-[12px] text-gray-500 font-medium mb-6">
              <span className="flex items-center gap-1.5"><Clock size={14} /> 45m left</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">Module 7 of 8</span>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold text-gray-900 mb-2.5">
                <span>Resume: Data Structures</span>
                <span className="text-[#3D8B71]">88%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3D8B71] rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <button className="w-full mt-6 bg-[#3D8B71]/10 text-[#3D8B71] hover:bg-[#3D8B71]/20 font-semibold py-2.5 rounded-xl transition-colors text-[14px]">
              Continue Learning
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
