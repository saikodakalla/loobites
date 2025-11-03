export interface ValidateImageResult {
  ok: boolean;
  isFood?: boolean;
  reason?: string;
  error?: string;
}

export async function validateImage(file: File): Promise<ValidateImageResult> {
  const form = new FormData();
  form.append("image", file);

  const bases = [
    import.meta?.env?.VITE_API_BASE,
    "",
    "http://localhost:4000",
  ].filter(Boolean) as string[];

  let lastError: unknown = null;
  for (const base of bases) {
    try {
      const res = await fetch(`${base}/api/validate-image`, {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as ValidateImageResult;
      if (!res.ok) return data?.ok ? data : { ok: false, ...data };
      return data;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  return { ok: false, error: (lastError as Error)?.message || "Network error" };
}

