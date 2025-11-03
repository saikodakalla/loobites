import { useEffect, useRef, useState } from "react";
import type { ResidenceMenu } from "../types";

interface MenusResponse {
  date: string;
  residences: ResidenceMenu[];
  cafeterias: Record<string, { slug: string; name: string; stations: { station: string; items: { name: string; tags?: string[] }[] }[] }>;
  availableCafeterias: string[];
}

let lastCache: MenusResponse | null = null;

export function useMenus(pollMs = 5 * 60 * 1000) {
  const [data, setData] = useState<MenusResponse | null>(lastCache);
  const [loading, setLoading] = useState<boolean>(!lastCache);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    setLoading(true);
    try {
      const envBase = (import.meta?.env?.VITE_API_BASE as string) || "";
      const candidates: string[] = [];
      if (envBase) candidates.push(envBase);
      candidates.push("");
      candidates.push("http://localhost:4000");

      let lastErr: unknown = null;
      for (const base of candidates) {
        try {
          const r = await fetch(`${base}/api/menus`, { headers: { Accept: "application/json" } });
          if (!r.ok) { lastErr = new Error(`HTTP ${r.status}`); continue; }
          const j = (await r.json()) as MenusResponse;
          setData(j);
          lastCache = j;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          continue;
        }
      }
      if (lastErr) throw lastErr;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    timer.current = setInterval(load, pollMs);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (timer.current) clearInterval(timer.current);
    };
  }, [pollMs]);

  return { data, loading, refresh: load } as const;
}

