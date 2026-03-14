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
  Zap,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "FlexiQuest", href: "/game", icon: Gamepad2 },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "30s Video", href: "/micro-video", icon: Zap },
    { label: "Flashcards", href: "/flashcards", icon: Layers },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Achievements", href: "/achievements", icon: Trophy },
    { label: "Streaks", href: "/streaks", icon: Flame },
    { label: "AI Tutor", href: "/tutor", icon: MessageSquare },
  ];

  return (
    <>
      {/* 
        Desktop: static sidebar, always visible 
        Mobile: overlay sidebar, slides in from left 
      */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-gray-100 
          flex flex-col z-50
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:translate-x-0 md:shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand + Close button */}
        <div className="h-[72px] flex items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3D8B71] rounded-lg flex items-center justify-center text-white">
              <Layers size={20} />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
              FlexiStudy
            </span>
          </Link>
          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
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
    </>
  );
}
