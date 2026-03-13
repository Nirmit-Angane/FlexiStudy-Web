"use client";

import { useState } from "react";
import { BookOpen, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const decks = [
    { title: "Science: Cell Biology", count: 24, mastered: 12, color: "#F5A623" },
    { title: "Math: Quadratics", count: 18, mastered: 18, color: "#5B60E6" },
    { title: "Tech: Python Basics", count: 30, mastered: 5, color: "#3D8B71" },
  ];

  const currentCards = [
    { front: "What is the powerhouse of the cell?", back: "Mitochondria" },
    { front: "What process do plants use to make food?", back: "Photosynthesis" },
    { front: "What is the genetic material in humans?", back: "DNA (Deoxyribonucleic acid)" },
    { front: "What organelle is responsible for protein synthesis?", back: "Ribosomes" },
  ];

  const currentCard = currentCards[currentCardIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % currentCards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + currentCards.length) % currentCards.length);
    }, 150);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
        <p className="text-gray-500">Master terminology and reinforce your memory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Decks Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center justify-between pointer-events-none mb-2">
            <h2 className="font-display text-sm font-bold text-gray-400 tracking-wider uppercase">Your Decks</h2>
            <Layers size={16} className="text-gray-400" />
          </div>

          <div className="flex flex-col gap-3">
            {decks.map((deck, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveDeck(idx);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activeDeck === idx 
                    ? "border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5" 
                    : "border-transparent bg-gray-50/50 hover:bg-gray-100/50 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deck.color }}></span>
                  <span className={`text-[13px] font-bold truncate ${activeDeck === idx ? 'text-gray-900' : ''}`}>
                    {deck.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                  <span>{deck.count} cards</span>
                  <span className={deck.mastered === deck.count ? 'text-[#3D8B71]' : ''}>
                    {deck.mastered} mastered
                  </span>
                </div>
              </button>
            ))}
          </div>

          <button className="mt-4 py-3 border border-dashed border-gray-300 rounded-xl text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors bg-gray-50/50">
            + Create New Deck
          </button>
        </div>

        {/* Main Flashcard Area */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[500px]">
          
          <div className="w-full flex justify-between items-center mb-8">
            <div className="text-[13px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              {currentCardIndex + 1} / {currentCards.length}
            </div>
            <div className="flex gap-2">
              <span className="text-[13px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-1.5 hover:bg-gray-200 cursor-pointer transition-colors">
                <RefreshCw size={14} /> Restart
              </span>
            </div>
          </div>

          {/* Flashcard Component */}
          <div className="perspective-1000 w-full max-w-lg aspect-[3/2] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div 
              className="relative w-full h-full transform-style-3d transition-transform duration-500 rounded-3xl shadow-md border-2 border-gray-100"
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              
              {/* Front */}
              <div 
                className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="absolute top-6 left-6 text-gray-300"><BookOpen size={24} /></span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest absolute top-8">Question</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {currentCard.front}
                </h3>
                <span className="absolute bottom-6 text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to flip</span>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backface-hidden w-full h-full bg-[#E6F3EE] rounded-3xl flex flex-col items-center justify-center p-8 text-center border-2 border-[#3D8B71]"
                style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
              >
                <span className="text-[11px] font-bold text-[#3D8B71] uppercase tracking-widest absolute top-8">Answer</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-[#3D8B71] leading-tight">
                  {currentCard.back}
                </h3>
                <span className="absolute bottom-6 text-xs text-[#3D8B71]/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to flip back</span>
              </div>

            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-12 w-full max-w-lg">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors text-[14px]"
            >
              Previous
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="flex-1 py-3.5 bg-[#3D8B71] text-white rounded-xl font-bold hover:bg-[#2A6652] transition-colors shadow-sm text-[14px]"
            >
              Next
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
