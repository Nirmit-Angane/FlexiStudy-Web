'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LessonJSON, Slide } from '@/lib/types';
import { ThemeRenderer } from './ThemeRenderer';
import { SlideRenderer } from './SlideRenderer';
import { AudioSync } from './AudioSync';
import { Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw } from 'lucide-react';

interface CanvasPlayerProps {
  data: LessonJSON;
  onComplete?: () => void;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({ data, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const themeRendererRef = useRef<ThemeRenderer | null>(null);
  const slideRendererRef = useRef<SlideRenderer | null>(null);
  const audioSyncRef = useRef<AudioSync | null>(null);
  const animationFrameRef = useRef<number>(0);
  const slideStartTimeRef = useRef<number>(0);

  // Initialize renderers
  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;

    themeRendererRef.current = new ThemeRenderer(1280, 720, data.theme);
    slideRendererRef.current = new SlideRenderer(1280, 720, data.theme);
    audioSyncRef.current = new AudioSync(data.slides, (index) => {
      setCurrentSlideIndex(index);
      slideStartTimeRef.current = performance.now();
    });

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      audioSyncRef.current?.cleanup();
    };
  }, [data]);

  // Main render loop
  useEffect(() => {
    const render = () => {
      if (!canvasRef.current || !themeRendererRef.current || !slideRendererRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, 1280, 720);

      // Render theme background
      themeRendererRef.current.render(ctx);

      // Calculate slide progress
      if (isPlaying) {
        const slide = data.slides[currentSlideIndex];
        const duration = (slide.durationSeconds || 5) * 1000;
        const elapsed = performance.now() - slideStartTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        setSlideProgress(progress);
        
        // Render slide content
        slideRendererRef.current.render(ctx, slide, progress);
      } else {
        // Render current state statically
        const slide = data.slides[currentSlideIndex];
        slideRendererRef.current.render(ctx, slide, slideProgress);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, currentSlideIndex, data, slideProgress]);

  const togglePlay = () => {
    if (!isPlaying) {
      if (currentSlideIndex === 0 && slideProgress === 0) {
        slideStartTimeRef.current = performance.now();
      } else {
        // Resume relative to progress
        const slide = data.slides[currentSlideIndex];
        const duration = (slide.durationSeconds || 5) * 1000;
        slideStartTimeRef.current = performance.now() - (slideProgress * duration);
      }
      audioSyncRef.current?.play();
      setIsPlaying(true);
    } else {
      audioSyncRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < data.slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      setSlideProgress(0);
      slideStartTimeRef.current = performance.now();
      audioSyncRef.current?.seek(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
      setSlideProgress(0);
      slideStartTimeRef.current = performance.now();
      audioSyncRef.current?.seek(prevIndex);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-full h-full' : 'aspect-video w-full'
      }`}
    >
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain"
      />

      {/* Overlays & Controls */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${((currentSlideIndex + slideProgress) / data.slides.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <SkipBack size={24} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <SkipForward size={24} />
            </button>
            <div className="ml-4 text-sm font-medium">
              Slide {currentSlideIndex + 1} / {data.slides.length}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Volume2 size={24} className="text-white/70" />
            <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Start State Overlay */}
      {!isPlaying && currentSlideIndex === 0 && slideProgress === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <h2 className="text-white text-3xl font-bold mb-8">{data.meta.topic}</h2>
          <button 
            onClick={togglePlay}
            className="group flex flex-col items-center gap-4 hover:scale-110 transition-transform"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full shadow-xl">
              <Play size={40} className="translate-x-1" />
            </div>
            <span className="text-white font-medium uppercase tracking-widest text-sm">Start Lesson</span>
          </button>
        </div>
      )}
    </div>
  );
};
