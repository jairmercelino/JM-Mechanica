# Fase 1 — Huidige staat van het systeem

*Datum analyse: 2026-04-21. Alle regelnummers verwijzen naar de staat van het repo op die dag.*

## 1. Kort overzicht

JM Mechanica is technisch een static-site + PWA op GitHub Pages (`jmmechanica.nl`) met één Cloudflare Worker (`jm-lead-search.jwz-jjm.workers.dev`) als backend-proxy voor drie dingen: dashboard-login, uren-sync en lead-search. De facturenverwerking loopt via een Python e-mailscanner die dagelijks als GitHub Action draait. Alle dashboard-data buiten uren staat in `localStorage` op één apparaat.

De code is in twee directories:
- `~/JM-Mechanica/` — git repo, deploy naar Pages (primair, authoritive)
- `~/Desktop/JM/` — losse kopie, met **plaintext IMAP-wachtwoorden** in `jm_config.json` (regel 7 en 13). De repo-versie is ge-sanitized (wachtwoorden leeg) en gebruikt macOS Keychain. De Desktop-kopie is stale/risicovol — zie §7.

Daarnaast staat er een iCloud-map `Jaarcijfers JM Mechanica 2022-2025` — niet geanalyseerd, geen code, waarschijnlijk PDF/XLSX.

## 2. Repo-lay-out

| Pad | Grootte | Rol |
|---|---|---|
| `index.html` | 933 r. | Publieke homepage: hero, diensten, contactformulier (Formspree), chatbot-UI |
| `diensten.html` | 441 r. | Diensten-detailpagina (content-only) |
| `over-mij.html` | 325 r. | Over-mij pagina (content-only) |
| `chatbot.js` | 210 r. | Gedeelde chatbot voor publieke site, regel-gebaseerd |
| `dashboard.html` | 2477 r. | PWA-dashboard (login, klok, rooster, uren, facturen, leads) |
| `sw.js` | 125 r. | Service worker: network-first voor HTML, cache-first voor images |
| `manifest.json` | 27 r. | PWA manifest (scope `/`, start `/dashboard.html`) |
| `worker/index.js` | 146 r. | Cloudflare Worker: `/auth`, `/auth/check`, `/sync`, `?q=` (lead search) |
| `worker/wrangler.toml` | 10 r. | Worker config, KV-binding `JM_DATA` |
| `worker/DEPLOY.md` | 59 r. | **Stale**: beschrijft Google CSE-flow, maar de Worker gebruikt Serper.dev |
| `jm_email_scanner.py` | 589 r. | IMAP-scanner voor facturen uit Gmail + Hostnet |
| `jm_config.json` | 47 r. | Config voor scanner (afzenders, negeerlijst) — wachtwoorden leeg |
| `jm_scan_resultaat.json` | 332 r. | Output scanner, gecommit door GitHub Action |
| `.github/workflows/scanner.yml` | 43 r. | Dagelijkse scan om 05:00 UTC (07:00 NL), commit + push |
| `assets/images/` | — | Foto's + 1 MP4 referentiemateriaal |

## 3. Module-voor-module

### 3.1 Publieke website (`index.html` + `diensten.html` + `over-mij.html` + `chatbot.js`)

**Wat doet het:** statische marketing-site. SEO-meta's gericht op "allround monteur Noord-Holland / Zaandam" (`index.html:6-20`). Contactformulier + chatbot op de homepage.

**Data die het verzamelt:**
- Contactformulier (`index.html:495-525`) velden: `naam`, `bedrijf`, `email`, `type` (dienst), `omschrijving`, plus honeypot `_gotcha`.
- Chatbot-state (`chatbot.js:4-7`): `naam`, `email`, `telefoon`, `bedrijf`, `dienst`, `locatie`, score, geschiedenis.

**Waar gaat die data heen:**
1. POST naar Formspree `https://formspree.io/f/mlgoydqr` (`index.html:837`, `chatbot.js:169`). Formspree stuurt het door naar de ingestelde mailbox (waarschijnlijk `info@jmmechanica.nl`, niet bevestigd — afhankelijk van Formspree-config die niet in het repo staat).
2. **Design-fout**: zowel `index.html:832-834` als `chatbot.js:166` slaat leads op in `localStorage.jm_leads` van de **bezoeker**. De eigenaar kan die niet zien. Het dashboard leest wél van `jm_leads`, maar alleen vanaf het eigen apparaat — dus chatbot-conversaties vullen daar nooit iets.

