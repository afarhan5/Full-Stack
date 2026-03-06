import { useState, useEffect, useCallback, useRef } from "react";
import {
  BrowserRouter, Routes, Route, Link,
  Navigate, useNavigate, useLocation
} from "react-router-dom";

const API = "https://nexus-backend-zrx2.onrender.com";

const themes = {
  dark: {
    bg: "#080810", card: "#0e0e1a", border: "#1a1a2e",
    text: "#e2e8f0", muted: "#4a5568", accent: "#00ff88",
    accentDim: "#00ff8812", danger: "#ff4757", blue: "#4facfe",
    purple: "#a78bfa", yellow: "#fbbf24", navbar: "#06060f",
    input: "#080810", shadow: "0 8px 32px rgba(0,0,0,0.5)"
  },
  light: {
    bg: "#f0f4f8", card: "#ffffff", border: "#e2e8f0",
    text: "#1a202c", muted: "#718096", accent: "#00a86b",
    accentDim: "#00a86b12", danger: "#e53e3e", blue: "#3182ce",
    purple: "#805ad5", yellow: "#d69e2e", navbar: "#ffffff",
    input: "#f7fafc", shadow: "0 8px 32px rgba(0,0,0,0.08)"
  }
};

const GlobalStyle = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { background:${theme.bg}; color:${theme.text}; font-family:'DM Sans',sans-serif; transition:background 0.3s,color 0.3s; min-height:100vh; }
    a { color:inherit; text-decoration:none; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:${theme.bg}; }
    ::-webkit-scrollbar-thumb { background:${theme.accent}; border-radius:2px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0}to{opacity:1} }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    @keyframes slideIn { from{transform:translateX(10px);opacity:0}to{transform:translateX(0);opacity:1} }
    .fu  { animation:fadeUp 0.45s ease both; }
    .fu1 { animation:fadeUp 0.45s 0.07s ease both; }
    .fu2 { animation:fadeUp 0.45s 0.14s ease both; }
    .fu3 { animation:fadeUp 0.45s 0.21s ease both; }
    .fu4 { animation:fadeUp 0.45s 0.28s ease both; }
    .fu5 { animation:fadeUp 0.45s 0.35s ease both; }
    input,select,button,textarea { font-family:'DM Sans',sans-serif; }
    button { cursor:pointer; }
    @media(max-width:768px){ .hide-mobile{display:none!important} }
    @media(max-width:640px){
      .grid-4{grid-template-columns:repeat(2,1fr)!important}
      .grid-3{grid-template-columns:1fr!important}
      .grid-2{grid-template-columns:1fr!important}
    }
  `}</style>
);

function getHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

// ── PASSWORD INPUT with eye toggle ────────────
function PwInput({ placeholder, value, onChange, onKeyDown, style }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={{ ...style, paddingRight: 44, marginBottom: 0, width: "100%" }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", fontSize: 16,
          color: "#888", padding: 4, lineHeight: 1
        }}
      >{show ? "🙈" : "👁️"}</button>
    </div>
  );
}

function Avatar({ user, size = 40, theme }) {
  if (user?.photo) return (
    <img src={user.photo} alt={user.name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${theme.accent}40` }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${theme.accent},${theme.blue})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#000"
    }}>{user?.name?.[0]?.toUpperCase() || "?"}</div>
  );
}

