import { useState, useEffect, useCallback, useRef } from "react";
import {
  BrowserRouter, Routes, Route, Link,
  Navigate, useNavigate, useLocation
} from "react-router-dom";

const API = "https://nexus-backend-zrx2.onrender.com";

// ── THEMES ────────────────────────────────────
const themes = {
  dark: {
    bg: "#080810", card: "#0e0e1a", border: "#1a1a2e",
    text: "#e2e8f0", muted: "#4a5568", accent: "#00ff88",
    accentDim: "#00ff8812", danger: "#ff4757", blue: "#4facfe",
    purple: "#a78bfa", yellow: "#fbbf24", navbar: "#06060f",
    input: "#080810", shadow: "0 8px 32px rgba(0,0,0,0.4)"
  },
  light: {
    bg: "#f0f4f8", card: "#ffffff", border: "#e2e8f0",
    text: "#1a202c", muted: "#718096", accent: "#00a86b",
    accentDim: "#00a86b12", danger: "#e53e3e", blue: "#3182ce",
    purple: "#805ad5", yellow: "#d69e2e", navbar: "#ffffff",
    input: "#f7fafc", shadow: "0 8px 32px rgba(0,0,0,0.08)"
  }
};

// ── GLOBAL STYLES ─────────────────────────────
const GlobalStyle = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior: smooth; }
    body { background:${theme.bg}; color:${theme.text}; font-family:'DM Sans',sans-serif; transition:background 0.3s,color 0.3s; min-height:100vh; }
    a { color:inherit; text-decoration:none; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:${theme.bg}; }
    ::-webkit-scrollbar-thumb { background:${theme.accent}; border-radius:2px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0}to{opacity:1} }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
    @keyframes glow { 0%,100%{box-shadow:0 0 12px ${theme.accent}40}50%{box-shadow:0 0 28px ${theme.accent}80} }
    @keyframes slideIn { from{transform:translateX(-10px);opacity:0}to{transform:translateX(0);opacity:1} }
    .fu  { animation:fadeUp 0.5s ease both; }
    .fu1 { animation:fadeUp 0.5s 0.08s ease both; }
    .fu2 { animation:fadeUp 0.5s 0.16s ease both; }
    .fu3 { animation:fadeUp 0.5s 0.24s ease both; }
    .fu4 { animation:fadeUp 0.5s 0.32s ease both; }
    .fu5 { animation:fadeUp 0.5s 0.40s ease both; }
    input,select,button,textarea { font-family:'DM Sans',sans-serif; }
    button { cursor:pointer; }
    @media(max-width:768px){ .hide-mobile{display:none!important} }
    @media(min-width:769px){ .show-mobile{display:none!important} }
    @media(max-width:600px){
      .grid-4{grid-template-columns:repeat(2,1fr)!important}
      .grid-3{grid-template-columns:1fr!important}
    }
  `}</style>
);

// ── HELPERS ───────────────────────────────────
function getHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

function Avatar({ user, size = 40, theme }) {
  const fontSize = size * 0.38;
  if (user?.photo) return (
    <img src={user.photo} alt={user.name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${theme.accent}40` }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${theme.accent},${theme.blue})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize, fontWeight: 700, color: "#000"
    }}>{user?.name?.[0]?.toUpperCase() || "?"}</div>
  );
}

