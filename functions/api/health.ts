// functions/api/health.ts

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'vudo-api',
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
