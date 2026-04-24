# Fase 0 — Next.js scaffold opzet (Design)

**Datum**: 2026-04-24
**Status**: Goedgekeurd door eigenaar, klaar voor implementation plan
**Volgende stap**: `superpowers:writing-plans` om hier een uitvoerbaar stappenplan van te maken

---

## 1. Doel

Eén concreet eindresultaat: een lege, werkende Next.js-repo waar vanaf
nu in gebouwd kan worden, en die bij elke commit automatisch deployt
naar een preview-URL via Vercel.

Dit is de eerste van vijf migratiefases (zie `CLAUDE.md` van het
huidige `JM-Mechanica`-repo). Fase 0 raakt de live site (GitHub Pages
op `jmmechanica.nl`) niet.

## 2. Scope

### In scope
- Next.js scaffold genereren met de afgesproken keuzes
- Lokale repo + privé GitHub-repo aangemaakt en gekoppeld
- Vercel-project gekoppeld aan GitHub-repo, eerste deploy live op
  `.vercel.app`-URL
- Schone basis-projectstructuur klaar voor Fase 1
- `.gitignore` (default + aanvullingen), `.nvmrc`, `.env.example`,
  vervangen `README.md`, gekopieerde `CLAUDE.md`
- Eerste commit + eerste succesvolle deploy

### Out of scope (komt in latere fases)
- Eigenlijke pagina's bouwen (home, diensten, over-mij, contact,
  privacy) → Fase 1
- Tailwind tokens / design-systeem opzetten → Fase 1
- Supabase / Resend / Spline integraties → Fase 2-5
- Custom domein koppelen (`jmmechanica.nl`) → Fase 4 (DNS-omzetting)

## 3. Acceptatiecriteria

Fase 0 is af zodra **alle** punten waar zijn:

1. `node -v` in `~/jmmechanica/` toont `v22.x.x` (via `.nvmrc`)
2. `npm run dev` start zonder fouten en `localhost:3000` toont de
   default Next.js welkomstpagina
3. `git log --oneline` toont minimaal de "scaffold + customizations"-commit
4. GitHub repo `jairmercelino/jmmechanica` bestaat (privé) en `git push`
   is geslaagd
5. Vercel-project is gekoppeld aan deze repo en de
   `<deploy-hash>.vercel.app`-URL toont dezelfde welkomstpagina als
   lokaal

## 4. Beslissingen

| Onderdeel | Keuze | Waarom |
|---|---|---|
| Repo-strategie | Nieuwe aparte repo (niet subfolder of branch) | Live GitHub Pages-site blijft veilig; Vercel-deploy en GitHub Pages-deploy mengen niet |
| Locatie op disk | `~/jmmechanica/` | Matcht repo-naam, in home naast huidige `~/JM-Mechanica/` |
| GitHub repo-naam | `jairmercelino/jmmechanica` | Lowercase conventie, matcht domein, geen toekomstige rename nodig |
| Privé / public | **Privé** in begin | Bouwgeschiedenis hoeft niet publiek; later optioneel public |
| Node-versie | 22 LTS via `.nvmrc` | LTS = supported tot apr 2027, Vercel-default, voorkomt versie-drift |
| Package manager | npm | Beginner-vriendelijk: alle tutorials/docs gebruiken het |
| Next.js versie | latest (15.x) | Modernste stabiele |
| TypeScript | ja | Vastgelegd in CLAUDE.md |
| ESLint | ja | Vangt kleine fouten + houdt code consistent |
| Tailwind CSS | ja | Vastgelegd in CLAUDE.md |
| `src/` directory | ja | Code en config gescheiden, schaalbaarder |
| App Router | ja | Vastgelegd in CLAUDE.md |
| Turbopack voor `next dev` | ja | Stabiel sinds Next.js 15, snellere dev-feedback |
| Import alias | default `@/*` (wijst naar `src/`) | Wat alle tutorials gebruiken |
| Vercel-koppeling | Via vercel.com UI (niet CLI) | Visueel inzicht in framework-detectie en build-instellingen |
| Vercel build/deploy | Alle defaults | Geen reden om af te wijken bij lege scaffold |
| Production branch | `main` | Standaard |

## 5. Project-structuur na scaffold

```
~/jmmechanica/
├── .git/
├── .gitignore                # Next.js default + .env.local + .vercel/
├── .nvmrc                    # "22"
├── .env.example              # leeg sjabloon
├── CLAUDE.md                 # gekopieerd uit ~/JM-Mechanica/CLAUDE.md
├── README.md                 # vervangen JM-versie
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── next-env.d.ts
├── public/                   # statische assets
│   ├── next.svg
│   └── vercel.svg
└── src/
    └── app/
        ├── favicon.ico
        ├── globals.css       # Tailwind directives + global styles
        ├── layout.tsx        # root layout
        └── page.tsx          # default welkomstpagina
```