**Externe afhankelijkheden:**
- Formspree (e-mail doorsturen, gratis tier)
- Tailwind + Material Symbols via CDN (gezien in index.html head, niet volledig ingelezen)
- Favicon-fetch via `https://www.google.com/s2/favicons` (zie dashboard.html:2346, ook publieke afhankelijkheid)

**Chatbot-scoringslogica** (`chatbot.js:62-103`): regex-matching op onderwerpen (tarief, beschikbaarheid, diensten, werkgebied, contact, certificering, ervaring). Punten: +3 per email, +3 per telefoonnummer, +2 per naam, +1 per nieuw onderwerp. Bij score ≥ 3 biedt de bot een formulier aan (`chatbot.js:115-121`). Geen LLM, geen externe API — 100% lokaal in de browser.

### 3.2 Dashboard — auth & PWA skelet (`dashboard.html:578-631` + `sw.js`)

**Login-flow:**
1. Gebruiker typt wachtwoord → SHA-256 hash clientside (`dashboard.html:581-584`).
2. POST hash naar `AUTH_URL = https://jm-lead-search.jwz-jjm.workers.dev/auth` (`dashboard.html:578, 589-594`).
3. Worker vergelijkt met secret `DASH_HASH`, retourneert `token` (UUID, 7-dagen KV-TTL) (`worker/index.js:70-76`).
4. Dashboard slaat `jm_in=1` + `jm_token` op in `localStorage` (`dashboard.html:596-600`).
5. Bij hergebruik: background-check op `/auth/check?token=` (`dashboard.html:618-620`). Offline = gewoon doorlaten.

**Service worker** (`sw.js`): network-first voor HTML (actuele versie), cache-first voor images/PNG/SVG, stale-while-revalidate voor JS + overig. Cache key `jm-v3`. Push-notificaties geregistreerd maar niet actief gebruikt buiten `sw.js:96-107`.

### 3.3 Dashboard — Inklokken + Uren (`dashboard.html:651-811`)

**Klok:** één timer-state in `localStorage.jm_clock_start` (ms sinds epoch). Inklokken zet timestamp, uitklokken rekent `eh*60+em - sh*60+sm` (met wrap-around middernacht, `dashboard.html:741`). Elke uren-entry krijgt auto-detecteerde dienstcode via `DIENST_PATROON` (10-daags, `D,D,M,M,N,N,null,null,null,null`, `dashboard.html:1443`). Pauzes automatisch: 30 min voor diensten > 6u.

**Data:** `localStorage.jm_uren` = array entries `{id, datum, start, einde, pauze, uren, opdrachtgever, dienst, notitie}`.

**Sync:** via Worker `/sync` endpoint met PIN-header. Bij elke `slaOp()` (dashboard.html:744) wordt `syncNaarCloud()` aangeroepen. Pull via "Sync ophalen" knop.

**Waar staat de data uiteindelijk:**
- Browser `localStorage` (primair)
- Cloudflare KV `JM_DATA`, key `uren` (`worker/index.js:47-57`)
- Sessions in KV met key `session:<uuid>`, TTL 7 dagen

### 3.4 Dashboard — Rooster (`dashboard.html:1443-1715`)

10-daags vast patroon, combineerbaar met per-datum overrides (`roosterAanpassingen`). Kalenderrendering maand-per-maand. Losse opdrachtgevers-lijst (`jm_opdrachtgevers`, default `["A-ware Almere","Certos"]`). Geen externe sync — alles `localStorage`.

Via "rooster overnemen in uren" (`dashboard.html:880-911`) kunnen alle komende diensten als uren-entries gegenereerd worden — handig voor vaste Certos-opdracht.

### 3.5 Dashboard — Facturen / Kosten (`dashboard.html:1057-1459`)

**Twee ingangen:**
1. Auto-load: `laadKostenAutomatisch()` haalt `jm_scan_resultaat.json` van GitHub Pages (`dashboard.html:1263-1275`). Dit JSON wordt gecommit door de GitHub-Action.
2. Handmatig: foto/PDF-upload vanuit browser (`verwerkFoto`, `verwerkBestanden` `dashboard.html:1069-1125`) → upload naar Google Drive via Drive API (`dashboard.html:1204-1261`).

**Naamgevingsverwarring:** de knop heet "🔄 Vernieuwen" en roept `laadVanGoogleDrive()` aan (`dashboard.html:1278`), maar die functie fetcht simpelweg `/jm_scan_resultaat.json` — het laadt NIET van Drive. Drie aparte laadpaden voor dezelfde data die vroeger één waren.

