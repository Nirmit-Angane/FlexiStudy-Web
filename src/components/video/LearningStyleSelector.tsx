"use client";

import React, { useState } from "react";

export type LearningStyle = "interactive" | "example" | "visual" | "practical";

interface StyleCard {
  id: LearningStyle;
  icon: string;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  glowColor: string;
}

const STYLES: StyleCard[] = [
  {
    id: "interactive",
    icon: "⚡",
    title: "Interactive",
    description: "Engage with quizzes, fill-in-the-blanks & prediction prompts that keep you active.",
    features: ["Quick quizzes", "Fill-in-the-blank", "Prediction questions"],
    gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    glowColor: "rgba(99, 102, 241, 0.25)",
  },
  {
    id: "example",
    icon: "📝",
    title: "Example",
    description: "Learn through step-by-step worked examples, code walkthroughs & solved problems.",
    features: ["Worked examples", "Code walkthroughs", "Problem solving"],
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    glowColor: "rgba(245, 158, 11, 0.25)",
  },
  {
    id: "visual",
    icon: "🎨",
    title: "Visual",
    description: "Understand concepts via flowcharts, diagrams, concept maps & visual summaries.",
    features: ["Flowcharts", "Concept maps", "Visual summaries"],
    gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    glowColor: "rgba(6, 182, 212, 0.25)",
  },
  {
    id: "practical",
    icon: "🔧",
    title: "Practical",
    description: "Apply knowledge with hands-on exercises, mini coding tasks & real-world activities.",
    features: ["Practice exercises", "Coding tasks", "Real-world activities"],
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    glowColor: "rgba(16, 185, 129, 0.25)",
  },
];

interface Props {
  topic: string;
  subject: string;
  onSelect: (style: LearningStyle) => void;
  onBack: () => void;
}

