"use client";

import { useState, useRef } from "react";
import { Zap, Sparkles, BookOpen, Loader2, RotateCcw, Download } from "lucide-react";
import { MicroVideoPlayer } from "@/components/video/MicroVideoPlayer";
import { LearningStyleSelector, type LearningStyle } from "@/components/video/LearningStyleSelector";

const SUBJECTS = [
  "Mathematics", "Science", "Technology", "History", "Geography",
  "English", "Economics", "Physics", "Chemistry", "Biology",
];

const EXAMPLE_TOPICS = [
  "Photosynthesis", "Newton's Laws of Motion", "How Fractions Work",
  "What is Machine Learning?", "The Water Cycle", "DNA and Genetics",
  "Supply and Demand", "The French Revolution",
];

const STYLE_META: Record<LearningStyle, { icon: string; label: string; color: string; bg: string }> = {
  interactive: { icon: "⚡", label: "Interactive", color: "#6366f1", bg: "#eef2ff" },
  example:     { icon: "📝", label: "Example",     color: "#f59e0b", bg: "#fffbeb" },
  visual:      { icon: "🎨", label: "Visual",      color: "#06b6d4", bg: "#ecfeff" },
  practical:   { icon: "🔧", label: "Practical",   color: "#10b981", bg: "#ecfdf5" },
};

