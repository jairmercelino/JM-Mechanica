# JM Mechanica — Project Context

## Over mij
Ik ben Jair Mercelino, eenmanszaak in Zaandam (Noord-Holland), allround
monteur. VCA-VOL gecertificeerd. Werk voor industriële klanten in
Noord-Holland. KvK: 86164309, BTW: NL004201082B62. E-mail:
info@jmmechanica.nl. Telefoon: +31 6 29 22 93 95.

## Wat dit project is
Mijn eigen platform dat twee dingen combineert:
1. Publieke site (jmmechanica.nl) als visitekaartje voor mijn monteurwerk.
2. Dashboard achter login voor mijn eigen bedrijfsvoering.

Het is een leer-én-productie-project: ik wil Next.js serieus leren, maar
het eindresultaat moet professioneel werkend zijn voor mijn eenmanszaak.

## Mijn niveau en leerstijl
- Ervaring met Claude Code en Google Stitch.
- Beginnende Next.js-kennis, wil dit serieus leren.
- Geen formele programmeerachtergrond.
- Leer het beste door uitleg + voorbeeld, niet alleen code.
- Nederlandstalig; code mag Engels zijn, comments ook.

## Hoe ik wil werken
- Leg uit WAAROM iets gebeurt, niet alleen WAT.
- Bouw in kleine stappen zodat ik kan volgen.
- Geen code-dumps zonder uitleg.
- Als ik iets fout doe: wijs het aan en leg uit — niet stilletjes fixen.
- Wijs me op valkuilen voor beginners.
- Als iets complex wordt: eerst simpel voorbeeld, dán uitbreiden.
- Nederlandse uitleg, Engelse code/comments.

## Wat NIET te doen
- Geen nieuwe dependencies toevoegen zonder overleg.
- Niet switchen van framework of tool zonder discussie.
- Geen grote refactors zonder expliciete vraag.
- Geen features bouwen die ik niet heb gevraagd.
- Niet vooruitlopen op latere fases.
- Geen klant-data of secrets in het repo committen.
- Geen destructieve acties (files verwijderen, DB-resets, force-push,
  branch-delete) zonder expliciete bevestiging.

## Scope van het platform
- Publieke pagina's: home, diensten, over mij, contact, privacy.
- Contactformulier dat naar mijn mail komt (info@jmmechanica.nl).
- Dashboard (beveiligd) met:
  - Rooster / planning
  - Inklok-systeem
  - Factuurscanner (haalt facturen uit e-mail en sorteert ze in Drive)
  - Bedrijvenzoeker voor klant-acquisitie (nog uit te bouwen)

## Stack
- Next.js 14+ met App Router
- TypeScript
- Tailwind CSS
- Supabase (database + auth)
- Vercel voor hosting
- Resend voor transactionele e-mail
- Spline voor eventuele 3D-elementen (pas Fase 5, niet eerder)

## Fase-aanpak
Ik bouw in duidelijke fases. Loop niet vooruit op latere fases.

- **Fase 0**: Voorbereiding — Next.js-repo opzetten, Foundations-tutorial
  doorwerken, schone projectstructuur bepalen.
- **Fase 1**: Statische kloon van huidige site in Next.js + Tailwind.
- **Fase 2**: Contactformulier via server actions + Resend, SEO-basis.
- **Fase 3**: Dashboard met Supabase Auth, module voor module:
  auth → rooster → inklok → factuurscanner → bedrijvenzoeker.
- **Fase 4**: DNS omzetten, oude stack afbouwen.
- **Fase 5**: Polish — Spline, animaties, cases, optionele
  uitbreidingen (bv. Moneybird-koppeling, KvK-verrijking).

## Huidige fase
**Fase 0 — begint.** Stack-keuze is vastgelegd (zie boven).
Next.js-scaffold bestaat nog niet (geen package.json, geen repo-init).
Eerste concrete stap: Next.js Foundations-tutorial doorwerken en vanaf
daar een schone repo-structuur opzetten.

## Regel tijdens de migratie
Tijdens Fase 0-3 worden **geen nieuwe features op de huidige stack
gebouwd**. Verbeteringen aan publieke site én dashboard worden direct in
de Next.js-herbouw meegenomen. Dit voorkomt dubbel werk. Uitzondering
alleen voor acute security/compliance-issues die niet kunnen wachten.

## Bestaande infrastructuur (context, nog niet gemigreerd)
Tot Fase 4 voltooid is, blijft dit productief en blijft hier dus bij
horen:
- **Live site**: `jmmechanica.nl` — static HTML + vanilla JS op GitHub
  Pages.
- **Dashboard**: privé op `/dashboard.html`, wachtwoord-beveiligd via
  Cloudflare Worker `DASH_HASH` secret.
- **Cloudflare Worker**: `jm-lead-search.jwz-jjm.workers.dev` met vijf
  endpoints:
  - `POST /auth` — dashboard-login
  - `GET /auth/check` — sessie-validatie
  - `GET|POST /sync` — uren-sync (dashboard ⇄ KV)
  - `GET /?q=` — lead search via Serper.dev
  - `GET|POST /scan-result` — scanner-output naar/van KV