export function LearningStyleSelector({ topic, subject, onSelect, onBack }: Props) {
  const [hoveredId, setHoveredId] = useState<LearningStyle | null>(null);
  const [selectedId, setSelectedId] = useState<LearningStyle | null>(null);

  const handleSelect = (style: LearningStyle) => {
    setSelectedId(style);
    // Small delay so the user sees the selection highlight before transition
    setTimeout(() => onSelect(style), 420);
  };

  return (
    <>
      <style>{`
        @keyframes lssFadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes lssCardIn { from { opacity:0; transform:translateY(18px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes lssPulse { 0%,100% { box-shadow: 0 0 0 0 var(--lss-glow); } 50% { box-shadow: 0 0 0 10px transparent; } }
        @keyframes lssCheck { from { transform:scale(0) rotate(-45deg); } to { transform:scale(1) rotate(0deg); } }
        @keyframes lssShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .lss-wrap {
          display:flex; flex-direction:column; gap:28px;
          animation: lssFadeUp .45s ease;
        }

        .lss-header {
          text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;
        }
        .lss-badge {
          display:inline-flex; align-items:center; gap:8px;
          padding:6px 16px; border-radius:999px;
          border:1px solid rgba(61,139,113,.4);
          background:rgba(61,139,113,.08); color:#2e6b57;
          font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
        }
        .lss-title {
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:clamp(22px,3.5vw,34px); font-weight:800;
          color:#111827; line-height:1.15; margin:0;
        }
        .lss-subtitle {
          font-size:15px; color:#6b7280; max-width:500px; line-height:1.5; margin:0;
        }
        .lss-topic-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:5px 14px; border-radius:999px;
          background:#e6f3ee; border:1px solid #b3d9cc;
          font-size:13px; font-weight:600; color:#2e6b57;
        }

        .lss-grid {
          display:grid; grid-template-columns:repeat(2,1fr); gap:18px;
        }
        @media (max-width: 640px) {
          .lss-grid { grid-template-columns:1fr; }
        }

        .lss-card {
          position:relative;
          background:#fff; border:2px solid #e5e7eb;
          border-radius:20px; padding:28px 24px;
          cursor:pointer; transition:all .28s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; gap:14px;
          overflow:hidden;
        }
        .lss-card::before {
          content:''; position:absolute; inset:0;
          border-radius:18px; opacity:0;
          transition:opacity .28s ease;
          pointer-events:none;
        }
        .lss-card:hover {
          transform:translateY(-5px);
          box-shadow:0 12px 32px rgba(0,0,0,.1), 0 0 0 2px var(--lss-glow, rgba(0,0,0,.05));
          border-color:transparent;
        }
        .lss-card:hover::before { opacity:1; }
        .lss-card.lss-selected {
          transform:translateY(-5px) scale(1.02);
          border-color:transparent;
          animation:lssPulse .8s ease;
        }
        .lss-card.lss-selected::before { opacity:1; }

        .lss-card-icon {
          width:52px; height:52px; border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          font-size:26px; flex-shrink:0;
          transition:transform .28s ease;
        }
        .lss-card:hover .lss-card-icon { transform:scale(1.12) rotate(-3deg); }

        .lss-card-title {
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:19px; font-weight:800; color:#111827; margin:0;
        }
        .lss-card-desc {
          font-size:13.5px; color:#6b7280; line-height:1.5; margin:0;
        }

        .lss-features {
          display:flex; flex-wrap:wrap; gap:6px; margin-top:auto;
        }
        .lss-feature-chip {
          padding:4px 10px; border-radius:999px;
          font-size:11px; font-weight:600;
          background:#f3f4f6; border:1px solid #e5e7eb;
          color:#6b7280; transition:all .2s;
        }
        .lss-card:hover .lss-feature-chip {
          background:rgba(255,255,255,.6); border-color:rgba(255,255,255,.8);
          color:#374151;
        }

        .lss-check {
          position:absolute; top:14px; right:14px;
          width:28px; height:28px; border-radius:50%;
          background:#10b981; color:#fff;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:800;
          animation:lssCheck .35s cubic-bezier(.34,1.56,.64,1);
          box-shadow:0 2px 8px rgba(16,185,129,.4);
        }

        .lss-shimmer {
          position:absolute; inset:0; border-radius:18px;
          background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%);
          background-size:200% 100%;
          animation:lssShimmer 1.5s ease infinite;
          pointer-events:none;
        }

        .lss-back-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:12px;
          background:#f9fafb; border:1.5px solid #e5e7eb;
          color:#6b7280; font-size:14px; font-weight:600;
          font-family:'Inter',sans-serif;
          cursor:pointer; transition:all .2s; align-self:center;
        }
        .lss-back-btn:hover { background:#e6f3ee; border-color:#3D8B71; color:#2e6b57; }
      `}</style>

      <div className="lss-wrap">
        {/* Header */}
        <div className="lss-header">
          <div className="lss-badge">🎯 Choose Your Learning Style</div>
          <h2 className="lss-title">How would you like to learn this?</h2>
          <p className="lss-subtitle">
            Select a style and AI will tailor the video's structure, examples and interactions to match your preference.
          </p>
          <div className="lss-topic-pill">
            📖 {topic} <span style={{ opacity: .5 }}>•</span> {subject}
          </div>
        </div>

        {/* Cards grid */}
        <div className="lss-grid">
          {STYLES.map((s, i) => {
            const isHovered = hoveredId === s.id;
            const isSelected = selectedId === s.id;
            return (
              <div
                key={s.id}
                className={`lss-card${isSelected ? " lss-selected" : ""}`}
                style={{
                  animationDelay: `${i * 80}ms`,
                  animation: `lssCardIn .4s ease ${i * 80}ms both`,
                  borderColor: isSelected ? "transparent" : isHovered ? "transparent" : "#e5e7eb",
                  background: isSelected
                    ? `linear-gradient(135deg, ${s.glowColor}, rgba(255,255,255,.97))`
                    : isHovered
                      ? `linear-gradient(135deg, ${s.glowColor.replace("0.25", "0.08")}, #fff)`
                      : "#fff",
                  "--lss-glow": s.glowColor,
                } as React.CSSProperties}
                onClick={() => !selectedId && handleSelect(s.id)}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {isSelected && <div className="lss-shimmer" />}
                {isSelected && <div className="lss-check">✓</div>}

                <div className="lss-card-icon" style={{ background: s.gradient }}>
                  {s.icon}
                </div>

                <div>
                  <h3 className="lss-card-title">{s.title}</h3>
                  <p className="lss-card-desc">{s.description}</p>
                </div>

                <div className="lss-features">
                  {s.features.map(f => (
                    <span key={f} className="lss-feature-chip">{f}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <button className="lss-back-btn" onClick={onBack}>
          ← Back to topic
        </button>
      </div>
    </>
  );
}
