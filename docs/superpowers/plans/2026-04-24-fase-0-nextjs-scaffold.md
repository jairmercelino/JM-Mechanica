# Fase 0 — Next.js Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een lege, werkende Next.js-repo opzetten op `~/jmmechanica/`,
gekoppeld aan een privé GitHub-repo `jairmercelino/jmmechanica` en aan
Vercel, zodat elke commit automatisch deployt naar een
`.vercel.app`-preview-URL.

**Architecture:** Standalone Next.js 15 App Router scaffold met
TypeScript, Tailwind, src/-directory en Turbopack-dev. Gehost op
Vercel met defaults. Geen externe dependencies (Supabase, Resend
etc.) in deze fase — alleen scaffold + deploy-pijplijn.

**Tech Stack:** Node 22 LTS, npm, Next.js 15, TypeScript, Tailwind
CSS, ESLint, Turbopack, GitHub, Vercel.

**Spec reference:** [`2026-04-24-fase-0-nextjs-scaffold-design.md`](../specs/2026-04-24-fase-0-nextjs-scaffold-design.md)

**Belangrijke afwijking van het pure TDD-model:** Dit is
infrastructuur-setup, geen code-werk. "Tests" zijn hier
verificatie-commando's met verwachte uitvoer. Het bite-sized-step-
principe blijft gelden, maar er worden geen unit tests geschreven.

---

## File Structure

Bestanden die deze plan **aanmaakt of wijzigt** bovenop wat
`create-next-app` genereert:

| Pad | Actie | Verantwoordelijkheid |
|---|---|---|
| `~/jmmechanica/.nvmrc` | create | Vastleggen Node-versie (22) |
| `~/jmmechanica/.env.example` | create | Sjabloon voor lokale env-vars |
| `~/jmmechanica/CLAUDE.md` | create | Gekopieerd uit oude repo, project context |
| `~/jmmechanica/README.md` | overwrite | Korte JM-versie ipv default Next.js README |
| `~/jmmechanica/.gitignore` | modify | `.vercel/` toevoegen (defensive) |

Alle overige bestanden komen uit `create-next-app` zelf en raken we
niet aan in deze fase.

---

## Task 1: Node 22 LTS klaarzetten

**Files:** geen (systeem-niveau via nvm)

- [ ] **Stap 1: Controleer huidige Node-versie**

```bash
node -v
```

Verwacht: `v24.14.1` (of vergelijkbaar — bewijst dat we van versie
moeten wisselen).

- [ ] **Stap 2: Installeer Node 22 LTS via nvm**

```bash
nvm install 22
```

Verwacht: download + install van laatste 22.x.x. Bij succes toont
het iets als `Now using node v22.x.x (npm v10.x.x)`.

- [ ] **Stap 3: Activeer Node 22 als default voor deze shell**

```bash
nvm use 22
node -v
```

Verwacht: `v22.x.x`. Niet `v24.x.x`. Als nog steeds 24 → opnieuw
`nvm use 22` of nieuwe terminal.

- [ ] **Stap 4: (Optioneel) Maak Node 22 default voor toekomstige shells**

```bash
nvm alias default 22
```

Verwacht: `default -> 22 (-> v22.x.x)`. Dit voorkomt dat een nieuwe
terminal terug naar 24 valt. Skip als je dat liever niet doet —
`.nvmrc` in stap 6 lost dit per repo op.

---

## Task 2: Scaffold draaien met `create-next-app`

**Files:** `~/jmmechanica/` (volledig gegenereerd)

- [ ] **Stap 1: Verifieer huidige werkmap is `~/`**

```bash
cd ~ && pwd
```

Verwacht: `/Users/jairmercelino`.

- [ ] **Stap 2: Verifieer dat `~/jmmechanica/` nog niet bestaat**

```bash
ls -la ~/jmmechanica 2>&1
```

Verwacht: `ls: ~/jmmechanica: No such file or directory`. Als de map
WEL bestaat → STOP. Niet overschrijven. Eerst onderzoeken wat
erin staat en met eigenaar overleggen.

- [ ] **Stap 3: Draai `create-next-app` interactief**

```bash
npx create-next-app@latest jmmechanica
```

Beantwoord de prompts exact zo:

