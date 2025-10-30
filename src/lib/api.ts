const API_BASES = (() => {
  const bases: string[] = [];
  const envBase = import.meta?.env?.VITE_API_BASE;
  if (envBase) bases.push(envBase);
  bases.push("");
  bases.push("http://localhost:4000");
  return bases;
})();

export async function fetchApi(path: string, options: RequestInit = {}) {
  let lastErr: unknown = null;
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options);
      return res;
    } catch (err) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Unknown fetch error");
}

export function getApiBases() {
  return [...API_BASES];
}
