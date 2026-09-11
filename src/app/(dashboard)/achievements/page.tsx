"use client";

import { Trophy, Star, Target, Flame, Cpu, Award } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    { id: 1, title: "First Steps", desc: "Complete your first lesson", icon: Star, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10", unlocked: true },
    { id: 2, title: "On Fire", desc: "Reach a 7-day learning streak", icon: Flame, color: "text-[#FF7059]", bg: "bg-[#FF7059]/10", unlocked: true },
    { id: 3, title: "Sharpshooter", desc: "Score 100% on 5 quizzes", icon: Target, color: "text-[#4A90E2]", bg: "bg-[#4A90E2]/10", unlocked: true },
    { id: 4, title: "Tech Wizard", desc: "Master the Technology module", icon: Cpu, color: "text-[#3D8B71]", bg: "bg-[#3D8B71]/10", unlocked: false, progress: 88 },
    { id: 5, title: "Scholar", desc: "Read 50 Example-style lessons", icon: Trophy, color: "text-[#A06CB0]", bg: "bg-[#A06CB0]/10", unlocked: false, progress: 45 },
    { id: 6, title: "Champion", desc: "Reach Level 20", icon: Award, color: "text-[#5B60E6]", bg: "bg-[#5B60E6]/10", unlocked: false, progress: 70 },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#FFD700] to-[#F5A623] rounded-full flex items-center justify-center shadow-lg border-4 border-white/10 shrink-0">
            <Trophy size={64} className="text-white drop-shadow-md" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="text-sm font-bold text-[#FFD700] uppercase tracking-widest mb-2 flex items-center gap-2 justify-center md:justify-start">
              <Star size={16} className="fill-[#FFD700]" /> 1,250 Total XP
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">3 Badges Unlocked!</h1>
            <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
              You are in the top 15% of active learners this week. Keep completing lessons and quizzes to earn more exclusive achievements.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {achievements.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl p-6 border shadow-sm transition-all relative overflow-hidden ${
                item.unlocked ? 'border-[#3D8B71]/30 hover:shadow-md' : 'border-gray-100 opacity-60 grayscale-[0.8]'
              }`}
            >
              {item.unlocked && (
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#3D8B71]/10 rounded-full blur-2xl"></div>
              )}
              
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${item.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.title}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    item.unlocked ? 'text-[#3D8B71]' : 'text-gray-400'
                  }`}>
                    {item.unlocked ? '✓ Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-6 flex-1 min-h-[40px] relative z-10">
                {item.desc}
              </p>

              {!item.unlocked && item.progress !== undefined && (
                <div className="relative z-10 mt-auto">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  );
}
