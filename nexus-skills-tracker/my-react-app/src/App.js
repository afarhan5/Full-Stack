import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";

const API = "https://nexus-backend-zrx2.onrender.com";

// ── THEMES ────────────────────────────────────
const themes = {
  dark: {
    bg: "#080810", card: "#0e0e1a", border: "#1a1a2e",
    text: "#e2e8f0", muted: "#4a5568", accent: "#00ff88",
    accentDim: "#00ff8815", danger: "#ff4757", blue: "#4facfe",
    purple: "#a78bfa", yellow: "#fbbf24", navbar: "#06060f"
  },
  light: {
    bg: "#f0f4f8", card: "#ffffff", border: "#e2e8f0",
    text: "#1a202c", muted: "#718096", accent: "#00a86b",
    accentDim: "#00a86b15", danger: "#e53e3e", blue: "#3182ce",
    purple: "#805ad5", yellow: "#d69e2e", navbar: "#ffffff"
  }
};

const GlobalStyle = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { background:${theme.bg}; color:${theme.text}; font-family:'DM Sans',sans-serif; transition:background 0.3s,color 0.3s; }
    a { color: inherit; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:${theme.bg}; }
    ::-webkit-scrollbar-thumb { background:${theme.accent}; border-radius:2px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes glow { 0%,100%{box-shadow:0 0 12px ${theme.accent}40} 50%{box-shadow:0 0 28px ${theme.accent}80} }
    .fu  { animation:fadeUp 0.5s ease both; }
    .fu1 { animation:fadeUp 0.5s 0.1s ease both; }
    .fu2 { animation:fadeUp 0.5s 0.2s ease both; }
    .fu3 { animation:fadeUp 0.5s 0.3s ease both; }
    .fu4 { animation:fadeUp 0.5s 0.4s ease both; }
    .glow-btn:not(:disabled):hover { animation:glow 1.5s infinite; }
    input,select,button,textarea { font-family:'DM Sans',sans-serif; }
    @media(max-width:768px){ .hide-mobile{display:none!important} }
    @media(min-width:769px){ .show-mobile{display:none!important} }
  `}</style>
);

function getHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

// ── STAT CARD ─────────────────────────────────
function StatCard({ label, value, color, icon, cls = "fu", theme }) {
  return (
    <div className={cls} style={{
      background: theme.card, border: `1px solid ${theme.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14,
      padding: "20px 24px", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position:"absolute", top:14, right:16, fontSize:32, opacity:0.12 }}>{icon}</div>
      <div style={{ color:theme.muted, fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontFamily:"'Space Mono',monospace" }}>{label}</div>
      <div style={{ color, fontSize:34, fontWeight:700, fontFamily:"'Space Mono',monospace" }}>{value}</div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────
