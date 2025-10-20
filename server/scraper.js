// server/scraper.js
import axios from "axios";
import * as cheerio from "cheerio";

const RAW_MENU_URL = (globalThis.process?.env?.MENU_URL_BASE || "").trim();
const USER_AGENT = "LooBitesBot/1.0 (+contact@loobites.local)";

function resolveMenuURL() {
  let u = RAW_MENU_URL;
  if (!u) {
    // Fallback to known public URL if env missing
    u = "https://uwaterloo.ca/food-services-information/locations-and-hours/daily-menu";
  }
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    return new URL(u).toString();
  } catch {
    throw new Error(`Invalid MENU_URL_BASE: ${RAW_MENU_URL || u}`);
  }
}

// We only surface the cafeterias used in the app's dropdown
const CAFETERIAS = [
  { slug: "cmh", display: "The Market (CMH)", synonyms: [/\bcmh\b/i, /claudette\s*millar/i, /the\s*market/i] },
  { slug: "v1", display: "Mudie's (Village 1)", synonyms: [/\bv1\b/i, /village\s*1/i, /mudie/i] },
  { slug: "rev", display: "REVelation (Ron Eydt Village)", synonyms: [/\brev\b/i, /ron\s*eydt/i, /revelation/i] },
];

function normalizeResidenceName(name) {
  const n = (name || "").replace(/\s+/g, " ").trim();
  for (const c of CAFETERIAS) {
    if (c.synonyms.some((re) => re.test(n))) return { slug: c.slug, display: c.display };
  }
  return null;
}

function tagsFromIcons($, $li) {
  const tags = new Set();
  $li.find("img, svg[aria-label], i[title]").each((_, el) => {
    const t = ($(el).attr("alt") || $(el).attr("title") || $(el).attr("aria-label") || "").trim();
    if (t) tags.add(t);
  });
  return [...tags].sort();
}

function parseNestedLists($, main) {
  const residences = [];
  // Some UW pages may actually wrap each cafe in a container like .views-row
  // Try to find multiple top-level containers with their own UL lists
  main.find('.views-row, .node, .block, section, article').each((_, sect) => {
    const $sect = $(sect);
    const heading = $sect.find('h1,h2,h3,h4,h5,strong,b').first().text();
    const norm = normalizeResidenceName(heading);
    if (!norm) return;

    const stations = [];
    // First try nested UL/OL for stations/items
    $sect.find('ul,ol').first().children('li').each((_, stLi) => {
      const $st = $(stLi);
      const stHeader = $st.children('strong,b').first().text().trim() || ($st.contents().get(0)?.data || '').trim();
      const stUL = $st.children('ul,ol').first();
      const items = [];
      stUL.children('li').each((_, itemLi) => {
        const $it = $(itemLi);
        const a = $it.find('a').first();
        const name = (a.text() || $it.text()).replace(/\s+/g, ' ').trim();
        if (name) items.push({ name, tags: tagsFromIcons($, $it) });
      });
      if (items.length) stations.push({ station: stHeader || 'Menu', items });
    });

    if (stations.length) residences.push({ name: norm.display, stations });
  });

  return residences;
}

