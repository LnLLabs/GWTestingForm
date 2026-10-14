export async function postJson(url: string, body?: unknown) {
  return sendJson("POST", url, body);
}

export async function patchJson(url: string, body?: unknown) {
  return sendJson("PATCH", url, body);
}

async function sendJson(method: "POST" | "PATCH", url: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Try again.");
  }
  return data;
}