function Navbar({ user, onLogout, theme, toggleTheme, isDark }) {
  const loc = useLocation();
  const links = [
    { to:"/", label:"Home" },
    { to:"/dashboard", label:"Dashboard" },
    { to:"/skills", label:"Skills" },
    { to:"/profile", label:"Profile" },
    ...(user?.role==="admin" ? [{ to:"/admin", label:"⚡ Admin" }] : [])
  ];
  return (
    <nav style={{
      background:theme.navbar, borderBottom:`1px solid ${theme.border}`,
      padding:"0 20px", height:62, display:"flex", alignItems:"center",
      justifyContent:"space-between", position:"sticky", top:0, zIndex:100,
      backdropFilter:"blur(12px)"
    }}>
      <span style={{ fontFamily:"'Space Mono',monospace", color:theme.accent, fontSize:18, letterSpacing:5, fontWeight:700 }}>NEXUS</span>

      <div className="hide-mobile" style={{ display:"flex", gap:2 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            textDecoration:"none", fontSize:13, padding:"7px 14px", borderRadius:8, fontWeight:500,
            color: loc.pathname===l.to ? theme.accent : theme.muted,
            background: loc.pathname===l.to ? theme.accentDim : "transparent",
            transition:"all 0.2s"
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={toggleTheme} title="Toggle theme" style={{
          background:theme.card, border:`1px solid ${theme.border}`, borderRadius:8,
          padding:"6px 10px", cursor:"pointer", fontSize:15, color:theme.text
        }}>{isDark ? "☀️" : "🌙"}</button>

        <div style={{
          display:"flex", alignItems:"center", gap:10,
          background:theme.accentDim, border:`1px solid ${theme.accent}30`,
          borderRadius:10, padding:"6px 12px"
        }}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:`linear-gradient(135deg,${theme.accent},${theme.blue})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"#000", flexShrink:0
          }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className="hide-mobile" style={{ display:"flex", flexDirection:"column", lineHeight:1.3 }}>
            <span style={{ color:theme.text, fontSize:12, fontWeight:600 }}>{user?.name}</span>
            <span style={{ color:theme.accent, fontSize:10, letterSpacing:1 }}>{user?.role?.toUpperCase()}</span>
          </div>
        </div>

        <button onClick={onLogout} style={{
          background:"none", border:`1px solid ${theme.danger}60`, color:theme.danger,
          padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600,
          transition:"all 0.2s"
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=theme.danger;e.currentTarget.style.color="#fff"}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=theme.danger}}>
          Logout
        </button>
      </div>
    </nav>
  );
}

// ── AUTH PAGE ─────────────────────────────────
function AuthPage({ onLogin, theme }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(API + (tab==="/login"||tab==="login" ? "/login" : "/register"), {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user); navigate("/");
      }
    } catch { setError("Cannot reach server. It may be waking up — wait 60s and try again."); }
    setLoading(false);
  }

  const inp = {
    width:"100%", padding:"13px 16px", borderRadius:10,
    background:theme.bg, border:`1px solid ${theme.border}`,
    color:theme.text, fontSize:14, outline:"none", marginBottom:12,
    transition:"border-color 0.2s"
  };

  return (
    <div style={{
      minHeight:"100vh", background:theme.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, position:"relative", overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", width:600, height:600, borderRadius:"50%",
        background:`radial-gradient(circle, ${theme.accent}08 0%, transparent 65%)`,
        top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none"
      }}/>
      <div className="fu" style={{
        width:"100%", maxWidth:420, background:theme.card,
        border:`1px solid ${theme.border}`, borderRadius:22, padding:"40px 36px"
      }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:"'Space Mono',monospace", color:theme.accent, fontSize:30, letterSpacing:8, fontWeight:700 }}>NEXUS</div>
          <div style={{ color:theme.muted, fontSize:10, letterSpacing:4, marginTop:6 }}>CORE SAAS PLATFORM</div>
        </div>

        <div style={{ display:"flex", background:theme.bg, borderRadius:10, padding:4, marginBottom:28 }}>
          {["login","register"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:"10px", border:"none", borderRadius:8, cursor:"pointer",
              background: tab===t ? theme.accent : "transparent",
              color: tab===t ? "#000" : theme.muted,
              fontSize:12, fontWeight:700, letterSpacing:1, transition:"all 0.25s"
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        {tab==="register" && (
          <input placeholder="Full Name" value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})} style={inp}
            onFocus={e=>e.target.style.borderColor=theme.accent}
            onBlur={e=>e.target.style.borderColor=theme.border} />
        )}
        <input placeholder="Email address" type="email" value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})} style={inp}
          onFocus={e=>e.target.style.borderColor=theme.accent}
          onBlur={e=>e.target.style.borderColor=theme.border}
          onKeyDown={e=>e.key==="Enter"&&submit()} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e=>setForm({...form,password:e.target.value})} style={inp}
          onFocus={e=>e.target.style.borderColor=theme.accent}
          onBlur={e=>e.target.style.borderColor=theme.border}
          onKeyDown={e=>e.key==="Enter"&&submit()} />

        {tab==="register" && (
          <div style={{ background:theme.accentDim, border:`1px solid ${theme.accent}30`, borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:12, color:theme.accent, lineHeight:1.5 }}>
            💡 <strong>First person to register becomes Admin.</strong> Everyone else is a regular user.
          </div>
        )}

        {error && (
          <div style={{ background:"#ff475715", border:`1px solid ${theme.danger}40`, borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:12, color:theme.danger, lineHeight:1.5 }}>
            ❌ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} className="glow-btn" style={{
          width:"100%", padding:"14px", borderRadius:10, border:"none",
          background: loading ? theme.muted : theme.accent,
          color:"#000", fontSize:14, fontWeight:700, letterSpacing:1,
          cursor: loading ? "not-allowed" : "pointer", transition:"opacity 0.2s"
        }}>
          {loading ? "⏳ Please wait..." : tab==="login" ? "▶  LOGIN" : "▶  CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────
function HomePage({ user, theme }) {
  const cards = [
    { title:"Skills Tracker", desc:"Add, manage and track your personal skills library", link:"/skills", color:theme.accent, icon:"🧠" },
    { title:"Dashboard", desc:"Analytics, roadmap and your learning progress", link:"/dashboard", color:theme.blue, icon:"📊" },
    { title:"My Profile", desc:"Account settings, password and user info", link:"/profile", color:theme.purple, icon:"👤" },
    ...(user?.role==="admin" ? [{ title:"Admin Panel", desc:"Manage all users and platform-wide stats", link:"/admin", color:theme.yellow, icon:"⚡" }] : [])
  ];

  return (
    <div style={{ padding:"40px 20px", maxWidth:1100, margin:"0 auto" }}>
      <div className="fu" style={{ marginBottom:48 }}>
        <p style={{ color:theme.muted, fontSize:12, letterSpacing:3, textTransform:"uppercase", marginBottom:10, fontFamily:"'Space Mono',monospace" }}>Welcome back</p>
        <h1 style={{ fontSize:"clamp(26px,5vw,52px)", fontWeight:700, lineHeight:1.2 }}>
          Hello, <span style={{ color:theme.accent }}>{user?.name}</span> 👋
        </h1>
        <p style={{ color:theme.muted, marginTop:12, fontSize:15 }}>
          Logged in as <span style={{ color:theme.blue, fontWeight:600 }}>{user?.role}</span> · Build something amazing today.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
        {cards.map((c,i) => (
          <Link key={c.title} to={c.link} style={{ textDecoration:"none" }} className={`fu${i+1}`}>
            <div style={{
              background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16,
              padding:28, cursor:"pointer", transition:"all 0.3s", minHeight:160,
              position:"relative", overflow:"hidden"
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow=`0 16px 48px ${c.color}18`}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
              <div style={{ fontSize:36, marginBottom:16 }}>{c.icon}</div>
              <h2 style={{ color:c.color, fontSize:18, fontWeight:700, marginBottom:8 }}>{c.title}</h2>
              <p style={{ color:theme.muted, fontSize:13, lineHeight:1.6 }}>{c.desc}</p>
              <div style={{ position:"absolute", bottom:20, right:20, color:c.color, fontSize:22, opacity:0.2, fontWeight:700 }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────
function DashboardPage({ user, theme }) {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch(API+"/skills",{headers:getHeaders()})
      .then(r=>r.json()).then(d=>Array.isArray(d)&&setSkills(d));
  },[]);

  const roadmap = [
    {l:"HTML + CSS",d:true},{l:"JavaScript",d:true},{l:"React",d:true},
    {l:"Node.js + Express",d:true},{l:"PostgreSQL + Prisma",d:true},
    {l:"JWT Authentication",d:true},{l:"React Router",d:true},
    {l:"Deploy to Internet",d:true},{l:"Advanced Full Stack",d:true},
    {l:"AI Platform",d:false},{l:"Ecommerce Module",d:false},{l:"Job Platform",d:false}
  ];
  const done = roadmap.filter(r=>r.d).length;
  const pct = Math.round(done/roadmap.length*100);

  return (
    <div style={{ padding:"40px 20px", maxWidth:1100, margin:"0 auto" }}>
      <div className="fu" style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:32, fontWeight:700 }}>📊 Dashboard</h1>
        <p style={{ color:theme.muted, marginTop:4 }}>Your personal learning analytics</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:16, marginBottom:28 }}>
        <StatCard label="My Skills" value={skills.length} color={theme.accent} icon="🧠" cls="fu1" theme={theme}/>
        <StatCard label="Lessons Done" value={done} color={theme.blue} icon="📚" cls="fu2" theme={theme}/>
        <StatCard label="Progress" value={`${pct}%`} color={theme.purple} icon="🚀" cls="fu3" theme={theme}/>
        <StatCard label="Days Active" value="2" color={theme.yellow} icon="🔥" cls="fu4" theme={theme}/>
      </div>

      {/* Progress bar + roadmap */}
      <div className="fu2" style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:28, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
          <h2 style={{ fontSize:18, fontWeight:600 }}>🗺️ Learning Roadmap</h2>
          <span style={{ color:theme.accent, fontFamily:"'Space Mono',monospace", fontSize:14 }}>{pct}% Complete</span>
        </div>
        <div style={{ background:theme.bg, borderRadius:8, height:8, marginBottom:24, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${theme.accent},${theme.blue})`, borderRadius:8, transition:"width 1.2s ease" }}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:6 }}>
          {roadmap.map((r,i)=>(
            <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 12px", borderRadius:8, background:r.d?theme.accentDim:"transparent" }}>
              <span>{r.d?"✅":"⬜"}</span>
              <span style={{ color:r.d?theme.accent:theme.muted, fontSize:13 }}>{r.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills tags */}
      <div className="fu3" style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:28 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:16 }}>🧠 My Skills ({skills.length})</h2>
        {skills.length===0 ? (
          <p style={{ color:theme.muted, fontSize:14 }}>No skills yet. <Link to="/skills" style={{ color:theme.accent, textDecoration:"none" }}>Add your first skill →</Link></p>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {skills.map(s=>(
              <span key={s.id} style={{ background:theme.accentDim, color:theme.accent, border:`1px solid ${theme.accent}30`, borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:500 }}>{s.name}</span>
            ))}
          </div>
        )}
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

  const load = useCallback(()=>{
    fetch(API+"/skills",{headers:getHeaders()})
      .then(r=>r.json()).then(d=>{if(Array.isArray(d))setSkills(d);setLoading(false);});
  },[]);

  useEffect(()=>{load();},[load]);

  async function addSkill() {
    if(!input.trim()) return;
    setAdding(true);
    const res = await fetch(API+"/skills",{method:"POST",headers:getHeaders(),body:JSON.stringify({skill:input.trim()})});
    const data = await res.json();
    if(data.skills) setSkills(data.skills);
    setInput(""); setAdding(false);
  }

  async function deleteSkill(id) {
    const res = await fetch(`${API}/skills/${id}`,{method:"DELETE",headers:getHeaders()});
    const data = await res.json();
    if(data.skills) setSkills(data.skills);
  }

  const inp = {
    flex:1, padding:"13px 18px", borderRadius:12,
    background:theme.card, border:`1px solid ${theme.border}`,
    color:theme.text, fontSize:14, outline:"none", transition:"border-color 0.2s",
    minWidth:0
  };

  return (
    <div style={{ padding:"40px 20px", maxWidth:700, margin:"0 auto" }}>
      <div className="fu" style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:32, fontWeight:700 }}>🧠 Skills Tracker</h1>
        <p style={{ color:theme.muted, marginTop:4, fontSize:14 }}>Your private skill library — only you can see these</p>
      </div>

      <div className="fu1" style={{ display:"flex", gap:10, marginBottom:28 }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&addSkill()}
          placeholder="Type a skill and press Enter…"
          style={inp}
          onFocus={e=>e.target.style.borderColor=theme.accent}
          onBlur={e=>e.target.style.borderColor=theme.border}
        />
        <button onClick={addSkill} disabled={adding} className="glow-btn" style={{
          padding:"13px 22px", borderRadius:12, border:"none",
          background:theme.accent, color:"#000", fontWeight:700,
          fontSize:14, cursor:"pointer", flexShrink:0, transition:"opacity 0.2s",
          opacity:adding?0.6:1
        }}>{adding?"…":"+ Add"}</button>
      </div>

      <div className="fu2" style={{ color:theme.muted, fontSize:12, marginBottom:14, fontFamily:"'Space Mono',monospace" }}>
        {loading ? "Loading…" : `${skills.length} SKILL${skills.length!==1?"S":""} TRACKED`}
      </div>

      {!loading && skills.map((sk,i)=>(
        <div key={sk.id} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:theme.card, border:`1px solid ${theme.border}`,
          borderLeft:`3px solid ${theme.accent}`, borderRadius:12,
          padding:"13px 18px", marginBottom:8,
          animation:`fadeUp 0.35s ${i*0.04}s both`, transition:"border-color 0.2s, transform 0.2s"
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=theme.accent;e.currentTarget.style.transform="translateX(4px)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.borderLeftColor=theme.accent;e.currentTarget.style.transform="none"}}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ color:theme.accent, fontWeight:700, fontSize:16 }}>✓</span>
            <span style={{ fontWeight:500 }}>{sk.name}</span>
          </div>
          <button onClick={()=>deleteSkill(sk.id)} style={{
            background:"none", border:`1px solid ${theme.danger}40`, color:theme.danger,
            padding:"4px 12px", borderRadius:8, cursor:"pointer", fontSize:12, transition:"all 0.2s"
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=theme.danger;e.currentTarget.style.color="#fff"}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=theme.danger}}>
            Delete
          </button>
        </div>
      ))}

      {!loading && skills.length===0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:theme.muted }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🧠</div>
          <p>No skills yet! Add your first skill above.</p>
        </div>
      )}
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────
function ProfilePage({ user, theme }) {
  const [form, setForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);

  async function changePassword() {
    if(form.newPassword!==form.confirmPassword){setErr("Passwords don't match!");return;}
    if(form.newPassword.length<6){setErr("Min 6 characters");return;}
    setLoading(true); setErr(""); setMsg("");
    try {
      const res = await fetch(API+"/change-password",{method:"PUT",headers:getHeaders(),body:JSON.stringify({currentPassword:form.currentPassword,newPassword:form.newPassword})});
      const data = await res.json();
      if(data.error) setErr(data.error);
      else { setMsg("✅ Password changed!"); setForm({currentPassword:"",newPassword:"",confirmPassword:""}); }
    } catch { setErr("Server error"); }
    setLoading(false);
  }

  const inp = { width:"100%", padding:"12px 16px", borderRadius:10, background:theme.bg, border:`1px solid ${theme.border}`, color:theme.text, fontSize:14, outline:"none", marginBottom:12, transition:"border-color 0.2s" };

  return (
    <div style={{ padding:"40px 20px", maxWidth:600, margin:"0 auto" }}>
      <div className="fu" style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:32, fontWeight:700 }}>👤 My Profile</h1>
      </div>

      <div className="fu1" style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:28, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:28 }}>
          <div style={{ width:62, height:62, borderRadius:"50%", background:`linear-gradient(135deg,${theme.accent},${theme.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:700, color:"#000", flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700 }}>{user?.name}</h2>
            <span style={{ background:user?.role==="admin"?theme.yellow+"30":theme.accentDim, color:user?.role==="admin"?theme.yellow:theme.accent, borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:700, letterSpacing:1 }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {[{l:"Email",v:user?.email},{l:"Role",v:user?.role},{l:"Plan",v:"Free"},{l:"Member Since",v:"2026"}].map(f=>(
          <div key={f.l} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${theme.border}` }}>
            <span style={{ color:theme.muted, fontSize:13 }}>{f.l}</span>
            <span style={{ fontSize:13, fontWeight:500 }}>{f.v}</span>
          </div>
        ))}
      </div>

      <div className="fu2" style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:28 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:20 }}>🔒 Change Password</h2>
        <input placeholder="Current Password" type="password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})} style={inp} onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border}/>
        <input placeholder="New Password (min 6 chars)" type="password" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} style={inp} onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border}/>
        <input placeholder="Confirm New Password" type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} style={inp} onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border}/>
        {err && <div style={{ color:theme.danger, fontSize:13, marginBottom:12 }}>❌ {err}</div>}
        {msg && <div style={{ color:theme.accent, fontSize:13, marginBottom:12 }}>{msg}</div>}
        <button onClick={changePassword} disabled={loading} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:loading?theme.muted:theme.accent, color:"#000", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {loading?"Changing…":"Change Password"}
        </button>
      </div>
    </div>
  );
}

