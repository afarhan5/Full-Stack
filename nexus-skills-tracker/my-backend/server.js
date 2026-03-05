const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const app = express();

// ✅ CORS FIX
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://nexus-skills-tracker-fx7kvsuvb-afarhan5s-projects.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "nexus_secret_key_123";


// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}


// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Account created!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// PROFILE
app.get("/profile", auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true }
  });

  res.json(user);
});


// SKILLS
app.get("/skills", auth, async (req, res) => {
  const skills = await prisma.skill.findMany();
  res.json(skills);
});

app.post("/skills", auth, async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill required" });
  }

  await prisma.skill.create({
    data: { name: skill }
  });

  const skills = await prisma.skill.findMany();

  res.json({
    message: "Skill added!",
    skills
  });
});

app.delete("/skills/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);

  await prisma.skill.delete({
    where: { id }
  });

  const skills = await prisma.skill.findMany();

  res.json({
    message: "Skill deleted!",
    skills
  });
});


// ✅ ROOT ROUTE (IMPORTANT)
app.get("/", (req, res) => {
  res.send("🚀 Nexus Backend API Running");
});


// ✅ RENDER PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});