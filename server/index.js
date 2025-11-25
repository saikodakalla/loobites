// server/index.js (ESM)
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { fetchMenus, todayInTorontoISO } from "./scraper.js";
import { createValidateImageRouter } from "./validateImage.js";

// Load env from .env.local if available
try {
  const dotenv = await import("dotenv");
  if (dotenv?.default?.config) dotenv.default.config({ path: ".env.local" });
} catch {
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
  } catch {}
}

const app = express();
app.use(cors());

const PORT = (globalThis.process?.env?.PORT) || 4000;

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

app.get("/", (req, res) => res.redirect(302, "/api/menus"));

app.get("/api/menus", async (req, res) => {
  try {
    const incoming = req.query.date;
    const today = todayInTorontoISO();
    const date =
      typeof incoming === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(incoming) &&
      incoming <= today
        ? incoming
        : today;
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

// Mount image validation API
app.use(createValidateImageRouter());

cron.schedule("5 9,15,21 * * *", async () => {
  const date = todayInTorontoISO();
  try {
    const data = await fetchMenus(date);
    setCached(date, data);
    console.log("[cron] refreshed menus", date);
  } catch (e) {
    console.error("[cron] failed", e.message);
  }
});

app.listen(PORT, () => console.log(`Menu API on http://localhost:${PORT}`));
