"use client";

import { useState } from "react";
import { BookOpen, RefreshCw, Layers, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  front: string;
  back: string;
}

interface Deck {
  topic: string;
  color: string;
  cards: Flashcard[];
  mastered: number[];
}

const QUICK_TOPICS = [
  { label: "📐 Algebra", topic: "Algebra Basics" },
  { label: "🔬 Photosynthesis", topic: "Photosynthesis" },
  { label: "💻 Python", topic: "Python Programming Basics" },
  { label: "🌍 Climate Change", topic: "Climate Change" },
  { label: "📖 World War 2", topic: "World War 2" },
  { label: "💰 Economics", topic: "Demand and Supply Economics" },
];

const DECK_COLORS = ["#3D8B71", "#5B60E6", "#F5A623", "#E14B7C", "#0EA5E9", "#A855F7"];

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckIdx, setActiveDeckIdx] = useState<number | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [cardCount, setCardCount] = useState(8);
  const [error, setError] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);

  const activeDeck = activeDeckIdx !== null ? decks[activeDeckIdx] : null;
  const totalCards = activeDeck?.cards.length ?? 0;
  const masteredCount = activeDeck?.mastered.length ?? 0;

  const generateDeck = async (topic: string) => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/practice/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), count: cardCount }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");

      const newDeck: Deck = {
        topic: data.topic,
        color: DECK_COLORS[decks.length % DECK_COLORS.length],
        cards: data.cards,
        mastered: [],
      };

      const newDecks = [...decks, newDeck];
      setDecks(newDecks);
      setActiveDeckIdx(newDecks.length - 1);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setCustomTopic("");
      setShowGenerator(false);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (!totalCards) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentCardIdx((p) => (p + 1) % totalCards), 150);
  };

  const handlePrev = () => {
    if (!totalCards) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentCardIdx((p) => (p - 1 + totalCards) % totalCards), 150);
  };

  const handleMastered = () => {
    if (!activeDeck || activeDeckIdx === null) return;
    const updated = [...decks];
    const mastered = updated[activeDeckIdx].mastered;
    if (!mastered.includes(currentCardIdx)) {
      updated[activeDeckIdx] = { ...updated[activeDeckIdx], mastered: [...mastered, currentCardIdx] };
      setDecks(updated);
    }
    handleNext();
  };

  const handleRestart = () => {
    setCurrentCardIdx(0);
    setIsFlipped(false);
    if (activeDeckIdx !== null) {
      const updated = [...decks];
      updated[activeDeckIdx] = { ...updated[activeDeckIdx], mastered: [] };
      setDecks(updated);
    }
  };

  const currentCard = activeDeck?.cards[currentCardIdx];
  const isMastered = activeDeck?.mastered.includes(currentCardIdx) ?? false;

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Flashcards</h1>
          <p className="text-gray-500">Generate AI-powered Q&amp;A decks on any topic.</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3D8B71] hover:bg-[#2e6854] text-white rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles size={18} />
          Generate Deck
        </button>
      </div>

      {/* Inline Generator Panel */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-[#3D8B71]" />
                New AI Flashcard Deck
              </h2>
              <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold transition-colors">✕</button>
            </div>

            {/* Quick topic buttons */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Start</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((qt) => (
                  <button
                    key={qt.topic}
                    onClick={() => generateDeck(qt.topic)}
                    disabled={isGenerating}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-semibold hover:border-[#3D8B71] hover:text-[#3D8B71] hover:bg-[#f0faf6] transition-all disabled:opacity-50"
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom topic + card count */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateDeck(customTopic)}
                placeholder="Or type any topic (e.g. Quantum Physics)…"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3D8B71] focus:ring-1 focus:ring-[#3D8B71] transition-all text-sm"
              />
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold focus:outline-none focus:border-[#3D8B71] transition-all"
              >
                <option value={5}>5 cards</option>
                <option value={8}>8 cards</option>
                <option value={12}>12 cards</option>
                <option value={16}>16 cards</option>
              </select>
              <button
                onClick={() => generateDeck(customTopic)}
                disabled={!customTopic.trim() || isGenerating}
                className="px-6 py-3 rounded-xl bg-[#3D8B71] hover:bg-[#2e6854] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : "Generate"}
              </button>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {decks.length === 0 && !showGenerator && (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-gray-300 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#f0faf6] border border-[#3D8B71]/30 flex items-center justify-center">
            <Sparkles size={28} className="text-[#3D8B71]" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">No decks yet</h3>
            <p className="text-gray-500 text-sm">Generate your first AI flashcard deck to get started.</p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="px-6 py-3 bg-[#3D8B71] text-white rounded-xl font-bold hover:bg-[#2e6854] transition-all shadow-sm"
          >
            + Generate First Deck
          </button>
        </div>
      )}

      {/* Decks + Card View */}
      {decks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Decks Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1 pointer-events-none">
              <h2 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Your Decks</h2>
              <Layers size={14} className="text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              {decks.map((deck, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveDeckIdx(idx); setCurrentCardIdx(0); setIsFlipped(false); }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeDeckIdx === idx
                      ? "border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5"
                      : "border-transparent bg-gray-50 hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: deck.color }} />
                    <span className={`text-[13px] font-bold truncate ${activeDeckIdx === idx ? "text-gray-900" : ""}`}>
                      {deck.topic}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span>{deck.cards.length} cards</span>
                    <span className={deck.mastered.length === deck.cards.length && deck.cards.length > 0 ? "text-[#3D8B71]" : ""}>
                      {deck.mastered.length} mastered
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: deck.cards.length > 0 ? `${(deck.mastered.length / deck.cards.length) * 100}%` : "0%",
                        backgroundColor: deck.color,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="mt-2 py-3 border border-dashed border-gray-300 rounded-xl text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors bg-gray-50"
            >
              + New Deck
            </button>
          </div>

          {/* Main Card Area */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[520px]">

            {activeDeck && currentCard ? (
              <>
                {/* Top Controls */}
                <div className="w-full flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                      {currentCardIdx + 1} / {totalCards}
                    </span>
                    {isMastered && (
                      <span className="text-[13px] font-bold text-[#3D8B71] bg-[#f0faf6] px-3 py-1 rounded-lg border border-[#3D8B71]/20">
                        ✓ Mastered
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Progress */}
                    <span className="text-[12px] text-gray-400 font-medium">{masteredCount}/{totalCards} done</span>
                    <button
                      onClick={handleRestart}
                      className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw size={13} /> Restart
                    </button>
                  </div>
                </div>

                {/* Flashcard */}
                <div
                  className="perspective-1000 w-full max-w-lg cursor-pointer group"
                  style={{ perspective: "1200px", aspectRatio: "3/2" }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="relative w-full h-full rounded-3xl shadow-md"
                    animate={{ rotateX: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-gray-100 flex flex-col items-center justify-center p-8 text-center"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="absolute top-6 left-6 text-gray-300"><BookOpen size={22} /></span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest absolute top-7 right-0 left-0 text-center">Question</span>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                        {currentCard.front}
                      </h3>
                      <span className="absolute bottom-6 text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to reveal answer
                      </span>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 w-full h-full bg-[#E6F3EE] rounded-3xl border-2 flex flex-col items-center justify-center p-8 text-center"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateX(180deg)",
                        borderColor: activeDeck.color,
                      }}
                    >
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest absolute top-7 right-0 left-0 text-center"
                        style={{ color: activeDeck.color }}
                      >
                        Answer
                      </span>
                      <h3
                        className="font-display text-xl md:text-2xl font-bold leading-snug"
                        style={{ color: activeDeck.color }}
                      >
                        {currentCard.back}
                      </h3>
                      <span className="absolute bottom-6 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: activeDeck.color + "99" }}>
                        Click to flip back
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-3 mt-10 w-full max-w-lg">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="w-11 h-11 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMastered(); }}
                    className="flex-1 py-3 bg-[#f0faf6] text-[#3D8B71] rounded-xl font-bold border border-[#3D8B71]/25 hover:bg-[#dff2ea] transition-colors text-[14px]"
                  >
                    ✓ Got it
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="w-11 h-11 flex items-center justify-center bg-[#3D8B71] text-white rounded-xl hover:bg-[#2e6854] transition-colors shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            ) : (
              /* Loading state while generating */
              isGenerating ? (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <Loader2 size={40} className="animate-spin text-[#3D8B71]" />
                  <p className="text-base font-semibold">Generating flashcards with AI…</p>
                  <p className="text-sm text-gray-400">This takes about 5–10 seconds</p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-4 opacity-40" />
                  <p className="font-semibold">Select a deck from the sidebar</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Full-screen loader when generating with no decks yet */}
      {isGenerating && decks.length === 0 && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 gap-4">
          <Loader2 size={48} className="animate-spin text-[#3D8B71]" />
          <p className="text-lg font-bold text-gray-900">Generating flashcards with AI…</p>
          <p className="text-sm text-gray-500">Usually takes 5–10 seconds</p>
        </div>
      )}
    </div>
  );
}
