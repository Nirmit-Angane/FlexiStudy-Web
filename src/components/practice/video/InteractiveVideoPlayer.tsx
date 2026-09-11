"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { SceneRenderer } from "./SceneRenderer";
import { VideoLesson } from "@/lib/video/types";
import { Play, Pause, RotateCcw, Volume2, Sliders } from "lucide-react";

import { CaptionDisplay } from "./CaptionDisplay";

interface Props {
  lesson: VideoLesson;
  onComplete?: () => void;
}

export const InteractiveVideoPlayer: React.FC<Props> = ({ lesson, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.95);
  const [currentCaption, setCurrentCaption] = useState("");
  const [showCaptions, setShowCaptions] = useState(true);
  
  const hasTriggeredComplete = useRef(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const currentSceneIdxRef = useRef<number>(0);
  
  const sentencesRef = useRef<string[]>([]);
  const currentSentenceIdxRef = useRef<number>(0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Preload sentences
  useEffect(() => {
    if (lesson.script) {
      sentencesRef.current = lesson.script.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    }
  }, [lesson.script]);

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
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);


  const totalDuration = lesson.scenes.reduce((acc, s) => acc + s.duration, 0) || 45000;

  const speakNextSentence = useCallback(() => {
    if (currentSentenceIdxRef.current >= sentencesRef.current.length) {
      // All sentences done, but we wait for the animation loop to finish the lesson
      return;
    }

    const text = sentencesRef.current[currentSentenceIdxRef.current];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setCurrentCaption(text);
    };

    utterance.onend = () => {
      currentSentenceIdxRef.current++;
      // Add a small pause between sentences for a more natural feel
      setTimeout(() => {
        if (isPlayingRef.current) {
          speakNextSentence();
        }
      }, 300);
    };

    // GC protection
    (window as any)._currentInteractiveUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }, [playbackRate, selectedVoice]);


  const handlePlayPause = () => {
    if (isFinished) {
      restart();
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      if (!window.speechSynthesis.speaking) {
        speakNextSentence();
      } else {
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      startTimeRef.current = performance.now() - (progress / 100) * totalDuration;
      animFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const restart = () => {
    window.speechSynthesis.cancel();
    synthRef.current = null;
    currentSentenceIdxRef.current = 0;
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsFinished(false);
    setProgress(0);
    setCurrentSceneIdx(0);
    currentSceneIdxRef.current = 0;
    setCurrentCaption("");
    hasTriggeredComplete.current = false;
    setTimeout(() => handlePlayPause(), 100);
  };

  const animate = () => {
    if (!isPlayingRef.current) return;
    
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    
    if (elapsed >= totalDuration) {
      setProgress(100);
      setIsFinished(true);
      setIsPlaying(false);
      isPlayingRef.current = false;
      window.speechSynthesis.cancel();
      if (onComplete && !hasTriggeredComplete.current) {
        onComplete();
        hasTriggeredComplete.current = true;
      }
      return;
    }

    const newProgress = (elapsed / totalDuration) * 100;
    setProgress(newProgress);

    let accumulatedTime = 0;
    for (let i = 0; i < lesson.scenes.length; i++) {
      accumulatedTime += lesson.scenes[i].duration;
      if (elapsed < accumulatedTime) {
        if (currentSceneIdxRef.current !== i) {
          currentSceneIdxRef.current = i;
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
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-0 select-none">
      {/* Top Header Bar */}
      <div className="bg-[#13161C] border border-[#2A2D36] border-b-0 rounded-t-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#3D8B71] animate-pulse shadow-[0_0_12px_rgba(61,139,113,0.8)]"></div>
          <span className="text-white font-bold text-lg tracking-tight truncate max-w-xs md:max-w-xl">{topicTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-lg transition-colors ${showCaptions ? 'text-[#3D8B71] bg-[#3D8B71]/10' : 'text-[#8B949E] hover:text-white'}`}
            title="Toggle Captions"
          >
            <Sliders size={18} />
          </button>
          <div className="h-6 w-[1px] bg-[#2A2D36] mx-1"></div>
          <span className="px-3 py-1 rounded-full bg-[#3D8B71]/20 text-[#56C99A] text-xs font-bold border border-[#3D8B71]/30 uppercase tracking-widest">
            AI Tutor
          </span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative w-full aspect-video bg-[#000000] overflow-hidden border-x border-[#2A2D36] group">
        {lesson.scenes && lesson.scenes[currentSceneIdx] ? (
          <SceneRenderer scene={lesson.scenes[currentSceneIdx]} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black text-white px-8 text-center">
            <p className="text-xl font-medium opacity-40 animate-pulse">Loading scene...</p>
          </div>
        )}

        {/* Captions Overlay */}
        <CaptionDisplay caption={currentCaption} isVisible={showCaptions && isPlaying && !isFinished} />

        {/* Initial Play Overlay */}
        {!isPlaying && progress === 0 && !isFinished && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-md z-30 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-[#3D8B71] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <button
                onClick={handlePlayPause}
                className="relative w-28 h-28 bg-[#3D8B71] hover:bg-[#4ab391] text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(61,139,113,0.4)] transition-all hover:scale-110 active:scale-95 group/play"
              >
                <Play size={56} className="ml-2 group-hover/play:scale-110 transition-transform" fill="currentColor" />
              </button>
            </div>
            <h2 className="mt-8 text-white text-2xl font-bold tracking-tight">Ready to learn?</h2>
            <p className="mt-2 text-white/50 text-base font-medium">Click to start your interactive lesson</p>
          </div>
        )}

        {/* Finished Overlay */}
        {isFinished && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center backdrop-blur-xl z-30 animate-in fade-in duration-700">
            <div className="w-24 h-24 rounded-full bg-[#3D8B71]/20 border-2 border-[#3D8B71] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(61,139,113,0.3)]">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#56C99A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-5xl font-black text-white mb-3 tracking-tighter">Great Job!</h3>
            <p className="text-white/60 mb-10 text-lg font-medium">You've completed the topic: <span className="text-[#56C99A]">{topicTitle}</span></p>
            <div className="flex gap-4">
              <button
                onClick={restart}
                className="px-8 py-4 bg-[#3D8B71] hover:bg-[#4ab391] text-white rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <RotateCcw size={22} /> Watch Again
              </button>
            </div>
          </div>
        )}

        {/* Slide Indicator */}
        {(isPlaying || progress > 0) && !isFinished && (
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 text-white/90 text-sm font-bold border border-white/10 shadow-xl">
              <span className="text-[#56C99A]">{currentSceneIdx + 1}</span>
              <span className="mx-2 text-white/30">/</span>
              <span>{totalSlides}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-[#13161C] border border-[#2A2D36] border-t-0 rounded-b-2xl px-6 py-6 flex flex-col gap-6 shadow-2xl">
        {/* Progress Bar Container */}
        <div className="relative group/progress">
          <div className="w-full h-2 bg-[#2A2D36] rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(86,201,154,0.4)]"
              style={{
                width: progress + "%",
                background: "linear-gradient(90deg, #3D8B71, #56C99A)",
              }}
            />
          </div>
          {/* Progress Handle Visual */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#3D8B71] opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 flex items-center justify-center bg-[#3D8B71] hover:bg-[#4ab391] rounded-2xl text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
            </button>
            
            <div className="flex flex-col">
              <span className="text-white font-mono text-lg tabular-nums flex items-center gap-2">
                {Math.floor((progress / 100) * (totalDuration / 1000)).toString().padStart(2, "0")}s
                <span className="text-[#3D3F45] text-sm font-bold">/</span>
                <span className="text-[#8B949E] text-sm">{Math.floor(totalDuration / 1000)}s</span>
              </span>
              <span className="text-[#56C99A] text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Live Progress</span>
            </div>
          </div>

          {/* Right: Tools & Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#1C2128] rounded-xl p-1 border border-[#2A2D36]">
              {[0.75, 1, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    playbackRate === rate 
                    ? "bg-[#3D8B71] text-white shadow-md scale-105" 
                    : "text-[#8B949E] hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
            
            <button
              onClick={restart}
              className="w-10 h-10 flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Restart Lesson"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
