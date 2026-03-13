"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Play, Check, Loader2, X, Maximize2,
  ArrowLeft, BookOpen, Zap, RotateCcw, Volume2, VolumeX,
  Lightbulb, Eye, Headphones, Hand, Clock, Star,
  TrendingUp, CheckCircle2, ChevronLeft, ChevronRight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
 ───────────────────────────────────────────────────────────── */
interface Slide {
  id: number;
  type: string;
  headline: string;
  body: string;
  emoji: string;
  points: string[] | null;
  tag: string;
  accentColor: string;
  bg: string;
}

interface LessonData {
  topic: string;
  summary: string;
  slides: Slide[];
}

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
 ───────────────────────────────────────────────────────────── */
const SLIDE_DURATION = 9;
const TOTAL_DURATION = 45;

const LEARNING_STYLES = [
  {
    key: "Visual",
    icon: <Eye size={18} />,
    desc: "Diagrams & spatial understanding",
    iconBg: "var(--brand-primary-light, #EAF5F1)",
    iconClr: "var(--brand-primary, #3D8B71)",
    border: "var(--brand-primary, #3D8B71)",
  },
  {
    key: "Auditory",
    icon: <Headphones size={18} />,
    desc: "Listening & narrative patterns",
    iconBg: "#EEF4FB",
    iconClr: "#4A7FC1",
    border: "#4A7FC1",
  },
  {
    key: "Kinesthetic",
    icon: <Hand size={18} />,
    desc: "Hands-on & practical tasks",
    iconBg: "#F4F0FB",
    iconClr: "#9B6DD6",
    border: "#9B6DD6",
  },
];

const GENERATION_STEPS = [
  { label: "Analysing topic complexity…", icon: "🧠" },
  { label: "Brainstorming visual analogies…", icon: "💡" },
  { label: "Drafting educational script…", icon: "✍️" },
  { label: "Generating slide content…", icon: "🎨" },
  { label: "Assembling your 45-second lesson…", icon: "🎬" },
];

const EXAMPLE_TOPICS = [
  "How does photosynthesis work?",
  "Explain Newton's laws of motion",
  "What is the Pythagorean theorem?",
  "How does the human immune system work?",
  "Explain supply and demand in economics",
  "What causes climate change?",
];

/* ─────────────────────────────────────────────────────────────
   BUILD NARRATION SCRIPT from lesson data
 ───────────────────────────────────────────────────────────── */
function buildNarrationScript(lesson: LessonData): string {
  return lesson.slides
    .map(s => {
      const pts = s.points?.join(". ") ?? "";
      return `${s.headline}. ${s.body}${pts ? " " + pts : ""}`;
    })
    .join(" ... ");
}

/* ─────────────────────────────────────────────────────────────
   VIDEO PLAYER COMPONENT
 ───────────────────────────────────────────────────────────── */