**Google Drive integratie** (`dashboard.html:1173-1261`):
- OAuth2 via Google Identity Services JS client
- CLIENT_ID `829454599266-vg861ouglnnmm5sgpulm4kgq9itki41j.apps.googleusercontent.com` (public, ok)
- FOLDER_ID `1VD1V2pIkCpLlIyj91FVMD-zddFXfNlAx` (private map-identificatie; exposure-risico: matig — zonder token onbruikbaar)
- Scope `drive.file` (alleen eigen bestanden)
- Uploads naar subfolders per kwartaal (`2026/Q1` etc.)

**Verwerking:** kosten worden geclassificeerd als `Inkomsten | 100% aftrekbaar | Deels aftrekbaar | Onbekende factuur | Prive` (`dashboard.html:1318-1407`). "Geschat terug" = 100%-aftrekbaar + 70% van deels-aftrekbaar (`dashboard.html:1328`) — deze 70% is een aanname die met de boekhouder besproken moet worden (zichtbaar gemarkeerd in UI).

### 3.6 Dashboard — Leads / Bedrijvenzoeker (`dashboard.html:1881-2474`)

**Kort:** dit is de module die jij als zwakke plek noemt. Een diepgaande analyse komt in Fase 2. Hier alleen de inventaris.

**Data-model (`dashboard.html:2044-2055`):**
```js
{ id, titel, snippet, url, domein, afbeelding,
  bronQuery, status, datum,
  contactNaam, contactFunctie, contactEmail, contactTelefoon, notities,
  datumBenaderd?, laatsteActie? }
```

**Pipeline-statussen** (`dashboard.html:2182-2183`): `nieuw → liked → benaderd → followup → reactie → afspraak → klant`. Plus `afgewezen` als tak.

**Bron:** Google-zoekresultaten via Serper.dev, geproxyd door de eigen Cloudflare Worker. 25 hard-coded queries in `LEAD_QUERIES` (`dashboard.html:1881-1911`). Geen KvK, geen Places, geen LinkedIn, geen scraping van websites zelf.

**"Agent" state** (`leadAgent`, `dashboard.html:1919-1925`):
- `queryScores` — per query een score, verhoogd bij elke "like"
- `likedKeywords` — woordfrequenties uit titels van gelikete leads
- `blockedDomains` — domeinen die zijn disliked
- `zoekIndex` — rotatie-cursor

**Leer-lus** (`dashboard.html:2079-2125`): like verhoogt query-score + extraheert woorden uit titel; bij ≥3 likes genereert de agent nieuwe queries met pattern `"{keyword}" fabriek productie noord-holland`.

**E-mail generatie** (`dashboard.html:2219-2258`): twee vaste templates (initieel + follow-up). Alleen dynamische velden zijn bedrijfsnaam (uit `lead.titel` met BV-suffix stripped) en contactnaam. Geen gebruik van de website-snippet of branche-informatie voor personalisatie.

**"Versturen":** er is geen verzending. `openInEmail()` (dashboard.html:2270-2281) kopieert de e-mail naar het klembord + alert. `markeerVerstuurd()` zet alleen de status. Er is geen SMTP-koppeling, geen Gmail API, geen mail-log per bedrijf.

**Follow-up:** `checkFollowUps()` (dashboard.html:2308-2317) zet status van `benaderd` → `followup` na 5 dagen sinds `datumBenaderd`. Draait bij tab-wissel naar leads.

### 3.7 E-mailscanner (`jm_email_scanner.py` + `.github/workflows/scanner.yml`)

**Wat doet het:**
1. Logt in op beide IMAP-inboxen (Gmail + Hostnet) met wachtwoorden uit macOS Keychain (`jm_email_scanner.py:59-70, 80-92`) of GitHub Secret `JM_CONFIG_JSON` in CI.
2. Scant laatste 150 mails per inbox (`jm_config.json:18`).
3. Filtert reclame via `altijd_negeren` (`jm_config.json:29-45`, 42 stopwoorden).
4. Matcht bekende afzenders (8 stuks: Certos, Alicia, Ziggo, Moneybird, Elektramat, Hostnet, Shopify, Carte Blanche).
5. Extraheert bedragen uit e-mail-body + PDF-bijlagen (`detecteer_bedrag`, `jm_email_scanner.py:288-358`) — 3 prioriteitsniveaus: gelabeld ("Totaal te betalen"), € teken, los getal.
6. Certos-specifiek: extraheert weeknummer uit PDF voor consistente bestandsnaam (`jm_email_scanner.py:184-191`).
7. Slaat PDF's op in `Facturen/{jaar} Q{kw}/` (niet in git: op lokale schijf — in GitHub Action wel gegenereerd maar niet gepushed).
8. Schrijft `jm_scan_resultaat.json` met `Inkomsten`, `100% aftrekbaar`, `Deels aftrekbaar`, `Onbekende factuur` lists.