function StatCard({ label, value, color, icon, cls = "fu", theme }) {
  return (
    <div className={cls} style={{
      background: theme.card, border: `1px solid ${theme.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: "18px 20px",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 12, right: 14, fontSize: 28, opacity: 0.1 }}>{icon}</div>
      <div style={{ color: theme.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>{label}</div>
      <div style={{ color, fontSize: 30, fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>{value}</div>
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
      boxShadow: `0 8px 24px ${bg}60`, animation: "slideIn 0.3s ease", maxWidth: 320
    }}>{type === "error" ? "❌" : "✅"} {msg}</div>
  );
}

function Modal({ open, onClose, title, children, theme }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: theme.card, border: `1px solid ${theme.border}`,
        borderRadius: 18, padding: 28, width: "100%", maxWidth: 420,
        animation: "fadeUp 0.3s ease", maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.muted, fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────
function Navbar({ user, onLogout, theme, toggleTheme, isDark }) {
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
      padding: "0 20px", height: 60, display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(12px)"
    }}>
      <span style={{ fontFamily: "'Space Mono',monospace", color: theme.accent, fontSize: 17, letterSpacing: 5, fontWeight: 700 }}>NEXUS</span>

      <div className="hide-mobile" style={{ display: "flex", gap: 2 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            fontSize: 13, padding: "7px 13px", borderRadius: 8, fontWeight: 500,
            color: loc.pathname === l.to ? theme.accent : theme.muted,
            background: loc.pathname === l.to ? theme.accentDim : "transparent",
            transition: "all 0.2s"
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={toggleTheme} style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 8, padding: "6px 10px", fontSize: 14, color: theme.text
        }}>{isDark ? "☀️" : "🌙"}</button>

        <Link to="/profile" style={{
          display: "flex", alignItems: "center", gap: 8,
          background: theme.accentDim, border: `1px solid ${theme.accent}30`,
          borderRadius: 10, padding: "5px 10px"
        }}>
          <Avatar user={user} size={26} theme={theme} />
          <div className="hide-mobile" style={{ lineHeight: 1.3 }}>
            <div style={{ color: theme.text, fontSize: 12, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ color: theme.accent, fontSize: 10, letterSpacing: 1 }}>{user?.role?.toUpperCase()}</div>
          </div>
        </Link>

        <button onClick={onLogout} style={{
          background: "none", border: `1px solid ${theme.danger}60`, color: theme.danger,
          padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, transition: "all 0.2s"
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
  const [hasUsers, setHasUsers] = useState(true); // assume true until checked
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API + "/has-users")
      .then(r => r.json())
      .then(d => setHasUsers(d.hasUsers))
      .catch(() => { });
  }, []);

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
    } catch { setError("Cannot reach server. Wait 60s and try again — free server may be waking up."); }
    setLoading(false);
  }

  const inpBase = {
    width: "100%", padding: "13px 16px", borderRadius: 10,
    background: theme.input, border: `1px solid ${theme.border}`,
    color: theme.text, fontSize: 14, outline: "none", transition: "border-color 0.2s"
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${theme.accent}08 0%,transparent 65%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

      <div className="fu" style={{ width: "100%", maxWidth: 400, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 22, padding: "36px 32px", boxShadow: theme.shadow }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", color: theme.accent, fontSize: 28, letterSpacing: 8, fontWeight: 700 }}>NEXUS</div>
          <div style={{ color: theme.muted, fontSize: 10, letterSpacing: 4, marginTop: 5 }}>CORE SAAS PLATFORM</div>
        </div>

        <div style={{ display: "flex", background: theme.bg, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
              flex: 1, padding: "9px", border: "none", borderRadius: 8,
              background: tab === t ? theme.accent : "transparent",
              color: tab === t ? "#000" : theme.muted,
              fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: "all 0.25s"
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {tab === "register" && (
            <div style={{ marginBottom: 14 }}>
              <input placeholder="Full Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={inpBase}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.border} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <input placeholder="Email address" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inpBase}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.border}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <PwInput
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={inpBase}
          />
        </div>

        {/* Only show admin hint if NO users exist yet */}
        {tab === "register" && !hasUsers && (
          <div style={{ background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: theme.accent, lineHeight: 1.6 }}>
            💡 <strong>You will be the Admin</strong> — first account gets full control.
          </div>
        )}

        {error && (
          <div style={{ background: "#ff475715", border: `1px solid ${theme.danger}40`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: theme.danger, lineHeight: 1.5 }}>
            ❌ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "13px", borderRadius: 10, border: "none",
          background: loading ? theme.muted : theme.accent,
          color: "#000", fontSize: 14, fontWeight: 700, letterSpacing: 1,
          cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s"
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
    { title: "Skills Tracker", desc: "Build and manage your personal skill library", link: "/skills", color: theme.accent, icon: "🧠" },
    { title: "Dashboard", desc: "Analytics, roadmap and learning progress", link: "/dashboard", color: theme.blue, icon: "📊" },
    { title: "My Profile", desc: "Edit photo, name, email and account settings", link: "/profile", color: theme.purple, icon: "👤" },
    ...(user?.role === "admin" ? [{ title: "Admin Panel", desc: "Manage all users and platform stats", link: "/admin", color: theme.yellow, icon: "⚡" }] : [])
  ];
  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 44 }}>
        <p style={{ color: theme.muted, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Space Mono',monospace" }}>Welcome back</p>
        <h1 style={{ fontSize: "clamp(24px,5vw,48px)", fontWeight: 700, lineHeight: 1.2 }}>
          Hello, <span style={{ color: theme.accent }}>{user?.name}</span> 👋
        </h1>
        <p style={{ color: theme.muted, marginTop: 12, fontSize: 14 }}>
          Logged in as <span style={{ color: theme.blue, fontWeight: 600 }}>{user?.role}</span>
        </p>
      </div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
        {cards.map((c, i) => (
          <Link key={c.title} to={c.link} className={`fu${i + 1}`}>
            <div style={{
              background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16,
              padding: 26, transition: "all 0.3s", minHeight: 150, position: "relative", overflow: "hidden"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 14px 40px ${c.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{c.icon}</div>
              <h2 style={{ color: c.color, fontSize: 17, fontWeight: 700, marginBottom: 7 }}>{c.title}</h2>
              <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.6 }}>{c.desc}</p>
              <div style={{ position: "absolute", bottom: 18, right: 18, color: c.color, fontSize: 20, opacity: 0.2 }}>→</div>
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
  const [roadmap, setRoadmap] = useState([]);
  const [newLesson, setNewLesson] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    fetch(API + "/skills", { headers: getHeaders() })
      .then(r => r.json()).then(d => Array.isArray(d) && setSkills(d));
    fetch(API + "/roadmap", { headers: getHeaders() })
      .then(r => r.json()).then(d => Array.isArray(d) && setRoadmap(d));
  }, []);

  async function toggleDone(item) {
    const res = await fetch(`${API}/roadmap/${item.id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify({ done: !item.done })
    });
    const data = await res.json();
    if (data.item) setRoadmap(prev => prev.map(r => r.id === item.id ? data.item : r));
  }

  async function addLesson() {
    if (!newLesson.trim()) return;
    setAddingLesson(true);
    const res = await fetch(`${API}/roadmap`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify({ label: newLesson.trim() })
    });
    const data = await res.json();
    if (data.items) setRoadmap(data.items);
    setNewLesson(""); setAddingLesson(false);
  }

  async function deleteLesson(id) {
    const res = await fetch(`${API}/roadmap/${id}`, { method: "DELETE", headers: getHeaders() });
    const data = await res.json();
    if (data.items) setRoadmap(data.items);
  }

  async function saveEditLabel(id) {
    if (!editLabel.trim()) return;
    const res = await fetch(`${API}/roadmap/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify({ label: editLabel.trim() })
    });
    const data = await res.json();
    if (data.item) { setRoadmap(prev => prev.map(r => r.id === id ? data.item : r)); setEditingId(null); }
  }

  const done = roadmap.filter(r => r.done).length;
  const pct = roadmap.length > 0 ? Math.round(done / roadmap.length * 100) : 0;

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>📊 Dashboard</h1>
        <p style={{ color: theme.muted, marginTop: 4, fontSize: 13 }}>Your personal learning analytics</p>
      </div>

      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="My Skills" value={skills.length} color={theme.accent} icon="🧠" cls="fu1" theme={theme} />
        <StatCard label="Lessons Done" value={done} color={theme.blue} icon="📚" cls="fu2" theme={theme} />
        <StatCard label="Progress" value={`${pct}%`} color={theme.purple} icon="🚀" cls="fu3" theme={theme} />
        <StatCard label="Total Lessons" value={roadmap.length} color={theme.yellow} icon="🗺️" cls="fu4" theme={theme} />
      </div>

      {/* Roadmap */}
      <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>🗺️ My Learning Roadmap</h2>
          <span style={{ color: theme.accent, fontFamily: "'Space Mono',monospace", fontSize: 12 }}>{done}/{roadmap.length} done · {pct}%</span>
        </div>

        {/* Progress bar */}
        <div style={{ background: theme.bg, borderRadius: 8, height: 7, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${theme.accent},${theme.blue})`, borderRadius: 8, transition: "width 1s ease" }} />
        </div>

        {/* Lessons list */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 6, marginBottom: 16 }}>
          {roadmap.map(item => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              borderRadius: 8, background: item.done ? theme.accentDim : "transparent",
              border: `1px solid ${item.done ? theme.accent + "30" : "transparent"}`,
              transition: "all 0.2s", group: true
            }}>
              <button onClick={() => toggleDone(item)} style={{ background: "none", border: "none", fontSize: 15, flexShrink: 0, lineHeight: 1 }}>
                {item.done ? "✅" : "⬜"}
              </button>
              {editingId === item.id ? (
                <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveEditLabel(item.id); if (e.key === "Escape") setEditingId(null); }}
                  autoFocus
                  style={{ flex: 1, background: "none", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 8px", color: theme.text, fontSize: 13, outline: "none" }} />
              ) : (
                <span style={{ flex: 1, color: item.done ? theme.accent : theme.muted, fontSize: 13, cursor: "pointer" }}
                  onDoubleClick={() => { setEditingId(item.id); setEditLabel(item.label); }}
                  title="Double-click to edit">{item.label}</span>
              )}
              {editingId === item.id ? (
                <button onClick={() => saveEditLabel(item.id)} style={{ background: "none", border: "none", color: theme.accent, fontSize: 14 }}>✓</button>
              ) : (
                <button onClick={() => deleteLesson(item.id)} style={{ background: "none", border: "none", color: theme.muted, fontSize: 13, opacity: 0.4, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Add lesson */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newLesson} onChange={e => setNewLesson(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addLesson()}
            placeholder="Add a new lesson to your roadmap…"
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 13, outline: "none", minWidth: 0 }}
            onFocus={e => e.target.style.borderColor = theme.accent}
            onBlur={e => e.target.style.borderColor = theme.border} />
          <button onClick={addLesson} disabled={addingLesson} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: theme.accent, color: "#000", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>+ Add</button>
        </div>
        <p style={{ color: theme.muted, fontSize: 11, marginTop: 8 }}>✏️ Double-click any item to rename it · Click ✅/⬜ to toggle · ✕ to remove</p>
      </div>

      {/* Skills preview */}
      <div className="fu3" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>🧠 My Skills ({skills.length})</h2>
        {skills.length === 0
          ? <p style={{ color: theme.muted, fontSize: 13 }}>No skills yet. <Link to="/skills" style={{ color: theme.accent }}>Add your first →</Link></p>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map(s => (
              <span key={s.id} style={{ background: theme.accentDim, color: theme.accent, border: `1px solid ${theme.accent}30`, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 500 }}>{s.name}</span>
            ))}
          </div>}
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
      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>🧠 Skills Tracker</h1>
        <p style={{ color: theme.muted, marginTop: 4, fontSize: 13 }}>Your private skill library — only you can see these</p>
      </div>

      <div className="fu1" style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addSkill()}
          placeholder="Type a skill and press Enter…"
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, outline: "none", transition: "border-color 0.2s", minWidth: 0 }}
          onFocus={e => e.target.style.borderColor = theme.accent}
          onBlur={e => e.target.style.borderColor = theme.border} />
        <button onClick={addSkill} disabled={adding} style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: theme.accent, color: "#000", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{adding ? "…" : "+ Add"}</button>
      </div>

      <div style={{ color: theme.muted, fontSize: 11, marginBottom: 12, fontFamily: "'Space Mono',monospace" }}>
        {loading ? "LOADING…" : `${skills.length} SKILL${skills.length !== 1 ? "S" : ""} TRACKED`}
      </div>

      {!loading && skills.map((sk, i) => (
        <div key={sk.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: theme.card, border: `1px solid ${theme.border}`,
          borderLeft: `3px solid ${theme.accent}`, borderRadius: 12,
          padding: "12px 16px", marginBottom: 7,
          animation: `fadeUp 0.3s ${i * 0.04}s both`, transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = "translateX(4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.borderLeftColor = theme.accent; e.currentTarget.style.transform = "none"; }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: theme.accent, fontWeight: 700 }}>✓</span>
            <span style={{ fontWeight: 500, fontSize: 14 }}>{sk.name}</span>
          </div>
          <button onClick={() => deleteSkill(sk.id)} style={{ background: "none", border: `1px solid ${theme.danger}40`, color: theme.danger, padding: "4px 12px", borderRadius: 8, fontSize: 12, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = theme.danger; }}>Delete</button>
        </div>
      ))}

      {!loading && skills.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 0", color: theme.muted }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🧠</div>
          <p>No skills yet! Add your first skill above.</p>
        </div>
      )}
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────
function ProfilePage({ user, onUserUpdate, theme }) {
  const fileRef = useRef();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [editForm, setEditForm] = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [deleteForm, setDeleteForm] = useState({ password: "" });
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [activeTab, setActiveTab] = useState("info");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  }

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
      onUserUpdate(data.user);
      showToast("Email updated!");
      setEmailForm({ newEmail: "", password: "" });
    }
    setSaving(false);
  }

  async function deleteAccount() {
    setSaving(true);
    const res = await fetch(API + "/me", { method: "DELETE", headers: getHeaders(), body: JSON.stringify({ password: deleteForm.password }) });
    const data = await res.json();
    if (data.error) { showToast(data.error, "error"); setSaving(false); return; }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onUserUpdate(null);
    navigate("/auth");
  }

  const inp = {
    width: "100%", padding: "12px 15px", borderRadius: 10,
    background: theme.input, border: `1px solid ${theme.border}`,
    color: theme.text, fontSize: 14, outline: "none", transition: "border-color 0.2s"
  };
  const inpFocus = e => e.target.style.borderColor = theme.accent;
  const inpBlur = e => e.target.style.borderColor = theme.border;

  const tabs = [
    { id: "info", label: "👤 Info" },
    { id: "security", label: "🔒 Security" },
    { id: "account", label: "📧 Account" },
    ...(profile?.role !== "admin" ? [{ id: "danger", label: "⚠️ Danger" }] : [])
  ];

  return (
    <div style={{ padding: "40px 20px", maxWidth: 640, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} theme={theme} />

      {/* Delete Confirm Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="⚠️ Delete Account" theme={theme}>
        <p style={{ color: theme.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
          This will permanently delete your account and all your data. This cannot be undone. Enter your password to confirm.
        </p>
        <PwInput placeholder="Enter your password to confirm"
          value={deleteForm.password}
          onChange={e => setDeleteForm({ password: e.target.value })}
          style={inp} />
        <button onClick={deleteAccount} disabled={saving} style={{
          width: "100%", padding: 13, borderRadius: 10, border: "none",
          background: theme.danger, color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 8
        }}>
          {saving ? "Deleting…" : "Yes, Delete My Account"}
        </button>
      </Modal>

      {/* Profile Header Card */}
      <div className="fu" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 26, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar user={profile} size={76} theme={theme} />
            <button onClick={() => fileRef.current.click()} disabled={photoLoading} style={{
              position: "absolute", bottom: 0, right: 0, width: 24, height: 24,
              borderRadius: "50%", background: theme.accent, border: `2px solid ${theme.card}`,
              color: "#000", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center"
            }} title="Change photo">{photoLoading ? "…" : "📷"}</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 3 }}>{profile?.name}</h1>
            <p style={{ color: theme.muted, fontSize: 13, marginBottom: 8 }}>{profile?.email}</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <span style={{ background: profile?.role === "admin" ? theme.yellow + "25" : theme.accentDim, color: profile?.role === "admin" ? theme.yellow : theme.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                {profile?.role?.toUpperCase()}
              </span>
              {profile?.phone && <span style={{ background: theme.accentDim, color: theme.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11 }}>📱 {profile.phone}</span>}
            </div>
          </div>
        </div>
        {profile?.bio && <p style={{ color: theme.muted, fontSize: 13, marginTop: 14, padding: "12px 0", borderTop: `1px solid ${theme.border}`, lineHeight: 1.7 }}>{profile.bio}</p>}
      </div>

      {/* Tabs */}
      <div className="fu1" style={{ display: "flex", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 4, marginBottom: 18, gap: 3 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: "8px 4px", border: "none", borderRadius: 8,
            background: activeTab === t.id ? (t.id === "danger" ? theme.danger : theme.accent) : "transparent",
            color: activeTab === t.id ? (t.id === "danger" ? "#fff" : "#000") : theme.muted,
            fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", transition: "all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Edit Profile Info</h2>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Full Name</label>
          <div style={{ marginBottom: 16 }}>
            <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inp} onFocus={inpFocus} onBlur={inpBlur} />
          </div>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Phone Number</label>
          <div style={{ marginBottom: 16 }}>
            <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+91 9999999999" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
          </div>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Bio</label>
          <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="Tell us about yourself…" rows={3}
            style={{ ...inp, resize: "vertical", fontFamily: "'DM Sans',sans-serif", marginBottom: 18, display: "block" }}
            onFocus={inpFocus} onBlur={inpBlur} />
          <button onClick={saveProfile} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: saving ? theme.muted : theme.accent, color: "#000", fontWeight: 700, fontSize: 14 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === "security" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>🔒 Change Password</h2>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Current Password</label>
          <PwInput placeholder="Current password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} style={inp} />
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>New Password</label>
          <PwInput placeholder="New password (min 6 chars)" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} style={inp} />
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Confirm New Password</label>
          <PwInput placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} style={inp} />
          <button onClick={changePassword} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: saving ? theme.muted : theme.accent, color: "#000", fontWeight: 700, fontSize: 14, marginTop: 4 }}>
            {saving ? "Changing…" : "Change Password"}
          </button>
        </div>
      )}

      {/* Tab: Account */}
      {activeTab === "account" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>📧 Change Email</h2>
          <p style={{ color: theme.muted, fontSize: 12, marginBottom: 18, lineHeight: 1.7 }}>Confirm your password to change your email address.</p>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Current Email</label>
          <div style={{ ...inp, color: theme.muted, marginBottom: 16, display: "flex", alignItems: "center", borderStyle: "dashed" }}>{profile?.email}</div>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>New Email</label>
          <div style={{ marginBottom: 16 }}>
            <input placeholder="New email address" type="email" value={emailForm.newEmail} onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })} style={inp} onFocus={inpFocus} onBlur={inpBlur} />
          </div>
          <label style={{ color: theme.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Confirm Password</label>
          <PwInput placeholder="Your current password" value={emailForm.password} onChange={e => setEmailForm({ ...emailForm, password: e.target.value })} style={inp} />
          <button onClick={changeEmail} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: saving ? theme.muted : theme.blue, color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 4 }}>
            {saving ? "Updating…" : "Update Email"}
          </button>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.muted, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>Account Details</h3>
            {[{ l: "Member Since", v: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "2026" }, { l: "Account Type", v: profile?.role }, { l: "Plan", v: "Free" }].map(f => (
              <div key={f.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ color: theme.muted, fontSize: 13 }}>{f.l}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Danger Zone (users only) */}
      {activeTab === "danger" && profile?.role !== "admin" && (
        <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.danger}40`, borderRadius: 16, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: theme.danger }}>⚠️ Danger Zone</h2>
          <p style={{ color: theme.muted, fontSize: 13, marginBottom: 22, lineHeight: 1.7 }}>
            Permanently delete your account and all associated data including your skills and roadmap. <strong style={{ color: theme.danger }}>This cannot be undone.</strong>
          </p>
          <button onClick={() => setShowDeleteModal(true)} style={{
            width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${theme.danger}`,
            background: "transparent", color: theme.danger, fontWeight: 700, fontSize: 14, transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.danger; }}>
            🗑️ Delete My Account
          </button>
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
    else { setUsers(prev => prev.map(u => u.id === editUser.id ? data.user : u)); showToast("User updated!"); setEditUser(null); }
    setSaving(false);
  }

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, outline: "none", marginBottom: 12 };

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center", color: theme.muted }}>
      <div style={{ fontSize: 48, animation: "pulse 1s infinite" }}>⚡</div>
      <p style={{ marginTop: 14 }}>Loading admin data…</p>
    </div>
  );

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} theme={theme} />

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit: ${editUser?.name}`} theme={theme}>
        <input placeholder="Name" value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inp} />
        <input placeholder="Email" type="email" value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={inp} />
        <input placeholder="Phone" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={inp} />
        <select value={editForm.role || "user"} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
          style={{ ...inp, color: theme.text, background: theme.input }}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={saveUser} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: theme.accent, color: "#000", fontWeight: 700, fontSize: 14 }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </Modal>

      <div className="fu" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>⚡ Admin Panel</h1>
        <p style={{ color: theme.muted, marginTop: 4, fontSize: 13 }}>Full platform control</p>
      </div>

      {stats && (
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Users" value={stats.totalUsers} color={theme.blue} icon="👥" cls="fu1" theme={theme} />
          <StatCard label="Total Skills" value={stats.totalSkills} color={theme.accent} icon="🧠" cls="fu2" theme={theme} />
          <StatCard label="Admins" value={stats.adminCount} color={theme.yellow} icon="⚡" cls="fu3" theme={theme} />
          <StatCard label="Regular Users" value={stats.totalUsers - stats.adminCount} color={theme.purple} icon="👤" cls="fu4" theme={theme} />
        </div>
      )}

      <div className="fu2" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>👥 All Users</h2>
          <span style={{ color: theme.muted, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{users.length} TOTAL</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: theme.bg }}>
                {["User", "Email", "Phone", "Role", "Skills", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: theme.muted, fontSize: 10, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${theme.border}`, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accentDim}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Avatar user={u} size={28} theme={theme} />
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: theme.muted, fontSize: 12 }}>{u.email}</td>
                  <td style={{ padding: "12px 14px", color: theme.muted, fontSize: 12 }}>{u.phone || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: u.role === "admin" ? theme.yellow + "25" : theme.accentDim, color: u.role === "admin" ? theme.yellow : theme.accent, borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{u._count?.skills || 0}</td>
                  <td style={{ padding: "12px 14px", color: theme.muted, fontSize: 11, whiteSpace: "nowrap" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => { setEditUser(u); setEditForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role }); }}
                        style={{ background: theme.accentDim, border: `1px solid ${theme.accent}40`, color: theme.accent, padding: "4px 9px", borderRadius: 7, fontSize: 11 }}>Edit</button>
                      {u.role !== "admin" && (
                        <button onClick={() => deleteUser(u.id)} style={{ background: "none", border: `1px solid ${theme.danger}40`, color: theme.danger, padding: "4px 9px", borderRadius: 7, fontSize: 11, transition: "all 0.2s" }}
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

      {stats?.recentUsers?.length > 0 && (
        <div className="fu3" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>🕐 Recent Signups</h2>
          {stats.recentUsers.map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar user={u} size={28} theme={theme} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: theme.muted }}>{u.email}</div>
                </div>
              </div>
              <span style={{ color: theme.muted, fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
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
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else { localStorage.removeItem("user"); localStorage.removeItem("token"); }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <BrowserRouter>
      <GlobalStyle theme={theme} />
      {user && <Navbar user={user} onLogout={handleLogout} theme={theme} toggleTheme={() => setIsDark(!isDark)} isDark={isDark} />}
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