| Prompt | Antwoord |
|---|---|
| Would you like to use TypeScript? | **Yes** |
| Would you like to use ESLint? | **Yes** |
| Would you like to use Tailwind CSS? | **Yes** |
| Would you like your code inside a `src/` directory? | **Yes** |
| Would you like to use App Router? (recommended) | **Yes** |
| Would you like to use Turbopack for `next dev`? | **Yes** |
| Would you like to customize the import alias (`@/*` by default)? | **No** |

Verwacht: `npx` haalt het pakket op, vraagt 7 keer iets, draait dan
`npm install`. Eindigt met `Success! Created jmmechanica at
/Users/jairmercelino/jmmechanica`. Duurt 1-3 minuten.

- [ ] **Stap 4: Verifieer de gegenereerde structuur**

```bash
cd ~/jmmechanica && ls -la
```

Verwacht in de output: `.git/`, `.gitignore`, `node_modules/`,
`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`,
`postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `public/`,
`src/`, `README.md`.

- [ ] **Stap 5: Verifieer dat `src/app/` de drie kern-files heeft**

```bash
ls src/app/
```

Verwacht: `favicon.ico`, `globals.css`, `layout.tsx`, `page.tsx`.

- [ ] **Stap 6: Verifieer dat git al geïnitialiseerd is met een eerste commit**

```bash
git log --oneline
```

Verwacht: één commit, iets als `xxxxxxx Initial commit from Create
Next App`. (`create-next-app` doet dit automatisch.) Als geen commits
→ `git init && git add -A && git commit -m "Initial commit from Create
Next App"`.

---

## Task 3: Customizations toevoegen

**Files:**
- Create: `~/jmmechanica/.nvmrc`
- Create: `~/jmmechanica/.env.example`
- Create: `~/jmmechanica/CLAUDE.md` (kopie van `~/JM-Mechanica/CLAUDE.md`)
- Overwrite: `~/jmmechanica/README.md`
- Modify: `~/jmmechanica/.gitignore`

- [ ] **Stap 1: Werkmap controle**

```bash
pwd
```

Verwacht: `/Users/jairmercelino/jmmechanica`. Zo niet → `cd ~/jmmechanica`.

- [ ] **Stap 2: Maak `.nvmrc`**

```bash
echo "22" > .nvmrc
cat .nvmrc
```

Verwacht: `cat` toont `22` op één regel.

- [ ] **Stap 3: Maak `.env.example`**

Inhoud:

```
# Lokale environment-variabelen voor jmmechanica
# Kopieer dit bestand naar .env.local en vul de waarden in.
# .env.local wordt nooit gecommit (staat in .gitignore via Next.js default).

# === Fase 2 (Resend voor contactformulier) ===
# RESEND_API_KEY=

# === Fase 3 (Supabase auth + database) ===
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

Commando om te schrijven:

```bash
cat > .env.example <<'EOF'
# Lokale environment-variabelen voor jmmechanica
# Kopieer dit bestand naar .env.local en vul de waarden in.
# .env.local wordt nooit gecommit (staat in .gitignore via Next.js default).

# === Fase 2 (Resend voor contactformulier) ===
# RESEND_API_KEY=

# === Fase 3 (Supabase auth + database) ===
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
EOF

cat .env.example
```

Verwacht: `cat` toont bovenstaande inhoud.

- [ ] **Stap 4: Kopieer CLAUDE.md uit oude repo**

```bash
cp ~/JM-Mechanica/CLAUDE.md ~/jmmechanica/CLAUDE.md
ls -l CLAUDE.md
```

Verwacht: bestand bestaat, ~8KB groot. Inhoud nog ongewijzigd —
updates komen later (bv. "Bestaande infrastructuur" kan na Fase 4
worden aangepast).

- [ ] **Stap 5: Vervang `README.md` met JM-versie**

Schrijf de README met onderstaand commando. De heredoc gebruikt
`<<'EOF'` (single-quoted), wat betekent dat alles letterlijk wordt
geschreven — inclusief backticks. Geen escapes nodig.

````bash
cat > README.md <<'EOF'
# jmmechanica

Productie-platform voor JM Mechanica (eenmanszaak Jair Mercelino,
Zaandam). Combineert publieke site (`jmmechanica.nl`) met dashboard
voor bedrijfsvoering (rooster, inklok, factuurscanner, leadbeheer).

Fase 0 (deze repo) levert de scaffold. Volle context staat in
`CLAUDE.md`.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (auth + database, vanaf Fase 3)
- Resend (transactionele e-mail, vanaf Fase 2)
- Vercel (hosting)
- Node 22 LTS — zie `.nvmrc`

## Lokaal draaien

```bash
nvm use            # leest .nvmrc → Node 22
npm install
npm run dev        # http://localhost:3000
```

## Scripts

- `npm run dev` — dev server met Turbopack
- `npm run build` — productie-build
- `npm run start` — productie-build draaien
- `npm run lint` — ESLint

## Folderconventie (groeit per fase)

- `src/app/` — routes (App Router)
- `src/components/` — herbruikbare UI components (vanaf Fase 1)
- `src/lib/` — utilities, server actions, helpers (vanaf Fase 2)
- `src/app/(dashboard)/` — beveiligde routes via route group (vanaf Fase 3)

## Migratie

Deze repo vervangt geleidelijk de huidige stack
(`github.com/jairmercelino/JM-Mechanica` → GitHub Pages). Tot Fase 4
(DNS-omzetting) blijft die productief. Geen nieuwe features op de
oude stack tijdens de migratie.
EOF

head -5 README.md
````

Verwacht: `head` toont de eerste 5 regels van de nieuwe README, te
beginnen met `# jmmechanica`.

