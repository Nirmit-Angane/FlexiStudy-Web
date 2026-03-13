"use client";
import React, { useState, useEffect, useRef } from "react";
import { SceneRenderer } from "./SceneRenderer";
import { VideoLesson } from "@/lib/video/types";
import { Play, Pause, RotateCcw, Maximize2 } from "lucide-react";

interface Props {
  lesson: VideoLesson;
}

export const InteractiveVideoPlayer: React.FC<Props> = ({ lesson }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const currentSceneTimeRef = useRef<number>(0); // Time spent in the current scene

  useEffect(() => {
    // Attempt to preload voice
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      window.speechSynthesis.cancel();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const totalDuration = lesson.scenes.reduce((acc, s) => acc + s.duration, 0) || 45000;

  const playTTS = () => {
    if (synthRef.current || !lesson.script) return;
    const utterance = new SpeechSynthesisUtterance(lesson.script);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = voices.filter(v =>
      v.name.includes("Google US English") ||
      v.name.includes("Samantha") ||
      v.name.includes("Zira") ||
      v.lang === "en-US"
    );
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsFinished(true);
      setProgress(100);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isFinished) {
      restart();
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
    } else {
      if (!synthRef.current) {
        playTTS();
      } else {
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
      startTimeRef.current = performance.now() - (progress / 100) * totalDuration;
      animate();
    }
  };

  const restart = () => {
    window.speechSynthesis.cancel();
    synthRef.current = null;
    setIsPlaying(false);
    setIsFinished(false);
    setProgress(0);
    setCurrentSceneIdx(0);
    currentSceneTimeRef.current = 0;
    setTimeout(() => handlePlayPause(), 100);
  };

  const animate = () => {
    if (!isPlaying && !synthRef.current) return;
    
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    
    if (elapsed >= totalDuration) {
      setProgress(100);
      setIsFinished(true);
      setIsPlaying(false);
      return;
    }

    setProgress((elapsed / totalDuration) * 100);

    // Calculate current scene
    let accumulatedTime = 0;
    for (let i = 0; i < lesson.scenes.length; i++) {
      accumulatedTime += lesson.scenes[i].duration;
      if (elapsed < accumulatedTime) {
        if (currentSceneIdx !== i) {
          setCurrentSceneIdx(i);
        }
        break;
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const totalSlides = lesson.scenes.length;
  const topicTitle = lesson.topic ?? "Video Lesson";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-0">
      {/* Top Header Bar */}
      <div className="bg-[#13161C] border border-[#2A2D36] border-b-0 rounded-t-2xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3D8B71] animate-pulse shadow-[0_0_8px_rgba(61,139,113,0.7)]"></div>
          <span className="text-white font-bold text-base tracking-tight truncate max-w-xs md:max-w-lg">{topicTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#3D8B71]/20 text-[#56C99A] text-xs font-semibold border border-[#3D8B71]/30 uppercase tracking-wider">
            AI Generated
          </span>
          <span className="text-[#8B949E] text-xs font-medium">{totalSlides} slides</span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative w-full aspect-video bg-black overflow-hidden border-x border-[#2A2D36]">
        {lesson.scenes[currentSceneIdx] && (
          <SceneRenderer scene={lesson.scenes[currentSceneIdx]} />
        )}

        {/* Initial Play Overlay */}
        {!isPlaying && progress === 0 && !isFinished && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center backdrop-blur-sm z-10">
            <button
              onClick={handlePlayPause}
              className="w-24 h-24 bg-[#3D8B71] hover:bg-[#2e6854] text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(61,139,113,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              <Play size={48} className="ml-2" />
            </button>
            <p className="mt-5 text-white/70 text-base font-medium tracking-wide">Click to begin</p>
          </div>
        )}

        {/* Finished Overlay */}
        {isFinished && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-10">
            <div className="w-20 h-20 rounded-full bg-[#3D8B71]/20 border-2 border-[#3D8B71] flex items-center justify-center mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#56C99A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-4xl font-black text-white mb-2 tracking-tight">Lesson Complete!</h3>
            <p className="text-white/50 mb-8 text-base">You watched all {totalSlides} slides</p>
            <div className="flex gap-4">
              <button
                onClick={restart}
                className="px-7 py-3 bg-[#3D8B71] hover:bg-[#2e6854] text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(61,139,113,0.3)]"
              >
                <RotateCcw size={20} /> Watch Again
              </button>
            </div>
          </div>
        )}

        {/* Current slide indicator (top-right corner) */}
        {(isPlaying || progress > 0) && !isFinished && (
          <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white/70 text-sm font-semibold border border-white/10">
            {currentSceneIdx + 1} / {totalSlides}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-[#13161C] border border-[#2A2D36] border-t-0 rounded-b-2xl px-6 py-4 flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#2A2D36] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: progress + "%",
              background: "linear-gradient(90deg, #3D8B71, #56C99A)",
            }}
          />
        </div>

        {/* Slide Dots + Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Play / Restart / Timer */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="w-11 h-11 flex items-center justify-center bg-[#3D8B71] hover:bg-[#2e6854] rounded-full text-white shadow-[0_0_16px_rgba(61,139,113,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>
            <button
              onClick={restart}
              className="text-[#8B949E] hover:text-white transition-colors"
            >
              <RotateCcw size={18} />
            </button>
            <span className="text-[#8B949E] text-sm font-mono tabular-nums">
              {Math.floor((progress / 100) * (totalDuration / 1000)).toString().padStart(2, "0")}s
              {" "}
              <span className="text-[#3D3F45]">/</span>
              {" "}
              {Math.floor(totalDuration / 1000)}s
            </span>
          </div>

          {/* Right: Slide Dots */}
          <div className="flex items-center gap-1.5">
            {lesson.scenes.map((_, idx) => (
              <div
                key={idx}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentSceneIdx
                    ? "w-5 h-2.5 bg-[#3D8B71] shadow-[0_0_6px_rgba(61,139,113,0.6)]"
                    : idx < currentSceneIdx
                    ? "w-2 h-2 bg-[#3D8B71]/50"
                    : "w-2 h-2 bg-[#2A2D36]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
