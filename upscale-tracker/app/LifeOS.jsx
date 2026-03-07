import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0a0f",
  card: "#12121a",
  border: "#1e1e2e",
  accent: "#7c3aed",
  accentGlow: "#9f67ff",
  gold: "#f59e0b",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  text: "#e2e8f0",
  muted: "#64748b",
  soft: "#1e1e30",
};

const initialData = {
  user: { name: "Alex", xp: 4280, level: 12, streak: 18 },
  habits: [
    { id: 1, title: "Morning Meditation", icon: "🧘", streak: 18, done: true, freq: "Daily", cat: "Health" },
    { id: 2, title: "Drink 2L Water", icon: "💧", streak: 15, done: true, freq: "Daily", cat: "Health" },
    { id: 3, title: "Read 30 mins", icon: "📚", streak: 7, done: false, freq: "Daily", cat: "Learning" },
    { id: 4, title: "Code Practice", icon: "💻", streak: 22, done: true, freq: "Daily", cat: "Skill" },
    { id: 5, title: "Evening Walk", icon: "🚶", streak: 5, done: false, freq: "Daily", cat: "Fitness" },
  ],
  tasks: [
    { id: 1, title: "Design landing page", project: "Startup", priority: "High", done: false, due: "Today" },
    { id: 2, title: "Review pull requests", project: "Work", priority: "High", done: true, due: "Today" },
    { id: 3, title: "Write blog post draft", project: "Personal", priority: "Medium", done: false, due: "Tomorrow" },
    { id: 4, title: "Update expense sheet", project: "Finance", priority: "Low", done: false, due: "This week" },
    { id: 5, title: "Plan workout routine", project: "Fitness", priority: "Medium", done: true, due: "Today" },
  ],
  goals: [
    { id: 1, title: "Become Python Developer", icon: "🐍", progress: 65, deadline: "Dec 2025", cat: "Career" },
    { id: 2, title: "Save ₹1,00,000", icon: "💰", progress: 42, deadline: "Mar 2026", cat: "Finance" },
    { id: 3, title: "Lose 8 kg", icon: "🏃", progress: 55, deadline: "Jun 2025", cat: "Health" },
    { id: 4, title: "Launch SaaS Product", icon: "🚀", progress: 30, deadline: "Sep 2025", cat: "Business" },
  ],
  skills: [
    { id: 1, name: "Python", level: "Intermediate", hours: 120, max: 200, color: COLORS.blue },
    { id: 2, name: "Design", level: "Advanced", hours: 340, max: 400, color: COLORS.accentGlow },
    { id: 3, name: "Marketing", level: "Beginner", hours: 45, max: 200, color: COLORS.gold },
    { id: 4, name: "Finance", level: "Beginner", hours: 20, max: 200, color: COLORS.green },
  ],
  finance: {
    income: 85000, expenses: 52000, savings: 33000,
    items: [
      { id: 1, label: "Salary", amount: 85000, type: "income" },
      { id: 2, label: "Rent", amount: -25000, type: "expense" },
      { id: 3, label: "Food", amount: -8000, type: "expense" },
      { id: 4, label: "Transport", amount: -3500, type: "expense" },
      { id: 5, label: "Entertainment", amount: -4500, type: "expense" },
      { id: 6, label: "Savings", amount: 33000, type: "saving" },
    ]
  },
  weeklyData: [62, 78, 55, 88, 72, 90, 84],
  achievements: [
    { icon: "🔥", title: "7-Day Streak", unlocked: true },
    { icon: "⚡", title: "Speed Learner", unlocked: true },
    { icon: "💎", title: "Goal Crusher", unlocked: true },
    { icon: "🏆", title: "30-Day Champion", unlocked: false },
    { icon: "🌟", title: "Level 15", unlocked: false },
    { icon: "🎯", title: "Perfect Week", unlocked: false },
  ]
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function XPBar({ xp, level }) {
  const pct = ((xp % 500) / 500) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 13 }}>LVL {level}</span>
      <div style={{ flex: 1, height: 6, background: COLORS.border, borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gold})`, borderRadius: 99, transition: "width 1s ease" }} />
      </div>
      <span style={{ color: COLORS.muted, fontSize: 11 }}>{xp} XP</span>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -10, fontSize: 64, opacity: 0.06 }}>{icon}</div>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ marginTop: 10, fontSize: 26, fontWeight: 800, color: color || COLORS.text, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.green, marginTop: 4 }}>↑ {sub}</div>}
    </div>
  );
}

function ProgressRing({ pct, size = 70, color = COLORS.accent, children }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>{children}</div>
    </div>
  );
}

function WeeklyChart({ data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: `${(v / max) * 72}px`, borderRadius: "6px 6px 2px 2px", background: i === 6 ? `linear-gradient(180deg, ${COLORS.accentGlow}, ${COLORS.accent})` : COLORS.soft, transition: "height 0.8s ease", position: "relative" }}>
            {i === 6 && <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: COLORS.accentGlow, fontWeight: 700 }}>{v}%</div>}
          </div>
          <span style={{ fontSize: 10, color: COLORS.muted }}>{weekdays[i]}</span>
        </div>
      ))}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", width: "100%", textAlign: "left", background: active ? `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.accent}11)` : "transparent", color: active ? COLORS.accentGlow : COLORS.muted, fontWeight: active ? 700 : 500, fontSize: 14, transition: "all 0.2s", borderLeft: active ? `3px solid ${COLORS.accent}` : "3px solid transparent" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function PriorityBadge({ p }) {
  const c = p === "High" ? COLORS.red : p === "Medium" ? COLORS.gold : COLORS.green;
  return <span style={{ fontSize: 10, color: c, background: `${c}22`, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{p}</span>;
}

export default function LifeOS() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(initialData);
  const [timer, setTimer] = useState({ running: false, seconds: 0, label: "Focus Session" });
  const [newTask, setNewTask] = useState("");
  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChat, setAiChat] = useState([{ role: "ai", text: "👋 Hi! I'm your AI Life Coach. Ask me anything about productivity, habits, goals, or how to optimize your day!" }]);
  const [newHabit, setNewHabit] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timer.running) {
      timerRef.current = setInterval(() => setTimer(t => ({ ...t, seconds: t.seconds + 1 })), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timer.running]);

  const fmtTime = s => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleHabit = (id) => {
    setData(d => ({ ...d, habits: d.habits.map(h => h.id === id ? { ...h, done: !h.done } : h) }));
  };

  const toggleTask = (id) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setData(d => ({ ...d, tasks: [...d.tasks, { id: Date.now(), title: newTask, project: "Personal", priority: "Medium", done: false, due: "Today" }] }));
    setNewTask("");
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setData(d => ({ ...d, habits: [...d.habits, { id: Date.now(), title: newHabit, icon: "✨", streak: 0, done: false, freq: "Daily", cat: "Personal" }] }));
    setNewHabit("");
  };

  const sendAI = async () => {
    if (!aiMsg.trim()) return;
    const userMsg = aiMsg;
    setAiChat(c => [...c, { role: "user", text: userMsg }]);
    setAiMsg("");
    setAiLoading(true);

    const habitsInfo = data.habits.map(h => `${h.title}: ${h.streak} day streak`).join(", ");
    const goalsInfo = data.goals.map(g => `${g.title}: ${g.progress}%`).join(", ");
    const systemPrompt = `You are an expert AI Life Coach embedded in a productivity app called Life OS. The user's current data: Habits: ${habitsInfo}. Goals: ${goalsInfo}. XP Level: ${data.user.level}. Streak: ${data.user.streak} days. Give concise, actionable, motivating advice. Keep responses under 100 words. Use emojis sparingly.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const json = await res.json();
      const reply = json.content?.map(b => b.text || "").join("") || "Sorry, I couldn't respond right now.";
      setAiChat(c => [...c, { role: "ai", text: reply }]);
    } catch {
      setAiChat(c => [...c, { role: "ai", text: "Connection error. Please try again." }]);
    }
    setAiLoading(false);
  };

  const completedHabits = data.habits.filter(h => h.done).length;
  const completedTasks = data.tasks.filter(t => t.done).length;
  const prodScore = Math.round(((completedHabits / data.habits.length) * 0.4 + (completedTasks / data.tasks.length) * 0.4 + 0.2) * 100);

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "habits", icon: "🔥", label: "Habits" },
    { id: "tasks", icon: "✅", label: "Tasks" },
    { id: "goals", icon: "🎯", label: "Goals" },
    { id: "skills", icon: "📈", label: "Skills" },
    { id: "finance", icon: "💰", label: "Finance" },
    { id: "timer", icon: "⏱", label: "Focus Timer" },
    { id: "ai", icon: "🧠", label: "AI Coach" },
    { id: "achievements", icon: "🏆", label: "Achievements" },
  ];

  const Sidebar = () => (
    <div style={{ width: 220, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "24px 12px", gap: 4, flexShrink: 0 }}>
      <div style={{ padding: "0 8px 20px", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -1, background: `linear-gradient(135deg, ${COLORS.accentGlow}, ${COLORS.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚡ Life OS</div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{data.user.name}</div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>🔥 {data.user.streak} day streak</div>
            </div>
          </div>
          <XPBar xp={data.user.xp} level={data.user.level} />
        </div>
      </div>
      {navItems.map(n => <NavItem key={n.id} {...n} active={tab === n.id} onClick={() => { setTab(n.id); setMobileSidebar(false); }} />)}
      <div style={{ marginTop: "auto", padding: "12px 14px", background: `${COLORS.accent}11`, borderRadius: 12, border: `1px solid ${COLORS.accent}33` }}>
        <div style={{ fontSize: 11, color: COLORS.accentGlow, fontWeight: 700 }}>⚡ PRO</div>
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Unlock AI insights & advanced analytics</div>
        <button style={{ marginTop: 8, width: "100%", padding: "6px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Upgrade ₹299/mo</button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>Good morning, {data.user.name}! 👋</h2>
        <p style={{ color: COLORS.muted, margin: "4px 0 0", fontSize: 13 }}>You're on a {data.user.streak}-day streak. Keep it up!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <StatCard icon="✅" label="Tasks Done" value={`${completedTasks}/${data.tasks.length}`} sub="Today" color={COLORS.green} />
        <StatCard icon="🔥" label="Habit Streak" value={`${data.user.streak}d`} sub="+3 this week" color={COLORS.gold} />
        <StatCard icon="⏱" label="Focus Time" value="3h 24m" sub="Today" color={COLORS.blue} />
        <StatCard icon="⚡" label="Prod. Score" value={`${prodScore}%`} sub="vs yesterday" color={COLORS.accentGlow} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>📊 Weekly Productivity</div>
          <WeeklyChart data={data.weeklyData} />
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>🎯 Top Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.goals.slice(0, 3).map(g => (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: COLORS.text }}>{g.icon} {g.title.slice(0, 20)}</span>
                  <span style={{ color: COLORS.muted }}>{g.progress}%</span>
                </div>
                <div style={{ height: 4, background: COLORS.border, borderRadius: 99 }}>
                  <div style={{ width: `${g.progress}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentGlow})`, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>🔥 Today's Habits</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {data.habits.map(h => (
            <button key={h.id} onClick={() => toggleHabit(h.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 30, border: `1px solid ${h.done ? COLORS.green : COLORS.border}`, background: h.done ? `${COLORS.green}15` : "transparent", cursor: "pointer", color: h.done ? COLORS.green : COLORS.muted, fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}>
              <span>{h.icon}</span><span>{h.title}</span>
              {h.done && <span style={{ fontSize: 11 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>✅ Today's Tasks</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.tasks.filter(t => t.due === "Today").map(t => (
            <div key={t.id} onClick={() => toggleTask(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: t.done ? `${COLORS.green}08` : COLORS.soft, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${t.done ? COLORS.green : COLORS.border}`, background: t.done ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {t.done && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
              </div>
              <span style={{ flex: 1, color: t.done ? COLORS.muted : COLORS.text, textDecoration: t.done ? "line-through" : "none", fontSize: 13 }}>{t.title}</span>
              <PriorityBadge p={t.priority} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHabits = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>🔥 Habit Tracker</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()} placeholder="New habit..." style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.soft, color: COLORS.text, fontSize: 13, outline: "none", width: 160 }} />
          <button onClick={addHabit} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Add</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {data.habits.map(h => (
          <div key={h.id} style={{ background: COLORS.card, border: `1px solid ${h.done ? COLORS.green + "44" : COLORS.border}`, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 30 }}>{h.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{h.title}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{h.cat} • {h.freq}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 13, color: COLORS.gold }}>🔥 {h.streak} days</span>
              </div>
            </div>
            <button onClick={() => toggleHabit(h.id)} style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${h.done ? COLORS.green : COLORS.border}`, background: h.done ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0, transition: "all 0.2s" }}>
              {h.done ? "✓" : ""}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>📈 Habit Completion Today</div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <ProgressRing pct={(completedHabits / data.habits.length) * 100} size={90} color={COLORS.green}>
            <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>{completedHabits}/{data.habits.length}</div>
          </ProgressRing>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.green }}>{Math.round((completedHabits / data.habits.length) * 100)}%</div>
            <div style={{ fontSize: 13, color: COLORS.muted }}>habits completed today</div>
            <div style={{ marginTop: 6, fontSize: 12, color: COLORS.gold }}>🔥 Best streak: {Math.max(...data.habits.map(h => h.streak))} days</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>✅ Task Manager</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="New task..." style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.soft, color: COLORS.text, fontSize: 13, outline: "none", width: 180 }} />
          <button onClick={addTask} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Add</button>
        </div>
      </div>

      {["Today", "Tomorrow", "This week"].map(group => {
        const grouped = data.tasks.filter(t => t.due === group);
        if (!grouped.length) return null;
        return (
          <div key={group} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{group}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped.map(t => (
                <div key={t.id} onClick={() => toggleTask(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: t.done ? `${COLORS.green}08` : COLORS.soft, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.done ? COLORS.green : COLORS.border}`, background: t.done ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {t.done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: t.done ? COLORS.muted : COLORS.text, textDecoration: t.done ? "line-through" : "none", fontSize: 14 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t.project}</div>
                  </div>
                  <PriorityBadge p={t.priority} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGoals = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>🎯 Goal Tracker</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {data.goals.map(g => (
          <div key={g.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <ProgressRing pct={g.progress} size={70} color={COLORS.accent}>
                <div style={{ fontSize: 20 }}>{g.icon}</div>
              </ProgressRing>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{g.title}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>📅 Deadline: {g.deadline}</div>
                <div style={{ fontSize: 11, background: `${COLORS.accent}22`, color: COLORS.accentGlow, padding: "2px 8px", borderRadius: 99, display: "inline-block", marginTop: 6 }}>{g.cat}</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
                <span>Progress</span><span style={{ color: COLORS.accentGlow, fontWeight: 700 }}>{g.progress}%</span>
              </div>
              <div style={{ height: 8, background: COLORS.border, borderRadius: 99 }}>
                <div style={{ width: `${g.progress}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentGlow})`, borderRadius: 99, transition: "width 1s" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>📈 Skill Tracker</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {data.skills.map(s => (
          <div key={s.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{s.name}</div>
                <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.level}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text }}>{s.hours}h</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>of {s.max}h</div>
              </div>
            </div>
            <div style={{ height: 10, background: COLORS.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${(s.hours / s.max) * 100}%`, height: "100%", background: s.color, borderRadius: 99, transition: "width 1s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: COLORS.muted }}>
              <span>{Math.round((s.hours / s.max) * 100)}% to next level</span>
              <span>{s.max - s.hours}h remaining</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>💰 Finance Tracker</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard icon="📥" label="Income" value={`₹${(data.finance.income / 1000).toFixed(0)}K`} color={COLORS.green} />
        <StatCard icon="📤" label="Expenses" value={`₹${(data.finance.expenses / 1000).toFixed(0)}K`} color={COLORS.red} />
        <StatCard icon="🏦" label="Savings" value={`₹${(data.finance.savings / 1000).toFixed(0)}K`} color={COLORS.blue} />
      </div>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>📊 Savings Rate</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing pct={Math.round((data.finance.savings / data.finance.income) * 100)} size={90} color={COLORS.green}>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.green }}>{Math.round((data.finance.savings / data.finance.income) * 100)}%</div>
          </ProgressRing>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>Saving {Math.round((data.finance.savings / data.finance.income) * 100)}% of income</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>Target: 40% | Current: {Math.round((data.finance.savings / data.finance.income) * 100)}%</div>
            <div style={{ marginTop: 8, height: 6, width: 200, background: COLORS.border, borderRadius: 99 }}>
              <div style={{ width: `${Math.min((data.finance.savings / data.finance.income) * 100 / 40 * 100, 100)}%`, height: "100%", background: COLORS.green, borderRadius: 99 }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>💳 This Month</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.finance.items.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: COLORS.soft }}>
              <span style={{ fontSize: 14, color: COLORS.text }}>{item.label}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: item.type === "income" ? COLORS.green : item.type === "saving" ? COLORS.blue : COLORS.red }}>
                {item.amount > 0 ? "+" : ""}₹{Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTimer = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0, alignSelf: "flex-start" }}>⏱ Focus Timer</h2>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 48, textAlign: "center", width: "100%", maxWidth: 420 }}>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 200, height: 200 }}>
          <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
            <circle cx={100} cy={100} r={88} fill="none" stroke={COLORS.border} strokeWidth={8} />
            <circle cx={100} cy={100} r={88} fill="none" stroke={timer.running ? COLORS.accentGlow : COLORS.accent} strokeWidth={8}
              strokeDasharray={553} strokeDashoffset={553 - (553 * ((timer.seconds % 1500) / 1500))}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.text, fontFamily: "monospace", letterSpacing: 2 }}>{fmtTime(timer.seconds)}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{timer.label}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
          <button onClick={() => setTimer(t => ({ ...t, running: !t.running }))} style={{ padding: "12px 32px", borderRadius: 50, border: "none", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
            {timer.running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={() => setTimer({ running: false, seconds: 0, label: "Focus Session" })} style={{ padding: "12px 20px", borderRadius: 50, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            ↺ Reset
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          {["Focus 25m", "Break 5m", "Deep 90m"].map(label => (
            <button key={label} onClick={() => setTimer({ running: false, seconds: label.includes("25") ? 1500 : label.includes("5") ? 300 : 5400, label })} style={{ padding: "6px 14px", borderRadius: 30, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontSize: 12, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, width: "100%", maxWidth: 420 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Today's Focus</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {[["3h 24m", "Total Focus"], ["5", "Sessions"], ["28m", "Avg. Session"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accentGlow }}>{v}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAI = () => {
    const chatRef = useRef(null);
    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [aiChat]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>🧠 AI Life Coach</h2>
        <div ref={chatRef} style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, overflowY: "auto", maxHeight: 440, display: "flex", flexDirection: "column", gap: 12 }}>
          {aiChat.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "10px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})` : COLORS.soft, fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: COLORS.soft, fontSize: 13, color: COLORS.muted }}>
                <span style={{ display: "inline-flex", gap: 4 }}>
                  {[0, 1, 2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accentGlow, display: "inline-block", animation: `pulse 1.2s ${j * 0.2}s infinite` }}>.</span>)}
                </span>
                Thinking...
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={aiMsg} onChange={e => setAiMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendAI()} placeholder="Ask your AI coach anything..." style={{ flex: 1, padding: "12px 18px", borderRadius: 50, border: `1px solid ${COLORS.border}`, background: COLORS.soft, color: COLORS.text, fontSize: 14, outline: "none" }} />
          <button onClick={sendAI} disabled={aiLoading} style={{ padding: "12px 22px", borderRadius: 50, border: "none", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: aiLoading ? 0.6 : 1 }}>Send ✈</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["What should I focus on today?", "How to improve my habits?", "Rate my goal progress", "Give me a productivity tip"].map(q => (
            <button key={q} onClick={() => { setAiMsg(q); }} style={{ padding: "6px 14px", borderRadius: 30, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontSize: 12, cursor: "pointer" }}>{q}</button>
          ))}
        </div>
      </div>
    );
  };

  const renderAchievements = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0 }}>🏆 Achievements</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {data.achievements.map((a, i) => (
          <div key={i} style={{ background: COLORS.card, border: `1px solid ${a.unlocked ? COLORS.gold + "55" : COLORS.border}`, borderRadius: 16, padding: 22, textAlign: "center", opacity: a.unlocked ? 1 : 0.5 }}>
            <div style={{ fontSize: 40, marginBottom: 10, filter: a.unlocked ? "none" : "grayscale(100%)" }}>{a.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: a.unlocked ? COLORS.gold : COLORS.muted }}>{a.title}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{a.unlocked ? "✓ Unlocked" : "🔒 Locked"}</div>
          </div>
        ))}
      </div>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>⚡ Your Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[["Level", data.user.level, COLORS.gold], ["XP", `${data.user.xp.toLocaleString()}`, COLORS.accentGlow], ["Streak", `${data.user.streak}d`, COLORS.green]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", padding: 16, background: COLORS.soft, borderRadius: 12 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return renderDashboard();
      case "habits": return renderHabits();
      case "tasks": return renderTasks();
      case "goals": return renderGoals();
      case "skills": return renderSkills();
      case "finance": return renderFinance();
      case "timer": return renderTimer();
      case "ai": return renderAI();
      case "achievements": return renderAchievements();
      default: return renderDashboard();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: COLORS.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2e2e3e; border-radius: 99px; }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.85; transform: translateY(-1px); }
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>

      {/* Sidebar - hidden on mobile */}
      <div style={{ display: "flex" }}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.card, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 13, color: COLORS.muted }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ padding: "6px 14px", borderRadius: 30, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 12, fontWeight: 700 }}>🟢 {prodScore}% Today</div>
            <div style={{ padding: "6px 14px", borderRadius: 30, background: `${COLORS.gold}22`, color: COLORS.gold, fontSize: 12, fontWeight: 700 }}>🔥 {data.user.streak} streak</div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>👤</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
