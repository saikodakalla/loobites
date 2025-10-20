// server/index.js (ESM)
import express from "express";
import cors from "cors";
import cron from "node-cron";
import multer from "multer";
import crypto from "crypto";
import { fetchMenus } from "./scraper.js";
import { addReview, listReviews } from "./reviewsStore.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Load env from .env.local if available (without requiring dotenv as a dep)
try {
  const dotenv = await import("dotenv");
  if (dotenv?.default?.config) dotenv.default.config({ path: ".env.local" });
} catch {
  // Fallback: minimal loader for KEY=VALUE lines
  const fs = await import("fs");
  try {
    const raw = fs.readFileSync(".env.local", "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) return;
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      const env = (globalThis.process ||= { env: {} }).env;
      if (!(key in env)) env[key] = val;
    });
  } catch {
    // ignore missing file
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = (globalThis.process?.env?.PORT) || 4000;
const ML_BASE = (globalThis.process?.env?.ML_SERVICE_URL) || 'http://localhost:8001';

const FOOD_KEYWORDS = [
  'dish', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'dessert', 'drink', 'beverage',
  'plate', 'cuisine', 'soup', 'salad', 'sandwich', 'burger', 'pizza', 'pasta', 'noodle', 'rice', 'curry',
  'chicken', 'beef', 'pork', 'fish', 'seafood', 'shrimp', 'tofu', 'vegetable', 'veggie', 'fruit', 'egg',
  'bread', 'cake', 'ice cream', 'cookie', 'waffle', 'pancake', 'burrito', 'taco', 'dumpling', 'sushi', 'roll'
];

// simple in-memory cache so your UI is snappy
const CACHE = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(date) {
  const hit = CACHE.get(date);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) return null;
  return hit.data;
}
function setCached(date, data) {
  CACHE.set(date, { at: Date.now(), data });
}

// API: /api/menus?date=YYYY-MM-DD (defaults to today)
app.get("/", (req, res) => {
  // Convenience: show today's menu at root
  res.redirect(302, "/api/menus");
});

app.get("/api/menus", async (req, res) => {
  try {
    const date = (req.query.date || new Date().toISOString().slice(0, 10));
    const cached = getCached(date);
    if (cached) return res.json(cached);

    const data = await fetchMenus(date);
    setCached(date, data);
    res.json(data);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Failed to fetch menus" });
  }
});

function isFoodLabel(label = '') {
  const lower = label.toLowerCase();
  return FOOD_KEYWORDS.some((kw) => lower.includes(kw));
}

async function classifyImage(file) {
  if (!file) return { label: null, accepted: false, reason: 'Missing image' };
  if (!ML_BASE) return { label: null, accepted: false, reason: 'ML service not configured' };

  const form = new FormData();
  const mime = file.mimetype || 'application/octet-stream';
  const blob = new Blob([file.buffer], { type: mime });
  form.append('file', blob, file.originalname || 'upload.jpg');

  const resp = await fetch(`${ML_BASE.replace(/\/$/, '')}/predict`, { method: 'POST', body: form });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`ML service error (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  const label = data?.label || '';
  const accepted = isFoodLabel(label);
  return { label, accepted };
}

app.get('/api/reviews', async (req, res) => {
  try {
    const menuId = req.query.menuId || null;
    const reviews = await listReviews(menuId);
    res.json(reviews);
  } catch (e) {
    console.error('[reviews] list failed', e);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

app.post('/api/reviews', upload.single('image'), async (req, res) => {
  try {
    const menuId = (req.body.menuId || '').trim();
    const rating = Number.parseInt(req.body.rating, 10);
    const body = (req.body.body || '').trim();
    const author = (req.body.author || 'Guest').trim();

    if (!menuId) return res.status(400).json({ error: 'Missing menu id' });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    if (!body) return res.status(400).json({ error: 'Review cannot be empty' });

    let encodedImage = null;
    let mlLabel = null;

    if (req.file) {
      let classification;
      try {
        classification = await classifyImage(req.file);
      } catch (e) {
        console.error('[reviews] classify failed', e);
        return res.status(502).json({ error: 'Image validation failed. Please try again later.' });
      }

      mlLabel = classification.label;
      if (!classification.accepted) {
        return res.status(422).json({ error: 'That photo does not appear to be food. Please upload a dish image.' });
      }

      const base64 = req.file.buffer.toString('base64');
      encodedImage = { mime: req.file.mimetype || 'image/jpeg', base64 };
    }

    const review = {
      id: crypto.randomUUID(),
      menuId,
      rating,
      body,
      author: author || 'Guest',
      createdAt: new Date().toISOString(),
      image: encodedImage,
      mlLabel,
    };

    await addReview(review);
    res.status(201).json(review);
  } catch (e) {
    console.error('[reviews] create failed', e);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

// pre-warm cache a few times per day (ET) to catch lunch/dinner changes
cron.schedule("5 9,15,21 * * *", async () => {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const data = await fetchMenus(date);
    setCached(date, data);
    console.log("[cron] refreshed menus", date);
  } catch (e) {
    console.error("[cron] failed", e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Menu API on http://localhost:${PORT}`);
});