export default function MicroVideoPage() {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Science");
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGenerateClick = () => {
    if (!topic.trim()) return;
    // Show learning style selector instead of generating immediately
    setShowStyleSelector(true);
  };

  const handleStyleSelect = (style: LearningStyle) => {
    setLearningStyle(style);
    setShowStyleSelector(false);
    generate(style);
  };

  const generate = async (style: LearningStyle) => {
    setLoading(true); setError(""); setLesson(null); setCompleted(false);
    try {
      const res = await fetch("/api/generate-microlesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), subject, learningStyle: style }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Generation failed");
      const data = await res.json();
      setLesson(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGenerateClick();
  };

  const reset = () => {
    setLesson(null); setCompleted(false); setError(""); setTopic("");
    setSubject("Science"); setLearningStyle(null); setShowStyleSelector(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleBackFromStyle = () => {
    setShowStyleSelector(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gradShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        @keyframes pulse { 0%,100%{opacity:.5;transform:scale(1);} 50%{opacity:1;transform:scale(1.05);} }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

        .mv-page { 
          max-width: 960px; margin: 0 auto; padding: 0 0 64px; 
          font-family: 'Inter', sans-serif; animation: fadeUp .4s ease;
          display: flex; flex-direction: column; gap: 32px;
        }

        /* ── Hero ── */
        .mv-hero {
          position: relative; border-radius: 24px; overflow: hidden;
          padding: 52px 48px; border: 1.5px solid #b3d9cc;
          background: linear-gradient(135deg, #f0faf5 0%, #e8f5ef 50%, #f0faf5 100%);
        }
        .mv-hero::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 70% 60% at 50% -10%, rgba(61,139,113,.12), transparent),
                      radial-gradient(ellipse 50% 50% at 90% 90%, rgba(61,139,113,.07), transparent);
        }
        .mv-hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          padding:6px 16px; border-radius:999px; border:1px solid rgba(61,139,113,.45);
          background:rgba(61,139,113,.1); color:#2e6b57;
          font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
          margin-bottom:20px;
        }
        .mv-hero h1 {
          font-family:'Plus Jakarta Sans',sans-serif; font-weight:800;
          font-size:clamp(28px,4vw,48px); color:#111827; line-height:1.1;
          margin:0 0 12px;
        }
        .mv-hero-gradient-text {
          background: linear-gradient(135deg,#3D8B71,#06d6a0);
          background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; animation:gradShift 4s ease infinite;
        }
        .mv-hero p {
          color:#4b7a66; font-size:16px; line-height:1.6; margin:0 0 32px; max-width:580px;
        }

        /* ── Step labels ── */
        .mv-step-label {
          font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em;
          color:#6b7280; margin-bottom:8px; display:flex; align-items:center; gap:6px;
        }
        .mv-step-dot { width:18px; height:18px; border-radius:50%; background:#e6f3ee;
          border:1px solid rgba(61,139,113,.4); color:#3D8B71; font-size:10px; font-weight:800;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }

        /* ── Input card ── */
        .mv-input-card {
          background:#ffffff; border:1.5px solid #e5e7eb;
          border-radius:20px; padding:28px 32px; display:flex; flex-direction:column; gap:20px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }
        .mv-row { display:flex; gap:14px; flex-wrap:wrap; }
        .mv-topic-wrap { position:relative; flex:1; min-width:240px; }
        .mv-topic-wrap input {
          width:100%; padding:14px 20px; border-radius:12px;
          background:#f9fafb; border:1.5px solid #e5e7eb;
          color:#111827; font-size:16px; font-family:'Inter',sans-serif;
          outline:none; transition:all .2s; box-sizing:border-box;
        }
        .mv-topic-wrap input::placeholder { color:#9ca3af; }
        .mv-topic-wrap input:focus {
          border-color:#3D8B71; box-shadow:0 0 0 3px rgba(61,139,113,.12); background:#fff;
        }
        .mv-subject-select {
          padding:14px 16px; border-radius:12px; background:#f9fafb;
          border:1.5px solid #e5e7eb; color:#111827;
          font-size:15px; font-family:'Inter',sans-serif; outline:none;
          cursor:pointer; min-width:160px; transition:all .2s;
        }
        .mv-subject-select:focus { border-color:#3D8B71; box-shadow:0 0 0 3px rgba(61,139,113,.12); }

        /* ── Generate button ── */
        .mv-generate-btn {
          padding:14px 32px; border-radius:12px; border:none; cursor:pointer;
          font-size:16px; font-weight:700; font-family:'Inter',sans-serif;
          display:flex; align-items:center; gap:10px; white-space:nowrap;
          background:linear-gradient(135deg,#3D8B71,#2e6b57);
          color:white; transition:all .2s;
          box-shadow:0 4px 16px rgba(61,139,113,.28);
        }
        .mv-generate-btn:hover:not(:disabled) {
          transform:translateY(-2px); box-shadow:0 8px 24px rgba(61,139,113,.38);
        }
        .mv-generate-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }

        /* ── Example chips ── */
        .mv-examples { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .mv-example-chip {
          padding:5px 13px; border-radius:999px; font-size:12.5px; font-weight:500;
          background:#f3f4f6; border:1px solid #e5e7eb;
          color:#6b7280; cursor:pointer; transition:all .18s;
        }
        .mv-example-chip:hover {
          background:#e6f3ee; border-color:#3D8B71; color:#2e6b57; transform:translateY(-1px);
        }

        /* ── Error ── */
        .mv-error {
          padding:16px 20px; border-radius:12px; background:#fef2f2;
          border:1px solid #fecaca; color:#dc2626;
          display:flex; align-items:center; gap:10px; font-size:14px;
        }

        /* ── Loading ── */
        .mv-loading {
          padding:60px 32px; border-radius:20px; background:#ffffff;
          border:1.5px solid #e5e7eb;
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px;
          text-align:center; box-shadow:0 1px 6px rgba(0,0,0,0.05);
        }
        .mv-loading-icon { animation:spin 1.2s linear infinite; color:#3D8B71; }
        .mv-loading h3 { font-family:'Plus Jakarta Sans',sans-serif; font-size:22px; font-weight:700; color:#111827; margin:0; }
        .mv-loading p { color:#6b7280; font-size:14px; margin:0; }

        /* ── Video card ── */
        .mv-video-card {
          background:#ffffff; border:1.5px solid #e5e7eb;
          border-radius:20px; padding:28px 32px;
          display:flex; flex-direction:column; gap:20px;
          animation:fadeUp .45s ease; box-shadow:0 1px 6px rgba(0,0,0,0.05);
        }
        .mv-video-header {
          display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap;
        }
        .mv-video-meta { display:flex; flex-direction:column; gap:6px; }
        .mv-video-topic {
          font-family:'Plus Jakarta Sans',sans-serif; font-size:22px;
          font-weight:800; color:#111827; margin:0;
        }
        .mv-video-chips { display:flex; gap:8px; flex-wrap:wrap; }
        .mv-chip {
          padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600;
          display:flex; align-items:center; gap:5px;
        }
        .mv-chip-primary { background:#e6f3ee; border:1px solid #b3d9cc; color:#2e6b57; }
        .mv-chip-green   { background:#dcfce7; border:1px solid #86efac; color:#166534; }
        .mv-chip-yellow  { background:#fef9c3; border:1px solid #fde047; color:#854d0e; }
        .mv-chip-style   { display:flex; align-items:center; gap:5px; }
        .mv-reset-btn {
          padding:10px 18px; border-radius:10px; border:1px solid #e5e7eb;
          background:#f9fafb; color:#6b7280; cursor:pointer;
          font-size:13px; font-weight:600; font-family:'Inter',sans-serif;
          display:flex; align-items:center; gap:6px; transition:all .18s;
        }
        .mv-reset-btn:hover { background:#e6f3ee; border-color:#3D8B71; color:#2e6b57; }

        /* ── Completion banner ── */
        .mv-complete-banner {
          padding:18px 24px; border-radius:14px;
          background:linear-gradient(135deg,#e6f3ee,#f0faf5);
          border:1px solid #b3d9cc;
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
        }
        .mv-complete-text { display:flex; align-items:center; gap:10px; }
        .mv-complete-icon { font-size:24px; }
        .mv-complete-msg { color:#111827; font-weight:600; font-size:15px; }
        .mv-complete-sub { color:#6b7280; font-size:13px; margin-top:2px; }
        .mv-complete-actions { display:flex; gap:10px; }
        .mv-btn-ghost {
          padding:9px 18px; border-radius:10px; border:1px solid #e5e7eb;
          background:#f9fafb; color:#6b7280; cursor:pointer;
          font-size:13px; font-weight:600; font-family:'Inter',sans-serif;
          display:flex; align-items:center; gap:6px; transition:all .18s;
        }
        .mv-btn-ghost:hover { background:#e6f3ee; border-color:#3D8B71; color:#2e6b57; }

        /* ── Info cards ── */
        .mv-cards-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px;
        }
        .mv-info-card {
          padding:20px; border-radius:14px; background:#ffffff;
          border:1.5px solid #e5e7eb;
          display:flex; flex-direction:column; gap:8px;
          box-shadow:0 1px 4px rgba(0,0,0,0.04); transition:all .18s;
        }
        .mv-info-card:hover { border-color:#3D8B71; box-shadow:0 4px 12px rgba(61,139,113,.1); }
        .mv-info-icon { font-size:24px; }
        .mv-info-label { font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:.08em; color:#6b7280; }
        .mv-info-value { font-size:16px; font-weight:700; color:#111827; }
        .mv-info-sub { font-size:12px; color:#9ca3af; }

        /* ── Notes section ── */
        .mv-notes-container {
          display: flex; flex-direction: column; gap: 24px;
          padding: 32px; border-radius: 20px; background: #fff;
          border: 1.5px solid #e5e7eb; box-shadow: 0 1px 6px rgba(0,0,0,0.05);
          animation: fadeUp .5s ease;
        }
        .mv-summary-box {
          padding: 24px; border-radius: 16px;
          background: linear-gradient(135deg, #f0faf5 0%, #e8f5ef 100%);
          border: 1px solid #b3d9cc; position: relative;
        }
        .mv-summary-box::before {
          content: '\u201C'; position: absolute; top: 10px; left: 15px;
          font-size: 60px; color: rgba(61,139,113,0.1); font-family: serif;
        }
        .mv-summary-text {
          font-size: 17px; line-height: 1.6; color: #111827; 
          font-weight: 500; position: relative; z-index: 1;
        }
        .mv-notes-list {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        .mv-note-item {
          display: flex; gap: 12px; padding: 16px; border-radius: 12px;
          background: #f9fafb; border: 1px solid #e5e7eb; transition: all .2s;
        }
        .mv-note-item:hover {
          border-color: #3D8B71; background: #fff; transform: translateY(-2px);
        }
        .mv-note-bullet {
          width: 24px; height: 24px; border-radius: 6px;
          background: #e6f3ee; color: #3D8B71;
          display: flex; align-items: center; justify-content:center;
          font-size: 14px; font-weight: 700; flex-shrink: 0;
        }
        .mv-note-content { font-size: 14.5px; color: #4b5563; line-height: 1.5; }
      `}</style>

      <div className="mv-page">

        {/* Hero */}
        <div className="mv-hero" style={{ position: "relative" }}>
          <div className="mv-hero-badge">
            <Zap size={13} />
            AI Micro-Video Generator
          </div>
          <h1>
            Learn anything in{" "}
            <span className="mv-hero-gradient-text">30 seconds</span>
          </h1>
          <p>
            Type a topic, choose your learning style, and AI instantly generates
            a rich, animated 30-second educational micro-video — tailored to how
            you learn best.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { icon: "🎯", label: "4 learning styles" },
              { icon: "✦", label: "5 animated segments" },
              { icon: "⚡", label: "Style-adapted content" },
              { icon: "🔀", label: "Smart subject detection" },
            ].map((f, i) => (
              <div key={`feature-${i}`} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(61,139,113,0.07)", border: "1px solid rgba(61,139,113,0.2)",
                fontSize: 13, color: "#2e6b57", fontWeight: 500,
              }}>
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Learning Style Selector ── */}
        {showStyleSelector && !lesson && !loading && (
          <LearningStyleSelector
            topic={topic}
            subject={subject}
            onSelect={handleStyleSelect}
            onBack={handleBackFromStyle}
          />
        )}

        {/* Input Card — only when not showing style selector, lesson, or loading */}
        {!showStyleSelector && !lesson && !loading && (
          <div className="mv-input-card">
            <div>
              <div className="mv-step-label">
                <div className="mv-step-dot">1</div>
                Enter your topic
              </div>
              <div className="mv-row">
                <div className="mv-topic-wrap">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. Photosynthesis, Newton's Laws, How DNA works…"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
                <select
                  className="mv-subject-select"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  className="mv-generate-btn"
                  onClick={handleGenerateClick}
                  disabled={!topic.trim()}
                >
                  <Sparkles size={17} />
                  Generate Video
                </button>
              </div>
            </div>

            <div>
              <div className="mv-step-label" style={{ marginBottom: 10 }}>
                <div className="mv-step-dot">2</div>
                Or try an example
              </div>
              <div className="mv-examples">
                {EXAMPLE_TOPICS.map(t => (
                  <div
                    key={t}
                    className="mv-example-chip"
                    onClick={() => { setTopic(t); setShowStyleSelector(true); }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mv-error">
            <span>⚠</span> {error}
            <button className="mv-btn-ghost" onClick={reset} style={{ marginLeft: "auto" }}>
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mv-loading">
            <Loader2 size={44} className="mv-loading-icon" />
            <div>
              <h3>Crafting your {learningStyle ? STYLE_META[learningStyle].label + "-style " : ""}lesson…</h3>
              <p>AI is building animated segments tailored to your learning style.</p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {["Hook", "Concept", learningStyle ? STYLE_META[learningStyle].label : "Interactive", "Insight", "Closing"].map((s, i) => (
                <div key={`loading-step-${i}`} style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: "rgba(61,139,113,0.08)", border: "1px solid rgba(61,139,113,0.25)",
                  color: "#3D8B71", animation: `pulse 1.4s ease ${i * 0.2}s infinite`,
                }}>
                  {s}
                </div>
              ))}
            </div>
            {learningStyle && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginTop: 8,
                padding: "6px 16px", borderRadius: 999,
                background: STYLE_META[learningStyle].bg,
                border: `1px solid ${STYLE_META[learningStyle].color}33`,
                fontSize: 13, fontWeight: 600, color: STYLE_META[learningStyle].color,
              }}>
                {STYLE_META[learningStyle].icon} {STYLE_META[learningStyle].label} Style
              </div>
            )}
          </div>
        )}

        {/* Video Card */}
        {lesson && !loading && (
          <div className="mv-video-card">
            {/* Header */}
            <div className="mv-video-header">
              <div className="mv-video-meta">
                <h2 className="mv-video-topic">{lesson.topic}</h2>
                <div className="mv-video-chips">
                  <span className="mv-chip mv-chip-primary">
                    <BookOpen size={11} /> {lesson.subject}
                  </span>
                  <span className="mv-chip mv-chip-green">
                    <Zap size={11} /> 30 seconds
                  </span>
                  <span className="mv-chip mv-chip-yellow">
                    ✦ 5 segments
                  </span>
                  {learningStyle && (
                    <span className="mv-chip mv-chip-style" style={{
                      background: STYLE_META[learningStyle].bg,
                      border: `1px solid ${STYLE_META[learningStyle].color}44`,
                      color: STYLE_META[learningStyle].color,
                    }}>
                      {STYLE_META[learningStyle].icon} {STYLE_META[learningStyle].label}
                    </span>
                  )}
                </div>
              </div>
              <button className="mv-reset-btn" onClick={reset}>
                <RotateCcw size={14} /> New Topic
              </button>
            </div>

            {/* Player */}
            <MicroVideoPlayer
              lesson={lesson}
              onComplete={() => setCompleted(true)}
              learningStyle={learningStyle || undefined}
            />

            {/* Completion banner */}
            {completed && (
              <div className="mv-complete-banner" style={{ animation: "fadeUp .35s ease" }}>
                <div className="mv-complete-text">
                  <span className="mv-complete-icon">🎉</span>
                  <div>
                    <div className="mv-complete-msg">Micro-lesson complete!</div>
                    <div className="mv-complete-sub">You watched all 5 segments in 30 seconds.</div>
                  </div>
                </div>
                <div className="mv-complete-actions">
                  <button className="mv-btn-ghost" onClick={reset}>
                    <RotateCcw size={13} /> New Topic
                  </button>
                  <button className="mv-btn-ghost" onClick={() => setCompleted(false)}>
                    Watch Again
                  </button>
                </div>
              </div>
            )}

            {/* Quick Summary & Notes */}
            {lesson.quickSummary && (
              <div className="mv-notes-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="mv-step-dot">✨</div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Quick Summary & Key Notes</h3>
                </div>

                <div className="mv-summary-box">
                  <p className="mv-summary-text">{lesson.quickSummary.summary}</p>
                </div>

                <div className="mv-notes-list">
                  {lesson.quickSummary.notes?.map((note: string, i: number) => (
                    <div key={`note-${i}`} className="mv-note-item">
                      <div className="mv-note-bullet">{i + 1}</div>
                      <div className="mv-note-content">{note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info grid when no lesson and not in style selector */}
        {!lesson && !loading && !showStyleSelector && (
          <div className="mv-cards-grid">
            {[
              { icon: "🪝", label: "Hook", time: "0–3s", desc: "Animated title with glowing rings" },
              { icon: "💡", label: "Concept", time: "3–10s", desc: "Slide-in text & keyword chips" },
              { icon: "⚡", label: "Interactive", time: "10–20s", desc: "Adapts to your learning style" },
              { icon: "🔑", label: "Insight", time: "20–27s", desc: "Key takeaway with emphasis cards" },
              { icon: "✅", label: "Closing", time: "27–30s", desc: "Particle burst & concept lock-in" },
            ].map((card, i) => (
              <div key={`info-card-${i}`} className="mv-info-card">
                <div className="mv-info-icon">{card.icon}</div>
                <div className="mv-info-label">{card.label}</div>
                <div className="mv-info-value">{card.time}</div>
                <div className="mv-info-sub">{card.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
