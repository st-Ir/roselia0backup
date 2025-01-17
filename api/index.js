require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Middleware untuk verifikasi token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Endpoint Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Endpoint Logout
app.post("/api/auth/logout", verifyToken, async (req, res) => {
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mendapatkan semua lagu
app.get("/api", async (req, res) => {
  try {
    const { data, error } = await db.from("songs").select();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "An error occurred while fetching songs" });
  }
});

// Menambahkan lagu
app.post("/api/songs", verifyToken, async (req, res) => {
  const { title, artist, src, cover } = req.body;
  if (!title || !artist || !src || !cover) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const { data, error } = await db.from("songs").insert({ title, artist, src, cover });
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({ error: "An error occurred while creating the song" });
  }
});

// Data album performance
app.get("/api/album-performance", async (req, res) => {
  try {
    const { data, error } = await db.from("album_performance").select();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching album performance:", error);
    res.status(500).json({ error: "An error occurred while fetching album performance data" });
  }
});

// Mengirim hasil ujian
app.post("/exam/submit", verifyToken, async (req, res) => {
  try {
    const { examData } = req.body;
    const { data, error } = await db
      .from("exam_results")
      .insert([{ user_id: req.user.id, ...examData }]);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
