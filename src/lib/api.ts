const API_URL = import.meta.env.VITE_API_BASE;

export async function fetchApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${path}`;
  const { headers: userHeaders, method: userMethod, ...rest } = options;
  const method = (userMethod ?? "GET").toUpperCase();

  const headers = new Headers(userHeaders || undefined);
  if (method === "GET" && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...rest,
      method,
      headers,
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    return res;
  } catch (err) {
    console.error("fetchApi error:", err);
    throw err;
  }
}
