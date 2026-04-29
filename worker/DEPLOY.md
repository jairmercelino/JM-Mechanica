# JM Lead Search Worker — Deploy Instructies

> **STALE — 2026-04-29**: Deze instructies beschrijven de oude
> Google Custom Search opzet. De Worker draait nu op Serper.dev
> (zie `index.js`). De Google CSE-key + CSE-id hieronder zijn
> geroteerd/verwijderd in Google Cloud op 2026-04-29.

## Wat is dit?
Een Cloudflare Worker die als proxy dient voor de Google Custom Search API.
Je API key blijft veilig server-side (niet zichtbaar in de browser).

## Stap 1: Cloudflare account aanmaken
1. Ga naar https://dash.cloudflare.com/sign-up
2. Maak een gratis account aan (geen creditcard nodig)

## Stap 2: Wrangler CLI installeren
```bash
npm install -g wrangler
wrangler login
```

## Stap 3: Google API key klaarzetten
Je hebt nodig:
- **GOOGLE_API_KEY** — je bestaande key: `[REDACTED — rotated 2026-04-29]`
- **GOOGLE_CSE_ID** — je bestaande ID: `[REDACTED — rotated 2026-04-29]`

**Belangrijk:** Ga naar https://console.cloud.google.com
1. Selecteer je project
2. Ga naar "APIs & Services" → "Enabled APIs"
3. Zoek "Custom Search JSON API" en schakel deze **IN**
4. Ga naar "Credentials" → klik op je API key
5. Onder "API restrictions" → selecteer "Custom Search JSON API"
6. Onder "Application restrictions" → kies "None" (of voeg je Worker URL toe later)

## Stap 4: Deployen
```bash
cd worker
wrangler deploy
```

## Stap 5: Secrets instellen
```bash
wrangler secret put GOOGLE_API_KEY
# Plak: [REDACTED — rotated 2026-04-29]

wrangler secret put GOOGLE_CSE_ID
# Plak: [REDACTED — rotated 2026-04-29]
```

## Stap 6: Testen
Open in je browser:
```
https://jm-lead-search.jairmercelino.workers.dev?q=voedingsindustrie+onderhoud+monteur
```

Je zou een JSON response moeten zien met zoekresultaten.

## Stap 7: Dashboard
Het dashboard is al geconfigureerd om de Worker te gebruiken.
De URL is: `https://jm-lead-search.jairmercelino.workers.dev`

## Kosten
- Cloudflare Workers gratis tier: 100.000 requests/dag
- Google Custom Search: 100 zoekopdrachten/dag gratis