function parseByScanning($, main) {
  const residences = [];
  let current = null; // { name, stations: [] }
  let currentStation = null;

  const isHeader = (el) => ["h1","h2","h3","h4","h5","strong","b"].includes(el.tagName?.toLowerCase());

  const isStationHeaderText = (t) => /grill|pizza|pasta|stir\s*fry|deli|soup|breakfast|lunch|dinner|entree|station|chef/i.test(t);

  const addResidenceIfNeeded = (text) => {
    const norm = normalizeResidenceName(text);
    if (norm) {
      current = { name: norm.display, slug: norm.slug, stations: [] };
      residences.push(current);
      currentStation = null;
      return true;
    }
    return false;
  };

  const addStation = (text) => {
    const station = text.replace(/\s+/g, " ").trim();
    if (!station) return;
    currentStation = { station, items: [] };
    current.stations.push(currentStation);
  };

  const addItem = ($li) => {
    const a = $li.find("a").first();
    const raw = (a.text() || $li.text() || "").replace(/\s+/g, " ").trim();
    const name = raw.replace(/^[-•\s]+/, "");
    if (!name) return;
    const tags = tagsFromIcons($, $li);
    if (!currentStation) {
      // Create a default bucket
      addStation("Menu");
    }
    currentStation.items.push({ name, tags });
  };

  // Depth-first traversal across the section to avoid missing nested blocks
  const nodes = main.find('*').toArray();
  nodes.forEach((el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase();
    const text = $el.text().replace(/\s+/g, " ").trim();
    if (!text) return;

    if (isHeader(el)) {
      // New residence?
      if (addResidenceIfNeeded(text)) return;
      // Station header under a current residence
      if (current && isStationHeaderText(text)) {
        addStation(text);
      }
      return;
    }

    if (!current) {
      // Not inside one of our cafeterias; skip
      return;
    }

    if (tag === "ul" || tag === "ol") {
      $el.children("li").each((_, li) => addItem($(li)));
      return;
    }

    if (tag === "p") {
      // Some pages list items in a paragraph with bullets or breaks
      const html = $el.html() || "";
      const parts = html.split(/<br\s*\/?>(?:\s*[-•]\s*)?|•|\n/g).map((s) => cheerio.load(`<div>${s}</div>`)('div').text());
      parts.forEach((p) => {
        const t = (p || "").replace(/\s+/g, " ").trim();
        if (t && t.length > 1 && /[a-z]/i.test(t)) {
          addItem($("<li>" + t + "</li>"));
        }
      });
      return;
    }
  });

  // Remove empty stations
  residences.forEach((r) => {
    r.stations = r.stations.filter((s) => s.items && s.items.length);
  });

  return residences.filter((r) => r.stations.length);
}

function parseUWStructure($, root, desiredDate) {
  const results = [];
  let scope = root;
  if (desiredDate) {
    // On the listing page, find the node that matches the desired date
    let node = root.find('.node-uw-ct-daily-menu').filter((_, el) => {
      const about = $(el).attr('about') || '';
      const href = $(el).find('h2 a').attr('href') || '';
      const title = $(el).find('h2').text() || '';
      return about.includes(`daily-menu-${desiredDate}`) || href.includes(`daily-menu-${desiredDate}`) || title.includes(desiredDate);
    }).first();

    if (!node || !node.length) {
      // Some date pages have the date only in the page-level H1
      const h1 = $("h1").first().text() || '';
      if (h1.includes(desiredDate)) {
        node = root.find('.node-uw-ct-daily-menu').first();
      }
    }

    if (!node || !node.length) {
      // If we explicitly want a date and cannot locate its block, do not parse fallback content
      return results;
    }
    const picked = node.find('.content_node');
    scope = (picked && picked.length) ? picked : node;
  }

  scope.find('.paragraphs-item-uw-fs-para-daily-menu').each((_, block) => {
    const $block = $(block);
    const loc = $block.find('.dm-location').first().text().replace(/\s+/g, ' ').trim();
    if (!loc) return;
    const norm = normalizeResidenceName(loc);
    if (!norm) return;

    const stations = [];
    $block.find('.paragraphs-item-uw-fs-dm-daily-outlet-menu').each((_, sect) => {
      const $sect = $(sect);
      const station = $sect.find('.dm-menu-type .field-item').first().text().replace(/\s+/g, ' ').trim() || 'Menu';
      const items = [];
      $sect.find('.dm-menus .dm-menu-item').each((_, li) => {
        const $li = $(li);
        const a = $li.find('a').first();
        const name = (a.text() || $li.text()).replace(/\s+/g, ' ').trim();
        if (!name) return;
        const tags = [];
        $li.find('img').each((_, img) => {
          const t = ($(img).attr('title') || $(img).attr('alt') || '').trim();
          if (t) tags.push(t);
        });
        items.push({ name, tags: Array.from(new Set(tags)) });
      });
      if (items.length) stations.push({ station, items });
    });

    if (stations.length) results.push({ name: norm.display, slug: norm.slug, stations });
  });
  return results;
}

