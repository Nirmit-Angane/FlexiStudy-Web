"use client";

import { useState } from "react";
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

/* ─── Mock data ──────────────────────────────────────────── */
const mockUser = { displayName: "Alex Johnson", streakCount: 7 };

const weeklyXP = [
  { day: "Mon", xp: 320 }, { day: "Tue", xp: 480 }, { day: "Wed", xp: 250 },
  { day: "Thu", xp: 590 }, { day: "Fri", xp: 410 }, { day: "Sat", xp: 680 },
  { day: "Sun", xp: 450 },
];

const activityBreakdown = [
  { activity: "Video Lessons", time: "42 min", pct: 48, color: "var(--brand-primary)" },
  { activity: "Practice Quiz", time: "28 min", pct: 32, color: "var(--info)" },
  { activity: "Flashcards", time: "12 min", pct: 14, color: "var(--subject-english)" },
  { activity: "Reading", time: "4 min", pct: 6, color: "var(--warning)" },
];

const courses = [
  { title: "Advanced Algebra", sub: "Module 4: Quadratic Equations", tag: "Mathematics", progress: 65, icon: "📐", accent: "#6b62fc", grad: "linear-gradient(135deg,#7B74FF,#5046e5)" },
  { title: "Cell Biology", sub: "Module 2: Mitosis & Meiosis", tag: "Science", progress: 32, icon: "🔬", accent: "#f29f05", grad: "linear-gradient(135deg,#FFBA44,#e08a00)" },
  { title: "Python Basics", sub: "Module 7: Data Structures", tag: "Technology", progress: 88, icon: "💻", accent: "#21b67c", grad: "linear-gradient(135deg,#38D39F,#18a06b)" },
];

const upcomingItems = [
  { time: "2:00 PM", title: "Algebra Quiz", tag: "Math", tagClr: "var(--subject-math-txt)", tagBg: "var(--subject-math-bg)" },
  { time: "4:30 PM", title: "Biology Video", tag: "Science", tagClr: "var(--subject-science-txt)", tagBg: "var(--subject-science-bg)" },
  { time: "7:00 PM", title: "Python Lab", tag: "Tech", tagClr: "var(--subject-tech-txt)", tagBg: "var(--subject-tech-bg)" },
];

const achievements = [
  { icon: "🏆", label: "Top 5%", sub: "This week", new: true },
  { icon: "⚡", label: "Speed Learner", sub: "3 modules", new: false },
  { icon: "💎", label: "Consistent", sub: "7-day streak", new: false },
];

const progressData = [
  { name: "Done", value: 72, color: "#3D8B71" },
  { name: "Left", value: 28, color: "#E8E4DC" },
];

