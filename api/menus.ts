// api/menus.ts
// Disable TS checking only for this file (Vercel-friendly)
// @ts-nocheck

import { fetchMenus, todayInTorontoISO } from "./scraper.js";

export default async function handler(req, res) {
  const qd = req.query?.date;
  const valid = typeof qd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(qd);
  const date = valid ? qd : todayInTorontoISO();

  try {
    const data = await fetchMenus(date);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      ...data,
      debugDetectedDate: date,
      debugServerTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (err) {
    console.error("Menus API ERROR:", err);
    res.status(500).json({ error: "Failed to fetch menus" });
  }
}