- [ ] **Stap 6: Voeg `.vercel/` toe aan `.gitignore`**

```bash
grep -q "^\.vercel" .gitignore || echo ".vercel" >> .gitignore
tail -5 .gitignore
```

Verwacht: laatste regels van `.gitignore` eindigen met `.vercel`. Het
`grep -q` voorkomt dubbele regel als 'ie er al staat (Next.js zet 'm
in nieuwere templates al, in oudere niet).

- [ ] **Stap 7: Verifieer alle 5 wijzigingen samen**

```bash
git status --short
```

Verwacht 4 nieuwe + 1 gewijzigde:
```
?? .env.example
?? .nvmrc
?? CLAUDE.md
 M .gitignore
 M README.md
```

(De `M` voor README.md komt omdat `create-next-app` 'm aanmaakt en wij
'm overschrijven. De `M` voor `.gitignore` alleen als de regel niet al
in de template stond.)

---

## Task 4: Lokaal valideren

**Files:** geen wijzigingen — alleen verificatie.

- [ ] **Stap 1: Start de dev server**

```bash
npm run dev
```

Verwacht: output eindigt met iets als:
```
   ▲ Next.js 15.x.x (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 1234ms
```

Geen errors of warnings in rood.

- [ ] **Stap 2: Open de pagina in een browser**

Open: http://localhost:3000

Verwacht: Default Next.js welkomstpagina met "Get started by editing
src/app/page.tsx" en de Vercel/Next-logo's. Geen 404, geen witte
pagina, geen stacktrace.

- [ ] **Stap 3: Open de browser-console (DevTools) en controleer**

`Cmd+Option+I` in Chrome/Safari.

Verwacht: Console-tab leeg of alleen Next.js dev-meldingen (groen of
grijs). **Geen** rode errors. Network-tab: alle requests `200 OK`.

- [ ] **Stap 4: Stop de dev server**

In de terminal waar `npm run dev` draait: `Ctrl+C`.

Verwacht: terminal-prompt komt terug.

---

## Task 5: Commit customizations

**Files:** `~/jmmechanica/` (git operaties)

- [ ] **Stap 1: Verifieer git-staat**

```bash
git status --short
```

Verwacht: dezelfde 4-5 wijzigingen als in Task 3 stap 7 (geen extras).
Als er meer staan (bv. `node_modules/` zou erin moeten staan via
`.gitignore`) → STOP en onderzoeken.

- [ ] **Stap 2: Stage de specifieke bestanden**

```bash
git add .nvmrc .env.example CLAUDE.md README.md .gitignore
git status --short
```

Verwacht: alle 5 bestanden krijgen `A` of `M` in de eerste kolom (gestaged):
```
M  .gitignore
A  .env.example
A  .nvmrc
A  CLAUDE.md
M  README.md
```

> **Waarom geen `git add .` of `git add -A`?** Veiligheid. Specifieke
> namen voorkomen dat je per ongeluk `node_modules`, `.env.local`,
> of build-output meeneemt als de `.gitignore` om wat voor reden niet
> klopt.

- [ ] **Stap 3: Commit**

