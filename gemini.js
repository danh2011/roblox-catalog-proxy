import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

export async function generateOutfit(prompt) {
  const systemPrompt = `
You are a fashion assistant for Roblox players. Given a prompt, you will return a JSON list of items suitable for a Roblox avatar. 

Rules:
- Return an object with key "items" and value a list of up to 6 items.
- Each item must have: "name" (string), "assetId" (number), and "thumbnailUrl" (string).
- Only include real Roblox items from the catalog that match the prompt.
- Do NOT make up item IDs or URLs. If you don’t know valid ones, say: { "items": [] }
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Prompt: ${prompt}` }
  ];

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });

    const candidates = response.data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No Gemini response candidates.");
    }

    const text = candidates[0].content.parts[0].text;

    // Try to extract the first JSON object found
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) {
      console.warn("No JSON found in Gemini output.");
      return { outfit: [] };
    }

    const json = JSON.parse(match[0]);
    if (!json.items || !Array.isArray(json.items)) {
      return { outfit: [] };
    }

    return json;
  } catch (err) {
    console.error("Gemini outfit error:", err.message);
    return { outfit: [] };
  }
}
