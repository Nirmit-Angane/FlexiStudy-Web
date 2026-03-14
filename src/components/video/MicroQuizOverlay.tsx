"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, Sparkles, Zap, BookOpen, Star
} from "lucide-react";

interface QuizQuestion {
  question: string;
  choices: string[];
  correctIdx: number;
}

interface Props {
  quiz: QuizQuestion[];
  topic: string;
  primaryColor: string;
  onComplete: (score: number, total: number) => void;
  onRestart: () => void;
  learningStyle?: string;
}

// ── tiny hex → rgba helper (no deps) ──────────────────────────────────────────
function hex2rgba(hex: string, a: number) {
  const h = (hex.startsWith("#") ? hex.slice(1) : hex).replace(/^(\w)(\w)(\w)$/, "$1$1$2$2$3$3");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

export function MicroQuizOverlay({
  quiz, topic, primaryColor, onComplete, onRestart, learningStyle
}: Props) {
  const pc = primaryColor || "#7c6cff";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [animKey, setAnimKey] = useState(0); // forces re-mount animation on question change

  const q = quiz[currentIdx];
  const progress = (currentIdx / quiz.length) * 100;
  const afterProg = ((currentIdx + (showResult ? 1 : 0)) / quiz.length) * 100;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedIdx(idx);
    setShowResult(true);
    if (idx === q.correctIdx) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setShowResult(false);
      setAnimKey(k => k + 1);
    } else {
      setIsFinished(true);
    }
  };

  const scorePercentage = Math.round((score / quiz.length) * 100);
  const needsImprovement = scorePercentage < 70;

  // ── shared surface styles ──────────────────────────────────────────────────
  const surface: React.CSSProperties = {
    background: "rgba(14,14,22,0.98)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.07)",
  };

  const cardBase: React.CSSProperties = {
    ...surface,
    borderRadius: 20,
    padding: "24px 28px",
  };

  // ── Finished screen ────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(8,8,14,0.3)",
        borderRadius: 20,
        minHeight: 480,
        padding: 24,
        animation: "quizFadeIn 0.35s ease both",
      }}>
        <style>{`
          @keyframes quizFadeIn  { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
          @keyframes quizSlideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
          @keyframes quizPop     { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
          @keyframes shimmer     { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.5} }
        `}</style>

        <div style={{ maxWidth: 460, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, animation: "quizSlideUp 0.4s ease both" }}>

          {/* Trophy / icon */}
          <div style={{ position: "relative", animation: "quizPop 0.5s cubic-bezier(.34,1.56,.64,1) 0.15s both" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: needsImprovement ? "rgba(239,68,68,0.12)" : hex2rgba(pc, 0.15),
              border: `2px solid ${needsImprovement ? "rgba(239,68,68,0.4)" : hex2rgba(pc, 0.5)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: needsImprovement ? "0 0 40px rgba(239,68,68,0.15)" : `0 0 50px ${hex2rgba(pc, 0.25)}`,
            }}>
              {needsImprovement
                ? <BookOpen size={44} color="#ef4444" />
                : <Trophy size={44} color={pc} />}
            </div>
            {!needsImprovement && (
              <Sparkles size={20} color="#fbbf24" style={{ position: "absolute", top: -4, right: -4, animation: "pulse 1.5s ease infinite" }} />
            )}
          </div>

          {/* Headline */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {needsImprovement ? "Good Effort!" : "Mastery Achieved!"}
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              You scored <span style={{ color: "#fff", fontWeight: 700 }}>{score}/{quiz.length}</span> on{" "}
              <span style={{ color: pc, fontStyle: "italic" }}>{topic}</span>
            </div>
          </div>

          {/* Score cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%" }}>
            {[
              { label: "Score", value: `${scorePercentage}%`, color: pc },
              { label: "Correct", value: `${score}/${quiz.length}`, color: "#22c55e" },
              { label: "XP", value: `+${score * 10}`, color: "#fbbf24" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...cardBase, padding: "16px 18px", borderRadius: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Score bar */}
          <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scorePercentage}%`, borderRadius: 8, background: `linear-gradient(90deg, ${pc}, #06d6a0)`, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
          </div>

          {/* Suggestion card */}
          {needsImprovement && (
            <div style={{ ...cardBase, width: "100%", borderRadius: 14, borderColor: hex2rgba(pc, 0.3), display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: pc, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                <Zap size={14} /> Personalized Suggestion
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                This topic felt tricky in{" "}
                <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>{learningStyle || "Interactive"}</span> mode.
                Try{" "}<span style={{ color: pc, fontWeight: 700 }}>Visual</span> or{" "}
                <span style={{ color: "#06d6a0", fontWeight: 700 }}>Practical</span> mode for a fresh angle.
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button
              onClick={() => onComplete(score, quiz.length)}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${pc}, #06d6a0)`,
                color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: `0 8px 30px ${hex2rgba(pc, 0.35)}`,
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
            >
              <CheckCircle2 size={18} /> Finish &amp; Save Progress
            </button>
            <button
              onClick={onRestart}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 14, cursor: "pointer",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.09)"; el.style.color = "rgba(255,255,255,0.9)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "rgba(255,255,255,0.6)"; }}
            >
              <RotateCcw size={15} /> Rewatch Lesson
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: "rgba(8,8,14,0.95)",
      backdropFilter: "blur(12px)",
      borderRadius: 20,
      minHeight: 520,
      padding: "28px 32px 24px",
      overflowY: "auto",
      animation: "quizFadeIn 0.35s ease both",
    }}>
      <style>{`
        @keyframes quizFadeIn  { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
        @keyframes quizSlideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes quizChoiceIn { from { opacity:0; transform:translateX(-12px) } to { opacity:1; transform:translateX(0) } }
        @keyframes resultPop   { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes glowPulse   { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: pc, textTransform: "uppercase", marginBottom: 5 }}>
            ⚡ Quick Quiz
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.01em" }}>
            {topic}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {/* Question counter dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {quiz.map((_, i) => (
              <div key={i} style={{
                width: i === currentIdx ? 20 : 8, height: 8, borderRadius: 8,
                background: i < currentIdx ? pc : i === currentIdx ? pc : "rgba(255,255,255,0.12)",
                opacity: i < currentIdx ? 0.5 : 1,
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
            {currentIdx + 1} / {quiz.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 32, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${afterProg}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${pc}, #06d6a0)`,
          transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 10px ${hex2rgba(pc, 0.5)}`,
        }} />
      </div>

      {/* ── Question + Choices ── */}
      <div key={animKey} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 700, margin: "0 auto", width: "100%", gap: 28 }}>

        {/* Question card */}
        <div style={{
          ...cardBase,
          borderRadius: 18,
          borderColor: hex2rgba(pc, 0.2),
          padding: "28px 32px",
          animation: "quizSlideUp 0.4s ease both",
          position: "relative", overflow: "hidden",
        }}>
          {/* Subtle glow accent */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: hex2rgba(pc, 0.08), filter: "blur(30px)", pointerEvents: "none" }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: pc, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={12} /> Question {currentIdx + 1}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.01em", position: "relative" }}>
            {q.question}
          </div>
        </div>

        {/* Choices */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.choices.map((choice, i) => {
            const isCorrectChoice = i === q.correctIdx;
            const isSelectedChoice = i === selectedIdx;
            let state: "idle" | "correct" | "wrong" | "dimmed" = "idle";
            if (showResult) {
              if (isCorrectChoice) state = "correct";
              else if (isSelectedChoice) state = "wrong";
              else state = "dimmed";
            }

            const colors = {
              idle: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.09)", text: "rgba(255,255,255,0.8)", badge: "rgba(255,255,255,0.08)", badgeText: "rgba(255,255,255,0.4)" },
              correct: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.5)", text: "#fff", badge: "rgba(34,197,94,0.25)", badgeText: "#22c55e" },
              wrong: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.5)", text: "rgba(255,255,255,0.7)", badge: "rgba(239,68,68,0.2)", badgeText: "#ef4444" },
              dimmed: { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.25)", badge: "rgba(255,255,255,0.04)", badgeText: "rgba(255,255,255,0.2)" },
            }[state];

            return (
              <button
                key={i}
                disabled={showResult}
                onClick={() => handleSelect(i)}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14,
                  border: `1.5px solid ${colors.border}`,
                  background: colors.bg,
                  cursor: showResult ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  animation: `quizChoiceIn 0.35s ease ${i * 0.07}s both`,
                  position: "relative", overflow: "hidden",
                  boxShadow: state === "correct" ? "0 0 24px rgba(34,197,94,0.12)" : state === "wrong" ? "0 0 24px rgba(239,68,68,0.08)" : "none",
                }}
                onMouseEnter={e => {
                  if (showResult) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = hex2rgba(pc, 0.08);
                  el.style.borderColor = hex2rgba(pc, 0.45);
                  el.style.transform = "translateX(4px)";
                }}
                onMouseLeave={e => {
                  if (showResult) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = colors.bg;
                  el.style.borderColor = colors.border;
                  el.style.transform = "translateX(0)";
                }}
              >
                {/* Subtle shine on correct */}
                {state === "correct" && (
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.05), transparent)", pointerEvents: "none" }} />
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Letter badge */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: colors.badge, border: `1px solid ${colors.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: colors.badgeText,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: "all 0.2s",
                  }}>
                    {CHOICE_LETTERS[i]}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 500, color: colors.text, lineHeight: 1.4, textAlign: "left" }}>
                    {choice}
                  </span>
                </div>

                {/* Result icon */}
                {state === "correct" && (
                  <CheckCircle2 size={22} color="#22c55e" style={{ flexShrink: 0, animation: "resultPop 0.35s cubic-bezier(.34,1.56,.64,1) both" }} />
                )}
                {state === "wrong" && (
                  <XCircle size={22} color="#ef4444" style={{ flexShrink: 0, animation: "resultPop 0.35s cubic-bezier(.34,1.56,.64,1) both" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Result feedback banner */}
        {showResult && (
          <div style={{
            padding: "14px 20px", borderRadius: 12,
            background: selectedIdx === q.correctIdx ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${selectedIdx === q.correctIdx ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            display: "flex", alignItems: "center", gap: 12,
            animation: "quizSlideUp 0.3s ease both",
          }}>
            {selectedIdx === q.correctIdx
              ? <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0 }} />
              : <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: selectedIdx === q.correctIdx ? "#22c55e" : "#ef4444", marginBottom: 2 }}>
                {selectedIdx === q.correctIdx ? "Correct!" : "Not quite — "}
                {selectedIdx !== q.correctIdx && (
                  <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
                    the answer was <span style={{ color: "#22c55e", fontWeight: 700 }}>{q.choices[q.correctIdx]}</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                {score} correct so far · {quiz.length - currentIdx - 1} question{quiz.length - currentIdx - 1 !== 1 ? "s" : ""} remaining
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: score }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: pc, boxShadow: `0 0 8px ${hex2rgba(pc, 0.5)}` }} />
          ))}
          {Array.from({ length: quiz.length - score }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)" }} />
          ))}
        </div>

        {showResult && (
          <button
            onClick={handleNext}
            style={{
              padding: "13px 24px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${pc}, #06d6a0)`,
              color: "#fff", fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: `0 6px 24px ${hex2rgba(pc, 0.4)}`,
              transition: "transform 0.2s, opacity 0.2s",
              animation: "quizSlideUp 0.3s ease both",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
          >
            {currentIdx === quiz.length - 1 ? "See Results" : "Next Question"}
            <ArrowRight size={17} />
          </button>
        )}
      </div>

    </div>
  );
}