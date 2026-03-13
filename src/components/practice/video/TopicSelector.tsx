"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TOPIC_CATEGORIES = [
  {
    category: "Mathematics",
    icon: "📐",
    topics: ["Fractions", "Algebra", "Trigonometry", "Calculus", "Probability", "Geometry"]
  },
  {
    category: "Science",
    icon: "🔬",
    topics: ["Photosynthesis", "Newton's Laws", "Periodic Table", "Human Digestive System", "Electricity", "Ecosystems"]
  },
  {
    category: "Technology & Coding",
    icon: "💻",
    topics: ["Python Functions", "HTML Basics", "What is AI", "Arrays", "OOP Concepts", "How the Internet Works"]
  },
  {
    category: "History & Social Studies",
    icon: "📖",
    topics: ["World War 2", "Indian Independence", "French Revolution", "Democracy", "Industrial Revolution"]
  },
  {
    category: "Geography",
    icon: "🌍",
    topics: ["Climate Change", "Plate Tectonics", "Water Cycle", "Types of Soil", "River Formation"]
  },
  {
    category: "English & Language",
    icon: "📝",
    topics: ["Parts of Speech", "Essay Writing", "Tenses", "Active vs Passive Voice"]
  },
  {
    category: "Economics",
    icon: "💰",
    topics: ["Demand and Supply", "Inflation", "GDP Basics", "Budget Concepts"]
  }
];

export default function TopicSelector() {
  const [custom, setCustom] = useState("");
  const [activeCategory, setActiveCategory] = useState(TOPIC_CATEGORIES[0].category);
  const router = useRouter();

  const go = (topic: string) => {
    if (!topic.trim()) return;
    router.push(`/practice/video/${encodeURIComponent(topic.trim())}`);
  };

  const currentCategoryData = TOPIC_CATEGORIES.find(c => c.category === activeCategory);

  return (
    <div>
      {/* Free-text input */}
      <div className="flex gap-3 mb-8">
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && go(custom)}
          placeholder="Type any topic you want to learn..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200
                     bg-white text-gray-900 placeholder:text-gray-400 shadow-sm
                     focus:outline-none focus:border-[#3D8B71] focus:ring-1 focus:ring-[#3D8B71] transition-all"
        />
        <button
          onClick={() => go(custom)}
          disabled={!custom.trim()}
          className="px-6 py-3 rounded-xl bg-[#3D8B71] text-white font-semibold shadow-sm
                     hover:bg-[#2E6B57] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate Lesson
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-none">
        {TOPIC_CATEGORIES.map(cat => (
          <button
            key={cat.category}
            onClick={() => setActiveCategory(cat.category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm flex items-center gap-2 border transition-all ${
              activeCategory === cat.category 
                ? "bg-[#3D8B71] text-white border-[#3D8B71] shadow-md" 
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span>{cat.icon}</span>
            <span className="font-semibold">{cat.category}</span>
          </button>
        ))}
      </div>

      {/* Suggested topic grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {currentCategoryData?.topics.map(topic => (
          <button
            key={topic}
            onClick={() => go(topic)}
            className="group px-4 py-4 rounded-xl border border-gray-200 bg-white
                       text-left shadow-sm hover:shadow-md hover:border-[#3D8B71]
                       transition-all flex flex-col justify-between"
          >
            <span className="text-gray-900 font-semibold mb-2 group-hover:text-[#3D8B71] transition-colors">{topic}</span>
            <span className="text-gray-500 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Start interactive video <span aria-hidden="true">&rarr;</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
