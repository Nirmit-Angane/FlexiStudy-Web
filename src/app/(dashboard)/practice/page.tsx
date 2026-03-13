"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Play, Check, Loader2, X, Maximize2,
  ArrowLeft, BookOpen, Zap, RotateCcw, Volume2, VolumeX,
  Lightbulb, Eye, Headphones, Hand, Clock, Star,
  TrendingUp, CheckCircle2, ChevronLeft, ChevronRight,
  Pause,
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
const SLIDE_DURATION = 9; // seconds per slide
const TOTAL_DURATION = 45;

const LEARNING_STYLES = [
  {
    key: "Visual",
    icon: <Eye size={18} />,
    desc: "Diagrams & spatial understanding",
    iconBg: "var(--style-visual-bg)",
    iconClr: "var(--style-visual)",
    border: "var(--style-visual)",
  },
  {
    key: "Auditory",
    icon: <Headphones size={18} />,
    desc: "Listening & narrative patterns",
    iconBg: "var(--info-subtle)",
    iconClr: "var(--info)",
    border: "var(--info)",
  },
  {
    key: "Kinesthetic",
    icon: <Hand size={18} />,
    desc: "Hands-on & practical tasks",
    iconBg: "var(--style-practical-bg)",
    iconClr: "var(--style-practical)",
    border: "var(--style-practical)",
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
  const [slideProgress, setSlideProgress] = useState(0); // 0–100 within current slide
  const [totalProgress, setTotalProgress] = useState(0); // 0–100 overall
  const [muted, setMuted] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [pointsVisible, setPointsVisible] = useState<boolean[]>([]);
  const [slideEntering, setSlideEntering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textTimerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = lesson.slides || [];
  const slide = slides[currentSlide] || ({} as Slide);
  const elapsed = Math.round((totalProgress / 100) * TOTAL_DURATION);
  const remaining = TOTAL_DURATION - elapsed;

  // Animate text when slide changes
  const animateSlide = (idx: number) => {
    setSlideEntering(true);
    setTextVisible(false);
    setPointsVisible([]);
    setTimeout(() => {
      setSlideEntering(false);
      setTextVisible(true);
    }, 300);
    const pts = slides[idx]?.points;
    if (pts?.length) {
      pts.forEach((_, i) => {
        setTimeout(() => {
          setPointsVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 500 + i * 250);
      });
    }
  };

  // Auto-play ticker
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setSlideProgress(sp => {
          const nextSp = sp + (100 / (SLIDE_DURATION * 10));
          setTotalProgress(tp => Math.min(tp + (100 / (TOTAL_DURATION * 10)), 100));

          if (nextSp >= 100) {
            // Advance slide
            setCurrentSlide(cs => {
              const next = cs + 1;
              if (next >= slides.length) {
                setPlaying(false);
                clearInterval(intervalRef.current!);
                return cs;
              }
              animateSlide(next);
              return next;
            });
            return 0;
          }
          return nextSp;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, slides.length]);

  // Animate on mount
  useEffect(() => {
    animateSlide(0);
  }, []);

  const handlePlayPause = () => {
    if (totalProgress >= 100) {
      // Reset
      setCurrentSlide(0);
      setSlideProgress(0);
      setTotalProgress(0);
      setPlaying(true);
      animateSlide(0);
    } else {
      setPlaying(p => !p);
    }
  };

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    setSlideProgress(0);
    setTotalProgress((idx / slides.length) * 100);
    animateSlide(idx);
  };

  const fmtTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div style={{
      background: "#0B0E17",
      borderRadius: compact ? "var(--radius-lg)" : "var(--radius-xl)",
      overflow: "hidden",
      width: "100%",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: compact ? "var(--shadow-lg)" : "0 32px 80px rgba(0,0,0,0.55)",
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
          background: slide.accentColor ? `${slide.accentColor}20` : "rgba(61,139,113,0.15)",
          filter: "blur(70px)", pointerEvents: "none",
          transition: "background 0.6s ease",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 220, height: 220,
          borderRadius: "50%",
          background: slide.accentColor ? `${slide.accentColor}12` : "rgba(74,127,193,0.12)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        {/* Grid texture overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Top-left: slide status */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.35)", borderRadius: "var(--radius-full)",
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
          <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", fontFamily: "var(--font-body)" }}>
            {playing ? "PLAYING" : totalProgress >= 100 ? "COMPLETE" : "PAUSED"} · {currentSlide + 1}/{slides.length}
          </span>
        </div>

        {/* Top-right: timer */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.35)", borderRadius: "var(--radius-full)",
          padding: "4px 10px", border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
        }}>
          <Clock size={10} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)" }}>
            {fmtTime(elapsed)} / {fmtTime(TOTAL_DURATION)}
          </span>
        </div>

        {/* Content — animated in */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          maxWidth: compact ? 460 : 640, width: "100%", textAlign: "center",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          {/* Emoji */}
          {slide.emoji && (
            <div style={{
              fontSize: compact ? 36 : 58,
              lineHeight: 1,
              marginBottom: compact ? 12 : 20,
              filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))",
            }}>
              {slide.emoji}
            </div>
          )}

          {/* Slide type tag */}
          {slide.tag && (
            <span style={{
              fontSize: 9, fontWeight: 800,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: slide.accentColor || "rgba(255,255,255,0.5)",
              marginBottom: compact ? 6 : 10,
              fontFamily: "var(--font-body)",
            }}>
              {slide.tag}
            </span>
          )}

          {/* Headline */}
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: compact ? "var(--text-lg)" : "var(--text-3xl)",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: "var(--leading-tight)",
            marginBottom: compact ? 8 : 14,
            textShadow: "0 2px 20px rgba(0,0,0,0.6)",
          }}>
            {slide.headline}
          </h2>

          {/* Body */}
          {slide.body && (
            <p style={{
              fontSize: compact ? 11 : "var(--text-sm)",
              color: "rgba(255,255,255,0.68)",
              lineHeight: "var(--leading-relaxed)",
              maxWidth: 500,
              marginBottom: slide.points?.length ? (compact ? 12 : 20) : 0,
            }}>
              {slide.body}
            </p>
          )}

          {/* Bullet points */}
          {slide.points && slide.points.length > 0 && (
            <div style={{
              display: "flex", flexDirection: "column",
              gap: compact ? 6 : 10,
              alignSelf: "flex-start", width: "100%", textAlign: "left",
            }}>
              {slide.points.map((pt, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: compact ? 8 : 10,
                  opacity: pointsVisible[i] ? 1 : 0,
                  transform: pointsVisible[i] ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                }}>
                  <div style={{
                    width: compact ? 16 : 20, height: compact ? 16 : 20,
                    borderRadius: "50%",
                    background: slide.accentColor || "var(--brand-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <CheckCircle2 size={compact ? 10 : 12} color="#fff" />
                  </div>
                  <span style={{
                    fontSize: compact ? 11 : "var(--text-sm)",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: "var(--leading-relaxed)",
                    fontFamily: "var(--font-body)",
                  }}>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slide progress bar (inner) */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 2, background: "rgba(255,255,255,0.06)",
        }}>
          <div style={{
            height: "100%", width: `${slideProgress}%`,
            background: slide.accentColor || "var(--brand-primary)",
            transition: playing ? "none" : "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={{
        background: "#0d1020",
        padding: compact ? "12px 16px" : "16px 24px",
        display: "flex", flexDirection: "column",
        gap: compact ? 8 : 12,
      }}>
        {/* Total scrubber */}
        <div style={{ position: "relative", cursor: "pointer" }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const targetSlide = Math.floor(pct * slides.length);
            goToSlide(Math.min(targetSlide, slides.length - 1));
          }}
        >
          <div style={{
            height: 4, background: "rgba(255,255,255,0.08)",
            borderRadius: "var(--radius-full)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${totalProgress}%`,
              background: `linear-gradient(90deg, var(--brand-primary), #56C99A)`,
              borderRadius: "var(--radius-full)",
              transition: playing ? "none" : "width 0.3s ease",
            }} />
          </div>
          {/* Slide tick marks */}
          {slides.map((_, i) => (
            <div key={i} style={{
              position: "absolute", top: -1,
              left: `${(i / slides.length) * 100}%`,
              width: 2, height: 6,
              background: "rgba(255,255,255,0.12)",
              transform: "translateX(-50%)",
              borderRadius: 1, pointerEvents: "none",
            }} />
          ))}
        </div>

        {/* Buttons row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Prev */}
            <button
              onClick={() => goToSlide(Math.max(currentSlide - 1, 0))}
              disabled={currentSlide === 0}
              style={{
                width: 30, height: 30, borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentSlide === 0 ? "not-allowed" : "pointer",
                opacity: currentSlide === 0 ? 0.3 : 1,
              }}
            >
              <ChevronLeft size={14} color="rgba(255,255,255,0.6)" />
            </button>

            {/* Play / Pause / Replay */}
            <button
              onClick={handlePlayPause}
              style={{
                width: compact ? 38 : 46, height: compact ? 38 : 46,
                borderRadius: "50%",
                background: "var(--brand-primary)",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 4px 16px rgba(61,139,113,0.4)",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(61,139,113,0.55)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(61,139,113,0.4)";
              }}
            >
              {totalProgress >= 100 ? (
                <RotateCcw size={compact ? 14 : 16} color="#fff" />
              ) : playing ? (
                <div style={{ display: "flex", gap: 3 }}>
                  <div style={{ width: compact ? 3 : 4, height: compact ? 10 : 12, background: "#fff", borderRadius: 2 }} />
                  <div style={{ width: compact ? 3 : 4, height: compact ? 10 : 12, background: "#fff", borderRadius: 2 }} />
                </div>
              ) : (
                <Play size={compact ? 14 : 16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
              )}
            </button>

            {/* Next */}
            <button
              onClick={() => goToSlide(Math.min(currentSlide + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              style={{
                width: 30, height: 30, borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentSlide === slides.length - 1 ? "not-allowed" : "pointer",
                opacity: currentSlide === slides.length - 1 ? 0.3 : 1,
              }}
            >
              <ChevronRight size={14} color="rgba(255,255,255,0.6)" />
            </button>

            {/* Mute */}
            <button
              onClick={() => setMuted(m => !m)}
              style={{
                width: 30, height: 30, borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {muted
                ? <VolumeX size={13} color="rgba(255,255,255,0.4)" />
                : <Volume2 size={13} color="rgba(255,255,255,0.5)" />
              }
            </button>

            {/* Title */}
            {!compact && (
              <div style={{ marginLeft: 4 }}>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)", fontWeight: 700,
                  color: "rgba(255,255,255,0.85)", lineHeight: 1.2,
                }}>
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
              <button key={i}
                onClick={() => goToSlide(i)}
                style={{
                  width: currentSlide === i ? (compact ? 16 : 20) : (compact ? 6 : 8),
                  height: compact ? 6 : 8,
                  borderRadius: "var(--radius-full)",
                  background: currentSlide === i
                    ? (slides[i]?.accentColor || "#56C99A")
                    : i < currentSlide
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(255,255,255,0.15)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 250ms ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
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

  // Lock scroll in fullscreen
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // ESC to exit fullscreen
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

    const interval = setInterval(() => {
      setGenStep(p => (p < GENERATION_STEPS.length - 1 ? p + 1 : p));
    }, 1400);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: LessonData = await res.json();
      setLessonData(data);
      setIsFullscreen(true);
    } catch (e) {
      setError("Failed to generate lesson. Please try again.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenStep(0);
    }
  };

  const activeStyleConfig = LEARNING_STYLES.find(s => s.key === style)!;

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes orbFloat { 0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(-18px)scale(1.05)} }
        @keyframes videoFadeIn { from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)} }

        .a1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
        .a2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .07s both}
        .a3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .14s both}
        .a4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .21s both}

        .lift{transition:transform 200ms cubic-bezier(.22,1,.36,1),box-shadow 200ms ease}
        .lift:hover{transform:translateY(-2px)}

        .chip-btn:hover{border-color:var(--brand-primary)!important;color:var(--brand-primary)!important;background:var(--brand-primary-light)!important}

        .gen-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(61,139,113,.42)!important}
        .gen-btn:not(:disabled):active{transform:translateY(0)}

        .textarea-x:focus{border-color:var(--brand-primary)!important;box-shadow:0 0 0 3px rgba(61,139,113,.12)!important;background:var(--bg-surface)!important}
        .textarea-x::placeholder{color:var(--text-muted)}

        .style-btn{transition:all 200ms cubic-bezier(.22,1,.36,1)}
        .style-btn:hover{transform:translateY(-2px)}

        .step-row{transition:all 350ms ease}
      `}</style>

      {/* ══ FULLSCREEN OVERLAY ══════════════════════════════ */}
      {isFullscreen && lessonData && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#07090f",
          display: "flex", flexDirection: "column",
          animation: "videoFadeIn 0.4s cubic-bezier(.22,1,.36,1)",
        }}>
          {/* Chrome bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px",
            background: "rgba(7,9,15,0.97)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setIsFullscreen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "var(--radius-md)", padding: "8px 16px",
                  color: "rgba(255,255,255,0.75)", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)",
                  transition: "all 150ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
              >
                <ArrowLeft size={15} /> Back to Practice
              </button>
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
              <span style={{
                padding: "3px 10px",
                background: "rgba(61,139,113,0.18)", border: "1px solid rgba(61,139,113,0.28)",
                borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700,
                color: "#56C99A", letterSpacing: "0.08em", textTransform: "uppercase",
                fontFamily: "var(--font-body)",
              }}>{style}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "var(--font-body)" }}>
                {lessonData.topic}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>ESC to exit</span>
              <button
                onClick={() => setIsFullscreen(false)}
                style={{
                  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--radius-sm)", color: "rgba(255,255,255,0.5)",
                  cursor: "pointer", transition: "all 150ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,82,82,0.2)"; e.currentTarget.style.color = "#ff6b6b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Player */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 0 }}>
            <div style={{ width: "100%", maxWidth: 1100 }}>
              <VideoPlayer lesson={lessonData} compact={false} />
            </div>
          </div>
        </div>
      )}

      {/* ══ PAGE ════════════════════════════════════════════ */}
      <div style={{
        fontFamily: "var(--font-body)",
        background: "var(--bg-page)",
        minHeight: "100vh",
        padding: "var(--space-8)",
        paddingBottom: "var(--space-16)",
      }}>

        {/* Header */}
        <div className="a1" style={{ marginBottom: "var(--space-8)" }}>
          <span className="ds-section-label">AI-Powered Learning</span>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-2)" }}>
                Practice Hub
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-base)", maxWidth: 480 }}>
                Generate personalised AI video lessons in seconds — tailored to your learning style.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              {[
                { icon: <Zap size={14} />, label: "~10 sec", sub: "Generation", bg: "var(--warning-subtle)", clr: "var(--warning)" },
                { icon: <Star size={14} />, label: "3 styles", sub: "Personalised", bg: "var(--brand-primary-light)", clr: "var(--brand-primary)" },
                { icon: <TrendingUp size={14} />, label: "5 slides", sub: "Per lesson", bg: "var(--success-subtle)", clr: "var(--success)" },
              ].map((s, i) => (
                <div key={i} className="lift" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "10px 14px", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: s.bg, color: s.clr, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "460px 1fr", gap: "var(--space-6)", alignItems: "start" }}>

          {/* ── LEFT: INPUT ── */}
          <div className="a2" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

            <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>

              {/* Card header */}
              <div style={{
                padding: "var(--space-5) var(--space-6)",
                background: "linear-gradient(135deg, var(--brand-primary-light) 0%, rgba(234,245,241,0.3) 100%)",
                borderBottom: "1px solid rgba(61,139,113,0.12)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, background: "var(--bg-surface)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", boxShadow: "var(--shadow-sm)", border: "1px solid rgba(61,139,113,0.15)" }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", fontSize: "var(--text-base)" }}>AI Video Generator</h3>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 1 }}>Personalised 45-second lessons on any topic</p>
                  </div>
                </div>
                <span style={{ padding: "3px 8px", background: "var(--bg-surface)", borderRadius: "var(--radius-xs)", fontSize: 9, fontWeight: 800, color: "var(--brand-primary)", border: "1px solid rgba(61,139,113,0.2)", letterSpacing: "0.06em" }}>BETA</span>
              </div>

              <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

                {/* Topic textarea */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-2)" }}>
                    What do you want to learn?
                  </label>
                  <div style={{ position: "relative" }}>
                    <textarea
                      className="textarea-x"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. How does photosynthesis work?"
                      maxLength={200}
                      style={{
                        width: "100%", height: 110,
                        background: "var(--bg-elevated)",
                        border: "1.5px solid var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        padding: "14px", paddingBottom: 32,
                        fontSize: "var(--text-sm)",
                        fontFamily: "var(--font-body)",
                        color: "var(--text-primary)",
                        resize: "none", outline: "none",
                        transition: "border-color 150ms, box-shadow 150ms, background 150ms",
                        lineHeight: "var(--leading-relaxed)",
                        boxSizing: "border-box",
                      }}
                    />
                    <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, fontWeight: 600, color: charCount > 180 ? "var(--warning)" : "var(--text-muted)", transition: "color 200ms" }}>
                      {charCount}/200
                    </span>
                  </div>
                </div>

                {/* Example chips */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-2)" }}>Try an example</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                    {EXAMPLE_TOPICS.slice(0, 4).map((t, i) => (
                      <button key={i} className="chip-btn"
                        onClick={() => setTopic(t)}
                        style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "5px 12px", cursor: "pointer", transition: "all 150ms", fontFamily: "var(--font-body)" }}>
                        {t.length > 30 ? t.slice(0, 28) + "…" : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning style */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)" }}>Learning Style</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-2)" }}>
                    {LEARNING_STYLES.map(s => {
                      const active = style === s.key;
                      return (
                        <button key={s.key} className="style-btn"
                          onClick={() => setStyle(s.key)}
                          style={{
                            padding: "12px 10px",
                            borderRadius: "var(--radius-md)",
                            border: `2px solid ${active ? s.border : "var(--border-default)"}`,
                            background: active ? s.iconBg : "var(--bg-surface)",
                            cursor: "pointer",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            fontFamily: "var(--font-body)",
                          }}>
                          <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: s.iconBg, color: s.iconClr, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {s.icon}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: active ? s.iconClr : "var(--text-secondary)" }}>{s.key}</span>
                          {active && <span style={{ fontSize: 9, color: s.iconClr, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{s.desc}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ background: "var(--error-subtle)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 13, color: "var(--error-text)", fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                {/* Generate button */}
                <button
                  className="gen-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  style={{
                    width: "100%", padding: "15px",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700, fontSize: "var(--text-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    border: "none",
                    cursor: isGenerating || !topic.trim() ? "not-allowed" : "pointer",
                    background: isGenerating || !topic.trim() ? "var(--bg-elevated)" : "var(--brand-primary)",
                    color: isGenerating || !topic.trim() ? "var(--text-muted)" : "#fff",
                    fontFamily: "var(--font-body)",
                    boxShadow: isGenerating || !topic.trim() ? "none" : "var(--shadow-brand)",
                    transition: "all 200ms cubic-bezier(.22,1,.36,1)",
                  }}
                >
                  {isGenerating
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating lesson…</>
                    : lessonData
                      ? <><RotateCcw size={16} /> Regenerate Lesson</>
                      : <><Sparkles size={16} /> Generate Video Lesson</>
                  }
                </button>

                {/* Watch fullscreen */}
                {lessonData && !isGenerating && (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "var(--text-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1.5px solid var(--border-strong)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 150ms" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.color = "var(--brand-primary)"; e.currentTarget.style.background = "var(--brand-primary-light)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
                  >
                    <Maximize2 size={15} /> Watch Fullscreen
                  </button>
                )}
              </div>
            </div>

            {/* Tips card */}
            <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "var(--space-3)" }}>
                <Lightbulb size={14} color="var(--warning)" />
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pro Tips</span>
              </div>
              {[
                "Be specific — \"Explain mitosis step by step\" beats just \"biology\"",
                "Match style to content — Visual works best for diagrams & processes",
                "Short focused topics produce tighter, more memorable lessons",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < 2 ? "var(--space-2)" : 0 }}>
                  <CheckCircle2 size={13} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: OUTPUT ── */}
          <div className="a3">
            {isGenerating ? (
              <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)", padding: "var(--space-12) var(--space-8)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: 520 }}>
                {/* Animated orb */}
                <div style={{ position: "relative", width: 100, height: 100, marginBottom: "var(--space-8)" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-primary-light), var(--brand-primary))", opacity: 0.15, animation: "orbFloat 3s ease-in-out infinite" }} />
                  <div style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "3px solid rgba(61,139,113,0.15)", borderTop: "3px solid var(--brand-primary)", animation: "spin 1.2s linear infinite" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 32 }}>{GENERATION_STEPS[genStep]?.icon}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
                  {GENERATION_STEPS[genStep]?.label}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: 320, lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-8)" }}>
                  Creating a <strong style={{ color: "var(--text-secondary)" }}>{style}</strong> lesson on{" "}
                  <strong style={{ color: "var(--text-secondary)" }}>"{topic}"</strong>
                </p>
                {/* Step list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", width: "100%", maxWidth: 340 }}>
                  {GENERATION_STEPS.map((step, i) => (
                    <div key={i} className="step-row" style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: "var(--radius-md)",
                      background: i < genStep ? "var(--success-subtle)" : i === genStep ? "var(--brand-primary-light)" : "var(--bg-elevated)",
                      border: `1px solid ${i < genStep ? "rgba(46,158,107,0.2)" : i === genStep ? "rgba(61,139,113,0.25)" : "var(--border-subtle)"}`,
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i < genStep ? "var(--success)" : i === genStep ? "var(--brand-primary)" : "var(--border-default)", transition: "background 300ms" }}>
                        {i < genStep
                          ? <Check size={12} color="#fff" />
                          : i === genStep
                            ? <Loader2 size={12} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                            : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-muted)", display: "block" }} />
                        }
                      </div>
                      <span style={{ fontSize: 12, fontWeight: i <= genStep ? 700 : 500, color: i < genStep ? "var(--success-text)" : i === genStep ? "var(--brand-primary)" : "var(--text-muted)", flex: 1, textAlign: "left" }}>
                        {step.label}
                      </span>
                      {i < genStep && <Check size={12} color="var(--success)" />}
                    </div>
                  ))}
                </div>
              </div>

            ) : lessonData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {/* Success banner */}
                <div style={{ background: "linear-gradient(135deg, var(--success-subtle), rgba(234,246,241,0.4))", border: "1px solid rgba(46,158,107,0.2)", borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-5)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--success-text)" }}>Lesson ready! 🎉</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      Your {style} lesson on "{lessonData.topic}" is ready to watch.
                    </p>
                  </div>
                  <button onClick={() => setIsFullscreen(true)} className="btn btn-sm btn-primary" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 14px" }}>
                    <Play size={12} fill="currentColor" /> Watch
                  </button>
                </div>

                {/* Inline player */}
                <VideoPlayer lesson={lessonData} compact={true} />

                {/* Meta row */}
                <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", padding: "var(--space-4) var(--space-5)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-4)", boxShadow: "var(--shadow-sm)" }}>
                  {[
                    { label: "Duration", value: "45 sec", icon: <Clock size={14} />, clr: "var(--info)" },
                    { label: "Slides", value: `${lessonData.slides?.length || 5}`, icon: <BookOpen size={14} />, clr: "var(--brand-primary)" },
                    { label: "Style", value: style, icon: <Eye size={14} />, clr: activeStyleConfig.iconClr },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", color: m.clr, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{m.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slide previews */}
                <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)" }}>Slide Overview</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {lessonData.slides.map((sl, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", borderLeft: `3px solid ${sl.accentColor || "var(--brand-primary)"}` }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{sl.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sl.headline}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{sl.tag}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>{i * SLIDE_DURATION}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            ) : (
              /* Empty state */
              <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "2px dashed var(--border-default)", padding: "var(--space-16) var(--space-8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 520 }}>
                <div style={{ width: 80, height: 80, background: "var(--bg-elevated)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-5)", border: "1px solid var(--border-subtle)" }}>
                  <Sparkles size={32} color="var(--brand-primary)" style={{ opacity: 0.45 }} />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
                  Your lesson will appear here
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: 300, lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>
                  Enter any topic, choose your learning style, and hit generate. Your personalised 45-second video lesson will be ready in seconds.
                </p>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", justifyContent: "center" }}>
                  {["Any topic", "AI-powered", "45 seconds", "3 learning styles"].map((f, i) => (
                    <span key={i} className="badge badge-neutral">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}