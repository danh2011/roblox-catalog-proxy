import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Uses Roblox’s official v1 search/details endpoint
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ data: [] });

  try {
    const url = `https://catalog.roblox.com/v1/search/items/details?keyword=${encodeURIComponent(q)}&limit=20`;
    const response = await axios.get(url);
    // response.data.data is an array of { id, name, ... }
    const items = response.data.data.map(item => ({
      assetId: item.id,
      name:    item.name,
      thumbnailUrl: `https://www.roblox.com/asset-thumbnail/image?assetId=${item.id}&width=150&height=150&format=png`
    }));
    return res.json({ data: items });
  } catch (err) {
    console.error("Catalog API error:", err.message);
    return res.status(502).json({ data: [] });
  }
});

// (Your existing /outfit route stays the same)
app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});