// ── ADMIN PAGE ────────────────────────────────
function AdminPage({ theme }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([
      fetch(API+"/admin/users",{headers:getHeaders()}).then(r=>r.json()),
      fetch(API+"/admin/stats",{headers:getHeaders()}).then(r=>r.json())
    ]).then(([u,s])=>{
      if(Array.isArray(u)) setUsers(u);
      if(s?.totalUsers!==undefined) setStats(s);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  async function deleteUser(id) {
    if(!window.confirm("Delete this user and all their data?")) return;
    const res = await fetch(`${API}/admin/users/${id}`,{method:"DELETE",headers:getHeaders()});
    const data = await res.json();
    if(data.users) setUsers(data.users);
  }

  if(loading) return (
    <div style={{ padding:60, textAlign:"center", color:theme.muted }}>
      <div style={{ fontSize:48, animation:"pulse 1s infinite" }}>⚡</div>
      <p style={{ marginTop:16 }}>Loading admin data…</p>
    </div>
  );

  return (
    <div style={{ padding:"40px 20px", maxWidth:1100, margin:"0 auto" }}>
      <div className="fu" style={{ marginBottom:36 }}>
        <h1 style={{ fontSize:32, fontWeight:700 }}>⚡ Admin Panel</h1>
        <p style={{ color:theme.muted, marginTop:4 }}>Full platform control</p>
      </div>

      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:32 }}>
          <StatCard label="Total Users" value={stats.totalUsers} color={theme.blue} icon="👥" cls="fu1" theme={theme}/>
          <StatCard label="Total Skills" value={stats.totalSkills} color={theme.accent} icon="🧠" cls="fu2" theme={theme}/>
          <StatCard label="Admins" value={stats.adminCount} color={theme.yellow} icon="⚡" cls="fu3" theme={theme}/>
          <StatCard label="Regular Users" value={stats.totalUsers-stats.adminCount} color={theme.purple} icon="👤" cls="fu4" theme={theme}/>
        </div>
      )}

      <div className="fu2" style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${theme.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ fontSize:18, fontWeight:600 }}>👥 All Users</h2>
          <span style={{ color:theme.muted, fontSize:13, fontFamily:"'Space Mono',monospace" }}>{users.length} total</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:theme.bg }}>
                {["User","Email","Role","Skills","Joined","Actions"].map(h=>(
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", color:theme.muted, fontSize:10, letterSpacing:2, fontWeight:600, textTransform:"uppercase", fontFamily:"'Space Mono',monospace", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} style={{ borderTop:`1px solid ${theme.border}`, transition:"background 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=theme.accentDim}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:u.role==="admin"?theme.yellow:theme.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000", flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight:500, fontSize:14 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"14px 16px", color:theme.muted, fontSize:13 }}>{u.email}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ background:u.role==="admin"?theme.yellow+"25":theme.accentDim, color:u.role==="admin"?theme.yellow:theme.accent, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{u.role}</span>
                  </td>
                  <td style={{ padding:"14px 16px", fontFamily:"'Space Mono',monospace", fontSize:14, color:theme.text }}>{u._count?.skills||0}</td>
                  <td style={{ padding:"14px 16px", color:theme.muted, fontSize:12, whiteSpace:"nowrap" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding:"14px 16px" }}>
                    {u.role!=="admin" && (
                      <button onClick={()=>deleteUser(u.id)} style={{ background:"none", border:`1px solid ${theme.danger}40`, color:theme.danger, padding:"4px 12px", borderRadius:8, cursor:"pointer", fontSize:12, transition:"all 0.2s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background=theme.danger;e.currentTarget.style.color="#fff"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=theme.danger}}>
                        Delete
                      </button>
                    )}
                    {u.role==="admin" && <span style={{ color:theme.muted, fontSize:12 }}>Protected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="fu3" style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:28, marginTop:20 }}>
          <h2 style={{ fontSize:18, fontWeight:600, marginBottom:16 }}>🕐 Recent Signups</h2>
          {stats.recentUsers.map(u=>(
            <div key={u.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${theme.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:theme.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>{u.name?.[0]?.toUpperCase()}</div>
                <span style={{ fontSize:14, fontWeight:500 }}>{u.name}</span>
              </div>
              <span style={{ color:theme.muted, fontSize:12 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────
export default function App() {
  const [user, setUser] = useState(()=>{ try{return JSON.parse(localStorage.getItem("user"));}catch{return null;} });
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? themes.dark : themes.light;

  return (
    <BrowserRouter>
      <GlobalStyle theme={theme}/>
      {user && <Navbar user={user} onLogout={()=>{localStorage.removeItem("token");localStorage.removeItem("user");setUser(null);}} theme={theme} toggleTheme={()=>setIsDark(!isDark)} isDark={isDark}/>}
      <Routes>
        <Route path="/auth" element={user?<Navigate to="/"/>:<AuthPage onLogin={u=>{setUser(u);}} theme={theme}/>}/>
        <Route path="/" element={user?<HomePage user={user} theme={theme}/>:<Navigate to="/auth"/>}/>
        <Route path="/dashboard" element={user?<DashboardPage user={user} theme={theme}/>:<Navigate to="/auth"/>}/>
        <Route path="/skills" element={user?<SkillsPage theme={theme}/>:<Navigate to="/auth"/>}/>
        <Route path="/profile" element={user?<ProfilePage user={user} theme={theme}/>:<Navigate to="/auth"/>}/>
        <Route path="/admin" element={user?.role==="admin"?<AdminPage theme={theme}/>:<Navigate to="/"/>}/>
      </Routes>
    </BrowserRouter>
  );
}