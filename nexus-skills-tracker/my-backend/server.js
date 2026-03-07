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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
  phone: true, photo: true, bio: true,
  dailyGoal: true, streak: true, lastActiveAt: true, createdAt: true
};

// ── ACHIEVEMENT CHECKER ───────────────────────
async function checkAchievements(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: true,
      roadmaps: { include: { lessons: true } }
    }
  });

  const existing = user.achievements.map(a => a.type);
  const toGrant = [];

  // Count total completed lessons
  const totalDone = user.roadmaps.reduce((sum, r) =>
    sum + r.lessons.filter(l => l.done).length, 0);

  // First lesson
  if (totalDone >= 1 && !existing.includes("FIRST_LESSON"))
    toGrant.push({ type: "FIRST_LESSON", label: "First Lesson!", icon: "🎯" });

  // 10 lessons
  if (totalDone >= 10 && !existing.includes("TEN_LESSONS"))
    toGrant.push({ type: "TEN_LESSONS", label: "10 Lessons Done!", icon: "📚" });

  // 50 lessons
  if (totalDone >= 50 && !existing.includes("FIFTY_LESSONS"))
    toGrant.push({ type: "FIFTY_LESSONS", label: "50 Lessons Done!", icon: "🔥" });

  // Completed a full roadmap
  const completedRoadmap = user.roadmaps.find(r =>
    r.lessons.length > 0 && r.lessons.every(l => l.done)
  );
  if (completedRoadmap && !existing.includes("ROADMAP_COMPLETE"))
    toGrant.push({ type: "ROADMAP_COMPLETE", label: "Roadmap Completed!", icon: "🏆" });

  // 7 day streak
  if (user.streak >= 7 && !existing.includes("STREAK_7"))
    toGrant.push({ type: "STREAK_7", label: "7 Day Streak!", icon: "⚡" });

  // 30 day streak
  if (user.streak >= 30 && !existing.includes("STREAK_30"))
    toGrant.push({ type: "STREAK_30", label: "30 Day Streak!", icon: "💎" });

  // Profile complete
  if (user.photo && user.bio && user.phone && !existing.includes("PROFILE_COMPLETE"))
    toGrant.push({ type: "PROFILE_COMPLETE", label: "Profile Complete!", icon: "✨" });

  if (toGrant.length > 0) {
    await prisma.achievement.createMany({
      data: toGrant.map(a => ({ ...a, userId }))
    });
  }

  return toGrant;
}

// ── UPDATE STREAK ─────────────────────────────
async function updateStreak(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const now = new Date();
  const last = user.lastActiveAt;

  let newStreak = user.streak;

  if (!last) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // Same day - no change
    } else if (diffDays === 1) {
      newStreak = user.streak + 1;
    } else {
      newStreak = 1; // streak broken
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastActiveAt: now }
  });

  return newStreak;
}

// ── ROOT ──────────────────────────────────────
app.get("/", (req, res) => res.send("🚀 Nexus Backend API Running"));

// ── HAS USERS ─────────────────────────────────
app.get("/has-users", async (req, res) => {
  const count = await prisma.user.count();
  res.json({ hasUsers: count > 0 });
});

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
      data: { name, email, password: hashed, role, lastActiveAt: new Date() },
      select: userSelect
    });

    // Grant first achievement
    await prisma.achievement.create({
      data: { type: "JOINED", label: "Joined Nexus!", icon: "🚀", userId: user.id }
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

    await updateStreak(user.id);
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
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── UPDATE PROFILE ────────────────────────────
app.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, bio, dailyGoal } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(dailyGoal && { dailyGoal: parseInt(dailyGoal) }),
      },
      select: userSelect
    });
    await checkAchievements(req.user.id);
    res.json({ message: "Profile updated!", user: updated, token: makeToken(updated) });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── UPLOAD PHOTO ──────────────────────────────
app.post("/me/photo", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const photoUrl = req.file.secure_url || req.file.path;
    console.log("Uploaded photo URL:", photoUrl);
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { photo: photoUrl },
      select: userSelect
    });
    await checkAchievements(req.user.id);
    res.json({ message: "Photo updated!", user: updated, token: makeToken(updated) });
  } catch (err) {
    console.error("Photo upload error:", err);
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
});

// ── CHANGE PASSWORD ───────────────────────────
app.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "All fields required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Min 6 characters" });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong current password" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Password changed!" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── CHANGE EMAIL ──────────────────────────────
app.put("/change-email", auth, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) return res.status(400).json({ error: "All fields required" });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ error: "Email already in use" });
    const updated = await prisma.user.update({
      where: { id: req.user.id }, data: { email: newEmail }, select: userSelect
    });
    res.json({ message: "Email updated!", user: updated, token: makeToken(updated) });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── DELETE ACCOUNT ────────────────────────────
app.delete("/me", auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });
    if (user.role === "admin") return res.status(400).json({ error: "Admin cannot delete their account" });

    // Delete all related data
    const roadmaps = await prisma.roadmap.findMany({ where: { userId: req.user.id } });
    for (const r of roadmaps) {
      await prisma.lesson.deleteMany({ where: { roadmapId: r.id } });
    }
    await prisma.roadmap.deleteMany({ where: { userId: req.user.id } });
    await prisma.skill.deleteMany({ where: { userId: req.user.id } });
    await prisma.achievement.deleteMany({ where: { userId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });

    res.json({ message: "Account deleted" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
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
    if (!skill || (skill.userId !== req.user.id && req.user.role !== "admin"))
      return res.status(403).json({ error: "Not allowed" });
    await prisma.skill.delete({ where: { id } });
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: "desc" }
    });
    res.json({ message: "Skill deleted!", skills });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── ROADMAPS ──────────────────────────────────
