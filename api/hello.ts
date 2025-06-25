export default async function handler(req: Request): Promise<Response> {
  return new Response(
    JSON.stringify({ ok: true, timestamp: new Date().toISOString() }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
