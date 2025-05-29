const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();
import { generateOutfit } from "./gemini.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// 1) Catalog scraping endpoint
app.get("/catalog", async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  const url = `https://www.roblox.com/catalog?Keyword=${encodeURIComponent(keyword)}&Category=3&Subcategory=3&salesTypeFilter=1`;
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const items = [];

    $(".item-card").each((_, el) => {
      const name      = $(el).find(".item-card-name").text().trim();
      const id        = $(el).attr("data-item-id");
      const thumbnail = $(el).find("img").attr("src");
      if (id && name && thumbnail) {
        items.push({ name, assetId: parseInt(id), thumbnailUrl: thumbnail });
      }
    });

    return res.json({ data: items });
  } catch (err) {
    console.error("Catalog scrape error:", err.message);
    return res.status(502).json({ error: "Failed to scrape catalog" });
  }
});

// 2) Outfit generation endpoint (Gemini AI)
app.get("/outfit", async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const outfit = await generateOutfit(prompt);
    return res.json({ outfit });
  } catch (err) {
    console.error("Gemini error:", err.message);
    return res.status(502).json({ error: "Failed to generate outfit" });
  }
});

// Root
app.get("/", (_, res) => res.send("Roblox Catalog Proxy + AI is running."));

app.listen(PORT, () => {
  console.log(`🚀 Proxy server listening on port ${PORT}`);
});