**GitHub Action** (`.github/workflows/scanner.yml`):
- Dagelijks 05:00 UTC (07:00 NL).
- Secret `JM_CONFIG_JSON` bevat de volledige config inclusief wachtwoorden.
- Commit en push `jm_scan_resultaat.json` als bot "JM Scanner Bot".

**Output nu** (`jm_scan_resultaat.json`, ingelezen 2026-04-21): 1 Certos-inkomstenregel zonder bedrag (match faalde), overige regels met bedragen. Laatst gepushed 21-04-2026 10:07 (uit git log).

### 3.8 Cloudflare Worker (`worker/index.js`)

Eén worker, vier endpoints:

| Endpoint | Methode | Doel | Secrets |
|---|---|---|---|
| `/auth` | POST | Login met SHA-256 hash | `DASH_HASH` |
| `/auth/check` | GET | Sessie-verificatie (KV lookup) | — |
| `/sync` | GET/POST | Uren-sync met PIN | `SYNC_PIN` |
| `?q=...` | GET | Lead search via Serper.dev | `SERPER_API_KEY` |

**KV-namespace `JM_DATA`** (id `b4181a5e95c645f390c60f1e55f4d3b2`, `worker/wrangler.toml:10`) bevat:
- `uren` — JSON array uren-entries
- `session:<token>` — TTL 7 dagen, value `active`

**CORS** (`worker/index.js:17-24`) staat `jmmechanica.nl`-origin en `localhost:3000` toe.

**Serper.dev-aanroep** (`worker/index.js:107-119`): `gl=nl`, `hl=nl`, `num=10`. Standaard 2500 zoekopdrachten/maand op gratis tier (aanname — zie §6, niet geverifieerd).

## 4. Integratie-overzicht (hoe hangen modules samen)

```
 Publieke site (jmmechanica.nl)           Dashboard (jmmechanica.nl/dashboard.html)
 ─────────────────────────────            ─────────────────────────────
 index.html ─┐                            dashboard.html ─── localStorage (per device)
             ├── Formspree ── email          │                  │
 chatbot.js ─┘                               │                  └─ jm_leads, jm_uren, etc.
                                             │
                                             ├─ /auth, /auth/check   Cloudflare Worker
                                             ├─ /sync (uren)         (jm-lead-search)
                                             └─ /?q= (leads)            │
                                                                        ├── Serper.dev → Google
                                                                        └── KV JM_DATA
                                             ▼
                                 fetch /jm_scan_resultaat.json (GitHub Pages)
                                             ▲
                                             │
            GitHub Actions  ── python jm_email_scanner.py ── Gmail + Hostnet (IMAP)
            (dagelijks 07:00 NL)                          └─ PDF's lokaal (niet in git)

            Google Drive API (alleen handmatige invoice-upload vanuit dashboard)
```

**Data-eilanden (belangrijk):**
- `jm_leads` op publieke site is andere storage dan `jm_leads` in dashboard (zelfde sleutel, verschillende browsers → niet gesynchroniseerd).
- Uren wél gesynchroniseerd via KV; alles anders (leads, facturen-cache, rooster, opdrachtgevers) bestaat alleen in de browser waar je het dashboard opent.

## 5. Externe afhankelijkheden (overzicht)

| Dienst | Waar gebruikt | Doel | Kosten |
|---|---|---|---|
| **Cloudflare Workers** | Worker | auth, uren-sync, lead-proxy, session store | Gratis (100k req/dag) |
| **Cloudflare KV** | Worker | `uren`, sessions | Gratis tier |
| **Serper.dev** | Worker (`/?q=`) | Google-zoekresultaten | Gratis tier (~2500/maand, niet geverifieerd) |
| **Formspree** | public site | Inkomende contact-leads naar mailbox | Gratis 50 submissions/mnd |
| **Google Drive API** | dashboard (facturen) | PDF-upload naar eigen Drive | Gratis (persoonlijk Drive-quota) |
| **Google Favicons** | dashboard (lead cards) | Logo's voor leadkaarten | Gratis (ongedocumenteerd endpoint) |
| **Gmail IMAP** | scanner | E-mail ophalen | Gratis |
| **Hostnet IMAP** | scanner | Zakelijke mail ophalen | Hostnet-abonnement |
| **GitHub Pages** | deploy | Site hosting | Gratis |
| **GitHub Actions** | scanner | Dagelijkse scan | Gratis (2000 min/mnd, ruim) |
| **Tailwind + Material Symbols CDN** | public site | Styling | Gratis |

