"use client";

import { useState } from "react";
import {
  User, Mail, Camera, Shield, Bell, Palette,
  LogOut, Trash2, Check, Eye, EyeOff,
  Zap, Flame, BookOpen, Trophy, Star, AlertTriangle,
  Smartphone, Globe, Download, Upload, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type TabId = "profile" | "security" | "notifications" | "appearance" | "danger";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const ACCENT_COLORS = [
  { id: "green", hex: "#3D8B71", label: "Sage" },
  { id: "blue", hex: "#4A7FC1", label: "Ocean" },
  { id: "amber", hex: "#D4860A", label: "Amber" },
  { id: "violet", hex: "#A06CB0", label: "Violet" },
  { id: "teal", hex: "#5BA3A0", label: "Teal" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} role="switch" aria-checked={on}
      style={{ width: 44, height: 24, borderRadius: 12, background: on ? "var(--brand-primary)" : "var(--border-strong)", position: "relative", cursor: "pointer", transition: "background var(--transition-fast)", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.25)", transition: "left var(--transition-fast)" }} />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", margin: "var(--space-6) 0 var(--space-4)" }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, end }: { icon: React.ElementType; title: string; desc?: string; end: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) var(--space-5)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--text-secondary)" }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>}
      </div>
      {end}
    </div>
  );
}

