const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const PORT = 2005;

const SUPABASE_URL = "https://iwgeduwlmpikexvczshr.supabase.co";
const SUPABASE_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Z2VkdXdsbXBpa2V4dmN6c2hyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTE0NDcwNywiZXhwIjoyMDM2NzIwNzA3fQ.m1eDGOsTBvbwQMxGC3g_EdR1BzNh8gHN-mnu1D6dmRw";

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

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

app.post("/api/songs", async (req, res) => {
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

// New endpoint for fetching album performance data
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

app.listen(PORT, () => {
  console.log("Server running at port", PORT);
});