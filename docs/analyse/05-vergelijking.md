# Fase 5 — Vergelijking met vergelijkbare systemen

*Doel: welke concrete patronen gebruiken andere tools die JM Mechanica niet heeft? Geen marketing-hype, alleen patronen die in Fase 6 bruikbaar zijn.*

## 0. Waarom deze vergelijking

Het is vrijwel zeker dat een eenmanszaak-monteur geen Apollo, Cognism of Smartlead gaat afnemen (prijzen beginnen typisch bij €49-€149 per maand, oplopend). Maar **de patronen die deze tools gebruiken** zijn leerzaam — die kun je in miniatuur-vorm zelf implementeren, zonder licentie, met open data en een paar honderd regels code.

Per tool: wat doet ze, welk patroon zit eronder, welk deel ervan is reproduceerbaar in het JM-systeem?

## 1. B2B data-providers (contact-intelligence)

### 1.1 Apollo.io
**Wat**: 450M+ contacten wereldwijd met email + mobiele nummers, sequencer (emailcampagnes), Chrome-extensie bovenop LinkedIn. Dual-credit model (mobiel + email apart). [Cognism blog](https://www.cognism.com/blog/apollo-competitors)

**Patroon 1 — Contact-enrichment via domein**: input = bedrijfsdomein, output = lijst mensen binnen het bedrijf met functietitel en e-mail. De email-constructie werkt via veelvoorkomende patronen (`voornaam@`, `voornaam.achternaam@`, `v.achternaam@`) + cross-check met publieke patronen.

**Reproduceerbaar voor JM**: voor Nederlandse BV's kun je `info@<domein>`, `sales@`, `planning@`, en `techniek@` proberen — nettieker dan Apollo's brute force, maar genereerbaar zonder dataset.

**Patroon 2 — Intent data**: signalen dat een bedrijf nu "in markt" is: recent funding, vacatureplaatsing, technologie-verschuiving. Apollo koopt dit van Bombora e.a.

**Reproduceerbaar**: vacature-feeds van Indeed RSS, LinkedIn Jobs (publiek), of nalopen van `/vacatures` op bedrijfswebsites. Niet precies hetzelfde, wel zelfde intent-signaal.

### 1.2 Lusha
**Wat**: Chrome-extensie die bij LinkedIn-profielen e-mail + telefoon onthult. Kleine teams, snelle workflows, credit-based. [Cognism Lusha alternatives](https://www.cognism.com/blog/lusha-alternative)

**Patroon**: opzoeken per persoon (niet bedrijf). Relevant voor LinkedIn-gebaseerde sales. Voor JM Mechanica minder relevant als je niet op LinkedIn zoekt.

**Reproduceerbaar**: gedeeltelijk — via Hunter.io `/email-finder` endpoint (gratis 25/maand, betaald vanaf $49/mnd). Dat is een single-function API die voor een eenmanszaak betaalbaar kan zijn.

### 1.3 Cognism
**Wat**: 200M+ Europese contacten, GDPR-compliant, DNC-filtering automatisch, "diamond-verified" mobile numbers. Europese focus is hun USP vs Apollo/ZoomInfo. [Cognism EMEA blog](https://www.cognism.com/blog/emea-b2b-data)

**Patroon 1 — Compliance als product-feature**: Cognism filtert automatisch telefoonnummers tegen Bel-me-niet-registers in 25+ landen. Dat **is de compliance-flow** (zie Fase 4 §2 + §5) als product.

**Reproduceerbaar**: voor NL specifiek kun je de KvK Non-Mailing Indicator checken via de KvK API. Dat is een hele specifieke, simpele API-call. Niet 25 landen, wel 1 die je nodig hebt.

**Patroon 2 — Branche/SBI-filtering aan de voorkant**: "bedrijven met SBI 10-32 (industrie/productie), > 10 FTE, in provincie Noord-Holland". Zonder dataset kun je dit niet; met KvK open data gedeeltelijk.

### 1.4 Dealfront (voorheen Leadfeeder + Echobot)
**Wat**: identificeert welke bedrijven je eigen website bezoeken (via IP → bedrijfsdomein matching) + intent-data. GDPR-compliant, EU-focus. [Dealfront Apollo alt](https://www.dealfront.com/blog/apollo-competitor-comparison/)

**Patroon — Visitor-to-lead**: iemand van Acme Industries BV bezoekt jmmechanica.nl, je krijgt een alert "Acme Industries BV, Zaandam, 50 FTE, kwam op /diensten pagina". Geen contactgegevens van individuele bezoeker, maar wel het bedrijf.

**Reproduceerbaar voor JM**: gedeeltelijk. Serverlogs + een reverse-IP-database (bijv. IP2Location, gratis tier 10k/mnd) + een matching-script. Zou nuttige warme signalen opleveren: "Wie kijkt naar onze diensten?". Praktische kanttekening: GDPR — IP-adressen zijn persoonsgegevens, de grondslag moet in orde zijn.

## 2. Nederlandse tools

### 2.1 KvK Open Data + API's
**Wat**:
- **KvK Open Dataset** (gratis, dagelijks, geanonimiseerd): SBI-codes, locatie, oprichtingsdatum, opheffingsdatum. Geen bedrijfsnamen of KvK-nummers. Alleen geschikt voor statistieken. [KvK Open Dataset](https://developers.kvk.nl/nl/documentation/open-dataset-basis-bedrijfsgegevens-api)
- **Zoeken API**: haal KvK-nummer op (gratis dev-key, 100 calls/5min).
- **Basisprofiel API**: haalt bedrijfsnaam, rechtsvorm, SBI, adressen via KvK-nr (tarief: €0-lage tarieven afhankelijk van abonnement, dev-key is gratis).
- **Vestigingsprofiel API**: alle vestigingen van een onderneming.
- **Naamgeving API**: alle handelsnamen/statutaire namen.

**Patroon**: bedrijfsverrijking met juridische/feitelijke basis. Geen contactpersoon-gegevens (geen mail, geen telefoon).

**Reproduceerbaar voor JM**: **direct toepasbaar**. Gratis of zeer lage kosten. Met Zoeken + Basisprofiel kun je van een domein (of bedrijfsnaam) naar KvK-nummer → SBI → rechtsvorm → adres gaan. Dit adresseert:
- Fase 2 Z2 (geen SBI-filtering)
- Fase 4 P5 (rechtsvorm-check tegen Tw 11.7)

### 2.2 OpenKvK.nl
**Wat**: derde-partij dienst die de KvK Open Data + scraping van publieke bronnen combineert. 5M+ records, web-UI, beperkte publieke API. [OpenKvK](https://openkvk.nl/)

**Patroon**: "goedkoper alternatief voor de KvK paid API's". Bruikbaar voor bulk-verrijking.

**Reproduceerbaar**: niet nodig — gewoon gebruiken als data-bron als de formele KvK-API te duur is.

### 2.3 Graydon / Company.info / Dataprovider
**Wat**:
- **Graydon**: financial health scoring, kredietrapporten. Betaalbaar vanaf ~€500/jr in basisvorm. Voor freelancer zwaar.
- **Company.info**: bedrijfsgegevens + rapporten, ~€40-100/mnd.
- **Dataprovider**: web-tech detection (welke technologie gebruikt een website, type webshop, etc.), betaald.

**Patroon — Pre-kwalificatie op financiële/technische gezondheid**: weet voor je benadert of het bedrijf betaald en groot genoeg is.

**Reproduceerbaar**: kost geld. Alternatief: simpele heuristieken op de bedrijfswebsite — heeft het bedrijf een vacature-pagina, een carrièreside, productie-foto's, etc. Geen wetenschappelijke scoring maar wel richting.

### 2.4 Moneybird + losse acquisitietools (typische ZZP-stack)
**Wat**: boekhoud-tool met CRM-light (klantenlijst, offerte, factuur), API voor eigen integraties. ZZP'ers combineren typisch met:
- **MailerLite / Brevo**: e-mail newsletters (met opt-in, afmeldlink, GDPR-compliant).
- **Calendly / SavvyCal**: afspraak-inplanning met kalender-integratie.
- **Typeform**: nette formulieren met conditional logic.
- **Notion/Google Sheets**: lead-lijst bijhouden.

**Patroon**: **geen monolithische CRM, wel goede koppelingen tussen tools**. De kern van deze stack: Moneybird als single source of truth voor klanten, de rest stuurt data er naartoe.

**Reproduceerbaar voor JM**: waarde zit in de Moneybird-koppeling. Zodra een lead klant wordt, automatisch in Moneybird aanmaken. Moneybird heeft een [REST API](https://developer.moneybird.com/). Geen nieuw CRM bouwen, wel de bestaande flow completeren.

## 3. Outreach automation tools

### 3.1 Instantly
**Wat**: gespecialiseerd in hoge-volume cold e-mail met deliverability-focus. 4.2M+ warmup-accounts in netwerk. Dual-feature: data (450M+ contacten) + sending. Prijs vanaf $37/mnd. [Instantly blog](https://instantly.ai/blog/instantly-vs-smartlead-lemlist-2026/)

**Patroon 1 — Mailbox warmup**: vóór je commerciële e-mail gaat versturen, stuurt het systeem gesimuleerde "gewone" mails tussen accounts om je afzender-reputatie op te bouwen. Nieuw domein stuurt op dag 1 maar 5 mails, opbouwend naar 40 dag 30, etc.

**Reproduceerbaar voor JM**: gedeeltelijk. `info@jmmechanica.nl` ontvangt al echte zakelijke mails (Certos, etc.), dus heeft een natuurlijke warmup. Als je volume op 5-10/dag houdt en via je gewone Hostnet-inbox verstuurt, blijf je veilig onder spam-detectie. Voor grotere volumes (20+/dag) wordt warmup relevant.

**Patroon 2 — Sequence met gerandomiseerde timing**: eerste mail → wacht 4-6 dagen random → follow-up 1 → wacht 5-7 dagen → follow-up 2. Geen vaste 5-dagen zoals nu in JM, om patroon-detectie door spamfilters te vermijden.

**Reproduceerbaar**: triviaal — randomize de follow-up drempel tussen 4-7 dagen.

**Patroon 3 — Inbox rotation**: meerdere afzender-inboxen worden afgewisseld om geen enkele individueel op limieten te laten lopen.

**Reproduceerbaar voor eenmanszaak**: niet nuttig — je hebt één afzender.

**Patroon 4 — Inbox Placement Test**: vóór je campagne verstuurt stuurt de tool een test-mail naar een paar test-inboxen (Gmail, Outlook, Yahoo) om te zien of hij in inbox of spam belandt.

**Reproduceerbaar**: gratis via [Mail-Tester](https://www.mail-tester.com/). Handig om een keer per 3 maanden je setup te valideren.

### 3.2 Smartlead
**Wat**: API-first cold email platform, technischer dan Instantly. Automatische SPF/DKIM/DMARC-config. Prijs ~$39/mnd + extra per account. [Sera blog](https://blog.seraleads.com/kb/sales-tool-reviews/smartlead-vs-instantly-2026/)

**Patroon — DNS-validatie vóór sending**: de tool checkt of SPF, DKIM, DMARC correct zijn ingesteld voor je domein. Als niet, waarschuwt hij voor verzending.

**Reproduceerbaar**: de checks zelf zijn publiek. [MXtoolbox](https://mxtoolbox.com/) doet gratis SPF/DKIM/DMARC validatie van `jmmechanica.nl`. Eenmalig instellen, niet steeds checken.

### 3.3 Lemlist
**Wat**: multichannel (e-mail + LinkedIn + calls) outreach, visuele personalisatie (bv. gepersonaliseerde afbeeldingen in mails). Prijs $69/user/mnd.

**Patroon — Variables met fallbacks**: `{{firstName | fallback: "Goedendag"}}`. Als je data mist, krijg je een nette fallback in plaats van `{{firstName}}` letterlijk.

**Reproduceerbaar**: gedeeltelijk — de huidige `genereerEmail` heeft al een simpele fallback (`contactNaam ? "Beste X" : "Goedendag"`). Kan worden uitgebreid naar bedrijf, functie, branche.

**Patroon — Liquid-template personalisatie**: gebruik van branche-specifieke zinnen. `{% if branche == "voedselproductie" %}… {% endif %}`.

**Reproduceerbaar**: kleine JS-templating zonder library.

### 3.4 Waalaxy / HeyReach / Dux-Soup (LinkedIn-automation)
**Wat**: automatisering van LinkedIn-connectieverzoeken en berichten. Waalaxy Chrome-extensie, HeyReach cloud-based.

**Patroon**: bulk-connectieverzoeken met gepersonaliseerd bericht + drip-sequence op LinkedIn.

**Reproduceerbaar voor JM**: **niet aanbevolen**. Schendt LinkedIn ToS (zie Fase 4 §4) en risico op account-ban is reëel. Manueel LinkedIn gebruiken = wel ok.

## 4. Features die JM Mechanica **wel** heeft (en sommige tools niet)

Om eerlijk te zijn — het huidige systeem doet ook dingen die grote tools niet automatisch doen:

| Feature JM | Status in commerciële tools |
|---|---|
| Rooster/beschikbaarheid in e-mail template (`getBeschikbaarheidTekst`) | Zelden — meestal is dit een Calendly-link, niet vrije tekst |
| Tight integratie met eigen uren-registratie | N.v.t. — verschillende doel |
| Lokale opslag zonder vendor lock-in | Bewust niet — deze tools verkopen SaaS |
| Eén-persoon-flow zonder team-admin | Meeste tools vragen per seat |
| Eigen chatbot met scoring | Moderne inbound-tools (Drift, Intercom) doen dit wel, maar enterprise-prijzen |

Waarde: het JM-systeem is **kleinschaligheids-natief** gebouwd. Dat is een feature, niet een bug. Bij opschalen zou je richting tools als Instantly kunnen gaan, maar voor een eenmanszaak is het systeem-in-miniatuur juist wat past.

## 5. Patronen die JM mist — geordend op bruikbaarheid

Hier zit de kern van de vergelijking: wat is concreet te implementeren zonder veel kosten?

| # | Patroon | Bron | Haalbaarheid voor ZZP | Impact op acquisitie |
|---|---|---|---|---|
| M1 | **KvK-verrijking** (SBI, rechtsvorm, adres) | KvK Zoeken + Basisprofiel API (gratis dev) | Makkelijk (~2 dagen) | Hoog — compliance + relevantie |
| M2 | **Domein → info@/sales@ heuristiek** | Apollo-patroon | Triviaal (~1 uur) | Middel — ~60-70% hit rate op Nederlandse BV's |
| M3 | **Unsubscribe-link + blacklist** | Tw 11.7 verplicht | Makkelijk (~0.5 dag) | Hoog — compliance, verlaagt klacht-risico |
| M4 | **Sequence met random timing** | Instantly/Smartlead | Triviaal | Middel — kleinere spam-detectie |
| M5 | **Vacature-signaal** als lead-trigger | Apollo intent | Medium (~2 dagen) | Hoog — warmste leads |
| M6 | **Persoonlijke hooks uit snippet** | Lemlist personalisatie | Medium met LLM (~1 dag) | Hoog — open rate 2-3x |
| M7 | **Reply-detectie via IMAP** | Instantly auto-reply handling | Medium (~2-3 dagen) | Middel — bespaart opvolging |
| M8 | **Visitor-to-lead via webserver-logs** | Dealfront | Moeilijk privacy-voorwaarden + server | Laag-Middel |
| M9 | **Moneybird-sync** bij klant-status | ZZP-stack-patroon | Medium (~1 dag) | Middel — admin-besparing |
| M10 | **Mail-Tester DNS-check** eenmalig | Deliverability | Triviaal (~0.5 uur) | Onmeetbaar, geen toekomstige pijn |
| M11 | **Conversie-learning** (klant → query-gewicht) | Standaard ML-patroon | Makkelijk | Middel — betere queries over tijd |
| M12 | **Calendly-achtige link in mail** bij afspraak-status | Tool-stack-patroon | Makkelijk (external: Calendly gratis) | Laag-Middel |

**Prioritering voor Fase 6** komt neer op: M3 eerst (compliance), dan M1 + M6 (relevantie), dan M5 + M11 (leer-lus).

## 6. Wat je niet gaat namaken

Expliciet: de volgende features die tools hebben, zijn voor een eenmanszaak onzinnig om zelf te bouwen.

- **450M+ contactendatabase** — koop liever 1 jaar Hunter.io credits + gebruik KvK.
- **Multi-IP sending infrastructure** — je stuurt ~10 mails/dag vanuit één inbox.
- **Eigen warmup-netwerk** — niet nodig op deze schaal.
- **Team/role-based permissions** — 1 persoon.
- **Funnel-analytics dashboards** — overkill.
- **A/B test-framework** — bij 2-4 mails/week is de statistiek zinloos.

De kunst is: patronen overnemen, features weglaten.

## 7. Voorbeeld-stack voor een NL-ZZP-monteur (anno 2026)

Om de vergelijking concreet te maken, hier hoe een realistische minimaal-outreach-stack eruit zou kunnen zien buiten JM:

| Onderdeel | Tool | Kosten/mnd |
|---|---|---|
| Leads-data (kwalificatie) | KvK Zoeken + Basisprofiel API | €0-25 |
| E-mailverificatie | Hunter.io of NeverBounce | €0-30 |
| Verzending | eigen Hostnet-mail (15-30/dag) | incl. in hosting |
| Sequencing/follow-up | Gmail + Google Sheets + Apps Script (zelfbouw) | €0 |
| Site-formulieren | Formspree | €0-12 |
| Afspraken | Calendly gratis | €0 |
| Boekhouden | Moneybird | €15-25 |

Totaal voor de volledige stack buiten JM: **€30-90/maand**. Het JM-systeem is functioneel een super-set van "Leads-data + sequencing/follow-up + site-formulieren" — zonder licentie. De waarde zit in de eigen logica, niet in de volume-infrastructuur.

## 8. Samenvatting

- De "onmiskenbaar dure" features zijn het volume + de database. Die hoef je niet.
- De **patronen** zijn kopieerbaar in een paar honderd regels code, vooral als je je beperkt tot NL + 1 persoon.
- De grootste gaten in het huidige JM-systeem corresponderen bijna 1-op-1 met "patronen die commerciële tools verkopen":
  - Contactverrijking (Apollo/Lusha) → Hunter + KvK
  - SBI-filtering (Cognism) → KvK API
  - Compliance-tooling (Cognism DNC-filter) → NMI-check + opt-out
  - Warmup/deliverability (Instantly/Smartlead) → Mail-Tester + volume-discipline
  - Personalisatie (Lemlist) → LLM per lead of branche-sjablonen
  - Intent (Dealfront) → vacature-feed + website-crawl
- Wat overblijft als echte moat van commerciële tools voor een eenmanszaak: de database. Die is te overbruggen met KvK + Hunter.

## 9. Verwijzingen

- [Instantly vs Smartlead vs Lemlist (2026)](https://instantly.ai/blog/instantly-vs-smartlead-lemlist-2026/)
- [Cognism — Apollo competitors](https://www.cognism.com/blog/apollo-competitors)
- [Cognism — EMEA B2B Data](https://www.cognism.com/blog/emea-b2b-data)
- [Dealfront — Apollo alternatives](https://www.dealfront.com/blog/apollo-competitor-comparison/)
- [KvK Developer Portal](https://developers.kvk.nl/documentation)
- [KvK Basisprofiel API](https://developers.kvk.nl/documentation/basisprofiel-api)
- [OpenKvK — 5M+ bedrijven gratis](https://openkvk.nl/)
- [Hunter.io](https://hunter.io/) (email finder)
- [Mail-Tester](https://www.mail-tester.com/) (deliverability check)
- [Moneybird Developer](https://developer.moneybird.com/) (REST API)
