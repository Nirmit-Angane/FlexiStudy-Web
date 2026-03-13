"use client";

import { useState } from "react";
import { User, Bell, Shield, Moon, Monitor, Eye, Volume2, Paperclip, Check } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = [
    { name: "Profile", icon: User },
    { name: "Preferences", icon: Monitor },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto flex-1">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and learning style.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[14px] font-medium text-left ${
                  activeTab === tab.name 
                    ? "bg-white border-l-4 border-[#3D8B71] text-[#3D8B71] shadow-sm font-bold" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          
          {activeTab === "Profile" && (
            <div className="flex flex-col gap-8 max-w-lg">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Public Profile</h2>
                <p className="text-sm text-gray-500 mb-6">This information will be displayed on your achievements.</p>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/10 overflow-hidden relative border border-gray-100 shrink-0">
                    <img 
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=e6ecea" 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative top-1">
                    <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                      Change Avatar
                    </button>
                    <button className="text-xs text-red-500 font-medium hover:underline text-left px-1">Remove</button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue="Priya Kulkarni" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#3D8B71]/50 focus:border-[#3D8B71] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue="student@flexistudy.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#3D8B71]/50 focus:border-[#3D8B71] transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button className="px-6 py-2.5 bg-[#3D8B71] text-white rounded-xl font-bold shadow-sm hover:bg-[#2A6652] transition-colors text-[14px]">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "Preferences" && (
            <div className="flex flex-col gap-8 max-w-lg">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Learning Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Customize how FlexiStudy adapts content for you.</p>
                
                <label className="block text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wide">Primary Learning Style</label>
                <div className="flex flex-col gap-3">
                  {/* Selected Style */}
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#3D8B71] bg-[#E6F3EE] cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#3D8B71] shadow-sm"><Eye size={20} /></div>
                      <div>
                        <div className="font-bold text-[#3D8B71]">Visual Learner</div>
                        <div className="text-xs text-[#3D8B71]/80">Diagrams, videos, and spatial elements.</div>
                      </div>
                    </div>
                    <Check className="text-[#3D8B71]" size={20} />
                  </div>
                  
                  {/* Other Styles */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"><Volume2 size={20} /></div>
                      <div>
                        <div className="font-bold text-gray-700">Auditory Learner</div>
                        <div className="text-xs text-gray-500">Listening, discussing, and rhythms.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"><Paperclip size={20} className="rotate-45" /></div>
                      <div>
                        <div className="font-bold text-gray-700">Kinesthetic Learner</div>
                        <div className="text-xs text-gray-500">Hands-on activities and movement.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Appearance</h2>
                <div className="flex items-center gap-4">
                  <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-[#3D8B71] bg-[#E6F3EE] text-[#3D8B71] font-bold text-sm col-span-1">
                    <Monitor size={18} /> Light Mode
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold hover:bg-gray-50 text-sm col-span-1 opacity-50 cursor-not-allowed">
                    <Moon size={18} /> Dark Mode (Pro)
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "Notifications" || activeTab === "Security") && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Shield size={48} className="text-gray-200 mb-4" />
              <h3 className="font-display text-lg font-bold text-gray-900 mb-2">Options coming soon</h3>
              <p className="text-sm text-gray-500 max-w-sm">We are rolling out advanced security and push notification preferences in the next update.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
