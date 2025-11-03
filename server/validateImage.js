// server/validateImage.js (ESM)
import express from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Basic in-memory rate limiter per IP (~30 req / 5min)
const RATE_LIMIT = { max: 30, windowMs: 5 * 60 * 1000 };
const hits = new Map(); // ip -> { count, resetAt }

function rateLimit(req, res, next) {
  try {
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = hits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT.windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + RATE_LIMIT.windowMs;
    }
    entry.count += 1;
    hits.set(ip, entry);
    if (entry.count > RATE_LIMIT.max) {
      const retry = Math.max(0, Math.floor((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retry));
      return res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
    }
  } catch {}
  next();
}

async function classifyImage(fileBuffer) {
  // Stub logic – acts as a placeholder for a real ML service
  const ok = !!fileBuffer && fileBuffer.length > 20_000;
  return { isFood: ok, reason: ok ? undefined : "Image too small/ambiguous" };
}

export function createValidateImageRouter() {
  const router = express.Router();

  router.post(
    "/api/validate-image",
    rateLimit,
    upload.single("image"),
    async (req, res) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ ok: false, error: "No file uploaded" });
        }
        const { mimetype, size, buffer } = file;
        if (!/(?:jpe?g|png)$/i.test(file.originalname) && !/^image\/(jpeg|png)$/i.test(mimetype)) {
          return res.status(400).json({ ok: false, error: "Only JPEG/PNG images are allowed" });
        }
        if (size > 5 * 1024 * 1024) {
          return res.status(400).json({ ok: false, error: "Image exceeds 5MB limit" });
        }

        const result = await classifyImage(buffer);
        return res.status(200).json({ ok: true, isFood: result.isFood, reason: result.reason });
      } catch (e) {
        console.error("/api/validate-image error:", e.message);
        return res.status(500).json({ ok: false, error: "Validation failed" });
      }
    }
  );

  return router;
}

