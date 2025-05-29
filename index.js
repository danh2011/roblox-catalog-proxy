import express from "express";
import axios from "axios";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/catalog", async (req, res) => {
  const keyword = req.query.q || "hat";
  const limit = req.query.limit || 10;

  try {
    const url = `https://catalog.roblox.com/v1/search/items?Category=1&Limit=${limit}&Keyword=${encodeURIComponent(keyword)}&SortType=3`;
    const response = await axios.get(url);
    const items = response.data.data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      creator: item.creatorName,
      thumbnail: item.thumbnailUrl
    }));

    res.json({ items });
  } catch (err) {
    console.error("Catalog fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch catalog data." });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