Geen KvK API, geen CRM (HubSpot/Pipedrive/etc.), geen LinkedIn, geen SMTP-provider, geen analytics. Aanname: geen cookieconsent-banner nodig zolang er geen tracking-cookies zijn — maar dit moet bevestigd worden (Fase 4).

## 6. Niet-geverifieerde aannames (expliciet)

Deze zijn relevant maar heb ik niet kunnen toetsen zonder externe toegang:

1. **Serper.dev-quota** — aangenomen gratis tier ~2500/mnd. Check op serper.dev nodig.
2. **Formspree-bestemming** — aangenomen dat submissies naar `info@jmmechanica.nl` gaan. Formspree-dashboard bevestigt dit maar repo toont het niet.
3. **Google Drive FOLDER_ID** — aangenomen dat deze map nog bestaat en toegankelijk is.
4. **GitHub Secret `JM_CONFIG_JSON`** — kunnen we niet zien; aangenomen dat die de volledige `jm_config.json` met wachtwoorden bevat (zoals de workflow suggereert).
5. **DEPLOY.md beschrijft Google CSE** — maar `index.js` gebruikt Serper.dev. De docs zijn stale; geen bewijs dat Google CSE ook actief is.

## 7. Opmerkelijke bevindingen voor volgende fases

- **S1 Lek-risico in `~/Desktop/JM/jm_config.json`**: plaintext wachtwoorden voor Gmail en Hostnet op lokale schijf. Niet in git, maar wel kwetsbaar bij backup/sync naar iCloud/Time Machine. Actie: verwijderen of verplaatsen naar Keychain. Ter info: de repo-kopie is schoon.
- **S2 Stale docs**: `worker/DEPLOY.md` beschrijft Google CSE + committeert een API-key literal (r. 19: `AIzaSyAM48uGnbdjMn4unW6R4EVC8ueDcEDHLCM`) en CSE-id. Die key staat in git history ongeacht of hij nog werkt; moet geroteerd worden als hij nog bestaat.
- **S3 Chatbot-leads onbereikbaar**: `localStorage.jm_leads` op bezoekersbrowser wordt nergens benut. Alle dashboard-leads komen uit de zoeker, niet uit de chatbot. Dat is een verspilling van de chatbot-score + gespreksgeschiedenis — die context bereikt Jair niet of alleen in de Formspree-mail.
- **S4 "Data-single-device"**: op een nieuw apparaat inloggen → leeg dashboard behalve uren. Leads, rooster, opdrachtgevers, facturen-cache gaan niet mee. Mogelijke bug of bewuste keuze.
- **S5 Scanner mist Certos-bedrag soms**: `jm_scan_resultaat.json` toont 1 Certos-regel met `"bedrag": "onbekend"` — de patronen uit `CERTOS_PATRONEN` (r.307-311) vangen niet alle gevallen.
- **S6 Rooster + uren overlappen niet echt**: `renderRooster` werkt met aparte `rooster`-array (`jm_rooster`), terwijl `DIENST_PATROON` een onafhankelijk 10-daags patroon is. Rooster-aanpassingen (`jm_rooster_aanp`) werken alleen via `passDienstAan`. Niet fout, wel complex.
- **S7 Geen tests, geen CI-linting op de frontend.** Wel GitHub Action voor scanner, geen build/test stap. De scroll-bug (extra `</div>`) en login-bug die vandaag gefixt zijn hadden door een simpele HTML-validator gevonden kunnen worden.

## 8. Samenvatting voor volgende fases

| Module | Werkt | Zwakte voor acquisitie |
|---|---|---|
| Publieke site | Ja | Chatbot-context bereikt dashboard niet; Formspree is enige kanaal in |
| Dashboard skelet + login | Ja | Solo, alleen op één device voor niet-uren data |
| Uren | Ja | Geen acquisitie-impact |
| Rooster | Ja | Niet gekoppeld aan lead-beschikbaarheidsberichten |
| Facturen | Ja | Geen lead-learning uit betaalde klanten |
| **Bedrijvenzoeker** | Basis | Geen KvK/SBI, naïeve queries, geen contactverrijking, geen echte verzending |
| Scanner | Ja (90%) | Geen rol in acquisitie |

De kern van de klantacquisitie-zwakte zit in §3.6 (bedrijvenzoeker) en §3.1 (chatbot die leads niet terugvoedt). Fase 2 gaat diep op §3.6 in.