function StatCard({ label, value, color, icon, cls = "fu", theme }) {
  return (
    <div className={cls} style={{
      background: theme.card, border: `1px solid ${theme.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: "20px 22px",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 12, right: 14, fontSize: 30, opacity: 0.1 }}>{icon}</div>
      <div style={{ color: theme.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>{label}</div>
      <div style={{ color, fontSize: 32, fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>{value}</div>
    </div>
  );
}

function Toast({ msg, type, theme }) {
  if (!msg) return null;
  const bg = type === "error" ? theme.danger : theme.accent;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: type === "error" ? "#fff" : "#000",
      padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
      boxShadow: `0 8px 24px ${bg}60`, animation: "slideIn 0.3s ease",
      maxWidth: 320
    }}>{type === "error" ? "❌" : "✅"} {msg}</div>
  );
}

function Modal({ open, onClose, title, children, theme }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: theme.card, border: `1px solid ${theme.border}`,
        borderRadius: 18, padding: 32, width: "100%", maxWidth: 440,
        animation: "fadeUp 0.3s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.muted, fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────
function Navbar({ user, onLogout, theme, toggleTheme, isDark, onUserUpdate }) {
  const loc = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/skills", label: "Skills" },
    { to: "/profile", label: "Profile" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "⚡ Admin" }] : [])
  ];
  return (
    <nav style={{
      background: theme.navbar, borderBottom: `1px solid ${theme.border}`,
      padding: "0 20px", height: 62, display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(12px)"
    }}>
      <span style={{ fontFamily: "'Space Mono',monospace", color: theme.accent, fontSize: 18, letterSpacing: 5, fontWeight: 700 }}>NEXUS</span>

      <div className="hide-mobile" style={{ display: "flex", gap: 2 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            fontSize: 13, padding: "7px 14px", borderRadius: 8, fontWeight: 500,
            color: loc.pathname === l.to ? theme.accent : theme.muted,
            background: loc.pathname === l.to ? theme.accentDim : "transparent",
            transition: "all 0.2s"
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={toggleTheme} style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 8, padding: "6px 10px", fontSize: 15, color: theme.text
        }}>{isDark ? "☀️" : "🌙"}</button>

        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 10, background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 10, padding: "5px 12px" }}>
          <Avatar user={user} size={28} theme={theme} />
          <div className="hide-mobile" style={{ lineHeight: 1.3 }}>
            <div style={{ color: theme.text, fontSize: 12, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ color: theme.accent, fontSize: 10, letterSpacing: 1 }}>{user?.role?.toUpperCase()}</div>
          </div>
        </Link>

        <button onClick={onLogout} style={{
          background: "none", border: `1px solid ${theme.danger}60`, color: theme.danger,
          padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.danger; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = theme.danger; }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

// ── AUTH PAGE ─────────────────────────────────
function AuthPage({ onLogin, theme }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    if (tab === "register" && !form.name) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(API + (tab === "login" ? "/login" : "/register"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user); navigate("/");
      }
    } catch { setError("Cannot reach server. It may be waking up — wait 60s and try again."); }
    setLoading(false);
  }

  const inp = {
    width: "100%", padding: "13px 16px", borderRadius: 10,
    background: theme.input, border: `1px solid ${theme.border}`,
    color: theme.text, fontSize: 14, outline: "none", marginBottom: 12, transition: "border-color 0.2s"
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${theme.accent}08 0%,transparent 65%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div className="fu" style={{ width: "100%", maxWidth: 420, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 22, padding: "40px 36px", boxShadow: theme.shadow }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", color: theme.accent, fontSize: 30, letterSpacing: 8, fontWeight: 700 }}>NEXUS</div>
          <div style={{ color: theme.muted, fontSize: 10, letterSpacing: 4, marginTop: 6 }}>CORE SAAS PLATFORM</div>
        </div>

        <div style={{ display: "flex", background: theme.bg, borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
              flex: 1, padding: "10px", border: "none", borderRadius: 8,
              background: tab === t ? theme.accent : "transparent",
              color: tab === t ? "#000" : theme.muted,
              fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: "all 0.25s"
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        {tab === "register" && (
          <input placeholder="Full Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent}
            onBlur={e => e.target.style.borderColor = theme.border} />
        )}
        <input placeholder="Email address" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} style={inp}
          onFocus={e => e.target.style.borderColor = theme.accent}
          onBlur={e => e.target.style.borderColor = theme.border}
          onKeyDown={e => e.key === "Enter" && submit()} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} style={inp}
          onFocus={e => e.target.style.borderColor = theme.accent}
          onBlur={e => e.target.style.borderColor = theme.border}
          onKeyDown={e => e.key === "Enter" && submit()} />

        {tab === "register" && (
          <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: theme.accent, lineHeight: 1.6 }}>
            💡 <strong>First person to register becomes Admin.</strong> All others are regular users.
          </div>
        )}

        {error && (
          <div style={{ background: "#ff475715", border: `1px solid ${theme.danger}40`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: theme.danger, lineHeight: 1.5 }}>
            ❌ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: loading ? theme.muted : theme.accent,
          color: "#000", fontSize: 14, fontWeight: 700, letterSpacing: 1,
          cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s"
        }}>
          {loading ? "⏳ Please wait..." : tab === "login" ? "▶  LOGIN" : "▶  CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────
function HomePage({ user, theme }) {
  const cards = [
    { title: "Skills Tracker", desc: "Add and manage your personal skill library", link: "/skills", color: theme.accent, icon: "🧠" },
    { title: "Dashboard", desc: "Analytics, roadmap and learning progress", link: "/dashboard", color: theme.blue, icon: "📊" },
    { title: "My Profile", desc: "Edit your profile, photo and settings", link: "/profile", color: theme.purple, icon: "👤" },
    ...(user?.role === "admin" ? [{ title: "Admin Panel", desc: "Manage all users and platform stats", link: "/admin", color: theme.yellow, icon: "⚡" }] : [])
  ];
  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 48 }}>
        <p style={{ color: theme.muted, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Space Mono',monospace" }}>Welcome back</p>
        <h1 style={{ fontSize: "clamp(26px,5vw,50px)", fontWeight: 700, lineHeight: 1.2 }}>
          Hello, <span style={{ color: theme.accent }}>{user?.name}</span> 👋
        </h1>
        <p style={{ color: theme.muted, marginTop: 12, fontSize: 15 }}>
          Logged in as <span style={{ color: theme.blue, fontWeight: 600 }}>{user?.role}</span> · Build something great today.
        </p>
      </div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
        {cards.map((c, i) => (
          <Link key={c.title} to={c.link} className={`fu${i + 1}`}>
            <div style={{
              background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16,
              padding: 28, transition: "all 0.3s", minHeight: 160, position: "relative", overflow: "hidden"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${c.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{c.icon}</div>
              <h2 style={{ color: c.color, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{c.title}</h2>
              <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.6 }}>{c.desc}</p>
              <div style={{ position: "absolute", bottom: 20, right: 20, color: c.color, fontSize: 22, opacity: 0.2 }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────
function DashboardPage({ user, theme }) {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    fetch(API + "/skills", { headers: getHeaders() })
      .then(r => r.json()).then(d => Array.isArray(d) && setSkills(d));
  }, []);

  const roadmap = [
    { l: "HTML + CSS", d: true }, { l: "JavaScript", d: true },
    { l: "React", d: true }, { l: "Node.js + Express", d: true },
    { l: "PostgreSQL + Prisma", d: true }, { l: "JWT Auth", d: true },
    { l: "React Router", d: true }, { l: "Deploy to Internet", d: true },
    { l: "Advanced Full Stack", d: true }, { l: "Profile & Photo Upload", d: true },
    { l: "AI Platform", d: false }, { l: "Ecommerce Module", d: false },
    { l: "Job Platform", d: false },
  ];
  const done = roadmap.filter(r => r.d).length;
  const pct = Math.round(done / roadmap.length * 100);

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>📊 Dashboard</h1>
        <p style={{ color: theme.muted, marginTop: 4 }}>Your personal learning analytics</p>
      </div>

      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="My Skills" value={skills.length} color={theme.accent} icon="🧠" cls="fu1" theme={theme} />
        <StatCard label="Lessons Done" value={done} color={theme.blue} icon="📚" cls="fu2" theme={theme} />
        <StatCard label="Progress" value={`${pct}%`} color={theme.purple} icon="🚀" cls="fu3" theme={theme} />
        <StatCard label="Days Active" value="2" color={theme.yellow} icon="🔥" cls="fu4" theme={theme} />
      </div>

      <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>🗺️ Learning Roadmap</h2>
          <span style={{ color: theme.accent, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{pct}% Complete</span>
        </div>
        <div style={{ background: theme.bg, borderRadius: 8, height: 8, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${theme.accent},${theme.blue})`, borderRadius: 8, transition: "width 1.2s ease" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 6 }}>
          {roadmap.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", borderRadius: 8, background: r.d ? theme.accentDim : "transparent" }}>
              <span>{r.d ? "✅" : "⬜"}</span>
              <span style={{ color: r.d ? theme.accent : theme.muted, fontSize: 13 }}>{r.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fu3" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>🧠 My Skills ({skills.length})</h2>
        {skills.length === 0
          ? <p style={{ color: theme.muted, fontSize: 14 }}>No skills yet. <Link to="/skills" style={{ color: theme.accent }}>Add your first →</Link></p>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map(s => (
              <span key={s.id} style={{ background: theme.accentDim, color: theme.accent, border: `1px solid ${theme.accent}30`, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500 }}>{s.name}</span>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

// ── SKILLS PAGE ───────────────────────────────
function SkillsPage({ theme }) {
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    fetch(API + "/skills", { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setSkills(d); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addSkill() {
    if (!input.trim()) return;
    setAdding(true);
    const res = await fetch(API + "/skills", { method: "POST", headers: getHeaders(), body: JSON.stringify({ skill: input.trim() }) });
    const data = await res.json();
    if (data.skills) setSkills(data.skills);
    setInput(""); setAdding(false);
  }

  async function deleteSkill(id) {
    const res = await fetch(`${API}/skills/${id}`, { method: "DELETE", headers: getHeaders() });
    const data = await res.json();
    if (data.skills) setSkills(data.skills);
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: 700, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>🧠 Skills Tracker</h1>
        <p style={{ color: theme.muted, marginTop: 4, fontSize: 13 }}>Your private skill library — only you can see these</p>
      </div>

      <div className="fu1" style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addSkill()}
          placeholder="Type a skill and press Enter…"
          style={{ flex: 1, padding: "13px 18px", borderRadius: 12, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, outline: "none", transition: "border-color 0.2s", minWidth: 0 }}
          onFocus={e => e.target.style.borderColor = theme.accent}
          onBlur={e => e.target.style.borderColor = theme.border} />
        <button onClick={addSkill} disabled={adding} style={{
          padding: "13px 22px", borderRadius: 12, border: "none", background: theme.accent,
          color: "#000", fontWeight: 700, fontSize: 14, flexShrink: 0, opacity: adding ? 0.6 : 1
        }}>{adding ? "…" : "+ Add"}</button>
      </div>

      <div className="fu2" style={{ color: theme.muted, fontSize: 11, marginBottom: 14, fontFamily: "'Space Mono',monospace" }}>
        {loading ? "LOADING…" : `${skills.length} SKILL${skills.length !== 1 ? "S" : ""} TRACKED`}
      </div>

      {!loading && skills.map((sk, i) => (
        <div key={sk.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: theme.card, border: `1px solid ${theme.border}`,
          borderLeft: `3px solid ${theme.accent}`, borderRadius: 12,
          padding: "13px 18px", marginBottom: 8,
          animation: `fadeUp 0.35s ${i * 0.04}s both`, transition: "border-color 0.2s,transform 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = "translateX(4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.borderLeftColor = theme.accent; e.currentTarget.style.transform = "none"; }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: theme.accent, fontWeight: 700 }}>✓</span>
            <span style={{ fontWeight: 500 }}>{sk.name}</span>
          </div>
          <button onClick={() => deleteSkill(sk.id)} style={{ background: "none", border: `1px solid ${theme.danger}40`, color: theme.danger, padding: "4px 12px", borderRadius: 8, fontSize: 12, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = theme.danger; }}>Delete</button>
        </div>
      ))}

      {!loading && skills.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: theme.muted }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
          <p>No skills yet! Add your first skill above.</p>
        </div>
      )}
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────
function ProfilePage({ user, onUserUpdate, theme }) {
  const fileRef = useRef();
  const [profile, setProfile] = useState(user);
  const [editForm, setEditForm] = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [activeTab, setActiveTab] = useState("info");

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  }

  // Load fresh profile
  useEffect(() => {
    fetch(API + "/me", { headers: getHeaders() })
      .then(r => r.json()).then(d => {
        if (d.id) { setProfile(d); setEditForm({ name: d.name || "", phone: d.phone || "", bio: d.bio || "" }); }
      });
  }, []);

  async function saveProfile() {
    setSaving(true);
    const res = await fetch(API + "/me", { method: "PUT", headers: getHeaders(), body: JSON.stringify(editForm) });
    const data = await res.json();
    if (data.error) showToast(data.error, "error");
    else {
      setProfile(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onUserUpdate(data.user);
      showToast("Profile updated!");
    }
    setSaving(false);
  }

  async function uploadPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const token = localStorage.getItem("token");
    const res = await fetch(API + "/me/photo", { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: fd });
    const data = await res.json();
    if (data.error) showToast(data.error, "error");
    else {
      setProfile(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onUserUpdate(data.user);
      showToast("Photo updated!");
    }
    setPhotoLoading(false);
  }

  async function changePassword() {
    if (pwForm.newPassword !== pwForm.confirmPassword) { showToast("Passwords don't match!", "error"); return; }
    if (pwForm.newPassword.length < 6) { showToast("Min 6 characters", "error"); return; }
    setSaving(true);
    const res = await fetch(API + "/change-password", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) });
    const data = await res.json();
    if (data.error) showToast(data.error, "error");
    else { showToast("Password changed!"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    setSaving(false);
  }

  async function changeEmail() {
    setSaving(true);
    const res = await fetch(API + "/change-email", { method: "PUT", headers: getHeaders(), body: JSON.stringify(emailForm) });
    const data = await res.json();
    if (data.error) showToast(data.error, "error");
    else {
      setProfile(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onUserUpdate(data.user);
      showToast("Email updated!");
      setEmailForm({ newEmail: "", password: "" });
    }
    setSaving(false);
  }

  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: theme.input, border: `1px solid ${theme.border}`,
    color: theme.text, fontSize: 14, outline: "none", marginBottom: 14, transition: "border-color 0.2s"
  };

  const tabs = ["info", "security", "account"];

  return (
    <div style={{ padding: "40px 20px", maxWidth: 660, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} theme={theme} />

      {/* Profile Header */}
      <div className="fu" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar + Upload */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar user={profile} size={80} theme={theme} />
            <button onClick={() => fileRef.current.click()} disabled={photoLoading} style={{
              position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%",
              background: theme.accent, border: `2px solid ${theme.card}`, color: "#000",
              fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center"
            }}>{photoLoading ? "…" : "📷"}</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{profile?.name}</h1>
            <p style={{ color: theme.muted, fontSize: 13, marginBottom: 8 }}>{profile?.email}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: profile?.role === "admin" ? theme.yellow + "25" : theme.accentDim, color: profile?.role === "admin" ? theme.yellow : theme.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                {profile?.role?.toUpperCase()}
              </span>
              {profile?.phone && <span style={{ background: theme.accentDim, color: theme.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11 }}>📱 {profile.phone}</span>}
            </div>
          </div>
        </div>

        {profile?.bio && (
          <p style={{ color: theme.muted, fontSize: 13, marginTop: 16, padding: "12px 0", borderTop: `1px solid ${theme.border}`, lineHeight: 1.6 }}>{profile.bio}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="fu1" style={{ display: "flex", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: "9px", border: "none", borderRadius: 8,
            background: activeTab === t ? theme.accent : "transparent",
            color: activeTab === t ? "#000" : theme.muted,
            fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s"
          }}>{t === "info" ? "👤 Info" : t === "security" ? "🔒 Security" : "📧 Account"}</button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Edit Profile Info</h2>
          <label style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label>
          <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <label style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Phone Number</label>
          <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+91 9999999999" style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <label style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Bio</label>
          <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="Tell us about yourself…" rows={3}
            style={{ ...inp, resize: "vertical", fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <button onClick={saveProfile} disabled={saving} style={{
            width: "100%", padding: 13, borderRadius: 10, border: "none",
            background: saving ? theme.muted : theme.accent, color: "#000", fontWeight: 700, fontSize: 14
          }}>{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === "security" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>🔒 Change Password</h2>
          <input placeholder="Current Password" type="password" value={pwForm.currentPassword}
            onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <input placeholder="New Password (min 6 chars)" type="password" value={pwForm.newPassword}
            onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <input placeholder="Confirm New Password" type="password" value={pwForm.confirmPassword}
            onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <button onClick={changePassword} disabled={saving} style={{
            width: "100%", padding: 13, borderRadius: 10, border: "none",
            background: saving ? theme.muted : theme.accent, color: "#000", fontWeight: 700, fontSize: 14
          }}>{saving ? "Changing…" : "Change Password"}</button>
        </div>
      )}

      {/* Tab: Account */}
      {activeTab === "account" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>📧 Change Email</h2>
          <p style={{ color: theme.muted, fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>Confirm your password to update your email address.</p>
          <label style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Current Email</label>
          <div style={{ ...inp, color: theme.muted, marginBottom: 14, cursor: "not-allowed", display: "flex", alignItems: "center" }}>{profile?.email}</div>
          <input placeholder="New Email Address" type="email" value={emailForm.newEmail}
            onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <input placeholder="Confirm with your Password" type="password" value={emailForm.password}
            onChange={e => setEmailForm({ ...emailForm, password: e.target.value })} style={inp}
            onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
          <button onClick={changeEmail} disabled={saving} style={{
            width: "100%", padding: 13, borderRadius: 10, border: "none",
            background: saving ? theme.muted : theme.blue, color: "#fff", fontWeight: 700, fontSize: 14
          }}>{saving ? "Updating…" : "Update Email"}</button>

          {/* Account Info */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: theme.muted }}>Account Details</h3>
            {[
              { l: "Member Since", v: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "2026" },
              { l: "Account Type", v: profile?.role },
              { l: "Plan", v: "Free" },
            ].map(f => (
              <div key={f.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ color: theme.muted, fontSize: 13 }}>{f.l}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN PAGE ────────────────────────────────
function AdminPage({ theme }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [saving, setSaving] = useState(false);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  }

  useEffect(() => {
    Promise.all([
      fetch(API + "/admin/users", { headers: getHeaders() }).then(r => r.json()),
      fetch(API + "/admin/stats", { headers: getHeaders() }).then(r => r.json())
    ]).then(([u, s]) => {
      if (Array.isArray(u)) setUsers(u);
      if (s?.totalUsers !== undefined) setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function deleteUser(id) {
    if (!window.confirm("Delete this user and all their data?")) return;
    const res = await fetch(`${API}/admin/users/${id}`, { method: "DELETE", headers: getHeaders() });
    const data = await res.json();
    if (data.users) { setUsers(data.users); showToast("User deleted!"); }
    else showToast(data.error, "error");
  }

  async function saveUser() {
    setSaving(true);
    const res = await fetch(`${API}/admin/users/${editUser.id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(editForm) });
    const data = await res.json();
    if (data.error) showToast(data.error, "error");
    else {
      setUsers(prev => prev.map(u => u.id === editUser.id ? data.user : u));
      showToast("User updated!");
      setEditUser(null);
    }
    setSaving(false);
  }

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, outline: "none", marginBottom: 12 };

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center", color: theme.muted }}>
      <div style={{ fontSize: 48, animation: "pulse 1s infinite" }}>⚡</div>
      <p style={{ marginTop: 16 }}>Loading admin data…</p>
    </div>
  );

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} theme={theme} />

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit: ${editUser?.name}`} theme={theme}>
        <input placeholder="Name" value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inp} />
        <input placeholder="Email" type="email" value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={inp} />
        <input placeholder="Phone" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={inp} />
        <select value={editForm.role || "user"} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
          style={{ ...inp, color: theme.text }}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={saveUser} disabled={saving} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: theme.accent, color: "#000", fontWeight: 700, fontSize: 14 }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </Modal>

      <div className="fu" style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>⚡ Admin Panel</h1>
        <p style={{ color: theme.muted, marginTop: 4 }}>Full platform control</p>
      </div>

      {stats && (
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Users" value={stats.totalUsers} color={theme.blue} icon="👥" cls="fu1" theme={theme} />
          <StatCard label="Total Skills" value={stats.totalSkills} color={theme.accent} icon="🧠" cls="fu2" theme={theme} />
          <StatCard label="Admins" value={stats.adminCount} color={theme.yellow} icon="⚡" cls="fu3" theme={theme} />
          <StatCard label="Regular Users" value={stats.totalUsers - stats.adminCount} color={theme.purple} icon="👤" cls="fu4" theme={theme} />
        </div>
      )}

      <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>👥 All Users</h2>
          <span style={{ color: theme.muted, fontSize: 12, fontFamily: "'Space Mono',monospace" }}>{users.length} total</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: theme.bg }}>
                {["User", "Email", "Phone", "Role", "Skills", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", color: theme.muted, fontSize: 10, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${theme.border}`, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accentDim}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar user={u} size={30} theme={theme} />
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", color: theme.muted, fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: "13px 16px", color: theme.muted, fontSize: 13 }}>{u.phone || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: u.role === "admin" ? theme.yellow + "25" : theme.accentDim, color: u.role === "admin" ? theme.yellow : theme.accent, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontFamily: "'Space Mono',monospace", fontSize: 14 }}>{u._count?.skills || 0}</td>
                  <td style={{ padding: "13px 16px", color: theme.muted, fontSize: 12, whiteSpace: "nowrap" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditUser(u); setEditForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role }); }} style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, color: theme.accent, padding: "4px 10px", borderRadius: 8, fontSize: 12 }}>Edit</button>
                      {u.role !== "admin" && (
                        <button onClick={() => deleteUser(u.id)} style={{ background: "none", border: `1px solid ${theme.danger}40`, color: theme.danger, padding: "4px 10px", borderRadius: 8, fontSize: 12, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = theme.danger; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = theme.danger; }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Signups */}
      {stats?.recentUsers?.length > 0 && (
        <div className="fu3" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>🕐 Recent Signups</h2>
          {stats.recentUsers.map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar user={u} size={28} theme={theme} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: theme.muted }}>{u.email}</div>
                </div>
              </div>
              <span style={{ color: theme.muted, fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? themes.dark : themes.light;

  function handleUserUpdate(u) {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <BrowserRouter>
      <GlobalStyle theme={theme} />
      {user && (
        <Navbar user={user} onLogout={handleLogout} theme={theme}
          toggleTheme={() => setIsDark(!isDark)} isDark={isDark}
          onUserUpdate={handleUserUpdate} />
      )}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage onLogin={u => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} theme={theme} />} />
        <Route path="/" element={user ? <HomePage user={user} theme={theme} /> : <Navigate to="/auth" />} />
        <Route path="/dashboard" element={user ? <DashboardPage user={user} theme={theme} /> : <Navigate to="/auth" />} />
        <Route path="/skills" element={user ? <SkillsPage theme={theme} /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} onUserUpdate={handleUserUpdate} theme={theme} /> : <Navigate to="/auth" />} />
        <Route path="/admin" element={user?.role === "admin" ? <AdminPage theme={theme} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}