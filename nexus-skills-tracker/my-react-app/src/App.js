import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";

const API = "https://nexus-backend-zrx2.onrender.com";

const inputStyle = {
  width: "100%", padding: "10px 12px",
  background: "#0a0a0f",
  border: "1px solid #1f1f2e",
  color: "#ccc", marginBottom: "12px",
  fontSize: "13px", boxSizing: "border-box",
  outline: "none", fontFamily: "Arial"
};

const pageStyle = {
  background: "#0a0a0f", minHeight: "100vh",
  fontFamily: "Arial", color: "white"
};

// ── NAVBAR ────────────────────────────────────
function Navbar({ user, onLogout }) {
  return (
    <div style={{
      background: "#060609",
      borderBottom: "1px solid #1f1f2e",
      padding: "16px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      {/* Logo */}
      <div style={{
        color: "#4ade80", fontSize: "20px",
        letterSpacing: "4px", fontWeight: "bold"
      }}>NEXUS</div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "24px" }}>
        <Link to="/" style={{
          color: "#4a4a6a", textDecoration: "none",
          fontSize: "12px", letterSpacing: "1px"
        }}>HOME</Link>
        <Link to="/dashboard" style={{
          color: "#4a4a6a", textDecoration: "none",
          fontSize: "12px", letterSpacing: "1px"
        }}>DASHBOARD</Link>
        <Link to="/skills" style={{
          color: "#4a4a6a", textDecoration: "none",
          fontSize: "12px", letterSpacing: "1px"
        }}>SKILLS</Link>
        <Link to="/profile" style={{
          color: "#4a4a6a", textDecoration: "none",
          fontSize: "12px", letterSpacing: "1px"
        }}>PROFILE</Link>
      </div>

      {/* User + Logout */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{ color: "#4ade80", fontSize: "12px" }}>
          {user?.name}
        </span>
        <button onClick={onLogout} style={{
          background: "none",
          border: "1px solid #f87171",
          color: "#f87171", padding: "6px 12px",
          cursor: "pointer", fontSize: "11px"
        }}>Logout</button>
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────
function HomePage({ user }) {
  return (
    <div style={{ ...pageStyle, padding: "60px 40px" }}>
      <h1 style={{ color: "#4ade80", fontSize: "48px",
        letterSpacing: "4px" }}>
        Welcome back, {user.name}! 🚀
      </h1>
      <p style={{ color: "#4a4a6a", fontSize: "16px",
        marginBottom: "40px" }}>
        You are logged in as <strong
        style={{ color: "#60a5fa" }}>{user.role}</strong>
      </p>

      {/* Cards */}
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
        {[
          { title: "Skills", desc: "Track your learning progress",
            link: "/skills", color: "#4ade80" },
          { title: "Dashboard", desc: "View your stats and metrics",
            link: "/dashboard", color: "#60a5fa" },
          { title: "Profile", desc: "Manage your account settings",
            link: "/profile", color: "#f59e0b" },
        ].map(card => (
          <Link key={card.title} to={card.link}
            style={{ textDecoration: "none" }}>
            <div style={{
              background: "#0d0d14",
              border: `1px solid #1f1f2e`,
              borderLeft: `3px solid ${card.color}`,
              padding: "24px", cursor: "pointer",
            }}>
              <h2 style={{ color: card.color, margin: "0 0 8px 0" }}>
                {card.title}
              </h2>
              <p style={{ color: "#4a4a6a", margin: 0, fontSize: "13px" }}>
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────
function DashboardPage({ user }) {
  const stats = [
    { label: "Total Skills", value: "6", color: "#4ade80" },
    { label: "Days Learning", value: "1", color: "#60a5fa" },
    { label: "Projects Built", value: "1", color: "#f59e0b" },
    { label: "Lessons Done", value: "13", color: "#a78bfa" },
  ];

  return (
    <div style={{ ...pageStyle, padding: "40px" }}>
      <h1 style={{ color: "#4ade80" }}>📊 Dashboard</h1>
      <p style={{ color: "#4a4a6a" }}>
        Your learning stats at a glance
      </p>

      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(4,1fr)", gap: "16px",
        marginTop: "32px" }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "#0d0d14",
            border: "1px solid #1f1f2e",
            borderLeft: `3px solid ${s.color}`,
            padding: "24px"
          }}>
            <div style={{ color: "#4a4a6a", fontSize: "11px",
              letterSpacing: "2px", marginBottom: "8px" }}>
              {s.label.toUpperCase()}
            </div>
            <div style={{ color: "#fff", fontSize: "36px",
              fontWeight: "bold" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "32px", background: "#0d0d14",
        border: "1px solid #1f1f2e", padding: "24px" }}>
        <h2 style={{ color: "#60a5fa", marginTop: 0 }}>
          🗺️ Your Roadmap
        </h2>
        {[
          { lesson: "HTML + CSS", done: true },
          { lesson: "JavaScript", done: true },
          { lesson: "React", done: true },
          { lesson: "Node.js + Express", done: true },
          { lesson: "PostgreSQL + Prisma", done: true },
          { lesson: "JWT Authentication", done: true },
          { lesson: "React Router", done: true },
          { lesson: "Deploy to Internet", done: false },
          { lesson: "Start AI Platform", done: false },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "10px 0",
            borderBottom: "1px solid #0f0f1a",
            display: "flex", gap: "12px",
            color: item.done ? "#4ade80" : "#4a4a6a",
            fontSize: "13px"
          }}>
            <span>{item.done ? "✅" : "⬜"}</span>
            <span>{item.lesson}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SKILLS PAGE ───────────────────────────────
function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  useEffect(() => {
    fetch(API + "/skills", { headers })
      .then(res => res.json())
      .then(data => { setSkills(data); setLoading(false); });
  }, []);

  async function addSkill() {
    if (input === "") return;
    const res = await fetch(API + "/skills", {
      method: "POST", headers,
      body: JSON.stringify({ skill: input }),
    });
    const data = await res.json();
    setSkills(data.skills);
    setInput("");
  }

  async function deleteSkill(id) {
    const res = await fetch(`${API}/skills/${id}`,
      { method: "DELETE", headers });
    const data = await res.json();
    setSkills(data.skills);
  }

  if (loading) return (
    <div style={{ ...pageStyle, padding: "40px" }}>
      <p style={{ color: "#4ade80" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ ...pageStyle, padding: "40px" }}>
      <h1 style={{ color: "#4ade80" }}>🧠 Skills Tracker</h1>
      <p style={{ color: "#4a4a6a" }}>Total: {skills.length}</p>

      <div style={{ maxWidth: "500px" }}>
        <input value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a skill..."
          style={{ ...inputStyle, marginBottom: "10px" }} />
        <button onClick={addSkill} style={{
          width: "100%", padding: "12px",
          background: "#0a0a0f",
          border: "1px solid #4ade80",
          color: "#4ade80", fontSize: "14px",
          cursor: "pointer", marginBottom: "24px"
        }}>+ Add Skill</button>

        {skills.map(skill => (
          <div key={skill.id} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", background: "#0d0d14",
            border: "1px solid #1f1f2e",
            borderLeft: "3px solid #4ade80",
            padding: "12px 16px", marginBottom: "8px"
          }}>
            <span style={{ color: "white" }}>✅ {skill.name}</span>
            <button onClick={() => deleteSkill(skill.id)} style={{
              background: "none", border: "1px solid #f87171",
              color: "#f87171", padding: "4px 10px",
              cursor: "pointer", fontSize: "12px"
            }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────
function ProfilePage({ user }) {
  return (
    <div style={{ ...pageStyle, padding: "40px" }}>
      <h1 style={{ color: "#4ade80" }}>👤 My Profile</h1>

      <div style={{ maxWidth: "400px", background: "#0d0d14",
        border: "1px solid #1f1f2e", padding: "28px" }}>
        {[
          { label: "Name", value: user.name },
          { label: "Email", value: user.email },
          { label: "Role", value: user.role },
          { label: "Plan", value: "Free" },
          { label: "Member Since", value: "2026" },
        ].map(f => (
          <div key={f.label} style={{
            marginBottom: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid #0f0f1a"
          }}>
            <div style={{ color: "#4a4a6a", fontSize: "10px",
              letterSpacing: "2px", marginBottom: "4px" }}>
              {f.label.toUpperCase()}
            </div>
            <div style={{ color: "#fff", fontSize: "14px" }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "user"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const url = tab === "login" ? "/login" : "/register";
    try {
      const res = await fetch(API + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
        navigate("/");
      }
    } catch {
      setError("Server error. Is backend running?");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Arial"
    }}>
      <div style={{
        width: "360px", background: "#0d0d14",
        border: "1px solid #4ade80", padding: "40px",
        boxShadow: "0 0 40px rgba(74,222,128,0.1)"
      }}>
        <h1 style={{ color: "#4ade80", textAlign: "center",
          letterSpacing: "6px", marginBottom: "4px" }}>NEXUS</h1>
        <p style={{ color: "#4a4a6a", textAlign: "center",
          fontSize: "11px", letterSpacing: "2px",
          marginBottom: "28px" }}>CORE SAAS PLATFORM</p>

        <div style={{ display: "flex", marginBottom: "24px",
          borderBottom: "1px solid #1f1f2e" }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, background: "none", border: "none",
              color: tab === t ? "#4ade80" : "#4a4a6a",
              padding: "10px", cursor: "pointer",
              fontSize: "12px", letterSpacing: "2px",
              borderBottom: tab === t
                ? "2px solid #4ade80" : "2px solid transparent",
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        {tab === "register" && (
          <input placeholder="Full Name" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            style={inputStyle} />
        )}
        <input placeholder="Email" type="email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          style={inputStyle} />
        <input placeholder="Password" type="password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          style={inputStyle} />
        {tab === "register" && (
          <select value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}
            style={{ ...inputStyle, color: "#ccc" }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}

        {error && (
          <p style={{ color: "#f87171", fontSize: "12px",
            marginBottom: "12px" }}>❌ {error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "12px",
          background: "#0a0a0f",
          border: "1px solid #4ade80",
          color: "#4ade80", fontSize: "13px",
          cursor: "pointer", letterSpacing: "2px"
        }}>
          {loading ? "Please wait..." :
            tab === "login" ? "▶ LOGIN" : "▶ CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogin(userData) { setUser(userData); }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/auth" element={
          user ? <Navigate to="/" /> :
          <AuthPage onLogin={handleLogin} />
        } />
        <Route path="/" element={
          user ? <HomePage user={user} /> :
          <Navigate to="/auth" />
        } />
        <Route path="/dashboard" element={
          user ? <DashboardPage user={user} /> :
          <Navigate to="/auth" />
        } />
        <Route path="/skills" element={
          user ? <SkillsPage /> :
          <Navigate to="/auth" />
        } />
        <Route path="/profile" element={
          user ? <ProfilePage user={user} /> :
          <Navigate to="/auth" />
        } />
      </Routes>
    </BrowserRouter>
  );
}