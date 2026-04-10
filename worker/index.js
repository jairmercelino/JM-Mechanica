/**
 * JM Mechanica — Lead Search Proxy
 * Cloudflare Worker die Serper.dev (Google Search) aanroept server-side.
 * API key blijft veilig als environment secret.
 *
 * Secrets (via wrangler secret put):
 *   SERPER_API_KEY — Serper.dev API key
 */

export default {
  async fetch(request, env) {
    // CORS
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://jmmechanica.nl';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === 'http://localhost:3000' || origin.includes('jmmechanica') ? origin : allowed,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return Response.json({ error: 'Alleen GET requests' }, { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
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

      // Resultaten omzetten naar zelfde format als dashboard verwacht
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
