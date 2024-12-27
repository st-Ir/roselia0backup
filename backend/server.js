const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 2005;

const SUPABASE_URL = "https://iwgeduwlmpikexvczshr.supabase.co";
const SUPABASE_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Z2VkdXdsbXBpa2V4dmN6c2hyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTE0NDcwNywiZXhwIjoyMDM2NzIwNzA3fQ.m1eDGOsTBvbwQMxGC3g_EdR1BzNh8gHN-mnu1D6dmRw";

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
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

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: error.message });
  }
});

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

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const { data, error } = await db.from('profiles').select().eq('id', req.user.id).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "An error occurred while fetching the profile" });
  }
});

app.put("/api/profile", verifyToken, async (req, res) => {
  const { name, avatar_url } = req.body;
  try {
    const { data, error } = await db.from('profiles').upsert({
      id: req.user.id,
      name,
      avatar_url,
      updated_at: new Date(),
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "An error occurred while updating the profile" });
  }
});

// Existing routes
app.get("/api", async (req, res) => {
  try {
    const { data, error } = await db.from("songs").select();
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "An error occurred while fetching songs" });
  }
});

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

app.get("/api/album-performance", async (req, res) => {
  try {
    const { data, error } = await db.from("album_performance").select();
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching album performance data:", error);
    res.status(500).json({ error: "An error occurred while fetching album performance data" });
  }
});

app.post("/exam/submit", verifyToken, async (req, res) => {
  try {
    const { examData } = req.body;
    const { data, error } = await db
      .from('exam_results')
      .insert([
        { 
          user_id: req.user.id,
          ...examData
        }
      ]);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error saving exam result:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running at port", PORT);
});