const styleCards = [
  { key: "Visual", cls: "style-card-visual", icon: "👁", title: "Visual", desc: "Diagrams, videos & spatial reasoning" },
  { key: "Auditory", cls: "style-card-auditory", icon: "🎧", title: "Auditory", desc: "Clear narration, rhythmic summaries & mnemonics" },
  { key: "Kinesthetic", cls: "style-card-kinesthetic", icon: "🛠", title: "Kinesthetic", desc: "Hands-on analogies & step-by-step mechanics" },
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
  const [selectedStyle, setSelectedStyle] = useState("visual");
  const [chartRange, setChartRange] = useState("7D");
  const firstName = mockUser.displayName.split(" ")[0];

  return (
    <>
      {/* ── Inject keyframe animation ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes shimmer-bar {
          from { background-position: -400px 0; }
          to   { background-position: 400px 0; }
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
      `}</style>

      <div style={{ background: "var(--bg-page)", minHeight: "100vh", padding: "var(--space-8)", fontFamily: "var(--font-body)" }}>

        {/* ══ TOP BAR ══════════════════════════════════════ */}
        <div className="anim-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
          <div>
            <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
              Friday, March 13 · Spring Term
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Good morning, {firstName} 👋
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {/* Search pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "9px 16px", boxShadow: "var(--shadow-sm)", cursor: "text" }}>
              <Search size={14} color="var(--text-muted)" />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Search courses…</span>
            </div>
            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
                <Bell size={16} color="var(--text-secondary)" />
              </button>
              <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--error)", border: "2px solid var(--bg-page)", display: "block" }} className="live-dot" />
            </div>
            {/* Avatar */}
            <div className="avatar avatar-md" style={{ cursor: "pointer" }}>AJ</div>
          </div>
        </div>

        {/* ══ HERO BANNER ══════════════════════════════════ */}
        <div className="anim-2" style={{
          position: "relative", overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(130deg, #1E5C47 0%, #3D8B71 45%, #5BAE8E 100%)",
          padding: "var(--space-8) var(--space-10)",
          marginBottom: "var(--space-6)",
          boxShadow: "0 8px 32px rgba(61,139,113,0.30)",
        }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 60, bottom: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-6)" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", borderRadius: "var(--radius-full)", padding: "5px 14px", marginBottom: "var(--space-4)", backdropFilter: "blur(8px)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BFF9F", display: "inline-block" }} className="live-dot" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em" }}>ON A ROLL — {mockUser.streakCount} DAY STREAK</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "#fff", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-3)" }}>
                Your next lesson awaits ✨
              </h2>
              <p style={{ fontSize: "var(--text-base)", color: "rgba(255,255,255,0.8)", maxWidth: 440, lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>
                You're <strong style={{ color: "#fff" }}>72% through today's goal.</strong> One focused session and you'll hit it.
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

            {/* Hero stat chips */}
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              {[
                { emoji: "🔥", val: "7", lbl: "Day Streak" },
                { emoji: "⭐", val: "2,450", lbl: "Total XP" },
                { emoji: "📚", val: "3", lbl: "Active Courses" },
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
        <div className="anim-3" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          {[
            { icon: <TrendingUp size={18} />, label: "Weekly XP", value: "3,180", delta: "+12%", iconBg: "var(--success-subtle)", iconClr: "var(--success)" },
            { icon: <BookOpen size={18} />, label: "Lessons Done", value: "14", delta: "+3 today", iconBg: "var(--info-subtle)", iconClr: "var(--info)" },
            { icon: <Target size={18} />, label: "Accuracy", value: "87%", delta: "+5%", iconBg: "var(--warning-subtle)", iconClr: "var(--warning)" },
            { icon: <Trophy size={18} />, label: "Rank", value: "#42", delta: "↑ 8 places", iconBg: "var(--brand-primary-light)", iconClr: "var(--brand-primary)" },
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-6)", alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

            {/* Weekly Activity Chart */}
            <div className="card anim-4" style={{ padding: 0, overflow: "visible" }}>
              <div className="card-header" style={{ padding: "var(--space-5) var(--space-6)" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>Weekly Activity</h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>XP earned per day — keep the bars green!</p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["7D", "30D", "All"].map(t => (
                    <button key={t} className={`period-btn${chartRange === t ? " active" : ""}`} onClick={() => setChartRange(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "var(--space-2) var(--space-6) var(--space-6)" }}>
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={weeklyXP} margin={{ top: 8, right: 0, bottom: 0, left: -28 }}>
                    <defs>
                      <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3D8B71" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#3D8B71" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<XPTooltip />} formatter={(v: any) => [`${v} XP`, 'XP']} />
                    <Area type="monotone" dataKey="xp" stroke="#3D8B71" strokeWidth={2.5} fill="url(#xpGrad)"
                      dot={{ r: 4, fill: "#3D8B71", strokeWidth: 2.5, stroke: "var(--bg-surface)" }}
                      activeDot={{ r: 6, fill: "#3D8B71", stroke: "var(--bg-surface)", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* My Courses */}
            <div className="anim-4">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)" }}>My Courses</h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>3 active · 1 nearly complete</p>
                </div>
                <Link href="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--brand-primary)", textDecoration: "none" }}>
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-4)" }}>
                {courses.map((c, i) => (
                  <div key={i} className="course-card hover-lift">
                    {/* Thumb */}
                    <div style={{ height: 130, background: c.grad, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: "var(--space-4)" }}>
                      <div style={{ position: "absolute", right: -12, top: -12, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                      <div style={{ position: "absolute", right: 16, top: 14, fontSize: 32 }}>{c.icon}</div>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.2), transparent)" }} />
                      <span style={{ position: "relative", zIndex: 1, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)", background: "rgba(0,0,0,0.18)", padding: "3px 8px", borderRadius: "var(--radius-full)", backdropFilter: "blur(4px)" }}>{c.tag}</span>
                    </div>
                    <div className="course-info">
                      <h3 className="course-title" style={{ marginTop: 0, marginBottom: "var(--space-1)" }}>{c.title}</h3>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-relaxed)" }}>{c.sub}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>{c.progress}% complete</span>
                        {c.progress >= 80 && <span className="badge badge-success" style={{ fontSize: 9, padding: "1px 6px" }}>Almost done!</span>}
                      </div>
                      <div className="progress-bar" style={{ height: 5 }}>
                        <div className="progress-fill" style={{ width: `${c.progress}%`, background: c.accent }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Style */}
            <div className="anim-5">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
                <div>
                  <span className="ds-section-label">Personalisation</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)" }}>Your Learning Style</h2>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>Determines how content is delivered to you</p>
                </div>
                <button className="btn btn-sm btn-outline-brand">Take Retest</button>
              </div>
              <div className="style-card-grid">
                {styleCards.map(s => (
                  <div key={s.key} className={`style-card ${s.cls}${selectedStyle === s.key ? " selected" : ""}`} onClick={() => setSelectedStyle(s.key)}>
                    <div className="style-check">✓</div>
                    <div className="style-card-icon">{s.icon}</div>
                    <div className="style-card-title">{s.title}</div>
                    <div className="style-card-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

            {/* Daily Progress */}
            <div className="card anim-3" style={{ padding: 0 }}>
              <div style={{ padding: "var(--space-5) var(--space-5) 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>Daily Progress</h2>
                  <span className="badge badge-success"><Zap size={10} /> On track</span>
                </div>
              </div>
              <div style={{ padding: "var(--space-4) var(--space-5) var(--space-5)" }}>

                {/* Ring + goal */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                  <div style={{ width: 72, height: 72, position: "relative", flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={progressData} cx="50%" cy="50%" innerRadius={26} outerRadius={35} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                          {progressData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>72%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>Goal: 2 hours</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>1h 26m completed today</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>34 min remaining</div>
                  </div>
                </div>

                {/* XP bar */}
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Daily XP</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand-primary)" }}>450 / 600 XP</span>
                  </div>
                  <div className="xp-bar-wrap"><div className="xp-bar" style={{ width: "75%" }} /></div>
                </div>

                {/* Activity breakdown */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>Breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {activityBreakdown.map((a, i) => (
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
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="anim-3 hover-lift" style={{ background: "linear-gradient(135deg,#FFF1EB,#FFE6D9)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", border: "1px solid #FFD4C0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#FF8B78,#FF5733)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(255,80,50,0.35)" }}>
                <Flame size={24} style={{ fill: "#fff", color: "#fff" }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#E84B2A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>🔥 Current Streak</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
                7 <span style={{ fontSize: "var(--text-xl)", color: "var(--text-secondary)" }}>days</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>Personal best: <strong style={{ color: "var(--text-secondary)" }}>12 days</strong></div>
              {/* Day checkboxes */}
              <div style={{ marginTop: "var(--space-4)", display: "flex", gap: 4 }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", aspectRatio: "1", borderRadius: "var(--radius-xs)", background: i < 5 ? "linear-gradient(135deg,#FF8B78,#FF5733)" : "var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 5 ? 11 : 10, color: i < 5 ? "#fff" : "var(--text-muted)", fontWeight: 700 }}>
                      {i < 5 && "✓"}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Practice */}
            <div className="anim-4">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>Quick Practice</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                {[
                  { href: "/practice", icon: <Lightbulb size={20} />, label: "Quiz Me", sub: "12 pending", iconBg: "var(--info-subtle)", iconClr: "var(--info)", hoverBg: "var(--info)" },
                  { href: "/flashcards", icon: <Brain size={20} />, label: "Flashcards", sub: "48 cards", iconBg: "var(--subject-english-bg)", iconClr: "var(--subject-english)", hoverBg: "var(--subject-english)" },
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
              <div style={{ padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {achievements.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", position: "relative" }}>
                    <span style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.sub}</div>
                    </div>
                    {a.new
                      ? <span className="badge badge-brand" style={{ fontSize: 9 }}>NEW</span>
                      : <Star size={13} style={{ color: "var(--warning)", fill: "var(--warning)", flexShrink: 0 }} />
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="card anim-5" style={{ padding: 0 }}>
              <div className="card-header">
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>Upcoming Today</h2>
                <Calendar size={15} color="var(--text-muted)" />
              </div>
              <div style={{ padding: "var(--space-3) var(--space-5) var(--space-5)" }}>
                {upcomingItems.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderBottom: i < upcomingItems.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <div style={{ minWidth: 50, textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "4px 0", flexShrink: 0 }}>{e.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{e.title}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: e.tagClr, background: e.tagBg, padding: "2px 8px", borderRadius: "var(--radius-full)", flexShrink: 0 }}>{e.tag}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}