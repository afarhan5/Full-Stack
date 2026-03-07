import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";

const API = "https://nexus-backend-zrx2.onrender.com";

const themes = {
  dark: {
    bg: "#07070f", card: "#0d0d1a", border: "#181830", cardHover: "#13132a",
    text: "#e8eaf0", muted: "#4a5068", accent: "#00e87a", accentDim: "#00e87a10",
    danger: "#ff4455", blue: "#4facfe", purple: "#9f7afa", yellow: "#ffca28",
    orange: "#ff7043", navbar: "#050510", input: "#07070f",
    shadow: "0 8px 40px rgba(0,0,0,0.6)", grad: "linear-gradient(135deg,#00e87a,#4facfe)"
  },
  light: {
    bg: "#f4f6fb", card: "#ffffff", border: "#e8ecf4", cardHover: "#f8faff",
    text: "#1a1d2e", muted: "#6b7280", accent: "#059669", accentDim: "#05966910",
    danger: "#dc2626", blue: "#2563eb", purple: "#7c3aed", yellow: "#d97706",
    orange: "#ea580c", navbar: "#ffffff", input: "#f9fafb",
    shadow: "0 8px 40px rgba(0,0,0,0.08)", grad: "linear-gradient(135deg,#059669,#2563eb)"
  }
};

const G = ({ t }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{background:${t.bg};color:${t.text};font-family:'Plus Jakarta Sans',sans-serif;transition:background .3s,color .3s;min-height:100vh}
    a{color:inherit;text-decoration:none}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:${t.bg}}
    ::-webkit-scrollbar-thumb{background:${t.accent};border-radius:2px}
    @keyframes fu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes si{from{transform:translateX(12px);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .fu{animation:fu .45s ease both}
    .fu1{animation:fu .45s .07s ease both}
    .fu2{animation:fu .45s .14s ease both}
    .fu3{animation:fu .45s .21s ease both}
    .fu4{animation:fu .45s .28s ease both}
    .fu5{animation:fu .45s .35s ease both}
    input,select,button,textarea{font-family:'Plus Jakarta Sans',sans-serif}
    button{cursor:pointer}
    @media(max-width:768px){.hm{display:none!important}}
    @media(max-width:600px){
      .g4{grid-template-columns:repeat(2,1fr)!important}
      .g3{grid-template-columns:1fr!important}
      .g2{grid-template-columns:1fr!important}
    }
  `}</style>
);

const H = () => { const t = localStorage.getItem("token"); return { "Content-Type": "application/json", "Authorization": `Bearer ${t}` }; };

function Pw({ placeholder, value, onChange, onKeyDown, s }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <input type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}
        style={{ ...s, paddingRight: 44, marginBottom: 0, width: "100%" }} />
      <button type="button" onClick={() => setShow(!show)}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, color: "#888", padding: 4, lineHeight: 1 }}>
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

function Av({ u, size = 38, t }) {
  if (u?.photo) return <img src={u.photo} alt={u?.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${t.accent}40` }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff" }}>
      {u?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}



function Stat({ label, value, color, icon, cls = "fu", t }) {
  return (
    <div className={cls} style={{ background: t.card, border: `1px solid ${t.border}`, borderTop: `3px solid ${color}`, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, right: 14, fontSize: 28, opacity: .08 }}>{icon}</div>
      <div style={{ color: t.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7, fontFamily: "'Space Mono',monospace" }}>{label}</div>
      <div style={{ color, fontSize: 28, fontWeight: 800, fontFamily: "'Space Mono',monospace" }}>{value}</div>
    </div>
  );
}

function Toast({ msg, type, t }) {
  if (!msg) return null;
  const bg = type === "error" ? t.danger : t.accent;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: bg, color: type === "error" ? "#fff" : "#000", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: `0 8px 24px ${bg}60`, animation: "si .3s ease", maxWidth: 320 }}>
      {type === "error" ? "❌" : "✅"} {msg}
    </div>
  );
}

function Modal({ open, onClose, title, children, t }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fi .2s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, animation: "fu .3s ease", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.muted, fontSize: 24, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Progress({ value, max, color, t, height = 8, animated = true }) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0;
  return (
    <div style={{ background: t.bg, borderRadius: height, height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color || t.accent, borderRadius: height, transition: animated ? "width 1s ease" : "none" }} />
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────
function Navbar({ user, onLogout, t, toggle, isDark }) {
  const loc = useLocation();
  const links = [
    { to: "/", icon: "🏠", label: "Home" },
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/roadmaps", icon: "🗺️", label: "Roadmaps" },
    { to: "/skills", icon: "🧠", label: "Skills" },
    { to: "/achievements", icon: "🏅", label: "Badges" },
    { to: "/profile", icon: "👤", label: "Profile" },
    ...(user?.role === "admin" ? [{ to: "/admin", icon: "⚡", label: "Admin" }] : [])
  ];
  return (
    <nav style={{ background: t.navbar, borderBottom: `1px solid ${t.border}`, padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, backdropFilter: "blur(16px)" }}>
      <span style={{ fontFamily: "'Space Mono',monospace", color: t.accent, fontSize: 17, letterSpacing: 5, fontWeight: 700 }}>NEXUS</span>
      <div className="hm" style={{ display: "flex", gap: 2 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, fontWeight: 600, color: loc.pathname === l.to ? t.accent : t.muted, background: loc.pathname === l.to ? t.accentDim : "transparent", transition: "all .2s", display: "flex", alignItems: "center", gap: 5 }}>
            <span>{l.icon}</span><span>{l.label}</span>
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {user?.streak > 0 && (
          <div style={{ background: t.accentDim, border: `1px solid ${t.accent}30`, borderRadius: 20, padding: "4px 10px", fontSize: 12, color: t.accent, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            🔥 {user.streak}
          </div>
        )}
        <button onClick={toggle} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 14, color: t.text }}>{isDark ? "☀️" : "🌙"}</button>
        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 8, background: t.accentDim, border: `1px solid ${t.accent}30`, borderRadius: 10, padding: "4px 10px" }}>
          <Av u={user} size={24} t={t} />
          <div className="hm" style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{user?.name}</div>
            <div style={{ fontSize: 9, color: t.accent, letterSpacing: 1 }}>{user?.role?.toUpperCase()}</div>
          </div>
        </Link>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${t.danger}50`, color: t.danger, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = t.danger; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = t.danger; }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

// ── AUTH PAGE ─────────────────────────────────
function AuthPage({ onLogin, t }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState(true);
  const nav = useNavigate();

  useEffect(() => { fetch(API + "/has-users").then(r => r.json()).then(d => setHasUsers(d.hasUsers)).catch(() => { }); }, []);

  async function submit() {
    if (!form.email || !form.password) { setErr("Fill all fields"); return; }
    if (tab === "register" && !form.name) { setErr("Name required"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(API + (tab === "login" ? "/login" : "/register"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.error) setErr(d.error);
      else { localStorage.setItem("token", d.token); localStorage.setItem("user", JSON.stringify(d.user)); onLogin(d.user); nav("/"); }
    } catch { setErr("Server waking up — wait 60s and retry."); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "13px 16px", borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, outline: "none", transition: "border-color .2s" };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${t.accent}08 0%,transparent 65%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div className="fu" style={{ width: "100%", maxWidth: 400, background: t.card, border: `1px solid ${t.border}`, borderRadius: 24, padding: "40px 32px", boxShadow: t.shadow }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", background: t.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 30, letterSpacing: 8, fontWeight: 700 }}>NEXUS</div>
          <div style={{ color: t.muted, fontSize: 10, letterSpacing: 4, marginTop: 6 }}>LEARNING PLATFORM</div>
        </div>
        <div style={{ display: "flex", background: t.bg, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(tb => (
            <button key={tb} onClick={() => { setTab(tb); setErr(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, background: tab === tb ? t.accent : "transparent", color: tab === tb ? "#000" : t.muted, fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: "all .25s" }}>{tb.toUpperCase()}</button>
          ))}
        </div>
        {tab === "register" && (
          <div style={{ marginBottom: 14 }}>
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp}
              onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <Pw placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && submit()} s={inp} />
        {tab === "register" && !hasUsers && (
          <div style={{ background: t.accentDim, border: `1px solid ${t.accent}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: t.accent, lineHeight: 1.7 }}>
            💡 <strong>You will be the Admin</strong> — first account gets full control.
          </div>
        )}
        {err && <div style={{ background: "#ff445515", border: `1px solid ${t.danger}40`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: t.danger }}>❌ {err}</div>}
        <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: loading ? t.muted : t.accent, color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "⏳ Please wait..." : tab === "login" ? "▶  LOGIN" : "▶  CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────
