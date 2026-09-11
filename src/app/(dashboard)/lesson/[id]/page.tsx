"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockLessons, mockSlides } from "@/lib/mock-data";
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Volume2, Pause } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import React from 'react';

const STYLE_COLORS: Record<string, string> = {
  Visual: "#4A7FC1",
  Example: "#F5A623",
  Practical: "#3D8B71",
  Interactive: "#A06CB0"
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const routeId = typeof params.id === 'string' ? params.id : 'lesson-1';
  const lesson = mockLessons.find(l => l.id === routeId) || mockLessons[0];
  const slides = mockSlides;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };
  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  const slide = slides[currentSlide];

  // ─── TTS State & Refs ───────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load available voices (handles Chrome's async voice loading)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const load = () => {
      const all = window.speechSynthesis.getVoices();
      setSelectedVoice(all.find(v =>
        (v.name.includes("Google") || v.name.includes("Natural")) &&
        (v.name.includes("Female") || v.name.includes("Zira") ||
          v.name.includes("Samantha") || v.name.includes("Google US English"))
      ) || all[0] || null);
    };


    // Voices might already be available (Firefox / Safari)
    if (window.speechSynthesis.getVoices().length > 0) {
      load();
    }
    window.speechSynthesis.onvoiceschanged = load;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Stop speech and clear keepalive interval
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Start speaking the current slide content
  const startSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    stopSpeaking(); // cancel any previous speech first

    const textToSpeak = `${slide.title}. ${slide.content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      // Chrome bug: speechSynthesis silently pauses after ~15s.
      // Periodically call resume() to keep it going.
      keepAliveRef.current = setInterval(() => {
        if (!window.speechSynthesis.speaking) return;
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 5000);
    };

    utterance.onend = () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      setIsPlaying(false);
    };

    // Keep a reference to prevent garbage collection mid-speech
    (window as any)._currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }, [slide, stopSpeaking, selectedVoice]);

  const toggleSpeech = () => {
    if (isPlaying) stopSpeaking();
    else startSpeaking();
  };

  // Stop speech whenever the slide changes or the component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
      }
    };
  }, [currentSlide]);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto pb-12">

      {/* Header Back Button */}
      <button
        onClick={() => router.push('/history')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium mb-8"
      >
        <ArrowLeft size={18} />
        Back to History
      </button>

      {/* Lesson Meta */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-3">
            {lesson.topic}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-medium bg-bg-elevated px-2.5 py-1 rounded-md border border-border-default">
              📖 {lesson.style}
            </span>
            <span className="flex items-center gap-1.5 font-medium bg-bg-elevated px-2.5 py-1 rounded-md border border-border-default">
              🔬 {lesson.subject}
            </span>
          </div>
        </div>

        <button
          onClick={toggleSpeech}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${isPlaying
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-brand-primary text-white hover:scale-105 active:scale-95'
            }`}
        >
          {isPlaying ? (
            <><Pause size={20} fill="currentColor" /> Stop Listening</>
          ) : (
            <><Volume2 size={20} /> Listen to Lesson</>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm mb-8 opacity-70">
        <span className="text-text-muted px-2">
          {lesson.difficulty}
        </span>
        <span className="text-text-muted px-2 border-l border-border-subtle">
          Completed {formatDistanceToNow(new Date(lesson.createdAt), { addSuffix: true })}
        </span>
        <div className="ml-auto flex items-center gap-2">
          Score:
          <span className={`font-bold ${lesson.finalScore >= 4 ? 'text-success' :
              lesson.finalScore === 3 ? 'text-warning' : 'text-error'
            }`}>
            {lesson.finalScore}/5
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>Slide {currentSlide + 1} of {slides.length}</span>
        <span>{(((currentSlide + 1) / slides.length) * 100).toFixed(0)}%</span>
      </div>
      <div className="xp-bar-wrap h-1.5 mb-8 bg-border-subtle">
        <div
          className="xp-bar transition-all duration-300"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            background: STYLE_COLORS[lesson.style] || 'var(--brand-primary)'
          }}
        />
      </div>

      {/* Content Card */}
      <div className="card min-h-[400px] flex flex-col mb-8 relative overflow-hidden">

        {/* Style accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: STYLE_COLORS[lesson.style] || 'var(--brand-primary)' }}
        />

        <div className="card-body p-8 sm:p-12 flex-1 flex flex-col justify-center">

          {lesson.style === "Example" && (
            <div className="text-brand-primary opacity-20 text-6xl font-serif absolute top-8 left-6 pointer-events-none">
              "
            </div>
          )}

          <h2 className="font-display text-2xl font-bold text-text-primary mb-6 relative z-10">
            {slide.title}
          </h2>

          <div className="prose prose-lg text-text-secondary max-w-none relative z-10 leading-relaxed font-body">
            {slide.content.split('\n').map((paragraph, idx) => (
              <React.Fragment key={idx}>
                {paragraph}
                <br />
              </React.Fragment>
            ))}
          </div>

          {lesson.style === "Example" && slide.slideIndex === 3 && (
            <div className="mt-8 p-6 bg-warning-subtle/30 border border-warning/20 rounded-xl relative z-10">
              <div className="text-xs font-bold text-warning uppercase tracking-widest mb-2 flex items-center gap-2">
                <Check size={14} /> Concept Analogy
              </div>
              <p className="text-text-primary font-medium italic">
                "Chlorophyll sits inside tiny kitchens called chloroplasts and has the special job of catching the sunlight, which acts as the fire to cook the meal."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="btn btn-secondary btn-lg min-w-[140px]"
        >
          <ChevronLeft size={18} className="mr-1" /> Prev
        </button>

        {/* Slide Dots */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide
                  ? 'bg-text-primary scale-125'
                  : 'bg-border-strong hover:bg-text-muted'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {currentSlide === slides.length - 1 ? (
          <Link href="/history" className="btn btn-primary btn-lg min-w-[140px]">
            Done <Check size={18} className="ml-1" />
          </Link>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary btn-lg min-w-[140px]"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}