**Geen lege folders vooraf aanmaken.** Conventie wordt vastgelegd in
de README; folders ontstaan op het moment dat de eerste file erin
nodig is. Documenteer in README:

- `src/components/` — herbruikbare UI components (komt in Fase 1)
- `src/lib/` — utilities, server actions, helpers (komt in Fase 2)
- `src/app/(dashboard)/` — beveiligde routes via route group (komt in
  Fase 3)

## 6. Vercel-koppeling

**Aanpak**: via vercel.com UI (eigenaar heeft account aangemaakt en
GitHub al gekoppeld op 2026-04-24).

**Stappen op hoog niveau**:
1. vercel.com → "Add New Project" → import `jairmercelino/jmmechanica`
2. Vercel detecteert "Next.js" automatisch
3. Alle defaults laten staan (geen environment variables, geen custom
   build commands)
4. "Deploy" → wacht ~1-2 minuten
5. Verifieer `<random>.vercel.app`-URL toont welkomstpagina

**Geen custom domein in Fase 0.** `jmmechanica.nl` blijft op GitHub
Pages tot Fase 4.

## 7. Volgorde van uitvoering

Vijf sub-fases binnen Fase 0:

1. **Node klaarzetten** — `nvm install 22 && nvm use 22`
2. **Scaffold draaien** — `npx create-next-app@latest jmmechanica`
   interactief vanuit `~/`, antwoorden conform Sectie 4
3. **Customizations** — `.nvmrc`, `.env.example`, `README.md`
   vervangen, `CLAUDE.md` kopiëren uit `~/JM-Mechanica/`
4. **Lokaal valideren** — `npm run dev`, controleer `localhost:3000`
5. **GitHub + Vercel** — privé repo aanmaken, eerste push, Vercel-koppeling

Eerste commit-message:
`Initial scaffold: Next.js 15 + TS + Tailwind + App Router (Fase 0)`

## 8. Verificatie per stap

| Stap | Verificatie |
|---|---|
| Node klaargezet | `node -v` toont `v22.x.x` |
| Scaffold gedraaid | Map `~/jmmechanica/` bestaat met boom uit Sectie 5 |
| Customizations | `git status` toont alleen verwachte 4 wijzigingen |
| Lokaal valideren | Welkomstpagina laadt zonder console-errors |
| GitHub + Vercel | `<hash>.vercel.app` toont welkomstpagina |

## 9. Risico's en mitigatie

| Risico | Mitigatie |
|---|---|
| Scaffold mislukt halverwege | Map weggooien (`rm -rf ~/jmmechanica`), opnieuw. Geen schade buiten die map. **Eigenaar moet expliciet bevestigen voor verwijdering.** |
| `npm install` traag of mislukt | Meestal netwerk; opnieuw proberen. Geen workaround nodig. |
| GitHub repo-naam bestaat al | Inspecteren wat er staat. Niet zomaar overschrijven. Eigenaar beslist. |
| Node 22 install via nvm faalt | Bestaande Node 24 werkt ook met Next.js 15, kunnen we tijdelijk gebruiken. `.nvmrc` blijft `22` als doel. |
| Vercel-deploy slaagt lokaal niet | Build errors bekijken, niet wegklikken. Root cause vinden. |

## 10. Externe afhankelijkheden / vereisten

| Vereiste | Status (per 2026-04-24) |
|---|---|
| Node + npm geïnstalleerd | ✅ Node 24, npm 11 (downgraden naar 22 LTS in stap 1) |
| pnpm geïnstalleerd | ✅ Aanwezig (gebruiken we niet) |
| Git + GitHub-account | ✅ Aanwezig, SSH werkt (`git@github.com:jairmercelino/...`) |
| Vercel-account | ✅ Aangemaakt en aan GitHub gekoppeld |
| `gh` CLI | ❓ Onbekend, controleren in implementation-plan |

## 11. Wat NIET in deze fase

Expliciet uitgesloten om scope-creep te voorkomen:

- Geen design-tokens, geen Tailwind custom config — defaults blijven
- Geen Supabase aansluiten, geen Resend toevoegen
- Geen pagina-content kopiëren uit huidige `index.html`
- Geen domein-koppeling
- Geen CI/CD-tweaks (Vercel doet build automatisch)
- Geen tests opzetten — komt zodra er code is om te testen
- Geen Foundations-tutorial in dit traject — dat is parallelle eigen
  studie van de eigenaar