function VideoPlayer({
  lesson,
  compact = false,
}: {
  lesson: LessonData;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [pointsVisible, setPointsVisible] = useState<boolean[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const muteRef = useRef(false); // keep muted state accessible in callbacks

  const slides = lesson.slides || [];
  const slide = slides[currentSlide] || ({} as Slide);
  const elapsed = Math.round((totalProgress / 100) * TOTAL_DURATION);
  const fmtTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  // Keep muteRef in sync
  useEffect(() => { muteRef.current = muted; }, [muted]);

  /* ── Speech Synthesis helpers ── */
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);

    // Voice selection: prioritize high-quality voices
    const voices = window.speechSynthesis.getVoices();
    const voicePreferences = ["Google US English", "Samantha", "Microsoft Zira", "Zira"];
    const preferredVoice = voices.find(v =>
      voicePreferences.some(pref => v.name.includes(pref))
    );

    if (preferredVoice) {
      utter.voice = preferredVoice;
    }

    utter.rate = 0.9;
    utter.pitch = 1;
    utter.volume = muteRef.current ? 0 : 1;
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);


  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, []);

  // Update volume without restarting when mute toggled
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.volume = muted ? 0 : 1;
    }
  }, [muted]);

  /* ── Slide animation ── */
  const animateSlide = useCallback((idx: number) => {
    setTextVisible(false);
    setPointsVisible([]);
    setTimeout(() => setTextVisible(true), 280);
    const pts = slides[idx]?.points;
    if (pts?.length) {
      pts.forEach((_, i) =>
        setTimeout(() =>
          setPointsVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          }), 480 + i * 240)
      );
    }
  }, [slides]);

  // Animate first slide on mount
  useEffect(() => { animateSlide(0); }, []); // eslint-disable-line

  /* ── Auto-play ticker ── */
  useEffect(() => {
    if (playing) {
      // Speak current slide text
      speak(`${slide.headline}. ${slide.body} ${slide.points?.join(". ") ?? ""}`);

      intervalRef.current = setInterval(() => {
        setSlideProgress(sp => {
          const next = sp + (100 / (SLIDE_DURATION * 10));
          setTotalProgress(tp => Math.min(tp + (100 / (TOTAL_DURATION * 10)), 100));

          if (next >= 100) {
            setCurrentSlide(cs => {
              const nxt = cs + 1;
              if (nxt >= slides.length) {
                setPlaying(false);
                stopSpeech();
                if (intervalRef.current) clearInterval(intervalRef.current);
                return cs;
              }
              animateSlide(nxt);
              // speak next slide
              const ns = slides[nxt];
              speak(`${ns.headline}. ${ns.body} ${ns.points?.join(". ") ?? ""}`);
              return nxt;
            });
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      stopSpeech();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]); // eslint-disable-line

  // Stop speech on unmount
  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const handlePlayPause = () => {
    if (totalProgress >= 100) {
      setCurrentSlide(0);
      setSlideProgress(0);
      setTotalProgress(0);
      animateSlide(0);
      setPlaying(true);
    } else {
      setPlaying(p => !p);
    }
  };

  const goToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, slides.length - 1));
    setCurrentSlide(clamped);
    setSlideProgress(0);
    setTotalProgress((clamped / slides.length) * 100);
    animateSlide(clamped);
    stopSpeech();
    if (playing) {
      const ns = slides[clamped];
      speak(`${ns.headline}. ${ns.body} ${ns.points?.join(". ") ?? ""}`);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const tgt = Math.floor(pct * slides.length);
    goToSlide(Math.min(tgt, slides.length - 1));
  };

  const progress = (currentSlide / slides.length) * 100 + (slideProgress / slides.length);

  return (
    <div style={{
      background: "#0B0E17",
      borderRadius: compact ? "var(--radius-lg, 12px)" : "var(--radius-xl, 16px)",
      overflow: "hidden",
      width: "100%",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: compact ? "0 8px 30px rgba(0,0,0,0.3)" : "0 32px 80px rgba(0,0,0,0.55)",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── SLIDE CANVAS ── */}
      <div style={{
        aspectRatio: "16/9",
        position: "relative",
        background: slide.bg || "linear-gradient(135deg,#0f1520,#0a1020)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: compact ? "20px 24px" : "40px 56px",
        transition: "background 0.6s ease",
      }}>
        {/* Ambient glow blobs */}
        <div style={{
          position: "absolute", top: -80, right: -80, width: 300, height: 300,
          borderRadius: "50%",
          background: slide.accentColor ? `${slide.accentColor}22` : "rgba(61,139,113,0.15)",
          filter: "blur(70px)", pointerEvents: "none",
          transition: "background 0.6s ease",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 220, height: 220,
          borderRadius: "50%",
          background: slide.accentColor ? `${slide.accentColor}14` : "rgba(74,127,193,0.12)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Status badge */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.35)", borderRadius: "999px",
          padding: "4px 10px", border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: playing ? "#56C99A" : "rgba(255,255,255,0.3)",
            display: "inline-block",
            boxShadow: playing ? "0 0 6px #56C99A" : "none",
            transition: "all 0.3s",
          }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>
            {playing ? "PLAYING" : totalProgress >= 100 ? "COMPLETE" : "PAUSED"} · {currentSlide + 1}/{slides.length}
          </span>
        </div>

        {/* Timer */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.35)", borderRadius: "999px",
          padding: "4px 10px", border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
        }}>
          <Clock size={10} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
            {fmtTime(elapsed)} / {fmtTime(TOTAL_DURATION)}
          </span>
        </div>

        {/* Slide content */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          maxWidth: compact ? 460 : 640, width: "100%", textAlign: "center",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          {slide.emoji && (
            <div style={{ fontSize: compact ? 36 : 58, lineHeight: 1, marginBottom: compact ? 12 : 20, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}>
              {slide.emoji}
            </div>
          )}
          {slide.tag && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: slide.accentColor || "rgba(255,255,255,0.5)", marginBottom: compact ? 6 : 10 }}>
              {slide.tag}
            </span>
          )}
          <h2 style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)", fontSize: compact ? "1.1rem" : "1.75rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25, marginBottom: compact ? 8 : 14, textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
            {slide.headline}
          </h2>
          {slide.body && (
            <p style={{ fontSize: compact ? 11 : 14, color: "rgba(255,255,255,0.68)", lineHeight: 1.6, maxWidth: 500, marginBottom: slide.points?.length ? (compact ? 12 : 20) : 0 }}>
              {slide.body}
            </p>
          )}
          {slide.points && slide.points.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 10, alignSelf: "flex-start", width: "100%", textAlign: "left" }}>
              {slide.points.map((pt, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: compact ? 8 : 10,
                  opacity: pointsVisible[i] ? 1 : 0,
                  transform: pointsVisible[i] ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                }}>
                  <div style={{ width: compact ? 16 : 20, height: compact ? 16 : 20, borderRadius: "50%", background: slide.accentColor || "#3D8B71", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <CheckCircle2 size={compact ? 10 : 12} color="#fff" />
                  </div>
                  <span style={{ fontSize: compact ? 11 : 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inner slide progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ height: "100%", width: `${slideProgress}%`, background: slide.accentColor || "#3D8B71", transition: playing ? "none" : "width 0.3s ease" }} />
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={{ background: "#0d1020", padding: compact ? "12px 16px" : "16px 24px", display: "flex", flexDirection: "column", gap: compact ? 8 : 12 }}>
        {/* Timeline scrubber */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={handleTimelineClick}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #3D8B71, #56C99A)", borderRadius: "999px", transition: playing ? "none" : "width 0.3s ease" }} />
          </div>
          {slides.map((_, i) => (
            <div key={i} style={{ position: "absolute", top: -1, left: `${(i / slides.length) * 100}%`, width: 2, height: 6, background: "rgba(255,255,255,0.12)", transform: "translateX(-50%)", borderRadius: 1, pointerEvents: "none" }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Prev */}
            <button onClick={() => goToSlide(currentSlide - 1)} disabled={currentSlide === 0}
              style={{ width: 30, height: 30, borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentSlide === 0 ? "not-allowed" : "pointer", opacity: currentSlide === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={14} color="rgba(255,255,255,0.6)" />
            </button>

            {/* Play / Pause / Replay */}
            <button onClick={handlePlayPause}
              style={{ width: compact ? 38 : 46, height: compact ? 38 : 46, borderRadius: "50%", background: "#3D8B71", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(61,139,113,0.4)", transition: "transform 150ms ease, box-shadow 150ms ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}>
              {totalProgress >= 100
                ? <RotateCcw size={compact ? 14 : 16} color="#fff" />
                : playing
                  ? <div style={{ display: "flex", gap: 3 }}>
                    <div style={{ width: compact ? 3 : 4, height: compact ? 10 : 12, background: "#fff", borderRadius: 2 }} />
                    <div style={{ width: compact ? 3 : 4, height: compact ? 10 : 12, background: "#fff", borderRadius: 2 }} />
                  </div>
                  : <Play size={compact ? 14 : 16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
              }
            </button>

            {/* Next */}
            <button onClick={() => goToSlide(currentSlide + 1)} disabled={currentSlide === slides.length - 1}
              style={{ width: 30, height: 30, borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentSlide === slides.length - 1 ? "not-allowed" : "pointer", opacity: currentSlide === slides.length - 1 ? 0.3 : 1 }}>
              <ChevronRight size={14} color="rgba(255,255,255,0.6)" />
            </button>

            {/* Mute toggle */}
            <button onClick={() => setMuted(m => !m)}
              style={{ width: 30, height: 30, borderRadius: "6px", background: muted ? "rgba(224,82,82,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${muted ? "rgba(224,82,82,0.3)" : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 200ms" }}>
              {muted
                ? <VolumeX size={13} color="#E05252" />
                : <Volume2 size={13} color="rgba(255,255,255,0.5)" />
              }
            </button>

            {!compact && (
              <div style={{ marginLeft: 4 }}>
                <p style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 }}>
                  {lesson.topic}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  {slides.length} slides · {TOTAL_DURATION}s
                </p>
              </div>
            )}
          </div>

          {/* Slide dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                style={{ width: currentSlide === i ? (compact ? 16 : 20) : (compact ? 6 : 8), height: compact ? 6 : 8, borderRadius: "999px", background: currentSlide === i ? (slides[i]?.accentColor || "#56C99A") : i < currentSlide ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", padding: 0, transition: "all 250ms ease" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PRACTICE PAGE
 ───────────────────────────────────────────────────────────── */
export default function PracticePage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Visual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState("");
  const charCount = topic.length;

  // Lock body scroll in fullscreen
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // ESC exits fullscreen
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setLessonData(null);
    setError("");
    setGenStep(0);

    // Cycle through generation steps
    const stepInterval = setInterval(() => {
      setGenStep(p => (p < GENERATION_STEPS.length - 1 ? p + 1 : p));
    }, 1600);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), style }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
        throw new Error("Invalid lesson data received. Please try again.");
      }

      setLessonData(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate lesson. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenStep(0);
    }
  };

  const activeStyleConfig = LEARNING_STYLES.find(s => s.key === style)!;

  return (
    <>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes orbFloat  { 0%,100%{transform:translateY(0)scale(1)} 50%{transform:translateY(-18px)scale(1.05)} }

        .a1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
        .a2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .07s both}
        .a3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .14s both}

        .lift{transition:transform 200ms cubic-bezier(.22,1,.36,1),box-shadow 200ms ease}
        .lift:hover{transform:translateY(-2px);box-shadow:var(--shadow-md,0 4px 12px rgba(0,0,0,0.12))!important}

        .chip-btn:hover{
          border-color:var(--brand-primary,#3D8B71)!important;
          color:var(--brand-primary,#3D8B71)!important;
          background:var(--brand-primary-light,#EAF5F1)!important
        }

        .gen-btn:not(:disabled):hover{
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(61,139,113,.42)!important
        }
        .gen-btn:not(:disabled):active{transform:translateY(0)}

        .textarea-x:focus{
          border-color:var(--brand-primary,#3D8B71)!important;
          box-shadow:0 0 0 3px rgba(61,139,113,.12)!important;
          background:var(--bg-surface,#fff)!important
        }
        .textarea-x::placeholder{color:var(--text-muted,#9DA3B0)}

        .style-btn{transition:all 200ms cubic-bezier(.22,1,.36,1)}
        .style-btn:hover{transform:translateY(-2px)}

        .step-row{transition:all 350ms ease}

        .action-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}
        .action-btn{transition:all 200ms ease}
      `}</style>

      {/* ══ FULLSCREEN OVERLAY ══ */}
      {isFullscreen && lessonData && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div style={{ height: 64, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setIsFullscreen(false)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", color: "rgba(255,255,255,0.75)", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
                <ArrowLeft size={15} /> Back to Practice
              </button>
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ padding: "3px 10px", background: "rgba(61,139,113,0.18)", border: "1px solid rgba(61,139,113,0.28)", borderRadius: "999px", fontSize: 11, fontWeight: 700, color: "#56C99A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {style}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{lessonData.topic}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>ESC to exit</span>
              <button onClick={() => setIsFullscreen(false)}
                style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,82,82,0.2)"; e.currentTarget.style.color = "#ff6b6b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Fullscreen player */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 0 }}>
            <div style={{ width: "100%", maxWidth: 1100 }}>
              <VideoPlayer lesson={lessonData} compact={false} />
            </div>
          </div>
        </div>
      )}

      {/* ══ PAGE ══ */}
      <div style={{ fontFamily: "var(--font-body, sans-serif)", background: "var(--bg-page, #FAF8F4)", minHeight: "100vh", padding: "var(--space-8, 32px)", paddingBottom: "var(--space-16, 64px)" }}>

        {/* Header */}
        <div className="a1" style={{ marginBottom: "var(--space-8, 32px)" }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-primary, #3D8B71)", background: "var(--brand-primary-light, #EAF5F1)", padding: "4px 10px", borderRadius: "999px", marginBottom: 12, border: "1px solid rgba(61,139,113,0.2)" }}>
            AI-Powered Learning
          </span>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4, 16px)" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)", fontSize: "var(--text-3xl, 1.875rem)", fontWeight: 800, color: "var(--text-primary, #1C1F27)", lineHeight: 1.2, marginBottom: "var(--space-2, 8px)" }}>
                Practice Hub
              </h1>
              <p style={{ color: "var(--text-secondary, #5C6070)", fontSize: 15, maxWidth: 480 }}>
                Generate personalised AI video lessons in seconds — tailored to your learning style.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3, 12px)" }}>
              {[
                { icon: <Zap size={14} />, label: "~10 sec", sub: "Generation", bg: "#FEF4E3", clr: "#D4860A" },
                { icon: <Star size={14} />, label: "3 styles", sub: "Personalised", bg: "var(--brand-primary-light, #EAF5F1)", clr: "var(--brand-primary, #3D8B71)" },
                { icon: <TrendingUp size={14} />, label: "5 slides", sub: "Per lesson", bg: "#EAF6F1", clr: "#2E9E6B" },
              ].map((s, i) => (
                <div key={i} className="lift" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-surface, #fff)", border: "1px solid var(--border-default, #E8E4DC)", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 1px 3px rgba(28,31,39,0.06)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "8px", background: s.bg, color: s.clr, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary, #1C1F27)" }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted, #9DA3B0)" }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ width: "100%", maxWidth: (!isGenerating && !lessonData) ? 600 : 960, transition: "max-width 400ms cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", gap: "var(--space-6, 24px)" }}>

            {/* ── INPUT VIEW ── */}
            {!isGenerating && !lessonData && (
              <div className="a2" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4, 16px)" }}>
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: "16px", border: "1px solid var(--border-default, #E8E4DC)", boxShadow: "0 1px 3px rgba(28,31,39,0.06)", overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, var(--brand-primary-light, #EAF5F1) 0%, rgba(234,245,241,0.3) 100%)", borderBottom: "1px solid rgba(61,139,113,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, background: "var(--bg-surface, #fff)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary, #3D8B71)", boxShadow: "0 1px 3px rgba(28,31,39,0.06)", border: "1px solid rgba(61,139,113,0.15)" }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, color: "var(--text-primary, #1C1F27)", fontSize: 15 }}>AI Video Generator</h3>
                        <p style={{ fontSize: 12, color: "var(--text-muted, #9DA3B0)", marginTop: 1 }}>Personalised 45-second lessons on any topic</p>
                      </div>
                    </div>
                    <span style={{ padding: "3px 8px", background: "var(--bg-surface, #fff)", borderRadius: "4px", fontSize: 9, fontWeight: 800, color: "var(--brand-primary, #3D8B71)", border: "1px solid rgba(61,139,113,0.2)", letterSpacing: "0.06em" }}>BETA</span>
                  </div>

                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Topic textarea */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted, #9DA3B0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                        What do you want to learn?
                      </label>
                      <div style={{ position: "relative" }}>
                        <textarea
                          className="textarea-x"
                          value={topic}
                          onChange={e => setTopic(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && topic.trim()) { e.preventDefault(); handleGenerate(); } }}
                          placeholder="e.g. How does photosynthesis work?"
                          maxLength={200}
                          style={{ width: "100%", height: 110, background: "var(--bg-elevated, #F4F2EE)", border: "1.5px solid var(--border-default, #E8E4DC)", borderRadius: "12px", padding: "14px", paddingBottom: 32, fontSize: 14, fontFamily: "var(--font-body, sans-serif)", color: "var(--text-primary, #1C1F27)", resize: "none", outline: "none", transition: "border-color 150ms, box-shadow 150ms, background 150ms", lineHeight: 1.6, boxSizing: "border-box" }}
                        />
                        <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, fontWeight: 600, color: charCount > 180 ? "#D4860A" : "var(--text-muted, #9DA3B0)", transition: "color 200ms" }}>
                          {charCount}/200
                        </span>
                      </div>
                    </div>

                    {/* Example chips */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted, #9DA3B0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Try an example</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {EXAMPLE_TOPICS.slice(0, 4).map((t, i) => (
                          <button key={i} className="chip-btn" onClick={() => setTopic(t)}
                            style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #5C6070)", background: "var(--bg-elevated, #F4F2EE)", border: "1px solid var(--border-default, #E8E4DC)", borderRadius: "999px", padding: "5px 12px", cursor: "pointer", transition: "all 150ms", fontFamily: "var(--font-body, sans-serif)" }}>
                            {t.length > 30 ? t.slice(0, 28) + "…" : t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Learning style */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted, #9DA3B0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Learning Style</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                        {LEARNING_STYLES.map(s => {
                          const active = style === s.key;
                          return (
                            <button key={s.key} className="style-btn" onClick={() => setStyle(s.key)}
                              style={{ padding: "12px 10px", borderRadius: "10px", border: `2px solid ${active ? s.border : "var(--border-default, #E8E4DC)"}`, background: active ? s.iconBg : "var(--bg-surface, #fff)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: "var(--font-body, sans-serif)" }}>
                              <div style={{ width: 32, height: 32, borderRadius: "8px", background: s.iconBg, color: s.iconClr, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {s.icon}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: active ? s.iconClr : "var(--text-secondary, #5C6070)" }}>{s.key}</span>
                              {active && <span style={{ fontSize: 9, color: s.iconClr, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{s.desc}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div style={{ background: "#FDEEEE", border: "1px solid rgba(224,82,82,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: 13, color: "#C03A3A", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                        <X size={14} color="#E05252" />
                        {error}
                      </div>
                    )}

                    {/* Generate button */}
                    <button className="gen-btn" onClick={handleGenerate} disabled={isGenerating || !topic.trim()}
                      style={{ width: "100%", padding: "15px", borderRadius: "10px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: isGenerating || !topic.trim() ? "not-allowed" : "pointer", background: isGenerating || !topic.trim() ? "var(--bg-elevated, #F4F2EE)" : "var(--brand-primary, #3D8B71)", color: isGenerating || !topic.trim() ? "var(--text-muted, #9DA3B0)" : "#fff", fontFamily: "var(--font-body, sans-serif)", boxShadow: isGenerating || !topic.trim() ? "none" : "0 4px 16px rgba(61,139,113,0.25)", transition: "all 200ms cubic-bezier(.22,1,.36,1)" }}>
                      {isGenerating
                        ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating lesson…</>
                        : <><Sparkles size={16} /> Generate Video Lesson</>
                      }
                    </button>
                  </div>
                </div>

                {/* Tips card */}
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: "12px", border: "1px solid var(--border-default, #E8E4DC)", padding: "20px", boxShadow: "0 1px 3px rgba(28,31,39,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Lightbulb size={14} color="#D4860A" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary, #5C6070)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pro Tips</span>
                  </div>
                  {[
                    "Be specific — \"Explain mitosis step by step\" beats just \"biology\"",
                    "Match style to content — Visual works best for diagrams & processes",
                    "Short focused topics produce tighter, more memorable lessons",
                  ].map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < 2 ? 8 : 0 }}>
                      <CheckCircle2 size={13} color="#2E9E6B" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary, #5C6070)", lineHeight: 1.6 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── GENERATING STATE ── */}
            {isGenerating && (
              <div className="a3" style={{ background: "var(--bg-surface, #fff)", borderRadius: "16px", border: "1px solid var(--border-default, #E8E4DC)", boxShadow: "0 1px 3px rgba(28,31,39,0.06)", padding: "64px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: 520 }}>
                {/* Animated orb */}
                <div style={{ position: "relative", width: 100, height: 100, marginBottom: 32 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-primary-light,#EAF5F1), var(--brand-primary,#3D8B71))", opacity: 0.15, animation: "orbFloat 3s ease-in-out infinite" }} />
                  <div style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "3px solid rgba(61,139,113,0.15)", borderTop: "3px solid var(--brand-primary,#3D8B71)", animation: "spin 1.2s linear infinite" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 32 }}>{GENERATION_STEPS[genStep]?.icon}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary, #1C1F27)", marginBottom: 8 }}>
                  {GENERATION_STEPS[genStep]?.label}
                </h3>
                <p style={{ color: "var(--text-muted, #9DA3B0)", fontSize: 14, maxWidth: 320, lineHeight: 1.6, marginBottom: 32 }}>
                  Creating a <strong style={{ color: "var(--text-secondary, #5C6070)" }}>{style}</strong> lesson on{" "}
                  <strong style={{ color: "var(--text-secondary, #5C6070)" }}>"{topic}"</strong>
                </p>
                {/* Steps list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 340 }}>
                  {GENERATION_STEPS.map((step, i) => (
                    <div key={i} className="step-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "10px", background: i < genStep ? "#EAF6F1" : i === genStep ? "var(--brand-primary-light,#EAF5F1)" : "var(--bg-elevated,#F4F2EE)", border: `1px solid ${i < genStep ? "rgba(46,158,107,0.2)" : i === genStep ? "rgba(61,139,113,0.25)" : "transparent"}` }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i < genStep ? "#2E9E6B" : i === genStep ? "var(--brand-primary,#3D8B71)" : "var(--border-default,#E8E4DC)", transition: "background 300ms" }}>
                        {i < genStep
                          ? <Check size={12} color="#fff" />
                          : i === genStep
                            ? <Loader2 size={12} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                            : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-muted,#9DA3B0)", display: "block" }} />
                        }
                      </div>
                      <span style={{ fontSize: 12, fontWeight: i <= genStep ? 700 : 500, color: i < genStep ? "#1E7A52" : i === genStep ? "var(--brand-primary,#3D8B71)" : "var(--text-muted,#9DA3B0)", flex: 1, textAlign: "left" }}>
                        {step.label}
                      </span>
                      {i < genStep && <Check size={12} color="#2E9E6B" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── LESSON READY VIEW ── */}
            {!isGenerating && lessonData && (
              <div className="a3" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4, 16px)" }}>
                {/* Success banner */}
                <div style={{ background: "linear-gradient(135deg, #EAF6F1, rgba(234,246,241,0.4))", border: "1px solid rgba(46,158,107,0.2)", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: "#2E9E6B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1E7A52" }}>Lesson ready! 🎉</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted, #9DA3B0)", marginTop: 2 }}>
                      Your {style} lesson on "{lessonData.topic}" is ready to watch.
                    </p>
                  </div>
                  <button onClick={() => setIsFullscreen(true)}
                    style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 14px", background: "var(--brand-primary, #3D8B71)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", transition: "all 150ms" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#2E6B57"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--brand-primary, #3D8B71)"; }}>
                    <Maximize2 size={12} /> Watch Fullscreen
                  </button>
                </div>

                {/* Inline player */}
                <VideoPlayer lesson={lessonData} compact={true} />

                {/* Meta row */}
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: "12px", border: "1px solid var(--border-default, #E8E4DC)", padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, boxShadow: "0 1px 3px rgba(28,31,39,0.06)" }}>
                  {[
                    { label: "Duration", value: "45 sec", icon: <Clock size={14} />, clr: "#4A7FC1" },
                    { label: "Slides", value: `${lessonData.slides?.length || 5}`, icon: <BookOpen size={14} />, clr: "var(--brand-primary, #3D8B71)" },
                    { label: "Style", value: style, icon: <Eye size={14} />, clr: activeStyleConfig.iconClr },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--bg-elevated, #F4F2EE)", color: m.clr, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted, #9DA3B0)" }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #1C1F27)" }}>{m.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slide overview */}
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: "12px", border: "1px solid var(--border-default, #E8E4DC)", padding: "20px", boxShadow: "0 1px 3px rgba(28,31,39,0.06)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted, #9DA3B0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Slide Overview</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {lessonData.slides.map((sl, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg-elevated, #F4F2EE)", borderRadius: "8px", borderLeft: `3px solid ${sl.accentColor || "var(--brand-primary, #3D8B71)"}` }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{sl.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary, #1C1F27)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sl.headline}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted, #9DA3B0)", marginTop: 1, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{sl.tag}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted, #9DA3B0)", flexShrink: 0 }}>{i * SLIDE_DURATION}s</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
                  <button className="action-btn" onClick={() => { setLessonData(null); setError(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "999px", background: "var(--bg-elevated, #F4F2EE)", border: "1px solid var(--border-default, #E8E4DC)", color: "var(--text-secondary, #5C6070)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    <ArrowLeft size={16} /> Create Another
                  </button>
                  <button className="action-btn" onClick={handleGenerate}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "999px", background: "var(--brand-primary-light, #EAF5F1)", border: "1px solid rgba(61,139,113,0.2)", color: "var(--brand-primary, #3D8B71)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    <RotateCcw size={16} /> Regenerate Lesson
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}