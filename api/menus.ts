import { fetchMenus, todayInTorontoISO } from "../server/scraper.js";

export default async function handler(req, res) {
  try {
    const incoming = req.query?.date;
    const today = todayInTorontoISO();
    const date =
      typeof incoming === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(incoming) &&
      incoming <= today
        ? incoming
        : today;

    const data = await fetchMenus(date);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      ...data,
      debugDetectedDate: date,
      debugServerTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (err) {
    console.error("Menus error:", err);
    res.status(500).json({ error: "Failed to fetch menus" });
  }
}
