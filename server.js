// server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory cache: { query: { timestamp, data } }
const cache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

// 1) CATALOG SEARCH (v2)
app.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ data: [] });

  // Return from cache if fresh
  const entry = cache[q];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return res.json({ data: entry.data });
  }

  try {
    const url = `https://catalog.roblox.com/v2/search/items/details?keyword=${encodeURIComponent(q)}&limit=20`;
    const { data: json } = await axios.get(url);
    const items = (json.data || []).map(item => ({
      assetId:      item.id,
      name:         item.name,
      thumbnailUrl: item.thumbnail?.url || (`https://www.roblox.com/asset-thumbnail/image?assetId=${item.id}&width=150&height=150&format=png`)
    }));

    cache[q] = { timestamp: Date.now(), data: items };
    return res.json({ data: items });
  } catch (err) {
    console.error("Catalog API error:", err.response?.status, err.message);
    return res.status(502).json({ data: [] });
  }
});

// 2) AI OUTFIT ROUTE (just proxy to your Gemini service)
app.post("/outfit", express.json(), async (req, res) => {
  const prompt = (req.body.prompt || "").trim();
  if (!prompt) return res.status(400).json({ outfit: [] });

  try {
    const response = await axios.post(
      process.env.GEMINI_PROXY_URL,    // e.g. "https://your-gemini-service.com/outfit"
      { prompt, user: req.body.userId },
      { headers: { "x-api-key": process.env.GEMINI_API_KEY } }
    );
    return res.json({ outfit: response.data.items || [] });
  } catch (err) {
    console.error("Gemini proxy error:", err.response?.status, err.message);
    return res.status(502).json({ outfit: [] });
  }
});

// Root
app.get("/", (_,res) => res.send("✅ Roblox Catalog + AI proxy is running"));

app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
