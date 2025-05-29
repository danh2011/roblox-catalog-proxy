import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("Missing search query");

  try {
    const url = `https://www.roblox.com/catalog?Keyword=${encodeURIComponent(query)}&Category=3&Subcategory=3&salesTypeFilter=1`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const items = [];
    $(".item-card").each((_, el) => {
      const name  = $(el).find(".item-card-name").text().trim();
      const price = $(el).find(".item-card-price").text().trim();
      const image = $(el).find("img").attr("src");
      const link  = "https://www.roblox.com" + $(el).find("a").attr("href");

      if (name) {
        items.push({ name, price, image, link });
      }
    });

    res.json({ data: items });
  } catch (err) {
    console.error("Error fetching catalog:", err.message);
    res.status(500).send("Error fetching data");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