app.get("/roadmaps", auth, async (req, res) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: req.user.id },
      include: { lessons: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(roadmaps);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/roadmaps", auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });
    const roadmap = await prisma.roadmap.create({
      data: { title, userId: req.user.id },
      include: { lessons: true }
    });
    res.json({ message: "Roadmap created!", roadmap });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put("/roadmaps/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title } = req.body;
    const roadmap = await prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap || roadmap.userId !== req.user.id) return res.status(403).json({ error: "Not allowed" });
    const updated = await prisma.roadmap.update({
      where: { id }, data: { title },
      include: { lessons: { orderBy: { order: "asc" } } }
    });
    res.json({ message: "Roadmap updated!", roadmap: updated });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/roadmaps/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const roadmap = await prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap || roadmap.userId !== req.user.id) return res.status(403).json({ error: "Not allowed" });
    await prisma.lesson.deleteMany({ where: { roadmapId: id } });
    await prisma.roadmap.delete({ where: { id } });
    res.json({ message: "Roadmap deleted!" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── LESSONS ───────────────────────────────────
app.post("/roadmaps/:roadmapId/lessons", auth, async (req, res) => {
  try {
    const roadmapId = parseInt(req.params.roadmapId);
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap || roadmap.userId !== req.user.id) return res.status(403).json({ error: "Not allowed" });

    const count = await prisma.lesson.count({ where: { roadmapId } });
    await prisma.lesson.create({ data: { title, roadmapId, order: count } });

    const lessons = await prisma.lesson.findMany({ where: { roadmapId }, orderBy: { order: "asc" } });
    res.json({ message: "Lesson added!", lessons });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put("/lessons/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, done, notes, timeSpent, order } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id }, include: { roadmap: true }
    });
    if (!lesson || lesson.roadmap.userId !== req.user.id)
      return res.status(403).json({ error: "Not allowed" });

    const wasNotDone = !lesson.done;
    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(done !== undefined && { done, completedAt: done ? new Date() : null }),
        ...(notes !== undefined && { notes }),
        ...(timeSpent !== undefined && { timeSpent }),
        ...(order !== undefined && { order }),
      }
    });

    // Update streak and check achievements when completing a lesson
    if (done && wasNotDone) {
      await updateStreak(req.user.id);
      await checkAchievements(req.user.id);
    }

    res.json({ message: "Lesson updated!", lesson: updated });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/lessons/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { roadmap: true } });
    if (!lesson || lesson.roadmap.userId !== req.user.id) return res.status(403).json({ error: "Not allowed" });
    await prisma.lesson.delete({ where: { id } });
    const lessons = await prisma.lesson.findMany({ where: { roadmapId: lesson.roadmapId }, orderBy: { order: "asc" } });
    res.json({ message: "Lesson deleted!", lessons });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── ACHIEVEMENTS ──────────────────────────────
app.get("/achievements", auth, async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.user.id }, orderBy: { earnedAt: "desc" }
    });
    res.json(achievements);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── STATS (personal) ──────────────────────────
app.get("/stats", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roadmaps: { include: { lessons: true } },
        skills: true,
        achievements: true
      }
    });

    const totalLessons = user.roadmaps.reduce((s, r) => s + r.lessons.length, 0);
    const doneLessons = user.roadmaps.reduce((s, r) => s + r.lessons.filter(l => l.done).length, 0);
    const totalTime = user.roadmaps.reduce((s, r) => s + r.lessons.reduce((ss, l) => ss + l.timeSpent, 0), 0);

    // Recent completions (last 7)
    const recent = user.roadmaps
      .flatMap(r => r.lessons.filter(l => l.done && l.completedAt).map(l => ({ ...l, roadmapTitle: r.title })))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 7);

    // Today's completed lessons
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDone = user.roadmaps.reduce((s, r) =>
      s + r.lessons.filter(l => l.done && l.completedAt && new Date(l.completedAt) >= today).length, 0);

    res.json({
      totalRoadmaps: user.roadmaps.length,
      totalLessons,
      doneLessons,
      totalSkills: user.skills.length,
      totalAchievements: user.achievements.length,
      totalTime,
      streak: user.streak,
      dailyGoal: user.dailyGoal,
      todayDone,
      recentCompletions: recent
    });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── ADMIN ROUTES ──────────────────────────────
app.get("/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, photo: true, streak: true, createdAt: true,
        _count: { select: { skills: true, roadmaps: true, achievements: true } }
      },
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
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, photo: true, streak: true, createdAt: true,
        _count: { select: { skills: true, roadmaps: true, achievements: true } }
      }
    });
    res.json({ message: "User updated!", user: updated });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/admin/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });

    const roadmaps = await prisma.roadmap.findMany({ where: { userId: id } });
    for (const r of roadmaps) {
      await prisma.lesson.deleteMany({ where: { roadmapId: r.id } });
    }
    await prisma.roadmap.deleteMany({ where: { userId: id } });
    await prisma.skill.deleteMany({ where: { userId: id } });
    await prisma.achievement.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, photo: true, streak: true, createdAt: true,
        _count: { select: { skills: true, roadmaps: true, achievements: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    res.json({ message: "User deleted!", users });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get("/admin/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalSkills = await prisma.skill.count();
    const totalRoadmaps = await prisma.roadmap.count();
    const totalLessons = await prisma.lesson.count();
    const doneLessons = await prisma.lesson.count({ where: { done: true } });
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    const recentUsers = await prisma.user.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, photo: true, createdAt: true, streak: true }
    });
    res.json({ totalUsers, totalSkills, totalRoadmaps, totalLessons, doneLessons, adminCount, recentUsers });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
