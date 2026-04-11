/**
 * JM Mechanica — Lead Search Proxy + Uren Sync
 * Cloudflare Worker die Serper.dev (Google Search) aanroept server-side
 * en uren-data synct via KV storage.
 *
 * Secrets (via wrangler secret put):
 *   SERPER_API_KEY — Serper.dev API key
 *   SYNC_PIN — 4-cijferige PIN voor uren sync
 *
 * KV Namespace:
 *   JM_DATA — opslag voor uren sync
 */

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://jmmechanica.nl';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === 'http://localhost:3000' || origin.includes('jmmechanica') ? origin : allowed,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Pin',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── UREN SYNC ──
    if (path === '/sync') {
      // PIN check
      const pin = request.headers.get('X-Sync-Pin') || url.searchParams.get('pin');
      if (!pin || pin !== env.SYNC_PIN) {
        return Response.json({ error: 'Ongeldige PIN' }, { status: 401, headers: corsHeaders });
      }

      if (!env.JM_DATA) {
        return Response.json({ error: 'KV niet geconfigureerd' }, { status: 500, headers: corsHeaders });
      }

      // GET = ophalen
      if (request.method === 'GET') {
        const data = await env.JM_DATA.get('uren', 'json');
        return Response.json({ uren: data || [], ts: Date.now() }, { headers: corsHeaders });
      }

      // POST = opslaan
      if (request.method === 'POST') {
        const body = await request.json();
        if (!Array.isArray(body.uren)) {
          return Response.json({ error: 'Ongeldige data' }, { status: 400, headers: corsHeaders });
        }
        await env.JM_DATA.put('uren', JSON.stringify(body.uren));
        return Response.json({ ok: true, count: body.uren.length, ts: Date.now() }, { headers: corsHeaders });
      }

      return Response.json({ error: 'Alleen GET/POST' }, { status: 405, headers: corsHeaders });
    }

    // ── LEAD SEARCH (bestaand) ──
    if (request.method !== 'GET') {
      return Response.json({ error: 'Alleen GET requests' }, { status: 405, headers: corsHeaders });
    }

    const query = url.searchParams.get('q');

    if (!query) {
      return Response.json({ error: 'Parameter ?q= is verplicht' }, { status: 400, headers: corsHeaders });
    }

    if (!env.SERPER_API_KEY) {
      return Response.json({ error: 'API niet geconfigureerd (SERPER_API_KEY ontbreekt)' }, { status: 500, headers: corsHeaders });
    }

    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          gl: 'nl',
          hl: 'nl',
          num: 10,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Response.json(
          { error: data.message || `Serper API fout ${res.status}` },
          { status: res.status, headers: corsHeaders }
        );
      }

      const items = (data.organic || []).map(item => ({
        title: item.title || '',
        snippet: item.snippet || '',
        link: item.link || '',
        image: null,
      }));

      return Response.json({ items }, { headers: corsHeaders });

    } catch (e) {
      return Response.json(
        { error: 'Kon Serper niet bereiken: ' + e.message },
        { status: 502, headers: corsHeaders }
      );
    }
  }
};
