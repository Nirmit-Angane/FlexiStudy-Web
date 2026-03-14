"use client";

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  Play, Flame, Lightbulb, Clock, BookOpen, TrendingUp,
  Award, Zap, ArrowRight, Star, Target, ChevronRight,
  Calendar, Brain, Bell, Search, Settings, CheckCircle2,
  Volume2, BarChart2, MessageSquare, Trophy, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

/* ─── Components / Helpers ───────────────────────────────────── */
function getWeeklyXP(lessons: any[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const xpMap: Record<string, number> = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };

  lessons.forEach(l => {
    const date = new Date(l.createdAt);
    const day = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
    xpMap[day] += (l.finalScore || 0) * 50;
  });

  return days.map(d => ({ day: d, xp: xpMap[d] }));
}

function getActivityBreakdown(lessons: any[]) {
  if (lessons.length === 0) return [];
  const counts: Record<string, number> = {};
  lessons.forEach(l => { counts[l.subject] = (counts[l.subject] || 0) + 1; });

  const total = lessons.length;
  const colors = ["var(--brand-primary)", "var(--info)", "var(--subject-english)", "var(--warning)"];

  return Object.entries(counts).map(([subject, count], i) => ({
    activity: subject,
    time: `${count * 15}m`,
    pct: Math.round((count / total) * 100),
    color: colors[i % colors.length]
  }));
}

/* ─────────────────────────────────────────────────────────────
   FIX: map to the 4 CSS classes that actually exist in globals:
   style-card-visual / style-card-example / style-card-practical / style-card-interactive
   Also use string emojis for icons (no SVG component inside style-card-icon).
───────────────────────────────────────────────────────────── */
const styleCards = [
  {
    key: "Visual",
    cls: "style-card-visual",        // ✅ exists in globals.css
    icon: "👁",
    title: "Visual",
    desc: "Diagrams, videos & spatial reasoning",
  },
  {
    key: "Auditory",
    cls: "style-card-practical",     // ✅ exists in globals.css (green accent)
    icon: "🎧",
    title: "Auditory",
    desc: "Clear narration, rhythmic summaries & mnemonics",
  },
  {
    key: "Kinesthetic",
    cls: "style-card-interactive",   // ✅ exists in globals.css (red accent)
    icon: "🛠",
    title: "Kinesthetic",
    desc: "Hands-on analogies & step-by-step mechanics",
  },
];

