"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockLessons, mockSlides } from "@/lib/mock-data";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
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

  // In a real app. we'd fetch the lesson by ID. Here we just take the first from mock if ID doesn't match perfectly.
  const routeId = typeof params.id === 'string' ? params.id : 'lesson-1';
  const lesson = mockLessons.find(l => l.id === routeId) || mockLessons[0];
  
  const slides = mockSlides; // We use the same mock slides for all lessons in this demo

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  const slide = slides[currentSlide];

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
      <div className="mb-8">
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
          <span className="text-text-muted px-2 border-l border-border-subtle">
            {lesson.difficulty}
          </span>
          <span className="text-text-muted px-2 border-l border-border-subtle">
            Completed {formatDistanceToNow(new Date(lesson.createdAt), { addSuffix: true })}
          </span>
          <div className="ml-auto flex items-center gap-2">
            Score: 
            <span className={`font-bold ${
              lesson.finalScore >= 4 ? 'text-success' : 
              lesson.finalScore === 3 ? 'text-warning' : 'text-error'
            }`}>
              {lesson.finalScore}/5
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>Slide {currentSlide + 1} of {slides.length}</span>
        <span>{( ((currentSlide + 1) / slides.length) * 100 ).toFixed(0)}%</span>
      </div>
      <div className="xp-bar-wrap h-1.5 mb-8 bg-border-subtle">
        <div 
          className="xp-bar transition-all duration-300" 
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            background: STYLE_COLORS[lesson.style] || 'var(--brand-primary)' 
          }}
        ></div>
      </div>

      {/* Content Card (Review Render) */}
      <div className="card min-h-[400px] flex flex-col mb-8 relative overflow-hidden">
        
        {/* Decorative Top Accent based on Style */}
        <div 
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: STYLE_COLORS[lesson.style] || 'var(--brand-primary)' }}
        ></div>

        <div className="card-body p-8 sm:p-12 flex-1 flex flex-col justify-center">
          
          {/* Style-specific rendering logic (mocked visually) */}
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

          {/* If it's the specific slide, show a "scenario card" for example style */}
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

        {/* Slide Dots Indicator */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide 
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