export default function AccountPage() {
  const { user, profile, loading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saved, setSaved] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || "");
  const [bio, setBio] = useState((profile as any)?.bio || "");
  const [grade, setGrade] = useState((profile as any)?.grade || "Grade 11");
  const [notifs, setNotifs] = useState({ streakReminder: true, lessonComplete: true, weeklyReport: true, newContent: false, achievements: true, marketing: false });
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("green");
  const [showXPAnim, setShowXPAnim] = useState(true);
  const [streakCelebration, setStreakCelebration] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  if (loading) return null;

  const fullName = profile?.displayName || user?.displayName || "Learner";
  const firstName = fullName.split(" ")[0];
  const photoURL = profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=e6ecea`;
  const userXP = profile?.xp || 0;
  const userStreak = profile?.streak || 0;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2600); };
  const showFooter = (["profile", "security", "notifications", "appearance"] as TabId[]).includes(activeTab);

  return (
    <>
      <style>{`
        @keyframes accFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes savedPop  { 0%{opacity:0;transform:scale(.8)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(61,139,113,.4)} 50%{box-shadow:0 0 0 8px rgba(61,139,113,0)} }
        .acc-page { animation:accFadeUp .4s cubic-bezier(.22,1,.36,1); font-family:var(--font-body); }
        .acc-tab { display:flex;align-items:center;gap:var(--space-3);padding:10px var(--space-4);border-radius:var(--radius-md);cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:var(--font-body);transition:all var(--transition-fast);border-left:3px solid transparent; }
        .acc-tab:hover { background:var(--bg-elevated); }
        .acc-tab.active { background:var(--brand-primary-light);border-left-color:var(--brand-primary); }
        .acc-tab.danger-t:hover { background:var(--error-subtle); }
        .acc-tab.danger-t.active { background:var(--error-subtle);border-left-color:var(--error); }
        .fi { width:100%;padding:11px 14px;background:var(--bg-elevated);border:1.5px solid var(--border-default);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-sm);color:var(--text-primary);outline:none;transition:all var(--transition-fast);box-sizing:border-box; }
        .fi::placeholder { color:var(--text-muted); }
        .fi:focus { border-color:var(--brand-primary);background:var(--bg-surface);box-shadow:0 0 0 3px rgba(61,139,113,.12); }
        .fi:disabled { opacity:.6;cursor:not-allowed; }
        .fl { font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:var(--space-2);display:block; }
        .save-btn { display:inline-flex;align-items:center;gap:var(--space-2);padding:11px 24px;border-radius:var(--radius-md);background:var(--brand-primary);color:#fff;font-size:var(--text-sm);font-weight:700;border:none;cursor:pointer;font-family:var(--font-body);box-shadow:var(--shadow-brand);transition:all var(--transition-fast);position:relative;overflow:hidden; }
        .save-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%);transform:translateX(-100%);transition:transform .5s ease; }
        .save-btn:hover { background:var(--brand-primary-dark);transform:translateY(-1px);box-shadow:0 6px 20px rgba(61,139,113,.35); }
        .save-btn:hover::after { transform:translateX(100%); }
        .saved-pop { animation:savedPop .35s ease; }
        .pw-wrap { position:relative; }
        .pw-eye { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);display:flex;align-items:center;padding:0;transition:color var(--transition-fast); }
        .pw-eye:hover { color:var(--text-primary); }
        .stat-pill { display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--radius-md);transition:all var(--transition-fast); }
        .stat-pill:hover { border-color:var(--brand-primary);background:var(--brand-primary-light); }
        .danger-row { display:flex;align-items:center;justify-content:space-between;padding:var(--space-5);border-bottom:1px solid var(--border-subtle);gap:var(--space-4);flex-wrap:wrap; }
        .danger-row:last-child { border-bottom:none; }
        .av-wrap { position:relative;cursor:pointer;width:fit-content; }
        .av-overlay { position:absolute;inset:0;border-radius:50%;background:rgba(61,139,113,.75);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity var(--transition-fast); }
        .av-wrap:hover .av-overlay { opacity:1; }
        .swatch { width:32px;height:32px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all var(--transition-fast);display:flex;align-items:center;justify-content:center; }
        .swatch:hover { transform:scale(1.12); }
        .swatch.chosen { border-color:var(--text-primary); }
      `}</style>

      <div className="acc-page px-4 md:px-0" style={{ maxWidth: 940, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: "var(--space-6) md:var(--space-8)" }}>
          <div className="ds-section-label">Account</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 5vw, 1.875rem)", fontWeight: 800, color: "var(--text-primary)", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-1)" }}>My Account</h1>
          <p style={{ fontSize: "var(--text-sm) md:var(--text-base)", color: "var(--text-secondary)" }}>Manage your profile, security settings, and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Sidebar */}
          <div className="w-full md:w-[220px] flex shrink-0 flex-col gap-1 md:sticky md:top-20">
            {/* Mini card */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-3)", boxShadow: "var(--shadow-sm)" }}>
              <img src={photoURL} alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--brand-primary-light)", flexShrink: 0, animation: "ringPulse 3s infinite" }} />
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user?.email || "No email"}</div>
              </div>
            </div>

            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDanger = tab.id === "danger";
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`acc-tab${isActive ? " active" : ""}${isDanger ? " danger-t" : ""}`}>
                  <Icon size={16} style={{ color: isActive ? (isDanger ? "var(--error)" : "var(--brand-primary)") : "var(--text-muted)", flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: isActive ? 700 : 500, color: isActive ? (isDanger ? "var(--error)" : "var(--brand-primary)") : "var(--text-secondary)" }}>{tab.label}</span>
                </button>
              );
            })}

            <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)" }}>
              <button onClick={logout}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "10px var(--space-4)", borderRadius: "var(--radius-md)", cursor: "pointer", border: "none", background: "transparent", width: "100%", fontFamily: "var(--font-body)", transition: "all var(--transition-fast)", color: "var(--text-muted)", fontSize: "var(--text-sm)", fontWeight: 600 }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--bg-elevated)"; b.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "var(--text-muted)"; }}
              ><LogOut size={16} /> Sign Out</button>
            </div>
          </div>

          {/* Content panel */}
          <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] shadow-md overflow-hidden">
            {/* Panel header */}
            <div className="px-5 md:px-8 py-4 md:py-6 border-bottom border-gray-100 bg-gradient-to-r from-white to-gray-50">
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                {TABS.find(t => t.id === activeTab)?.label}
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                {activeTab === "profile" && "Your public identity and learning profile."}
                {activeTab === "security" && "Password, sessions, and account safety."}
                {activeTab === "notifications" && "Control how and when FlexiStudy contacts you."}
                {activeTab === "appearance" && "Personalise the look and feel of the app."}
                {activeTab === "danger" && "Irreversible actions — proceed with caution."}
              </div>
            </div>

            {/* ── PROFILE ── */}
            {activeTab === "profile" && (
              <div className="p-5 md:p-8">
                {/* Avatar row */}
                <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6 p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                  <div className="av-wrap">
                    <img src={photoURL} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--bg-surface)", boxShadow: "var(--shadow-md)", display: "block" }} />
                    <div className="av-overlay"><Camera size={20} color="#fff" /></div>
                    <div style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "var(--success)", border: "2.5px solid var(--bg-surface)" }} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{fullName}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>{user?.email}</div>
                    <div className="flex justify-center sm:justify-start gap-2">
                      <button style={{ fontSize: "var(--text-xs)", fontWeight: 600, padding: "6px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-strong)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all var(--transition-fast)", fontFamily: "var(--font-body)" }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--brand-primary)"; b.style.color = "var(--brand-primary)"; b.style.background = "var(--brand-primary-light)"; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--border-strong)"; b.style.color = "var(--text-primary)"; b.style.background = "var(--bg-surface)"; }}
                      ><Upload size={13} /> Upload Photo</button>
                      <button style={{ fontSize: "var(--text-xs)", fontWeight: 600, padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid transparent", background: "transparent", color: "var(--error-text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all var(--transition-fast)", fontFamily: "var(--font-body)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--error-subtle)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      ><Trash2 size={13} /> Remove</button>
                    </div>
                  </div>
                  <span className="badge badge-success">✦ Active</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: <Zap size={14} />, val: userXP.toLocaleString(), lbl: "Total XP", color: "var(--brand-primary)", bg: "var(--brand-primary-light)" },
                    { icon: <Flame size={14} />, val: `${userStreak}d`, lbl: "Streak", color: "#E84B2A", bg: "#FFF1EB" },
                    { icon: <Trophy size={14} />, val: "Lv 1", lbl: "Rank", color: "var(--warning)", bg: "var(--warning-subtle)" },
                  ].map((s, i) => (
                    <div key={i} className="stat-pill">
                      <div style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{s.lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="fl">Display Name</label><input className="fi" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" /></div>
                  <div><label className="fl">Email Address</label><input className="fi" defaultValue={user?.email || ""} type="email" disabled /></div>
                  <div><label className="fl">Grade / Level</label>
                    <select className="fi" value={grade} onChange={e => setGrade(e.target.value)} style={{ cursor: "pointer", appearance: "none" }}>
                      {["Grade 9", "Grade 10", "Grade 11", "Grade 12", "College Year 1", "College Year 2", "Other"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div><label className="fl">Learning Style</label>
                    <select className="fi" defaultValue="Visual" style={{ cursor: "pointer", appearance: "none" }}>
                      {["Visual", "Auditory", "Kinesthetic", "Global"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}><label className="fl">Bio</label><textarea className="fi" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself…" style={{ resize: "vertical" }} /></div>
                </div>

                {/* XP bar */}
                <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4) var(--space-5)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Level 1 Progress</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--brand-primary)" }}>{userXP} / 1,000 XP</span>
                  </div>
                  <div className="xp-bar-wrap"><div className="xp-bar" style={{ width: `${Math.min(100, (userXP / 1000) * 100)}%` }} /></div>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <div className="p-5 md:p-8">
                <SectionLabel>Change Password</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 420 }}>
                  <div><label className="fl">Current Password</label>
                    <div className="pw-wrap">
                      <input className="fi" type={showOldPw ? "text" : "password"} placeholder="••••••••" style={{ paddingRight: 44 }} />
                      <button className="pw-eye" onClick={() => setShowOldPw(p => !p)}>{showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div><label className="fl">New Password</label>
                    <div className="pw-wrap">
                      <input className="fi" type={showNewPw ? "text" : "password"} placeholder="••••••••" style={{ paddingRight: 44 }} />
                      <button className="pw-eye" onClick={() => setShowNewPw(p => !p)}>{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div><label className="fl">Confirm New Password</label><input className="fi" type="password" placeholder="••••••••" /></div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "var(--leading-relaxed)", padding: "var(--space-3) var(--space-4)", background: "var(--info-subtle)", borderRadius: "var(--radius-md)", border: "1px solid rgba(74,127,193,.2)" }}>
                    💡 Use at least 8 characters with a mix of letters, numbers and symbols.
                  </div>
                </div>

                <SectionLabel>Active Sessions</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {[
                    { device: "Chrome · macOS", loc: "Mumbai, India", time: "Now", current: true },
                    { device: "Safari · iPhone 15", loc: "Pune, India", time: "2h ago", current: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) var(--space-5)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: `1px solid ${s.current ? "rgba(61,139,113,.25)" : "var(--border-subtle)"}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: s.current ? "var(--brand-primary-light)" : "var(--bg-surface)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: s.current ? "var(--brand-primary)" : "var(--text-muted)", flexShrink: 0 }}><Smartphone size={16} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 2 }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>{s.device}</span>
                          {s.current && <span className="badge badge-success" style={{ fontSize: 9 }}>This device</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Globe size={10} /> {s.loc} · {s.time}</div>
                      </div>
                      {!s.current && <button style={{ fontSize: 11, fontWeight: 700, color: "var(--error-text)", background: "var(--error-subtle)", border: "none", borderRadius: "var(--radius-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)" }}>Revoke</button>}
                    </div>
                  ))}
                </div>

                <SectionLabel>Data Export</SectionLabel>
                <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", fontWeight: 700, padding: "9px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-strong)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all var(--transition-fast)" }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--brand-primary)"; b.style.color = "var(--brand-primary)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--border-strong)"; b.style.color = "var(--text-primary)"; }}
                ><Download size={13} /> Export My Data</button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === "notifications" && (
              <div className="p-5 md:p-8">
                <SectionLabel>Learning Alerts</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <SettingRow icon={Flame} title="Daily Streak Reminder" desc="Get nudged before your streak expires" end={<Toggle on={notifs.streakReminder} onChange={v => setNotifs(p => ({ ...p, streakReminder: v }))} />} />
                  <SettingRow icon={BookOpen} title="Lesson Completion Summary" desc="Recap after each finished lesson" end={<Toggle on={notifs.lessonComplete} onChange={v => setNotifs(p => ({ ...p, lessonComplete: v }))} />} />
                  <SettingRow icon={Trophy} title="Achievement Unlocked" desc="Celebrate new badges and milestones" end={<Toggle on={notifs.achievements} onChange={v => setNotifs(p => ({ ...p, achievements: v }))} />} />
                </div>
                <SectionLabel>Progress Reports</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <SettingRow icon={Star} title="Weekly Progress Report" desc="Every Sunday — your week in review" end={<Toggle on={notifs.weeklyReport} onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))} />} />
                  <SettingRow icon={Zap} title="New Content Available" desc="When new lessons drop in your subjects" end={<Toggle on={notifs.newContent} onChange={v => setNotifs(p => ({ ...p, newContent: v }))} />} />
                </div>
                <SectionLabel>Marketing</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <SettingRow icon={Mail} title="Promotional Emails" desc="Special offers and feature announcements" end={<Toggle on={notifs.marketing} onChange={v => setNotifs(p => ({ ...p, marketing: v }))} />} />
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === "appearance" && (
              <div className="p-5 md:p-8">
                <SectionLabel>Theme</SectionLabel>
                <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
                  {[{ id: "light", label: "Light", preview: "#FAF8F4", bar: "#3D8B71", locked: false }, { id: "dark", label: "Dark (Pro)", preview: "#1C1F27", bar: "#56C99A", locked: true }].map(t => (
                    <div key={t.id} onClick={() => !t.locked && setTheme(t.id)} style={{ padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: `2px solid ${theme === t.id ? "var(--brand-primary)" : "var(--border-default)"}`, background: theme === t.id ? "var(--brand-primary-light)" : "var(--bg-elevated)", cursor: t.locked ? "not-allowed" : "pointer", opacity: t.locked ? 0.5 : 1, transition: "all var(--transition-fast)", minWidth: 110, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                      <div style={{ width: 60, height: 40, borderRadius: "var(--radius-sm)", background: t.preview, border: "1px solid var(--border-default)", overflow: "hidden" }}><div style={{ height: 10, background: t.bar }} /></div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: theme === t.id ? "var(--brand-primary)" : "var(--text-secondary)" }}>{t.label}</span>
                        {t.locked && <span style={{ fontSize: 9, fontWeight: 700, background: "var(--warning-subtle)", color: "var(--warning-text)", padding: "1px 6px", borderRadius: "var(--radius-full)" }}>PRO</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <SectionLabel>Accent Colour</SectionLabel>
                <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
                  {ACCENT_COLORS.map(c => (
                    <div key={c.id} className={`swatch${accentColor === c.id ? " chosen" : ""}`} style={{ background: c.hex }} onClick={() => setAccentColor(c.id)} title={c.label}>
                      {accentColor === c.id && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  ))}
                </div>
                <SectionLabel>Interface Preferences</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <SettingRow icon={Zap} title="XP Animations" desc="Particle effects when earning XP" end={<Toggle on={showXPAnim} onChange={setShowXPAnim} />} />
                  <SettingRow icon={Star} title="Streak Celebration" desc="Confetti on streak milestones" end={<Toggle on={streakCelebration} onChange={setStreakCelebration} />} />
                  <SettingRow icon={BookOpen} title="Compact Mode" desc="Reduce spacing for a denser layout" end={<Toggle on={compactMode} onChange={setCompactMode} />} />
                </div>
              </div>
            )}

            {/* ── DANGER ZONE ── */}
            {activeTab === "danger" && (
              <div className="p-5 md:p-8">
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", padding: "var(--space-4) var(--space-5)", background: "var(--error-subtle)", borderRadius: "var(--radius-md)", border: "1px solid rgba(224,82,82,.25)", marginBottom: "var(--space-6)" }}>
                  ⚠️ The actions below are <strong style={{ color: "var(--error-text)" }}>permanent and irreversible</strong>. Please read carefully before proceeding.
                </div>
                <div style={{ border: "1.5px solid var(--error-subtle)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", overflow: "hidden" }}>
                  <div className="danger-row">
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>Reset All Progress</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Wipe all XP, streaks, and lesson history. Your account stays active.</div>
                    </div>
                    <button style={{ fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid rgba(224,82,82,.4)", background: "transparent", color: "var(--error-text)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-body)", transition: "all var(--transition-fast)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--error-subtle)" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                    >Reset Progress</button>
                  </div>
                  <div className="danger-row">
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>Delete Account</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Permanently delete your account and all associated data.</div>
                    </div>
                    <button style={{ fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--error)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-body)", transition: "all var(--transition-fast)", display: "flex", alignItems: "center", gap: 6 }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--error-text)"; b.style.transform = "translateY(-1px)" }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "var(--error)"; b.style.transform = "none" }}
                    ><Trash2 size={13} /> Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel footer */}
            {showFooter && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 md:px-8 py-5 bg-gray-50 border-t border-gray-100">
                {saved
                  ? <div className="saved-pop" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--success-text)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} /> Changes saved successfully
                  </div>
                  : <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center" }}>Changes are saved to your account instantly.</span>
                }
                <button className="save-btn w-full sm:w-auto" onClick={handleSave}>
                  {saved ? <><Check size={15} /> Saved!</> : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}