function buildResponse(html, date) {
  const $ = cheerio.load(html);
  // Choose a page-level container, not the inner .content_node
  const main = $("#main-content, main, #content, article, .region-content, .node__content, .layout-content").first();

  // 0) Try UW-specific structure first
  let normalized = parseUWStructure($, main, date);
  let residences;
  if (!normalized.length) {
    // 1) Fallback to nested lists per section
    let res1 = parseNestedLists($, main);
    if (!res1.length) {
      // 2) Generic scan
      res1 = parseByScanning($, main);
    }
    normalized = [];
    for (const r of res1) {
      const n = normalizeResidenceName(r.name);
      if (!n) continue;
      normalized.push({ slug: n.slug, name: n.display, stations: r.stations || [] });
    }
    residences = res1.map(({ name, stations }) => ({ name, stations }));
  } else {
    residences = normalized.map(({ name, stations }) => ({ name, stations }));
  }

  // removed old generic section collector (now using site-specific parser + fallbacks)

  // Build cafeterias map
  const allowed = new Set(CAFETERIAS.map((c) => c.slug));
  const cafeterias = {};
  normalized.forEach((r) => { cafeterias[r.slug] = r; });

  return {
    date,
    residences,
    cafeterias,
    availableCafeterias: Object.keys(cafeterias).filter((k) => allowed.has(k)),
  };
}

function todayInToronto() {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' });
    return fmt.format(new Date()); // en-CA yields YYYY-MM-DD
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function fetchMenus(dateISO) {
  const date = (dateISO && /\d{4}-\d{2}-\d{2}/.test(dateISO) ? dateISO : todayInToronto());
  const baseURL = resolveMenuURL();
  const u = new URL(baseURL);
  // Build a canonical date page URL using the site origin
  const dateURL = new URL(`/food-services-information/content/daily-menu-${date}`, u.origin).toString();
  const withQuery = `${baseURL}?date=${encodeURIComponent(date)}`;
  const candidates = [dateURL, withQuery];

  let lastErr = null;
  for (const attempt of candidates) {
    try {
      const { data: html, status } = await axios.get(attempt, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (s) => s >= 200 && s < 400,
      });
      const out = buildResponse(html, date);
      // Accept if we parsed any cafeteria content
      if (out && out.cafeterias && Object.keys(out.cafeterias).length) return out;
      // If 404 on direct date page, continue; otherwise keep best effort
      lastErr = new Error(`No menu parsed from ${attempt} (status ${status})`);
    } catch (e) {
      lastErr = e;
      continue;
    }
  }

  // Extra step: fetch the listing and locate the exact date link dynamically
  try {
    const { data: listHTML } = await axios.get(baseURL, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      timeout: 20000,
      maxRedirects: 5,
    });
    const $ = cheerio.load(listHTML);
    const link = $("a[href*='content/daily-menu-']")
      .filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.includes(`daily-menu-${date}`);
      })
      .first()
      .attr('href');
    if (link) {
      const abs = new URL(link, u.origin).toString();
      const { data: html } = await axios.get(abs, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        timeout: 20000,
        maxRedirects: 5,
      });
      const out = buildResponse(html, date);
      if (out && out.cafeterias && Object.keys(out.cafeterias).length) return out;
      lastErr = new Error(`No menu parsed from ${abs} (linked from listing)`);
    }
  } catch (e) {
    lastErr = e;
  }

  // Final fallback: do not parse baseURL for a wrong date; return explicit failure
  if (lastErr) throw lastErr;
  // Should not reach here, but return empty structure to be safe
  return { date, residences: [], cafeterias: {}, availableCafeterias: [] };
}

// Helper for local fixture debugging
export function parseMenusFromHTML(html, dateISO) {
  const date = dateISO || new Date().toISOString().slice(0, 10);
  return buildResponse(html, date);
}
