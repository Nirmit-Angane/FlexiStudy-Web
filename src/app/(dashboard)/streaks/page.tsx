"use client";

import { useState } from "react";
import { Flame, Calendar, Trophy, Zap, ChevronLeft, ChevronRight, Star, Target } from "lucide-react";

export default function StreaksPage() {
  const currentStreak = 7;
  const longestStreak = 12;
  const [currentMonth, setCurrentMonth] = useState("March 2026");

  const activityData = Array.from({ length: 31 }, (_, i) => ({
    date: i + 1,
    active: i >= 24,
    partial: i === 20 || i === 22,
  }));

  const milestones = [
    { days: 3, label: "Starter", icon: "⚡", unlocked: true },
    { days: 7, label: "On Fire", icon: "🔥", unlocked: true },
    { days: 10, label: "Consistent", icon: "🏅", unlocked: false },
    { days: 14, label: "Dedicated", icon: "🏆", unlocked: false },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 12px rgba(255,112,89,0.6)); }
          50% { transform: scale(1.12) rotate(2deg); filter: drop-shadow(0 0 24px rgba(255,112,89,0.9)); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes progressGrow {
          from { width: 0%; }
          to { width: 70%; }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,112,89,0.4); }
          70% { box-shadow: 0 0 0 16px rgba(255,112,89,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,112,89,0); }
        }
        @keyframes calDayPop {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmerSlide {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes badgeBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-2px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* PAGE */
        .streaks-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
          padding-bottom: var(--space-12);
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          animation: fadeSlideIn 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        /* HEADER */
        .streaks-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .streaks-title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: 800;
          color: var(--text-primary);
          line-height: var(--leading-tight);
        }
        .streaks-subtitle {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        /* TOP GRID */
        .streaks-top-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: var(--space-4);
        }

        /* HERO CARD */
        .streak-hero-card {
          grid-column: 1 / 3;
          border-radius: var(--radius-xl);
          padding: var(--space-10) var(--space-8);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          overflow: hidden;
          background: linear-gradient(135deg, #FF7059 0%, #E04A2C 55%, #C73A20 100%);
          box-shadow: 0 12px 40px rgba(255,112,89,0.35), 0 4px 12px rgba(255,112,89,0.2);
        }
        .streak-hero-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .streak-hero-card::after {
          content: '';
          position: absolute;
          bottom: -30px;
          right: -30px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .flame-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 2px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-5);
          animation: ringPulse 2.5s infinite;
          position: relative;
          z-index: 1;
        }
        .flame-icon {
          color: #fff;
          filter: drop-shadow(0 0 10px rgba(255,200,100,0.8));
          animation: flamePulse 2s ease-in-out infinite;
        }

        .streak-number {
          font-family: var(--font-display);
          font-size: 80px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.03em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.2);
          animation: countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-delay: 0.2s;
          position: relative;
          z-index: 1;
          opacity: 0;
        }
        .streak-label {
          font-size: var(--text-sm);
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-top: var(--space-2);
          position: relative;
          z-index: 1;
        }
        .streak-subtext {
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.7);
          text-align: center;
          max-width: 240px;
          line-height: var(--leading-relaxed);
          margin-top: var(--space-4);
          position: relative;
          z-index: 1;
        }

        /* STAT SIDE CARDS */
        .streaks-side-cards {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .streak-stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: var(--space-4);
          transition: all var(--transition-normal);
          animation: staggerIn 0.4s ease both;
          cursor: default;
        }
        .streak-stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          border-color: var(--border-strong);
        }
        .streak-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .streak-stat-card:nth-child(2) { animation-delay: 0.2s; }

        .stat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon-trophy {
          background: var(--warning-subtle);
          color: var(--warning);
          animation: float 3s ease-in-out infinite;
        }
        .stat-icon-xp {
          background: var(--info-subtle);
          color: var(--info);
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
        }
        .stat-meta-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 3px;
        }
        .stat-meta-value {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        /* MILESTONE CARD */
        .milestone-card {
          background: var(--warning-subtle);
          border: 1px solid rgba(212,134,10,0.2);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          flex: 1;
          animation: staggerIn 0.4s ease both;
          animation-delay: 0.3s;
        }
        .milestone-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--warning-text);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }
        .milestone-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-3);
        }
        .milestone-progress-wrap {
          background: rgba(212,134,10,0.15);
          border-radius: var(--radius-full);
          height: 6px;
          overflow: hidden;
        }
        .milestone-progress-fill {
          height: 100%;
          background: var(--warning);
          border-radius: var(--radius-full);
          animation: progressGrow 1s cubic-bezier(0.4,0,0.2,1) forwards;
          animation-delay: 0.5s;
          width: 0%;
          position: relative;
        }
        .milestone-progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 16px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5));
        }
        .milestone-fraction {
          font-size: 11px;
          font-weight: 700;
          color: var(--warning-text);
          margin-top: var(--space-2);
          text-align: right;
        }

        /* MILESTONES ROW */
        .milestones-row-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: var(--space-6) var(--space-8);
          box-shadow: var(--shadow-sm);
          animation: staggerIn 0.4s ease both;
          animation-delay: 0.35s;
        }
        .milestones-row-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }
        .milestones-section-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--subject-math-bg);
          color: var(--subject-math);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .milestones-section-title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
        }
        .milestones-track {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
        }
        .milestone-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 2px solid var(--border-default);
          background: var(--bg-elevated);
          position: relative;
          transition: all var(--transition-normal);
          cursor: default;
        }
        .milestone-badge.unlocked {
          border-color: rgba(46,158,107,0.3);
          background: var(--success-subtle);
          animation: badgeBounce 3s ease-in-out infinite;
        }
        .milestone-badge.unlocked:nth-child(2) { animation-delay: 0.4s; }
        .milestone-badge:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .milestone-badge-emoji {
          font-size: 28px;
          line-height: 1;
          filter: grayscale(0);
        }
        .milestone-badge.locked .milestone-badge-emoji {
          filter: grayscale(1);
          opacity: 0.4;
        }
        .milestone-badge-days {
          font-family: var(--font-display);
          font-size: var(--text-xs);
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .milestone-badge.unlocked .milestone-badge-days {
          color: var(--success-text);
        }
        .milestone-badge-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .milestone-badge.unlocked .milestone-badge-label {
          color: var(--success-text);
        }
        .milestone-check {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--success);
          color: #fff;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-surface);
          box-shadow: var(--shadow-sm);
        }

        /* CALENDAR */
        .calendar-section {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          animation: staggerIn 0.4s ease both;
          animation-delay: 0.4s;
        }
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6) var(--space-8);
          border-bottom: 1px solid var(--border-subtle);
          background: linear-gradient(to right, var(--bg-surface), var(--bg-elevated));
        }
        .calendar-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .calendar-icon {
          width: 40px;
          height: 40px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .calendar-section-title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
        }
        .calendar-nav {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .cal-nav-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-default);
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .cal-nav-btn:hover {
          border-color: var(--brand-primary);
          color: var(--brand-primary);
          background: var(--brand-primary-light);
        }
        .cal-month-label {
          font-family: var(--font-display);
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--text-primary);
          min-width: 110px;
          text-align: center;
        }
        .calendar-body {
          padding: var(--space-6) var(--space-8) var(--space-8);
        }
        .cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }
        .cal-weekday {
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding: var(--space-2) 0;
        }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--space-2);
        }
        .cal-day {
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: default;
          transition: all var(--transition-fast);
          border: 1.5px solid transparent;
          position: relative;
        }
        .cal-day.empty {
          background: transparent;
        }
        .cal-day.inactive {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border-color: var(--border-subtle);
        }
        .cal-day.inactive:hover {
          border-color: var(--border-default);
          color: var(--text-secondary);
        }
        .cal-day.partial {
          background: rgba(255,112,89,0.1);
          color: #E04A2C;
          border-color: rgba(255,112,89,0.2);
        }
        .cal-day.active {
          background: linear-gradient(135deg, #FF7059, #E04A2C);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(255,112,89,0.35);
          font-weight: 700;
        }
        .cal-day.active:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 18px rgba(255,112,89,0.45);
        }
        .cal-day.today {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 2px rgba(61,139,113,0.2);
        }
        .cal-day-flame {
          font-size: 10px;
          line-height: 1;
          margin-bottom: 1px;
        }
        .cal-day.active {
          /* staggered animation applied inline */
        }

        /* LEGEND */
        .cal-legend {
          display: flex;
          gap: var(--space-6);
          margin-top: var(--space-5);
          padding-top: var(--space-5);
          border-top: 1px solid var(--border-subtle);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--text-secondary);
        }
        .legend-dot {
          width: 14px;
          height: 14px;
          border-radius: var(--radius-xs);
        }
        .legend-dot-active { background: linear-gradient(135deg, #FF7059, #E04A2C); }
        .legend-dot-partial { background: rgba(255,112,89,0.2); border: 1.5px solid rgba(255,112,89,0.3); }
        .legend-dot-inactive { background: var(--bg-elevated); border: 1.5px solid var(--border-subtle); }
      `}</style>

      <div className="streaks-page">

        {/* Header */}
        <div className="streaks-header">
          <div className="ds-section-label">Progress</div>
          <h1 className="streaks-title">My Streaks</h1>
          <p className="streaks-subtitle">Consistency is the foundation of mastery. Keep the flame alive.</p>
        </div>

        {/* Top Grid */}
        <div className="streaks-top-grid">

          {/* Hero Flame Card */}
          <div className="streak-hero-card">
            <div className="flame-ring">
              <Flame size={52} className="flame-icon" fill="white" />
            </div>
            <div className="streak-number">{currentStreak}</div>
            <div className="streak-label">Day Streak</div>
            <div className="streak-subtext">You're building an unstoppable habit! Log in tomorrow to keep the flame alive.</div>
          </div>

          {/* Side stats */}
          <div className="streaks-side-cards">
            <div className="streak-stat-card">
              <div className="stat-icon-wrap stat-icon-trophy">
                <Trophy size={26} />
              </div>
              <div>
                <div className="stat-meta-label">Longest Streak</div>
                <div className="stat-meta-value">{longestStreak} Days</div>
              </div>
            </div>

            <div className="streak-stat-card">
              <div className="stat-icon-wrap stat-icon-xp">
                <Zap size={26} />
              </div>
              <div>
                <div className="stat-meta-label">Total XP Earned</div>
                <div className="stat-meta-value">1,250 XP</div>
              </div>
            </div>

            {/* Next Milestone */}
            <div className="milestone-card">
              <div className="milestone-title">
                <Flame size={16} fill="currentColor" /> Next Milestone
              </div>
              <div className="milestone-desc">
                Reach <strong>10 days</strong> to unlock the "Consistent" badge!
              </div>
              <div className="milestone-progress-wrap">
                <div className="milestone-progress-fill" />
              </div>
              <div className="milestone-fraction">7 / 10 days</div>
            </div>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="milestones-row-section">
          <div className="milestones-row-header">
            <div className="milestones-section-icon">
              <Star size={18} />
            </div>
            <span className="milestones-section-title">Streak Badges</span>
            <span className="badge badge-success" style={{ marginLeft: "auto" }}>2 / 4 Unlocked</span>
          </div>
          <div className="milestones-track">
            {milestones.map((m, i) => (
              <div
                key={m.days}
                className={`milestone-badge ${m.unlocked ? "unlocked" : "locked"}`}
                style={m.unlocked ? { animationDelay: `${i * 0.3}s` } : {}}
              >
                {m.unlocked && <div className="milestone-check">✓</div>}
                <div className="milestone-badge-emoji">{m.icon}</div>
                <div className="milestone-badge-days">{m.days} days</div>
                <div className="milestone-badge-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-section">
          <div className="calendar-header">
            <div className="calendar-title-group">
              <div className="calendar-icon">
                <Calendar size={18} />
              </div>
              <span className="calendar-section-title">Activity Calendar</span>
            </div>
            <div className="calendar-nav">
              <button className="cal-nav-btn"><ChevronLeft size={15} /></button>
              <span className="cal-month-label">{currentMonth}</span>
              <button className="cal-nav-btn"><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="calendar-body">
            <div className="cal-weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="cal-weekday">{d}</div>
              ))}
            </div>
            <div className="cal-grid">
              {/* Offset */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`e-${i}`} className="cal-day empty" />
              ))}
              {activityData.map((day, i) => {
                const cls = day.active ? "active" : day.partial ? "partial" : "inactive";
                const delay = day.active ? `${(i % 7) * 0.04}s` : "0s";
                return (
                  <div
                    key={day.date}
                    className={`cal-day ${cls}`}
                    style={day.active ? {
                      animation: `calDayPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both`,
                      animationDelay: delay,
                    } : {}}
                  >
                    {day.active && <span className="cal-day-flame">🔥</span>}
                    {day.date}
                  </div>
                );
              })}
            </div>

            <div className="cal-legend">
              <div className="legend-item">
                <div className="legend-dot legend-dot-active" />
                Active day
              </div>
              <div className="legend-item">
                <div className="legend-dot legend-dot-partial" />
                Partial session
              </div>
              <div className="legend-item">
                <div className="legend-dot legend-dot-inactive" />
                No activity
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}