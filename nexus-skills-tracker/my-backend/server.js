const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "nexus_secret_key_123";

// ── AUTH MIDDLEWARE ───────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" });
  next();
}

// ── ROOT ──────────────────────────────────────
app.get("/", (req, res) => res.send("🚀 Nexus Backend API Running"));

// ── REGISTER ──────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    // First user ever = admin, everyone else = user
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "user";

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET, { expiresIn: "7d" }
    );

    res.json({
      message: "Account created!", token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── LOGIN ─────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET, { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!", token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── CHANGE PASSWORD ───────────────────────────
app.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed }
    });

    res.json({ message: "Password changed!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── USER SKILLS ───────────────────────────────
app.get("/skills", auth, async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/skills", auth, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: "Skill required" });

    await prisma.skill.create({ data: { name: skill, userId: req.user.id } });
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ message: "Skill added!", skills });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/skills/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    if (skill.userId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Not allowed" });

    await prisma.skill.delete({ where: { id } });
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ message: "Skill deleted!", skills });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN ROUTES ──────────────────────────────
app.get("/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true,
        role: true, createdAt: true,
        _count: { select: { skills: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/admin/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id)
      return res.status(400).json({ error: "Cannot delete yourself" });

    await prisma.skill.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true,
        role: true, createdAt: true,
        _count: { select: { skills: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    res.json({ message: "User deleted!", users });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/admin/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalSkills = await prisma.skill.count();
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json({ totalUsers, totalSkills, adminCount, recentUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── START ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));