- **Cloudflare KV namespace** `JM_DATA` voor uren, sessies,
  scan-resultaat.
- **Python scanner** (`jm_email_scanner.py`): draait lokaal op Mac via
  launchd (`com.jmmechanica.scanner.plist`). Leest Gmail + Hostnet IMAP,
  slaat PDF's in
  `~/Library/CloudStorage/GoogleDrive-jwz.jjm@gmail.com/Mijn Drive/JM Mechanica/Facturen/{jaar} Q{kw}/`,
  post JSON-samenvatting naar Worker KV.
- **Formspree** voor contactformulier → `info@jmmechanica.nl`.
- **Hostnet** voor zakelijke e-mail.
- **Supabase-project**: bestaat al; details niet in repo.

## Bestaand analysewerk
In `docs/analyse/` staat een volledige analyse van de huidige stack
(april 2026):
- `00-samenvatting.md` — 2-minuten overview
- `01-huidige-staat.md` — architectuur per module
- `02-bedrijvenzoeker.md` — lead-system diepgaand
- `03-acquisitie-flow.md` — bottleneck-analyse
- `04-juridisch.md` — AVG, Tw 11.7, KvK, LinkedIn ToS
- `05-vergelijking.md` — commerciële tools en patronen
- `06-verbeterplan.md` — **huidige-stack verbeterplan, grotendeels
  achterhaald door Next.js-migratie. Inventaris 01-05 blijft relevant
  als bron voor de herbouw.**
- `07-zelfreview.md` — correcties en nuances

## Secrets en configuratie
- `.env` nooit committen.
- **Huidige secrets in Cloudflare Worker** (via `wrangler secret put`):
  - `SERPER_API_KEY` — lead search
  - `SYNC_PIN` — uren-sync
  - `DASH_HASH` — SHA-256 hash dashboard-wachtwoord
  - `SCAN_TOKEN` — upload scan-resultaat
- **macOS Keychain** voor scanner:
  - service `jm-scanner-gmail` voor account `jwz.jjm@gmail.com`
  - service `jm-scanner-hostnet` voor account `info@jmmechanica.nl`
  - service `jm-scanner-scan-token` voor account `jm-mechanica`
- **Later toe te voegen (Next.js-fase)**: Supabase keys, Resend key →
  in Vercel environment variables.

## Compliance-status (huidig)
- Privacyverklaring aanwezig op `/privacy.html`.
- Contactformulier heeft verplichte akkoord-checkbox.
- Chatbot toont privacy-regel onder invoerveld.
- Lead-mail-template bevat opt-out-regel én link naar privacy.
- **Opt-out register bestaat nog niet** — wordt meegenomen in Next.js-
  herbouw (Fase 3 dashboard-module "bedrijvenzoeker"). Tot die tijd:
  **geen cold mails versturen vanuit het huidige dashboard**.
- Huiswerk voor eigenaar: Google API key rotation (oude key in git
  history), Mail-Tester DNS-check.

## Geactiveerde skills en plugins

Dit project gebruikt:
- **Superpowers** (`superpowers@claude-plugins-official` v5.0.7) —
  skills framework met o.a. `brainstorming`, `test-driven-development`,
  `systematic-debugging`, `executing-plans`, `dispatching-parallel-agents`,
  `using-git-worktrees`, `finishing-a-development-branch`.
- **Frontend-design skill** (`frontend-design@claude-plugins-official`)
  — voor distinctive UI die niet generiek AI-achtig oogt.

Beide zijn user-scope geïnstalleerd, zichtbaar voor elke sessie in dit
project.

### Wanneer welke aanpak

Omdat dit een leer-project is én een productie-platform, onderscheid
ik twee soorten taken:

**Leer-taken / kleine experimenten** (ik wil iets begrijpen of
uitproberen):
- Skip de volledige brainstorm/plan-cyclus als ik zeg "snel even" of
  "laten we proberen".
- Leg uit wat we doen, maar blokkeer me niet met verplichte tests bij
  een throwaway experiment.
- Focus op leren, niet op productie-perfectie.

**Echte feature-bouw** (nieuw onderdeel van het platform):
- Gebruik de volledige Superpowers-workflow: brainstorm → plan → code
  → verify.
- Gebruik TDD waar het zinvol is (utility-functies, logica, formulier-
  validatie). Voor puur visuele componenten mag TDD worden
  overgeslagen.
- Gebruik frontend-design skill voor alle UI-componenten.
- Review-stap niet overslaan.

**Bug fixes**:
- Gebruik de `systematic-debugging`-skill, niet gokken.
- Eerst root cause, dan pas fix.

### Welke taak is welke?

Standaard: behandel een verzoek als leer-taak tenzij ik expliciet zeg
"dit is een feature" of "dit komt in productie". Bij twijfel: vraag
het.

### Frontend-design skill gebruik

Activeer automatisch bij:
- Nieuwe componenten (Header, Hero, Cards, etc.)
- Pagina-layouts
- Visuele keuzes (spacing, kleur, typografie)
- Elke keer dat ik iets "mooi" of "professioneel" wil hebben.
