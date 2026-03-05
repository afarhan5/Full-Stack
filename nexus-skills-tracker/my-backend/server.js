const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ── PRISMA ────────────────────────────────────
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── CLOUDINARY ────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nexus-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── EXPRESS ───────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "nexus_secret_key_123";

// ── HELPERS ───────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET, { expiresIn: "7d" }
  );
}

const userSelect = {
  id: true, name: true, email: true, role: true,
  phone: true, photo: true, bio: true, createdAt: true
};

// ── ROOT ──────────────────────────────────────
app.get("/", (req, res) => res.send("🚀 Nexus Backend API Running"));

// ── REGISTER ──────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "user";

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: userSelect
    });

    res.json({ message: "Account created!", token: makeToken(user), user });
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

    const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: userSelect });
    res.json({ message: "Login successful!", token: makeToken(safeUser), user: safeUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET MY PROFILE ────────────────────────────
app.get("/me", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: userSelect });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── UPDATE PROFILE (name, phone, bio) ─────────
app.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
      },
      select: userSelect
    });
    res.json({ message: "Profile updated!", user: updated, token: makeToken(updated) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── UPLOAD PHOTO ──────────────────────────────
app.post("/me/photo", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { photo: req.file.path },
      select: userSelect
    });
    res.json({ message: "Photo updated!", user: updated, token: makeToken(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── CHANGE PASSWORD ───────────────────────────
app.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "All fields required" });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "Min 6 characters" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Password changed!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── CHANGE EMAIL ──────────────────────────────
app.put("/change-email", auth, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password)
      return res.status(400).json({ error: "All fields required" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { email: newEmail },
      select: userSelect
    });
    res.json({ message: "Email updated!", user: updated, token: makeToken(updated) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── SKILLS ────────────────────────────────────
app.get("/skills", auth, async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: "desc" }
    });
    res.json(skills);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/skills", auth, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: "Skill required" });
    await prisma.skill.create({ data: { name: skill, userId: req.user.id } });
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: "desc" }
    });
    res.json({ message: "Skill added!", skills });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/skills/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) return res.status(404).json({ error: "Not found" });
    if (skill.userId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Not allowed" });
    await prisma.skill.delete({ where: { id } });
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: "desc" }
    });
    res.json({ message: "Skill deleted!", skills });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── ADMIN ─────────────────────────────────────
app.get("/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, photo: true, createdAt: true, _count: { select: { skills: true } } },
      orderBy: { createdAt: "asc" }
    });
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put("/admin/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, role } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
      },
      select: { id: true, name: true, email: true, role: true, phone: true, photo: true, createdAt: true, _count: { select: { skills: true } } }
    });
    res.json({ message: "User updated!", user: updated });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/admin/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });
    await prisma.skill.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, photo: true, createdAt: true, _count: { select: { skills: true } } },
      orderBy: { createdAt: "asc" }
    });
    res.json({ message: "User deleted!", users });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get("/admin/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalSkills = await prisma.skill.count();
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    const recentUsers = await prisma.user.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, photo: true, createdAt: true }
    });
    res.json({ totalUsers, totalSkills, adminCount, recentUsers });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── START ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));