```bash
git commit -m "Initial scaffold: Next.js 15 + TS + Tailwind + App Router (Fase 0)

- Node 22 LTS via .nvmrc
- create-next-app defaults: TS, ESLint, Tailwind, src/, App Router, Turbopack
- .env.example als sjabloon voor latere fases (Resend, Supabase)
- README vervangen door JM-versie met stack en folderconventie
- CLAUDE.md gekopieerd uit oude repo
- .vercel/ toegevoegd aan .gitignore"

git log --oneline
```

Verwacht: 2 commits:
```
xxxxxxx Initial scaffold: Next.js 15 + TS + Tailwind + App Router (Fase 0)
xxxxxxx Initial commit from Create Next App
```

---

## Task 6: GitHub repo aanmaken (privé) en pushen

**Files:** geen lokaal — remote setup.

- [ ] **Stap 1: Check of `gh` CLI geïnstalleerd is**

```bash
which gh && gh --version
```

Verwacht (pad A — geïnstalleerd): pad zoals `/opt/homebrew/bin/gh` +
versie-info. Ga door naar Stap 2A.
Verwacht (pad B — niet geïnstalleerd): `gh not found`. Ga naar
Stap 2B (browser-route).

- [ ] **Stap 2A: Met `gh` CLI — privé repo aanmaken en remote koppelen**

```bash
gh auth status
```

Verwacht: ingelogd als `jairmercelino` met `git` protocol of `https`.
Als niet ingelogd: `gh auth login` (interactief, kies GitHub.com → SSH).

```bash
gh repo create jairmercelino/jmmechanica --private --source=. --remote=origin --description "JM Mechanica platform — Next.js scaffold (Fase 0)"
```

Verwacht: `✓ Created repository jairmercelino/jmmechanica on GitHub`
gevolgd door `✓ Added remote git@github.com:jairmercelino/jmmechanica.git`.

Skip Stap 2B als deze geslaagd is.

- [ ] **Stap 2B: Zonder `gh` — via browser**

1. Open https://github.com/new
2. Repository name: `jmmechanica`
3. Description: `JM Mechanica platform — Next.js scaffold (Fase 0)`
4. Visibility: **Private**
5. **GEEN README, .gitignore of license toevoegen** (we hebben al een lokale repo)
6. Klik "Create repository"
7. Op de volgende pagina kopieer je de SSH-URL (begint met `git@github.com:`)

Vervolgens lokaal:

```bash
git remote add origin git@github.com:jairmercelino/jmmechanica.git
git remote -v
```

Verwacht: 2 regels, `origin` met fetch en push naar
`git@github.com:jairmercelino/jmmechanica.git`.

- [ ] **Stap 3: Push naar GitHub**

```bash
git push -u origin main
```

Verwacht: enkele regels output eindigend met `branch 'main' set up
to track 'origin/main'`. Eerste push duurt 5-15 seconden.

Bij error `Permission denied (publickey)` → SSH-key niet gekoppeld
aan GitHub. Niet doorgaan, eerst `ssh -T git@github.com` om te
verifiëren wat er mis is.

- [ ] **Stap 4: Verifieer in GitHub UI**

Open: https://github.com/jairmercelino/jmmechanica

Verwacht: privé repo zichtbaar (slotje icoontje), beide commits in
de history, README rendert correct.

---

## Task 7: Vercel koppelen via UI

**Files:** geen — externe service-setup.

- [ ] **Stap 1: Open Vercel dashboard**

Open: https://vercel.com/dashboard

Verwacht: ingelogd, je projecten-overzicht zichtbaar (waarschijnlijk
leeg of met andere projecten).

- [ ] **Stap 2: Start nieuw project**

Klik **"Add New..."** → **"Project"** (rechtsboven).

Verwacht: pagina "Import Git Repository" met je GitHub-repos.

- [ ] **Stap 3: Importeer `jmmechanica`**

Zoek `jmmechanica` in de lijst. Klik **"Import"** ernaast.

Als 'ie er niet staat → "Adjust GitHub App Permissions" → geef Vercel
toegang tot `jmmechanica` (of "All repositories"). Daarna refresht
de lijst.

- [ ] **Stap 4: Configureer (alle defaults laten staan)**

Op de "Configure Project" pagina:
- **Framework Preset**: Next.js (auto-detected) ✓
- **Root Directory**: `./` (default) ✓
- **Build Command**: `next build` (default, leeg laten = auto) ✓
- **Output Directory**: `.next` (default, leeg laten) ✓
- **Install Command**: `npm install` (default, leeg laten) ✓
- **Environment Variables**: **leeg laten** — geen toevoegen

