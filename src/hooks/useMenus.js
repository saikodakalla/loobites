import { useEffect, useRef, useState } from "react";

export function useMenus(pollMs = 5 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const envBase = (import.meta?.env?.VITE_API_BASE) || '';
      const candidates = [];
      if (envBase) candidates.push(envBase);
      candidates.push('');
      candidates.push('http://localhost:4000');

      let lastErr = null;
      for (const base of candidates) {
        try {
          const r = await fetch(`${base}/api/menus`, { headers: { Accept: 'application/json' } });
          if (!r.ok) { lastErr = new Error(`HTTP ${r.status}`); continue; }
          const ct = r.headers.get('content-type') || '';
          if (!ct.includes('application/json')) {
            // Try parse anyway; if fails, move to next
            try {
              const j = await r.json();
              setData(j);
              lastErr = null;
              break;
            } catch (e) { lastErr = e; continue; }
          } else {
            const j = await r.json();
            setData(j);
            lastErr = null;
            break;
          }
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
      clearInterval(timer.current);
    };
  }, [pollMs]);

  return { data, loading, refresh: load };
}