/* ─── Tooltip ─────────────────────────────────────────────── */
function XPTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "var(--brand-primary)", boxShadow: "var(--shadow-md)" }}>
      {payload[0].value} XP
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, profile, lessons, loading } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState("Visual");
  const [chartRange, setChartRange] = useState("7D");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (loading) return null;

  const displayName = profile?.displayName || user?.displayName || "Learner";
  const firstName = displayName.split(" ")[0];
  const userXP = profile?.xp || 0;
  const userStreak = profile?.streak || 0;
  const photoURL = profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}&backgroundColor=e6ecea`;

  const derivedWeeklyXP = getWeeklyXP(lessons);
  const derivedActivity = getActivityBreakdown(lessons);
  const recentLessons = lessons.slice(0, 3).map(l => ({
    title: l.topic,
    sub: `${l.subject} • ${l.difficulty}`,
    tag: l.subject,
    progress: (l.finalScore / 5) * 100,
    icon: l.subject === "Science" ? "🔬" : l.subject === "Mathematics" ? "📐" : "💻",
    accent: "var(--brand-primary)",
    grad: "var(--brand-gradient)"
  }));

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.6; }
        }
        .anim-1  { animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-2  { animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.06s both; }
        .anim-3  { animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .anim-4  { animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .anim-5  { animation: fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
        .hover-lift { transition: transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .period-btn { font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: var(--radius-full); border: 1px solid var(--border-default); cursor: pointer; transition: all 150ms ease; }
        .period-btn.active { background: var(--brand-primary); color: #fff; border-color: var(--brand-primary); }
        .period-btn:not(.active) { background: transparent; color: var(--text-muted); }
        .period-btn:not(.active):hover { color: var(--text-primary); border-color: var(--border-strong); }

        /* ─── FIX: override style-card-grid to 3 columns for 3 cards ─── */
        .style-card-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }

        /* ─── RESPONSIVE DASHBOARD GRIDS ─── */
        .dash-page { padding: var(--space-8); }
        .dash-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5); gap: var(--space-3); }
        .dash-topbar-right { display: flex; align-items: center; gap: var(--space-3); }
        .dash-hero-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-6); }
        .dash-hero-stats { display: flex; gap: var(--space-3); flex-wrap: wrap; }
        .dash-stat-strip { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--space-4); margin-bottom: var(--space-5); }
        .dash-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-6); align-items: start; }
        .dash-lessons-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: var(--space-4); }
        .dash-topics-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: var(--space-4); }

        @media (max-width: 767px) {
          .dash-page { padding: var(--space-4); }
          .dash-topbar { flex-wrap: wrap; }
          .dash-topbar-right { display: none; }
          .dash-hero-inner { flex-direction: column; align-items: flex-start; }
          .dash-hero-stats { width: 100%; }
          .dash-hero-stats > div { flex: 1; min-width: 0; }
          .dash-stat-strip { grid-template-columns: repeat(2,1fr); }
          .dash-main-grid { grid-template-columns: 1fr; }
          .dash-lessons-grid { grid-template-columns: 1fr; }
          .dash-topics-grid { grid-template-columns: 1fr; }
          .style-card-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .dash-stat-strip { grid-template-columns: repeat(2,1fr); }
          .dash-main-grid { grid-template-columns: 1fr; }
          .dash-lessons-grid { grid-template-columns: repeat(2,1fr); }
          .dash-topics-grid { grid-template-columns: repeat(2,1fr); }
          .style-card-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div className="dash-page" style={{ background: "var(--bg-page)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

        {/* ══ TOP BAR ══════════════════════════════════════ */}
        <div className="anim-1 dash-topbar">
          <div>
            <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
              Friday, March 13 · Spring Term
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Good morning, {firstName} 👋
            </h1>
          </div>
          <div className="dash-topbar-right">
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "8px 16px", boxShadow: "var(--shadow-sm)", cursor: "text" }}>
              <Search size={14} color="var(--text-muted)" />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Search courses…</span>
            </div>
            <div style={{ position: "relative" }}>
              <button style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
                <Bell size={16} color="var(--text-secondary)" />
              </button>
              <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--error)", border: "2px solid var(--bg-page)", display: "block" }} className="live-dot" />
            </div>
            <div className="avatar avatar-sm" style={{ cursor: "pointer", overflow: "hidden" }}>
              <img src={photoURL} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>

        {/* ══ HERO BANNER ══════════════════════════════════ */}
        <div className="anim-2" style={{
          position: "relative", overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(130deg, #1E5C47 0%, #3D8B71 45%, #5BAE8E 100%)",
          padding: "var(--space-6) var(--space-8)",
          marginBottom: "var(--space-5)",
          boxShadow: "0 8px 32px rgba(61,139,113,0.20)",
        }}>
          <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 60, bottom: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          <div className="dash-hero-inner" style={{ position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", borderRadius: "var(--radius-full)", padding: "5px 14px", marginBottom: "var(--space-4)", backdropFilter: "blur(8px)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BFF9F", display: "inline-block" }} className="live-dot" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em" }}>ON A ROLL — {userStreak} DAY STREAK</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "#fff", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-3)" }}>
                Your next lesson awaits ✨
              </h2>
              <p style={{ fontSize: "var(--text-base)", color: "rgba(255,255,255,0.8)", maxWidth: 440, lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>
                {userXP > 0 ? (
                  <>You're <strong style={{ color: "#fff" }}>{Math.round((userXP % 1000) / 10)}% through today's goal.</strong> One focused session and you'll hit it.</>
                ) : (
                  <>Welcome to FlexiStudy! <strong style={{ color: "#fff" }}>Complete your first lesson</strong> to start your learning journey.</>
                )}
              </p>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button className="hover-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--brand-primary-dark)", padding: "12px 22px", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "var(--text-sm)", border: "none", cursor: "pointer" }}>
                  <Play fill="currentColor" size={14} /> Continue: Cell Biology
                </button>
                <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.14)", color: "#fff", padding: "12px 18px", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "var(--text-sm)", border: "1px solid rgba(255,255,255,0.22)", cursor: "pointer", backdropFilter: "blur(8px)", transition: "background 150ms ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}>
                  <Calendar size={14} /> View Schedule
                </button>
              </div>
            </div>

            <div className="dash-hero-stats">
              {[
                { emoji: "🔥", val: userStreak.toString(), lbl: "Day Streak" },
                { emoji: "⭐", val: userXP.toLocaleString(), lbl: "Total XP" },
                { emoji: "📚", val: lessons.length.toString(), lbl: "Lessons Done" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-5)", textAlign: "center", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(12px)", minWidth: 76 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 600, marginTop: 4, whiteSpace: "nowrap" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ STAT STRIP ═══════════════════════════════════ */}
        <div className="anim-3 dash-stat-strip">
          {[
            { icon: <TrendingUp size={18} />, label: "Weekly XP", value: derivedWeeklyXP.reduce((a, c) => a + c.xp, 0).toLocaleString(), delta: "Last 7 days", iconBg: "var(--success-subtle)", iconClr: "var(--success)" },
            { icon: <BookOpen size={18} />, label: "Lessons Done", value: lessons.length.toString(), delta: lessons.length > 0 ? "Fantastic start" : "Start your journey", iconBg: "var(--info-subtle)", iconClr: "var(--info)" },
            { icon: <Target size={18} />, label: "Accuracy", value: lessons.length > 0 ? `${Math.round(lessons.reduce((a, l) => a + (l.finalScore || 0), 0) / lessons.length)}%` : "0%", delta: "Avg score", iconBg: "var(--warning-subtle)", iconClr: "var(--warning)" },
            { icon: <Trophy size={18} />, label: "Rank", value: userXP > 0 ? "Novice" : "New", delta: "Level 1", iconBg: "var(--brand-primary-light)", iconClr: "var(--brand-primary)" },
          ].map((s, i) => (
            <div key={i} className="stat-card hover-lift" style={{ gap: "var(--space-2)", padding: "var(--space-5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="stat-card-icon" style={{ background: s.iconBg, color: s.iconClr, width: 38, height: 38, fontSize: 14, borderRadius: "var(--radius-md)" }}>{s.icon}</div>
                <span className="stat-card-delta delta-up">{s.delta}</span>
              </div>
              <div className="stat-card-value" style={{ fontSize: "var(--text-2xl)", marginTop: "var(--space-2)" }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ MAIN GRID ════════════════════════════════════ */}
        <div className="dash-main-grid">

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

            {/* Weekly Activity Chart */}
            <div className="card anim-4" style={{ padding: 0, overflow: "visible" }}>
              <div className="card-header" style={{ padding: "var(--space-5) var(--space-6)" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>Weekly Activity</h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>XP earned per day — keep the streaks alive!</p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["7D", "30D", "All"].map(t => (
                    <button key={t} className={`period-btn${chartRange === t ? " active" : ""}`} onClick={() => setChartRange(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "var(--space-2) var(--space-6) var(--space-6)" }}>
                {mounted && (
                  <ResponsiveContainer width="100%" height={170} minWidth={0} minHeight={0}>
                    <AreaChart data={derivedWeeklyXP} margin={{ top: 8, right: 0, bottom: 0, left: -28 }}>
                      <defs>
                        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3D8B71" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#3D8B71" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<XPTooltip />} />
                      <Area type="monotone" dataKey="xp" stroke="#3D8B71" strokeWidth={2.5} fill="url(#xpGrad)"
                        dot={{ r: 4, fill: "#3D8B71", strokeWidth: 2.5, stroke: "var(--bg-surface)" }}
                        activeDot={{ r: 6, fill: "#3D8B71", stroke: "var(--bg-surface)", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Lessons */}
            <div className="anim-4">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)" }}>Recent Progress</h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{recentLessons.length} lessons completed recently</p>
                </div>
                <Link href="/history" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--brand-primary)", textDecoration: "none" }}>
                  View History <ArrowRight size={14} />
                </Link>
              </div>
              <div className="dash-lessons-grid">
                {recentLessons.length > 0 ? (
                  recentLessons.map((c, i) => (
                    <div key={i} className="course-card hover-lift">
                      <div style={{ height: 110, background: c.grad, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: "var(--space-3)" }}>
                        <div style={{ position: "absolute", right: -12, top: -12, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                        <div style={{ position: "absolute", right: 12, top: 10, fontSize: 24 }}>{c.icon}</div>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }} />
                        <span style={{ position: "relative", zIndex: 1, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)", background: "rgba(0,0,0,0.18)", padding: "2px 7px", borderRadius: "var(--radius-full)", backdropFilter: "blur(4px)" }}>{c.tag}</span>
                      </div>
                      <div className="course-info" style={{ padding: "var(--space-4)" }}>
                        <h3 className="course-title" style={{ fontSize: "var(--text-sm)", marginTop: 0, marginBottom: "var(--space-1)" }}>{c.title}</h3>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: "var(--space-3)", lineHeight: "var(--leading-relaxed)" }}>{c.sub}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }}>{Math.round(c.progress)}% score</span>
                        </div>
                        <div className="progress-bar" style={{ height: 4 }}>
                          <div className="progress-fill" style={{ width: `${c.progress}%`, background: c.accent }} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: "span 3", background: "var(--bg-surface)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "var(--space-8)", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: "var(--space-2)" }}>🌱</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Start your learning journey</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Complete your first AI lesson to see progress here.</div>
                  </div>
                )}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────
                LEARNING STYLE  — FIXED
                • style-card-grid overridden to 3 cols (via <style>)
                • cls values use globals.css class names only
                • selectedStyle key matches styleCards[].key
            ────────────────────────────────────────────────────── */}
            <div className="anim-5">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
                <div>
                  <span className="ds-section-label">Personalisation</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)" }}>Your Learning Style</h2>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>Determines how content is delivered to you</p>
                </div>
                <button className="btn btn-sm btn-outline-brand">Take Retest</button>
              </div>

              {/* style-card-grid is overridden to repeat(3,1fr) via <style> above */}
              <div className="style-card-grid">
                {styleCards.map(s => (
                  <div
                    key={s.key}
                    className={`style-card ${s.cls}${selectedStyle === s.key ? " selected" : ""}`}
                    onClick={() => setSelectedStyle(s.key)}
                  >
                    <div className="style-check">✓</div>
                    {/* emoji rendered as text — no SVG component causes layout shift */}
                    <div className="style-card-icon" style={{ fontSize: 24 }}>{s.icon}</div>
                    <div className="style-card-title">{s.title}</div>
                    <div className="style-card-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ TODAY'S GOALS ══════════════════════════════ */}
            <div className="anim-5">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <div>
                  <span className="ds-section-label">Daily Targets</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)" }}>Today's Goals</h2>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", background: "var(--brand-primary-light)", padding: "4px 12px", borderRadius: "var(--radius-full)" }}>2 / 4 done</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {[
                  { label: "Complete 1 lesson", sub: "Earn 50 XP", done: true, icon: "📖" },
                  { label: "Review flashcard deck", sub: "10 cards minimum", done: true, icon: "🃏" },
                  { label: "Score 80%+ on a quiz", sub: "Accuracy challenge", done: false, icon: "🎯" },
                  { label: "Study for 20 minutes", sub: "Focused session", done: false, icon: "⏱" },
                ].map((g, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    background: g.done ? "var(--success-subtle)" : "var(--bg-surface)",
                    border: `1px solid ${g.done ? "rgba(46,158,107,0.18)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-md)",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--radius-md)", flexShrink: 0,
                      background: g.done ? "rgba(61,139,113,0.1)" : "var(--bg-elevated)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    }}>{g.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: g.done ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: g.done ? "line-through" : "none", opacity: g.done ? 0.7 : 1 }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{g.sub}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: g.done ? "var(--brand-primary)" : "transparent",
                      border: `2px solid ${g.done ? "var(--brand-primary)" : "var(--border-strong)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#fff", fontWeight: 800,
                    }}>{g.done ? "✓" : ""}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ SUGGESTED TOPICS ═══════════════════════════ */}
            <div className="anim-5">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <div>
                  <span className="ds-section-label">AI Picks</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)" }}>Suggested Topics</h2>
                </div>
                <Link href="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--brand-primary)", textDecoration: "none" }}>
                  Browse all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="dash-topics-grid">
                {[
                  { emoji: "🧬", title: "Cell Division", subject: "Biology", difficulty: "Medium", duration: "15 min", thumbBg: "linear-gradient(135deg,#EAF5F1,#C3E8D8)", tagClr: "var(--brand-primary)", tagBg: "var(--brand-primary-light)" },
                  { emoji: "⚛️", title: "Atomic Structure", subject: "Chemistry", difficulty: "Hard", duration: "20 min", thumbBg: "linear-gradient(135deg,#EAF0FB,#C8D8F7)", tagClr: "var(--info)", tagBg: "var(--info-subtle)" },
                  { emoji: "📐", title: "Trigonometry Basics", subject: "Mathematics", difficulty: "Easy", duration: "10 min", thumbBg: "linear-gradient(135deg,#FEF5E3,#FDEBC2)", tagClr: "#C47F17", tagBg: "#FEF5E3" },
                ].map((t, i) => (
                  <div key={i} className="hover-lift" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                    <div style={{ height: 82, background: t.thumbBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, position: "relative" }}>
                      {t.emoji}
                      <span style={{ position: "absolute", top: 8, right: 8, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: t.tagClr, background: t.tagBg, padding: "2px 8px", borderRadius: "var(--radius-full)" }}>{t.difficulty}</span>
                    </div>
                    <div style={{ padding: "var(--space-3) var(--space-4) var(--space-4)", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.tagClr, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{t.subject}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35 }}>{t.title}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--space-3)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                          <Clock size={11} /> {t.duration}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--brand-primary)", fontSize: 11, fontWeight: 700 }}>
                          Start <ArrowRight size={11} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

            {/* Daily Progress */}
            <div className="card anim-3" style={{ padding: 0 }}>
              <div style={{ padding: "var(--space-4) var(--space-5) 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>Daily Progress</h2>
                  <span className="badge badge-success"><Zap size={10} /> On track</span>
                </div>
              </div>
              <div style={{ padding: "var(--space-4) var(--space-5) var(--space-5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                  <div style={{ width: 72, height: 72, position: "relative", flexShrink: 0 }}>
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Done", value: Math.min(100, (userXP % 1000) / 10) },
                              { name: "Left", value: 100 - Math.min(100, (userXP % 1000) / 10) },
                            ]}
                            cx="50%" cy="50%" innerRadius={26} outerRadius={35}
                            dataKey="value" stroke="none" startAngle={90} endAngle={-270}
                          >
                            <Cell fill="#3D8B71" />
                            <Cell fill="#E8E4DC" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{Math.round((userXP % 1000) / 10)}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>Next Milestone</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{1000 - (userXP % 1000)} XP to go</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Keep learning!</div>
                  </div>
                </div>

                <div style={{ marginBottom: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Level Progress</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand-primary)" }}>{userXP % 1000} / 1000 XP</span>
                  </div>
                  <div className="xp-bar-wrap"><div className="xp-bar" style={{ width: `${(userXP % 1000) / 10}%` }} /></div>
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>Breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {derivedActivity.length > 0 ? (
                      derivedActivity.map((a, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, display: "inline-block", flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{a.activity}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{a.time}</span>
                          </div>
                          <div style={{ height: 3, background: "var(--bg-elevated)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${a.pct}%`, background: a.color, borderRadius: "var(--radius-full)", transition: "width 0.8s ease" }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>
                        No activities recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="anim-3 hover-lift" style={{ background: "linear-gradient(135deg,#FFF1EB,#FFE6D9)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)", border: "1px solid #FFD4C0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: 24, top: 24, width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#FF8B78,#FF5733)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(255,80,50,0.35)", zIndex: 2 }}>
                <Flame size={24} style={{ fill: "#fff", color: "#fff" }} />
              </div>
              <div style={{ paddingRight: 64 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#E84B2A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>🔥 Current Streak</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
                  {userStreak} <span style={{ fontSize: "var(--text-xl)", color: "var(--text-secondary)" }}>days</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, fontWeight: 500 }}>Keep it up! <strong style={{ color: "var(--text-secondary)" }}>Great work.</strong></div>
              </div>
              <div style={{ marginTop: "var(--space-6)", display: "flex", gap: 6 }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                  const today = new Date().getDay();
                  const adjustedToday = today === 0 ? 6 : today - 1;
                  const isActive = i <= adjustedToday && userStreak > 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ width: "100%", aspectRatio: "1", borderRadius: "var(--radius-xs)", background: isActive ? "linear-gradient(135deg,#FF8B78,#FF5733)" : "var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isActive ? 11 : 10, color: isActive ? "#fff" : "var(--text-muted)", fontWeight: 700 }}>
                        {isActive && "✓"}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Practice */}
            <div className="anim-4">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>Quick Practice</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                {[
                  { href: "/practice", icon: <Lightbulb size={20} />, label: "Quiz Me", sub: "Test knowledge", iconBg: "var(--info-subtle)", iconClr: "var(--info)", hoverBg: "var(--info)" },
                  { href: "/flashcards", icon: <Brain size={20} />, label: "Flashcards", sub: "Review decks", iconBg: "var(--subject-english-bg)", iconClr: "var(--subject-english)", hoverBg: "var(--subject-english)" },
                  { href: "/tutor", icon: <MessageSquare size={20} />, label: "AI Tutor", sub: "Ask anything", iconBg: "var(--brand-primary-light)", iconClr: "var(--brand-primary)", hoverBg: "var(--brand-primary)" },
                  { href: "/progress", icon: <BarChart2 size={20} />, label: "Progress", sub: "Full report", iconBg: "var(--warning-subtle)", iconClr: "var(--warning)", hoverBg: "var(--warning)" },
                ].map((p, i) => (
                  <a key={i} href={p.href} className="hover-lift" style={{ textDecoration: "none", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-4)", border: "1px solid var(--border-default)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "var(--shadow-sm)", textAlign: "center" }}
                    onMouseEnter={e => { const el = e.currentTarget.querySelector('.picon') as HTMLElement | null; if (el) { el.style.background = p.hoverBg; el.style.color = "#fff"; } }}
                    onMouseLeave={e => { const el = e.currentTarget.querySelector('.picon') as HTMLElement | null; if (el) { el.style.background = p.iconBg; el.style.color = p.iconClr; } }}>
                    <div className="picon" style={{ width: 42, height: 42, borderRadius: "50%", background: p.iconBg, color: p.iconClr, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms ease" }}>{p.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{p.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card anim-5" style={{ padding: 0 }}>
              <div className="card-header">
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>Achievements</h2>
                <a href="/achievements" style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  See all <ChevronRight size={12} />
                </a>
              </div>
              <div style={{ padding: "var(--space-3) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {[
                  { icon: "🏆", label: "Early Adopter", sub: "Joined FlexiStudy" },
                  ...(userStreak >= 3 ? [{ icon: "🔥", label: "Hot Streak", sub: "3 day streak" }] : []),
                  ...(userXP >= 1000 ? [{ icon: "⭐", label: "XP Hunter", sub: "1,000 XP milestone" }] : []),
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{a.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next */}
            <div className="card anim-5" style={{ padding: 0 }}>
              <div className="card-header">
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>Recommended Next</h2>
                <Sparkles size={15} color="var(--brand-primary)" />
              </div>
              <div style={{ padding: "var(--space-3) var(--space-5) var(--space-5)" }}>
                {lessons.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0" }}>
                    <div style={{ minWidth: 50, textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "4px 0", flexShrink: 0 }}>Next</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Advanced Topics</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--brand-primary)", background: "var(--brand-primary-light)", padding: "2px 8px", borderRadius: "var(--radius-full)", flexShrink: 0 }}>Review</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Time for your first lesson!</div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Pick a topic and start learning.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}