Klik **"Deploy"**.

Verwacht: build-log start. Duurt 1-3 minuten. Eindigt met "Congratulations!"-pagina + screenshot van je deployment.

- [ ] **Stap 5: Open de live URL**

Op de succes-pagina staat een knop **"Continue to Dashboard"** of
direct een preview-screenshot. Klik op de URL (vorm
`jmmechanica-xxxx.vercel.app`).

Verwacht: dezelfde Next.js welkomstpagina als lokaal op
`localhost:3000`. Geen errors, niet leeg.

- [ ] **Stap 6: Verifieer auto-deploy bij volgende push (optioneel)**

Voor zekerheid: maak een triviale wijziging, push, en kijk of
Vercel automatisch deployt.

```bash
cd ~/jmmechanica
echo "" >> README.md
git add README.md
git commit -m "Test auto-deploy: append empty line to README"
git push
```

Open Vercel dashboard → klik op je `jmmechanica`-project. Verwacht
binnen ~30 seconden een nieuwe deployment in "Deployments"-tab met
status "Building" → "Ready".

> **Skip-optie:** als je Stap 6 niet wilt doen omdat een loze commit
> in de history je dwarszit, sla 'm dan over. Het mechanisme werkt
> sowieso — Vercel + GitHub-koppeling is automatisch.

---

## Task 8: Eindverificatie acceptatiecriteria

**Files:** geen — alleen acceptance-test van het hele Fase 0-resultaat.

Loop alle 5 acceptatiecriteria uit de spec één voor één na.

- [ ] **Criterium 1: Node-versie via `.nvmrc`**

```bash
cd ~/jmmechanica && nvm use && node -v
```

Verwacht: `Found '.nvmrc' with version <22>` + `Now using node v22.x.x` + `v22.x.x`.

- [ ] **Criterium 2: Lokale dev-server**

```bash
npm run dev
```

Verwacht: start zonder errors, `localhost:3000` toont welkomstpagina.
`Ctrl+C` om te stoppen.

- [ ] **Criterium 3: Git-historie**

```bash
git log --oneline
```

Verwacht: minimaal 2 commits (Initial commit from Create Next App +
Initial scaffold...). Optioneel een 3e als Stap 6 van Task 7
gedaan is.

- [ ] **Criterium 4: GitHub repo**

```bash
git remote -v
gh repo view jairmercelino/jmmechanica --json visibility 2>/dev/null
```

Of in browser: https://github.com/jairmercelino/jmmechanica → privé,
commits zichtbaar.

- [ ] **Criterium 5: Vercel-deployment**

Open `jmmechanica-xxxx.vercel.app`. Verwacht: dezelfde welkomstpagina
als lokaal.

- [ ] **Stap 6: Markeer Fase 0 als afgerond**

Update `CLAUDE.md` in `~/jmmechanica/` (en eventueel ook in de oude
repo voor parallelle status):

```diff
- ## Huidige fase
- **Fase 0 — begint.** Stack-keuze is vastgelegd (zie boven).
- Next.js-scaffold bestaat nog niet (geen package.json, geen repo-init).
- Eerste concrete stap: Next.js Foundations-tutorial doorwerken en vanaf
- daar een schone repo-structuur opzetten.
+ ## Huidige fase
+ **Fase 0 — afgerond op 2026-04-24.**
+ Scaffold + GitHub + Vercel staan. Volgende stap: Foundations-tutorial
+ doorwerken (parallel) en Fase 1 plannen (statische kloon van huidige
+ site in Next.js + Tailwind).
```

Commit:

```bash
cd ~/jmmechanica
git add CLAUDE.md
git commit -m "Mark Fase 0 as complete; set scope for Fase 1"
git push
```

Verwacht: nieuwe commit zichtbaar op GitHub, Vercel deployt
automatisch (cosmetisch — pagina verandert niet).

---

## Klaar

Na alle 8 taken: Fase 0 is af. `~/jmmechanica/` staat, GitHub-repo
bestaat (privé), Vercel deployt automatisch op elke push, en de
welkomstpagina is live op een `.vercel.app`-URL.

Volgende fase (apart spec + plan): **Fase 1 — statische kloon van
huidige site in Next.js + Tailwind.**
