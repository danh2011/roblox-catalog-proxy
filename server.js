const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/catalog", async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ error: "Missing keyword." });

  const url = `https://www.roblox.com/catalog?Keyword=${encodeURIComponent(keyword)}&Category=3&Subcategory=3&salesTypeFilter=1`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const results = [];

    $(".item-card").each((i, elem) => {
      const name = $(elem).find(".item-card-name").text().trim();
      const id = $(elem).attr("data-item-id");
      const thumbnail = $(elem).find("img").attr("src");

      if (id && name && thumbnail) {
        results.push({
          name,
          assetId: parseInt(id),
          thumbnail,
        });
      }
    });

    res.json({ items: results });
  } catch (err) {
    console.error("Scrape failed:", err.message);
    res.status(502).json({ error: "Failed to scrape catalog." });
  }
});

app.get("/", (req, res) => {
  res.send("📦 Roblox Catalog Scraper is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper live at port ${PORT}`);
});
