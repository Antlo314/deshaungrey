export function elevenReady() {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_AGENT_ID);
}

export async function getSignedUrl() {
  const key = process.env.ELEVENLABS_API_KEY;
  const agent = process.env.ELEVENLABS_AGENT_ID;
  if (!key || !agent) return null;

  const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agent)}`;
  const res = await fetch(url, {
    headers: { "xi-api-key": key },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { signed_url?: string };
  return data.signed_url ?? null;
}