function HomePage({ user, t }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { fetch(API + "/stats", { headers: H() }).then(r => r.json()).then(d => d.totalRoadmaps !== undefined && setStats(d)); }, []);

  const cards = [
    { to: "/roadmaps", icon: "🗺️", label: "Roadmaps", desc: "Create and manage your learning paths", color: t.accent },
    { to: "/dashboard", icon: "📊", label: "Dashboard", desc: "Analytics, streaks and progress", color: t.blue },
    { to: "/skills", icon: "🧠", label: "Skills", desc: "Your personal skill library", color: t.purple },
    { to: "/achievements", icon: "🏅", label: "Achievements", desc: "Badges and milestones", color: t.yellow },
    { to: "/profile", icon: "👤", label: "Profile", desc: "Edit your account and settings", color: t.orange },
    ...(user?.role === "admin" ? [{ to: "/admin", icon: "⚡", label: "Admin", desc: "Manage users and platform", color: t.danger }] : [])
  ];

  const goalPct = stats ? Math.min(100, Math.round(stats.todayDone / stats.dailyGoal * 100)) : 0;

  return (
    <div style={{ padding: "36px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 36 }}>
        <p style={{ color: t.muted, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Space Mono',monospace" }}>Welcome back</p>
        <h1 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, lineHeight: 1.2 }}>
          Hello, <span style={{ background: t.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.name}</span> 👋
        </h1>
        {stats && (
          <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ background: t.accentDim, border: `1px solid ${t.accent}30`, color: t.accent, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
              🔥 {stats.streak} day streak
            </span>
            <span style={{ background: t.accentDim, border: `1px solid ${t.accent}30`, color: t.accent, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
              🎯 {stats.todayDone}/{stats.dailyGoal} today's goal {goalPct >= 100 ? "✅" : ""}
            </span>
            {stats.recentCompletions?.[0] && (
              <span style={{ background: t.accentDim, border: `1px solid ${t.blue}30`, color: t.blue, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
                ▶️ Continue: {stats.recentCompletions[0].roadmapTitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Daily Goal bar */}
      {stats && (
        <div className="fu1" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>🎯 Daily Goal</span>
            <span style={{ color: t.accent, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{stats.todayDone}/{stats.dailyGoal} lessons</span>
          </div>
          <Progress value={stats.todayDone} max={stats.dailyGoal} color={goalPct >= 100 ? t.accent : t.blue} t={t} />
          {goalPct >= 100 && <p style={{ color: t.accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>🎉 Daily goal achieved!</p>}
        </div>
      )}

      <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {cards.map((c, i) => (
          <Link key={c.to} to={c.to} className={`fu${i + 1}`}>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, transition: "all .3s", position: "relative", overflow: "hidden", minHeight: 140 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 36px ${c.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
              <h2 style={{ color: c.color, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{c.label}</h2>
              <p style={{ color: t.muted, fontSize: 12, lineHeight: 1.6 }}>{c.desc}</p>
              <div style={{ position: "absolute", bottom: 16, right: 16, color: c.color, fontSize: 20, opacity: .2 }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────
function DashboardPage({ t }) {
  const [stats, setStats] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);

  useEffect(() => {
    fetch(API + "/stats", { headers: H() }).then(r => r.json()).then(d => d.totalRoadmaps !== undefined && setStats(d));
    fetch(API + "/roadmaps", { headers: H() }).then(r => r.json()).then(d => Array.isArray(d) && setRoadmaps(d));
  }, []);

  const totalLessons = roadmaps.reduce((s, r) => s + r.lessons.length, 0);
  const doneLessons = roadmaps.reduce((s, r) => s + r.lessons.filter(l => l.done).length, 0);
  const pct = totalLessons > 0 ? Math.round(doneLessons / totalLessons * 100) : 0;

  return (
    <div style={{ padding: "36px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>📊 Dashboard</h1>
        <p style={{ color: t.muted, marginTop: 4, fontSize: 13 }}>Your learning analytics at a glance</p>
      </div>

      <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <Stat label="Roadmaps" value={stats?.totalRoadmaps ?? "…"} color={t.accent} icon="🗺️" cls="fu1" t={t} />
        <Stat label="Lessons Done" value={stats?.doneLessons ?? "…"} color={t.blue} icon="📚" cls="fu2" t={t} />
        <Stat label="Day Streak" value={stats?.streak ?? 0} color={t.orange} icon="🔥" cls="fu3" t={t} />
        <Stat label="Badges" value={stats?.totalAchievements ?? 0} color={t.yellow} icon="🏅" cls="fu4" t={t} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }} className="g2">
        {/* Overall Progress */}
        <div className="fu2" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Overall Progress</h2>
            <span style={{ color: t.accent, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{pct}%</span>
          </div>
          <Progress value={doneLessons} max={totalLessons} t={t} />
          <p style={{ color: t.muted, fontSize: 12, marginTop: 8 }}>{doneLessons} of {totalLessons} lessons completed</p>

          {/* Per roadmap */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {roadmaps.slice(0, 4).map(r => {
              const d = r.lessons.filter(l => l.done).length;
              const p = r.lessons.length > 0 ? Math.round(d / r.lessons.length * 100) : 0;
              return (
                <div key={r.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.title}</span>
                    <span style={{ color: t.muted, fontSize: 11 }}>{d}/{r.lessons.length}</span>
                  </div>
                  <Progress value={d} max={r.lessons.length} color={p === 100 ? t.accent : t.blue} t={t} height={5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Goal + Streak */}
        <div className="fu3" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎯 Today's Progress</h2>
          {stats && (
            <>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: t.accent, fontFamily: "'Space Mono',monospace" }}>{stats.todayDone}</div>
                <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>of {stats.dailyGoal} daily goal</div>
              </div>
              <Progress value={stats.todayDone} max={stats.dailyGoal} color={stats.todayDone >= stats.dailyGoal ? t.accent : t.blue} t={t} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                <div style={{ background: t.bg, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🔥</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: t.orange }}>{stats.streak}</div>
                  <div style={{ color: t.muted, fontSize: 11 }}>Day Streak</div>
                </div>
                <div style={{ background: t.bg, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>⏱️</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: t.blue }}>{Math.round((stats.totalTime || 0) / 60)}m</div>
                  <div style={{ color: t.muted, fontSize: 11 }}>Time Learned</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Completions */}
      {stats?.recentCompletions?.length > 0 && (
        <div className="fu4" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📅 Recent Learning History</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.recentCompletions.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: t.bg, borderRadius: 10, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: t.accent, fontSize: 16 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{l.title}</div>
                    <div style={{ fontSize: 11, color: t.muted }}>{l.roadmapTitle}</div>
                  </div>
                </div>
                <span style={{ color: t.muted, fontSize: 11 }}>{l.completedAt ? new Date(l.completedAt).toLocaleDateString() : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROADMAPS PAGE ─────────────────────────────
function RoadmapsPage({ t }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [renameModal, setRenameModal] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [newLesson, setNewLesson] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [noteLesson, setNoteLesson] = useState(null);
  const [noteVal, setNoteVal] = useState("");
  const [timerLesson, setTimerLesson] = useState(null);
  const [timerVal, setTimerVal] = useState(0);
  const timerRef = useRef(null);

  function toast_(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), 3000); }

  const load = useCallback(() => {
    fetch(API + "/roadmaps", { headers: H() }).then(r => r.json()).then(d => { if (Array.isArray(d)) { setRoadmaps(d); if (selected) setSelected(d.find(r => r.id === selected.id) || null); } setLoading(false); });
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  // Timer
  useEffect(() => {
    if (timerLesson) {
      timerRef.current = setInterval(() => setTimerVal(v => v + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerLesson]);

  async function createRoadmap() {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch(API + "/roadmaps", { method: "POST", headers: H(), body: JSON.stringify({ title: newTitle.trim() }) });
    const d = await res.json();
    if (d.roadmap) { setRoadmaps(prev => [d.roadmap, ...prev]); setNewTitle(""); toast_("Roadmap created!"); }
    setCreating(false);
  }

  async function deleteRoadmap(id) {
    if (!window.confirm("Delete this roadmap and all lessons?")) return;
    await fetch(`${API}/roadmaps/${id}`, { method: "DELETE", headers: H() });
    setRoadmaps(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
    toast_("Roadmap deleted!");
  }

  async function renameRoadmap() {
    if (!renameVal.trim()) return;
    const res = await fetch(`${API}/roadmaps/${renameModal.id}`, { method: "PUT", headers: H(), body: JSON.stringify({ title: renameVal.trim() }) });
    const d = await res.json();
    if (d.roadmap) { setRoadmaps(prev => prev.map(r => r.id === renameModal.id ? d.roadmap : r)); if (selected?.id === renameModal.id) setSelected(d.roadmap); toast_("Renamed!"); }
    setRenameModal(null);
  }

  async function addLesson() {
    if (!newLesson.trim() || !selected) return;
    setAddingLesson(true);
    const res = await fetch(`${API}/roadmaps/${selected.id}/lessons`, { method: "POST", headers: H(), body: JSON.stringify({ title: newLesson.trim() }) });
    const d = await res.json();
    if (d.lessons) {
      const updated = { ...selected, lessons: d.lessons };
      setSelected(updated);
      setRoadmaps(prev => prev.map(r => r.id === selected.id ? updated : r));
      setNewLesson("");
    }
    setAddingLesson(false);
  }

  async function toggleLesson(lesson) {
    const res = await fetch(`${API}/lessons/${lesson.id}`, { method: "PUT", headers: H(), body: JSON.stringify({ done: !lesson.done }) });
    const d = await res.json();
    if (d.lesson) {
      const updated = { ...selected, lessons: selected.lessons.map(l => l.id === lesson.id ? d.lesson : l) };
      setSelected(updated);
      setRoadmaps(prev => prev.map(r => r.id === selected.id ? updated : r));
      if (!lesson.done) toast_("Lesson completed! 🎉");
    }
  }

  async function deleteLesson(id) {
    const res = await fetch(`${API}/lessons/${id}`, { method: "DELETE", headers: H() });
    const d = await res.json();
    if (d.lessons) {
      const updated = { ...selected, lessons: d.lessons };
      setSelected(updated);
      setRoadmaps(prev => prev.map(r => r.id === selected.id ? updated : r));
    }
  }

  async function saveNote() {
    const res = await fetch(`${API}/lessons/${noteLesson.id}`, { method: "PUT", headers: H(), body: JSON.stringify({ notes: noteVal }) });
    const d = await res.json();
    if (d.lesson) {
      const updated = { ...selected, lessons: selected.lessons.map(l => l.id === noteLesson.id ? d.lesson : l) };
      setSelected(updated); setRoadmaps(prev => prev.map(r => r.id === selected.id ? updated : r));
      toast_("Note saved!"); setNoteLesson(null);
    }
  }

  async function saveTimer() {
    const res = await fetch(`${API}/lessons/${timerLesson.id}`, { method: "PUT", headers: H(), body: JSON.stringify({ timeSpent: (timerLesson.timeSpent || 0) + timerVal }) });
    const d = await res.json();
    if (d.lesson) {
      const updated = { ...selected, lessons: selected.lessons.map(l => l.id === timerLesson.id ? d.lesson : l) };
      setSelected(updated); setRoadmaps(prev => prev.map(r => r.id === selected.id ? updated : r));
    }
    setTimerLesson(null); setTimerVal(0);
  }

  async function saveEditLesson(id, title) {
    const res = await fetch(`${API}/lessons/${id}`, { method: "PUT", headers: H(), body: JSON.stringify({ title }) });
    const d = await res.json();
    if (d.lesson) {
      const updated = { ...selected, lessons: selected.lessons.map(l => l.id === id ? d.lesson : l) };
      setSelected(updated); setRoadmaps(prev => prev.map(r => r.id === selected.id ? updated : r));
      setEditLesson(null);
    }
  }

  const filteredLessons = selected?.lessons?.filter(l => l.title.toLowerCase().includes(search.toLowerCase())) || [];
  const doneLessons = selected?.lessons?.filter(l => l.done).length || 0;
  const totalLessons = selected?.lessons?.length || 0;
  const pct = totalLessons > 0 ? Math.round(doneLessons / totalLessons * 100) : 0;

  // Find next incomplete lesson
  const nextLesson = selected?.lessons?.find(l => !l.done);

  const inp = { padding: "11px 14px", borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, color: t.text, fontSize: 13, outline: "none", transition: "border-color .2s" };

  return (
    <div style={{ padding: "36px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} t={t} />

      {/* Rename Modal */}
      <Modal open={!!renameModal} onClose={() => setRenameModal(null)} title="Rename Roadmap" t={t}>
        <input value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => e.key === "Enter" && renameRoadmap()}
          style={{ ...inp, width: "100%", marginBottom: 14 }} autoFocus />
        <button onClick={renameRoadmap} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: t.accent, color: "#000", fontWeight: 700, fontSize: 14 }}>Save</button>
      </Modal>

      {/* Note Modal */}
      <Modal open={!!noteLesson} onClose={() => setNoteLesson(null)} title={`📝 Notes: ${noteLesson?.title}`} t={t}>
        <textarea value={noteVal} onChange={e => setNoteVal(e.target.value)} rows={6} placeholder="Write your notes here…"
          style={{ ...inp, width: "100%", resize: "vertical", fontFamily: "inherit", marginBottom: 14, display: "block" }} />
        <button onClick={saveNote} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: t.accent, color: "#000", fontWeight: 700, fontSize: 14 }}>Save Note</button>
      </Modal>

      {/* Timer Modal */}
      <Modal open={!!timerLesson} onClose={saveTimer} title={`⏱️ Timer: ${timerLesson?.title}`} t={t}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 52, fontWeight: 800, fontFamily: "'Space Mono',monospace", color: t.accent }}>
            {String(Math.floor(timerVal / 60)).padStart(2, "0")}:{String(timerVal % 60).padStart(2, "0")}
          </div>
          <p style={{ color: t.muted, fontSize: 13, marginTop: 8 }}>Total: {Math.round(((timerLesson?.timeSpent || 0) + timerVal) / 60)} min</p>
        </div>
        <button onClick={saveTimer} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: t.accent, color: "#000", fontWeight: 700, fontSize: 14 }}>Stop & Save</button>
      </Modal>

      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🗺️ My Roadmaps</h1>
        <p style={{ color: t.muted, marginTop: 4, fontSize: 13 }}>Create and track your custom learning paths</p>
      </div>

      {/* Create Roadmap */}
      <div className="fu1" style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && createRoadmap()}
          placeholder="New roadmap title… e.g. 'Frontend Dev 2026'"
          style={{ ...inp, flex: 1, minWidth: 0, padding: "12px 16px" }}
          onFocus={e => e.target.style.borderColor = t.accent}
          onBlur={e => e.target.style.borderColor = t.border} />
        <button onClick={createRoadmap} disabled={creating} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: t.accent, color: "#000", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {creating ? "…" : "+ Create"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "280px 1fr" : "1fr", gap: 20 }} className={selected ? "" : "g3"}>
        {/* Roadmap List */}
        <div>
          <div style={{ color: t.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Space Mono',monospace" }}>
            {loading ? "LOADING…" : `${roadmaps.length} ROADMAP${roadmaps.length !== 1 ? "S" : ""}`}
          </div>
          {!loading && roadmaps.map((r, i) => {
            const d = r.lessons.filter(l => l.done).length;
            const p = r.lessons.length > 0 ? Math.round(d / r.lessons.length * 100) : 0;
            const isSelected = selected?.id === r.id;
            return (
              <div key={r.id} style={{ background: isSelected ? t.accentDim : t.card, border: `1px solid ${isSelected ? t.accent + "60" : t.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, cursor: "pointer", transition: "all .2s", animation: `fu .35s ${i * .05}s both` }}
                onClick={() => { setSelected(r); setSearch(""); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: isSelected ? t.accent : t.text, flex: 1, marginRight: 8 }}>{r.title}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setRenameModal(r); setRenameVal(r.title); }}
                      style={{ background: "none", border: "none", color: t.muted, fontSize: 13, padding: "2px 5px" }}>✏️</button>
                    <button onClick={e => { e.stopPropagation(); deleteRoadmap(r.id); }}
                      style={{ background: "none", border: "none", color: t.danger, fontSize: 13, padding: "2px 5px" }}>🗑️</button>
                  </div>
                </div>
                <Progress value={d} max={r.lessons.length} color={p === 100 ? t.accent : t.blue} t={t} height={4} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ color: t.muted, fontSize: 11 }}>{d}/{r.lessons.length} lessons</span>
                  <span style={{ color: p === 100 ? t.accent : t.muted, fontSize: 11, fontWeight: 700 }}>{p}%</span>
                </div>
              </div>
            );
          })}
          {!loading && roadmaps.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: t.muted }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🗺️</div>
              <p style={{ fontSize: 13 }}>No roadmaps yet. Create your first above!</p>
            </div>
          )}
        </div>

        {/* Lesson Detail */}
        {selected && (
          <div>
            {/* Header */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>{selected.title}</h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {nextLesson && (
                    <button onClick={() => toggleLesson(nextLesson)} style={{ background: t.blue, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
                      ▶️ Continue: {nextLesson.title.length > 20 ? nextLesson.title.slice(0, 20) + "…" : nextLesson.title}
                    </button>
                  )}
                  <span style={{ color: t.accent, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{pct}%</span>
                </div>
              </div>
              <Progress value={doneLessons} max={totalLessons} t={t} />
              <p style={{ color: t.muted, fontSize: 12, marginTop: 6 }}>{doneLessons} of {totalLessons} lessons completed</p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search lessons…"
                style={{ ...inp, width: "100%", padding: "10px 14px" }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.border} />
            </div>

            {/* Add Lesson */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={newLesson} onChange={e => setNewLesson(e.target.value)} onKeyDown={e => e.key === "Enter" && addLesson()}
                placeholder="Add a lesson… e.g. 'Flexbox Layout'"
                style={{ ...inp, flex: 1, minWidth: 0 }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.border} />
              <button onClick={addLesson} disabled={addingLesson} style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: t.accent, color: "#000", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {addingLesson ? "…" : "+ Add"}
              </button>
            </div>

            {/* Lessons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredLessons.map((l, i) => (
                <div key={l.id} style={{
                  background: t.card, border: `1px solid ${l.done ? t.accent + "40" : t.border}`,
                  borderLeft: `3px solid ${l.done ? t.accent : t.border}`,
                  borderRadius: 10, padding: "11px 14px",
                  animation: `fu .3s ${i * .03}s both`, transition: "all .2s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => toggleLesson(l)} style={{ background: "none", border: "none", fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
                      {l.done ? "✅" : "⬜"}
                    </button>
                    {editLesson === l.id ? (
                      <input defaultValue={l.title} autoFocus
                        onKeyDown={e => { if (e.key === "Enter") saveEditLesson(l.id, e.target.value); if (e.key === "Escape") setEditLesson(null); }}
                        onBlur={e => saveEditLesson(l.id, e.target.value)}
                        style={{ ...inp, flex: 1, padding: "4px 10px", fontSize: 13 }} />
                    ) : (
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: l.done ? t.muted : t.text, textDecoration: l.done ? "line-through" : "none" }}
                        onDoubleClick={() => setEditLesson(l.id)} title="Double-click to edit">
                        {l.title}
                      </span>
                    )}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {l.timeSpent > 0 && <span style={{ color: t.muted, fontSize: 11, padding: "2px 6px", background: t.bg, borderRadius: 6 }}>⏱️ {Math.round(l.timeSpent / 60)}m</span>}
                      {l.notes && <span style={{ color: t.blue, fontSize: 11, padding: "2px 6px", background: t.accentDim, borderRadius: 6 }}>📝</span>}
                      <button onClick={() => { setTimerLesson(l); setTimerVal(0); }} title="Start timer"
                        style={{ background: "none", border: "none", color: t.muted, fontSize: 13, padding: "2px 4px" }}>⏱️</button>
                      <button onClick={() => { setNoteLesson(l); setNoteVal(l.notes || ""); }} title="Add note"
                        style={{ background: "none", border: "none", color: t.muted, fontSize: 13, padding: "2px 4px" }}>📝</button>
                      <button onClick={() => deleteLesson(l.id)} title="Delete"
                        style={{ background: "none", border: "none", color: t.danger, fontSize: 13, padding: "2px 4px", opacity: .5 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = ".5"}>✕</button>
                    </div>
                  </div>
                  {l.notes && editLesson !== l.id && (
                    <div style={{ marginTop: 8, padding: "8px 10px", background: t.bg, borderRadius: 8, fontSize: 12, color: t.muted, borderLeft: `2px solid ${t.blue}` }}>
                      📝 {l.notes}
                    </div>
                  )}
                </div>
              ))}
              {filteredLessons.length === 0 && search && (
                <p style={{ color: t.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No lessons match "{search}"</p>
              )}
              {totalLessons === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: t.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
                  <p style={{ fontSize: 13 }}>No lessons yet. Add your first above!</p>
                </div>
              )}
            </div>
            <p style={{ color: t.muted, fontSize: 11, marginTop: 10 }}>💡 Double-click a lesson to rename · ⏱️ Timer · 📝 Notes</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SKILLS PAGE ───────────────────────────────
function SkillsPage({ t }) {
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetch(API + "/skills", { headers: H() }).then(r => r.json()).then(d => { if (Array.isArray(d)) setSkills(d); setLoading(false); }); }, []);

  async function add() {
    if (!input.trim()) return; setAdding(true);
    const res = await fetch(API + "/skills", { method: "POST", headers: H(), body: JSON.stringify({ skill: input.trim() }) });
    const d = await res.json();
    if (d.skills) setSkills(d.skills);
    setInput(""); setAdding(false);
  }

  async function del(id) {
    const res = await fetch(`${API}/skills/${id}`, { method: "DELETE", headers: H() });
    const d = await res.json();
    if (d.skills) setSkills(d.skills);
  }

  const inp = { padding: "12px 16px", borderRadius: 12, background: t.card, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, outline: "none", transition: "border-color .2s" };

  return (
    <div style={{ padding: "36px 20px", maxWidth: 700, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🧠 Skills Library</h1>
        <p style={{ color: t.muted, marginTop: 4, fontSize: 13 }}>Your private skill collection</p>
      </div>
      <div className="fu1" style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Add a skill…"
          style={{ ...inp, flex: 1, minWidth: 0 }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
        <button onClick={add} disabled={adding} style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: t.accent, color: "#000", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{adding ? "…" : "+ Add"}</button>
      </div>
      <div style={{ color: t.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Space Mono',monospace" }}>
        {loading ? "LOADING…" : `${skills.length} SKILL${skills.length !== 1 ? "S" : ""}`}
      </div>
      {!loading && skills.map((sk, i) => (
        <div key={sk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card, border: `1px solid ${t.border}`, borderLeft: `3px solid ${t.accent}`, borderRadius: 12, padding: "12px 16px", marginBottom: 7, animation: `fu .3s ${i * .04}s both`, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.transform = "translateX(4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.borderLeftColor = t.accent; e.currentTarget.style.transform = "none"; }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: t.accent, fontWeight: 800, fontSize: 15 }}>✓</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{sk.name}</span>
          </div>
          <button onClick={() => del(sk.id)} style={{ background: "none", border: `1px solid ${t.danger}40`, color: t.danger, padding: "4px 12px", borderRadius: 8, fontSize: 12, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = t.danger; }}>Delete</button>
        </div>
      ))}
      {!loading && skills.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 0", color: t.muted }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🧠</div>
          <p>No skills yet! Add your first above.</p>
        </div>
      )}
    </div>
  );
}

// ── ACHIEVEMENTS PAGE ─────────────────────────
function AchievementsPage({ t }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => { fetch(API + "/achievements", { headers: H() }).then(r => r.json()).then(d => { if (Array.isArray(d)) setAchievements(d); }); }, []);

  const allBadges = [
    { type: "JOINED", label: "Joined Nexus!", icon: "🚀", desc: "Created your account" },
    { type: "FIRST_LESSON", label: "First Lesson!", icon: "🎯", desc: "Completed your first lesson" },
    { type: "TEN_LESSONS", label: "10 Lessons!", icon: "📚", desc: "Completed 10 lessons" },
    { type: "FIFTY_LESSONS", label: "50 Lessons!", icon: "🔥", desc: "Completed 50 lessons" },
    { type: "ROADMAP_COMPLETE", label: "Roadmap Done!", icon: "🏆", desc: "Completed a full roadmap" },
    { type: "STREAK_7", label: "7 Day Streak!", icon: "⚡", desc: "Logged in 7 days in a row" },
    { type: "STREAK_30", label: "30 Day Streak!", icon: "💎", desc: "Logged in 30 days in a row" },
    { type: "PROFILE_COMPLETE", label: "Profile Complete!", icon: "✨", desc: "Filled all profile fields" },
  ];

  const earned = achievements.map(a => a.type);

  return (
    <div style={{ padding: "36px 20px", maxWidth: 900, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🏅 Achievements</h1>
        <p style={{ color: t.muted, marginTop: 4, fontSize: 13 }}>{earned.length} of {allBadges.length} badges earned</p>
      </div>
      <Progress value={earned.length} max={allBadges.length} t={t} height={8} />
      <p style={{ color: t.muted, fontSize: 12, marginTop: 8, marginBottom: 24 }}>{Math.round(earned.length / allBadges.length * 100)}% complete</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
        {allBadges.map((b, i) => {
          const isEarned = earned.includes(b.type);
          const earnedData = achievements.find(a => a.type === b.type);
          return (
            <div key={b.type} style={{ background: t.card, border: `1px solid ${isEarned ? t.accent + "60" : t.border}`, borderRadius: 16, padding: 20, textAlign: "center", animation: `fu .4s ${i * .06}s both`, opacity: isEarned ? 1 : .45, transition: "all .3s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => isEarned && (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              {isEarned && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 12, color: t.accent }}>✓</div>}
              <div style={{ fontSize: 40, marginBottom: 10, filter: isEarned ? "none" : "grayscale(1)" }}>{b.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: isEarned ? t.accent : t.muted }}>{b.label}</div>
              <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5 }}>{b.desc}</div>
              {isEarned && earnedData && (
                <div style={{ marginTop: 10, fontSize: 11, color: t.muted }}>{new Date(earnedData.earnedAt).toLocaleDateString()}</div>
              )}
              {!isEarned && <div style={{ marginTop: 10, fontSize: 11, color: t.muted }}>🔒 Locked</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────
function ProfilePage({ user, onUpdate, t }) {
  const fileRef = useRef();
  const nav = useNavigate();
  const [profile, setProfile] = useState(user);
  const [ef, setEf] = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "", dailyGoal: user?.dailyGoal || 2 });
  const [pwf, setPwf] = useState({ cur: "", nw: "", conf: "" });
  const [emf, setEmf] = useState({ newEmail: "", password: "" });
  const [delf, setDelf] = useState({ password: "" });
  const [photoLoad, setPhotoLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [tab, setTab] = useState("info");
  const [showDel, setShowDel] = useState(false);

  function tk(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), 3500); }

  useEffect(() => { fetch(API + "/me", { headers: H() }).then(r => r.json()).then(d => { if (d.id) { setProfile(d); setEf({ name: d.name || "", phone: d.phone || "", bio: d.bio || "", dailyGoal: d.dailyGoal || 2 }); } }); }, []);

  async function saveInfo() {
    setSaving(true);
    const res = await fetch(API + "/me", { method: "PUT", headers: H(), body: JSON.stringify(ef) });
    const d = await res.json();
    if (d.error) tk(d.error, "error");
    else { setProfile(d.user); localStorage.setItem("token", d.token); onUpdate(d.user); tk("Profile updated!"); }
    setSaving(false);
  }

  async function uploadPhoto(e) {
    const file = e.target.files[0]; if (!file) return;
    setPhotoLoad(true);
    const fd = new FormData(); fd.append("photo", file);
    const res = await fetch(API + "/me/photo", { method: "POST", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, body: fd });
    const d = await res.json();
    if (d.error) tk(d.error, "error");
    else { setProfile(d.user); localStorage.setItem("token", d.token); onUpdate(d.user); tk("Photo updated!"); }
    setPhotoLoad(false);
  }

  async function changePw() {
    if (pwf.nw !== pwf.conf) { tk("Passwords don't match!", "error"); return; }
    if (pwf.nw.length < 6) { tk("Min 6 chars", "error"); return; }
    setSaving(true);
    const res = await fetch(API + "/change-password", { method: "PUT", headers: H(), body: JSON.stringify({ currentPassword: pwf.cur, newPassword: pwf.nw }) });
    const d = await res.json();
    if (d.error) tk(d.error, "error"); else { tk("Password changed!"); setPwf({ cur: "", nw: "", conf: "" }); }
    setSaving(false);
  }

  async function changeEmail() {
    setSaving(true);
    const res = await fetch(API + "/change-email", { method: "PUT", headers: H(), body: JSON.stringify(emf) });
    const d = await res.json();
    if (d.error) tk(d.error, "error");
    else { setProfile(d.user); localStorage.setItem("token", d.token); onUpdate(d.user); tk("Email updated!"); setEmf({ newEmail: "", password: "" }); }
    setSaving(false);
  }

  async function delAccount() {
    setSaving(true);
    const res = await fetch(API + "/me", { method: "DELETE", headers: H(), body: JSON.stringify({ password: delf.password }) });
    const d = await res.json();
    if (d.error) { tk(d.error, "error"); setSaving(false); return; }
    localStorage.clear(); onUpdate(null); nav("/auth");
  }

  const inp = { width: "100%", padding: "12px 15px", borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, outline: "none", transition: "border-color .2s" };
  const fo = e => e.target.style.borderColor = t.accent;
  const bl = e => e.target.style.borderColor = t.border;

  const tabs = [
    { id: "info", label: "👤 Info" },
    { id: "security", label: "🔒 Security" },
    { id: "account", label: "📧 Account" },
    ...(profile?.role !== "admin" ? [{ id: "danger", label: "⚠️ Danger" }] : [])
  ];

  return (
    <div style={{ padding: "36px 20px", maxWidth: 640, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} t={t} />
      <Modal open={showDel} onClose={() => setShowDel(false)} title="⚠️ Delete Account" t={t}>
        <p style={{ color: t.muted, fontSize: 13, marginBottom: 18, lineHeight: 1.7 }}>This will <strong style={{ color: t.danger }}>permanently delete</strong> your account and all data. Cannot be undone.</p>
        <Pw placeholder="Enter password to confirm" value={delf.password} onChange={e => setDelf({ password: e.target.value })} s={inp} />
        <button onClick={delAccount} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: t.danger, color: "#fff", fontWeight: 800, fontSize: 14 }}>
          {saving ? "Deleting…" : "Delete My Account"}
        </button>
      </Modal>

      {/* Header */}
      <div className="fu" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: 26, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Av u={profile} size={72} t={t} />
            <button onClick={() => fileRef.current.click()} disabled={photoLoad}
              style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: t.accent, border: `2px solid ${t.card}`, color: "#000", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photoLoad ? "…" : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>{profile?.name}</h1>
            <p style={{ color: t.muted, fontSize: 13, marginBottom: 8 }}>{profile?.email}</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <span style={{ background: profile?.role === "admin" ? t.yellow + "25" : t.accentDim, color: profile?.role === "admin" ? t.yellow : t.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>{profile?.role?.toUpperCase()}</span>
              {profile?.streak > 0 && <span style={{ background: "#ff700020", color: t.orange, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>🔥 {profile.streak} streak</span>}
              {profile?.phone && <span style={{ background: t.accentDim, color: t.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11 }}>📱 {profile.phone}</span>}
            </div>
          </div>
        </div>
        {profile?.bio && <p style={{ color: t.muted, fontSize: 13, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}`, lineHeight: 1.7 }}>{profile.bio}</p>}
      </div>

      {/* Tabs */}
      <div className="fu1" style={{ display: "flex", background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 4, marginBottom: 18, gap: 3 }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex: 1, padding: "8px 4px", border: "none", borderRadius: 8, background: tab === tb.id ? (tb.id === "danger" ? t.danger : t.accent) : "transparent", color: tab === tb.id ? (tb.id === "danger" ? "#fff" : "#000") : t.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", transition: "all .2s" }}>{tb.label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div className="fu2" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Edit Profile</h2>
          {[{ label: "Full Name", key: "name", type: "text", ph: "Your full name" }, { label: "Phone", key: "phone", type: "tel", ph: "+91 9999999999" }].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ color: t.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>{f.label}</label>
              <input type={f.type} value={ef[f.key]} onChange={e => setEf({ ...ef, [f.key]: e.target.value })} placeholder={f.ph} style={inp} onFocus={fo} onBlur={bl} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: t.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Bio</label>
            <textarea value={ef.bio} onChange={e => setEf({ ...ef, bio: e.target.value })} placeholder="Tell us about yourself…" rows={3}
              style={{ ...inp, resize: "vertical", fontFamily: "inherit", display: "block" }} onFocus={fo} onBlur={bl} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: t.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Daily Goal (lessons per day)</label>
            <select value={ef.dailyGoal} onChange={e => setEf({ ...ef, dailyGoal: parseInt(e.target.value) })}
              style={{ ...inp, background: t.input }}>
              {[1, 2, 3, 5, 7, 10].map(n => <option key={n} value={n}>{n} lesson{n !== 1 ? "s" : ""}</option>)}
            </select>
          </div>
          <button onClick={saveInfo} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: saving ? t.muted : t.accent, color: "#000", fontWeight: 800, fontSize: 14 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

      {tab === "security" && (
        <div className="fu2" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🔒 Change Password</h2>
          {[{ label: "Current Password", key: "cur", ph: "Current password" }, { label: "New Password", key: "nw", ph: "Min 6 characters" }, { label: "Confirm Password", key: "conf", ph: "Repeat new password" }].map(f => (
            <div key={f.key}>
              <label style={{ color: t.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>{f.label}</label>
              <Pw placeholder={f.ph} value={pwf[f.key]} onChange={e => setPwf({ ...pwf, [f.key]: e.target.value })} s={inp} />
            </div>
          ))}
          <button onClick={changePw} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: saving ? t.muted : t.accent, color: "#000", fontWeight: 800, fontSize: 14 }}>
            {saving ? "Changing…" : "Change Password"}
          </button>
        </div>
      )}

      {tab === "account" && (
        <div className="fu2" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>📧 Change Email</h2>
          <p style={{ color: t.muted, fontSize: 12, marginBottom: 18, lineHeight: 1.7 }}>Confirm your password to change email address.</p>
          <div style={{ ...inp, color: t.muted, marginBottom: 16, borderStyle: "dashed", display: "flex", alignItems: "center" }}>{profile?.email}</div>
          <div style={{ marginBottom: 14 }}>
            <input placeholder="New email address" type="email" value={emf.newEmail} onChange={e => setEmf({ ...emf, newEmail: e.target.value })} style={inp} onFocus={fo} onBlur={bl} />
          </div>
          <Pw placeholder="Confirm with your password" value={emf.password} onChange={e => setEmf({ ...emf, password: e.target.value })} s={inp} />
          <button onClick={changeEmail} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: saving ? t.muted : t.blue, color: "#fff", fontWeight: 800, fontSize: 14, marginTop: 4 }}>
            {saving ? "Updating…" : "Update Email"}
          </button>
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${t.border}` }}>
            {[{ l: "Member Since", v: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "2026" }, { l: "Account Type", v: profile?.role }, { l: "Plan", v: "Free" }].map(f => (
              <div key={f.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ color: t.muted, fontSize: 13 }}>{f.l}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "danger" && profile?.role !== "admin" && (
        <div className="fu2" style={{ background: t.card, border: `1px solid ${t.danger}40`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: t.danger }}>⚠️ Danger Zone</h2>
          <p style={{ color: t.muted, fontSize: 13, marginBottom: 22, lineHeight: 1.7 }}>Permanently delete your account and all data. <strong style={{ color: t.danger }}>Cannot be undone.</strong></p>
          <button onClick={() => setShowDel(true)} style={{ width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${t.danger}`, background: "transparent", color: t.danger, fontWeight: 800, fontSize: 14, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.danger; }}>
            🗑️ Delete My Account
          </button>
        </div>
      )}
    </div>
  );
}

// ── ADMIN PAGE ────────────────────────────────
function AdminPage({ t }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [ef, setEf] = useState({});
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [saving, setSaving] = useState(false);

  function tk(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), 3000); }

  useEffect(() => {
    Promise.all([
      fetch(API + "/admin/users", { headers: H() }).then(r => r.json()),
      fetch(API + "/admin/stats", { headers: H() }).then(r => r.json())
    ]).then(([u, s]) => {
      if (Array.isArray(u)) setUsers(u);
      if (s?.totalUsers !== undefined) setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function delUser(id) {
    if (!window.confirm("Delete user and all their data?")) return;
    const res = await fetch(`${API}/admin/users/${id}`, { method: "DELETE", headers: H() });
    const d = await res.json();
    if (d.users) { setUsers(d.users); tk("User deleted!"); } else tk(d.error, "error");
  }

  async function saveUser() {
    setSaving(true);
    const res = await fetch(`${API}/admin/users/${editUser.id}`, { method: "PUT", headers: H(), body: JSON.stringify(ef) });
    const d = await res.json();
    if (d.error) tk(d.error, "error");
    else { setUsers(prev => prev.map(u => u.id === editUser.id ? d.user : u)); tk("Updated!"); setEditUser(null); }
    setSaving(false);
  }

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, outline: "none", marginBottom: 12 };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: t.muted }}><div style={{ fontSize: 48, animation: "pulse 1s infinite" }}>⚡</div><p style={{ marginTop: 14 }}>Loading…</p></div>;

  return (
    <div style={{ padding: "36px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} t={t} />
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit: ${editUser?.name}`} t={t}>
        <input placeholder="Name" value={ef.name || ""} onChange={e => setEf({ ...ef, name: e.target.value })} style={inp} />
        <input placeholder="Email" type="email" value={ef.email || ""} onChange={e => setEf({ ...ef, email: e.target.value })} style={inp} />
        <input placeholder="Phone" value={ef.phone || ""} onChange={e => setEf({ ...ef, phone: e.target.value })} style={inp} />
        <select value={ef.role || "user"} onChange={e => setEf({ ...ef, role: e.target.value })} style={{ ...inp, background: t.input, color: t.text }}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={saveUser} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: t.accent, color: "#000", fontWeight: 800, fontSize: 14 }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </Modal>

      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>⚡ Admin Panel</h1>
        <p style={{ color: t.muted, marginTop: 4, fontSize: 13 }}>Platform management and analytics</p>
      </div>

      {stats && (
        <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 24 }}>
          <Stat label="Users" value={stats.totalUsers} color={t.blue} icon="👥" cls="fu1" t={t} />
          <Stat label="Roadmaps" value={stats.totalRoadmaps} color={t.accent} icon="🗺️" cls="fu2" t={t} />
          <Stat label="Lessons" value={stats.totalLessons} color={t.purple} icon="📚" cls="fu3" t={t} />
          <Stat label="Completed" value={stats.doneLessons} color={t.orange} icon="✅" cls="fu4" t={t} />
          <Stat label="Skills" value={stats.totalSkills} color={t.yellow} icon="🧠" cls="fu5" t={t} />
          <Stat label="Admins" value={stats.adminCount} color={t.danger} icon="⚡" cls="fu5" t={t} />
        </div>
      )}

      <div className="fu2" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>👥 All Users</h2>
          <span style={{ color: t.muted, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{users.length} TOTAL</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.bg }}>
                {["User", "Email", "Role", "Roadmaps", "Skills", "Streak", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: t.muted, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${t.border}`, transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = t.accentDim}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Av u={u} size={28} t={t} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: t.muted, fontSize: 12 }}>{u.email}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: u.role === "admin" ? t.yellow + "25" : t.accentDim, color: u.role === "admin" ? t.yellow : t.accent, borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{u._count?.roadmaps || 0}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{u._count?.skills || 0}</td>
                  <td style={{ padding: "12px 14px", color: u.streak > 0 ? t.orange : t.muted, fontSize: 13, fontWeight: u.streak > 0 ? 700 : 400 }}>{u.streak > 0 ? `🔥 ${u.streak}` : "—"}</td>
                  <td style={{ padding: "12px 14px", color: t.muted, fontSize: 11, whiteSpace: "nowrap" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => { setEditUser(u); setEf({ name: u.name, email: u.email, phone: u.phone || "", role: u.role }); }}
                        style={{ background: t.accentDim, border: `1px solid ${t.accent}40`, color: t.accent, padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700 }}>Edit</button>
                      {u.role !== "admin" && (
                        <button onClick={() => delUser(u.id)} style={{ background: "none", border: `1px solid ${t.danger}40`, color: t.danger, padding: "4px 9px", borderRadius: 7, fontSize: 11, transition: "all .2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = t.danger; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = t.danger; }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stats?.recentUsers?.length > 0 && (
        <div className="fu3" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🕐 Recent Signups</h2>
          {stats.recentUsers.map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Av u={u} size={28} t={t} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {u.streak > 0 && <span style={{ color: t.orange, fontSize: 12, fontWeight: 700 }}>🔥 {u.streak}</span>}
                <span style={{ color: t.muted, fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? themes.dark : themes.light;

  function upd(u) { setUser(u); if (u) localStorage.setItem("user", JSON.stringify(u)); else { localStorage.removeItem("user"); localStorage.removeItem("token"); } }

  return (
    <BrowserRouter>
      <G t={t} />
      {user && <Navbar user={user} onLogout={() => upd(null)} t={t} toggle={() => setIsDark(!isDark)} isDark={isDark} />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage onLogin={u => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} t={t} />} />
        <Route path="/" element={user ? <HomePage user={user} t={t} /> : <Navigate to="/auth" />} />
        <Route path="/dashboard" element={user ? <DashboardPage t={t} /> : <Navigate to="/auth" />} />
        <Route path="/roadmaps" element={user ? <RoadmapsPage t={t} /> : <Navigate to="/auth" />} />
        <Route path="/skills" element={user ? <SkillsPage t={t} /> : <Navigate to="/auth" />} />
        <Route path="/achievements" element={user ? <AchievementsPage t={t} /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} onUpdate={upd} t={t} /> : <Navigate to="/auth" />} />
        <Route path="/admin" element={user?.role === "admin" ? <AdminPage t={t} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}