"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Trophy, 
  Flame, 
  Settings,
  MessageSquare,
  Gamepad2,
  Zap
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "CodeQuest", href: "/game", icon: Gamepad2 },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "30s Video", href: "/micro-video", icon: Zap },
    { label: "Flashcards", href: "/flashcards", icon: Layers },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Achievements", href: "/achievements", icon: Trophy },
    { label: "Streaks", href: "/streaks", icon: Flame },
    { label: "AI Tutor", href: "/tutor", icon: MessageSquare },
  ];

  return (
    <div className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 shrink-0">
      
      {/* Brand */}
      <div className="h-[72px] flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3D8B71] rounded-lg flex items-center justify-center text-white">
            <Layers size={20} />
          </div>
          <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
            FlexiStudy
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-[15px] ${
                isActive 
                  ? "bg-[#E6F3EE] text-[#3D8B71]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Settings Footer */}
      <div className="p-4 mt-auto border-t border-gray-100">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-[15px] ${
            pathname === "/settings"
              ? "bg-[#E6F3EE] text-[#3D8B71]" 
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings size={20} />
          Settings
        </Link>
      </div>

    </div>
  );
}
