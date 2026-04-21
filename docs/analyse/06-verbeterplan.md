# Fase 6 — Verbeterplan

*Syntese van Fase 1-5 in concrete actieitems, gesorteerd op impact × haalbaarheid voor één persoon met beperkte tijd.*

## 0. Leesleidraad

Elk item volgt dezelfde structuur:

- **Wat**: wat moet er gebeuren
- **Waarom**: met verwijzing naar bevinding uit eerdere fases (bijv. Z2 = Fase 2, zwakte 2; G9 = Fase 4, gat 9; M3 = Fase 5, mist-patroon 3)
- **Hoe**: concrete technische aanpak
- **Werk**: inschatting in uren of dagen (8u/dag)
- **Impact**: verwachte invloed op acquisitie-resultaat / compliance
- **Risico**: wat kan er misgaan
- **Afhankelijk van**: andere items, externe services
- **Meting**: hoe je weet of het werkt

Cumulatieve werkschatting staat onderaan.

## Sectie A — Quick wins (< 1 dag werk, direct effect)

### A1. `jm_scan_resultaat.json` uit publiek repo halen
- **Wat**: stop met committen van de scanner-output naar de publieke branch.
- **Waarom**: G15 / P3 — commercieel gevoelige bedragen + afzendernamen staan publiek op GitHub.
- **Hoe**:
  1. `.gitignore` toevoegen: `jm_scan_resultaat.json`, `Facturen/`.
  2. `git rm --cached jm_scan_resultaat.json` + commit.
  3. GitHub history purge met `git filter-repo` of BFG (optioneel, arbeidsintensief; minimaal voor "nu niet meer").
  4. GitHub Action aanpassen: schrijf output naar een private Cloudflare R2-bucket of naar dashboard via Worker + KV (kleine JSON, past in KV).
  5. Dashboard `laadKostenAutomatisch()` aanpassen naar nieuwe bron.
- **Werk**: 2-4u (de Worker/R2-route is iets meer).
- **Impact**: compliance + privacy, direct risico weg.
- **Risico**: dashboard breekt tijdelijk als laadpad kapot is. Test lokaal eerst.
- **Afhankelijk van**: Cloudflare R2 of KV bij keuze voor server-side opslag.
- **Meting**: `jm_scan_resultaat.json` niet meer in laatste commit, dashboard toont kostenmetrics nog steeds.

### A2. Google API key in `worker/DEPLOY.md` roteren
- **Wat**: nieuwe Google API key genereren, oude deactiveren, DEPLOY.md herschrijven naar actuele Serper-flow.
- **Waarom**: G21 / P4 — key staat in git history.
- **Hoe**:
  1. Google Cloud Console → Credentials → verwijder oude key `AIzaSyAM48uGnbdjMn4unW6R4EVC8ueDcEDHLCM`.
  2. Maak nieuwe key aan (als nog nodig).
  3. Herschrijf `worker/DEPLOY.md` zodat die de huidige Serper.dev-flow beschrijft (Google CSE wordt niet meer gebruikt).
  4. Verwijder API-key-literal uit docs.
- **Werk**: 1u.
- **Impact**: voorkomt misbruik als iemand git history leest.
- **Risico**: als de key ergens anders nog actief wordt gebruikt (oude pipelines), breekt die. Check eerst waar hij gebruikt wordt.
- **Afhankelijk van**: toegang Google Cloud Console.
- **Meting**: `gh` search / git log greppable → geen API-key-literals meer.

### A3. Opt-out in elke lead-mail
- **Wat**: twee regels toevoegen aan `genereerEmail()` in dashboard.html.
- **Waarom**: G1 / P1 — Tw 11.7 vereist opt-out in elke ongevraagde commerciële mail.
- **Hoe**: append aan body:
  ```
  ---
  Geen interesse? Antwoord kort met "stop" en ik staak het contact.
  [Privacyverklaring](https://jmmechanica.nl/privacy)
  ```
- **Werk**: 30 minuten.
- **Impact**: Tw-compliant. Ook: ontvangers die antwoorden met "stop" worden afmeldingen, dat geeft feedback.
- **Risico**: mensen klikken niet, maar beschermt juridisch.
- **Afhankelijk van**: A4 (privacyverklaring moet bestaan voor link werkt).
- **Meting**: genereerEmail-output bevat "stop"-regel.

### A4. Privacyverklaring op website
- **Wat**: simpele `privacy.html` pagina + linken in footer.
- **Waarom**: G9 / P2 — AVG art 13/14 transparantieplicht. Ook gebruikt door A3.
- **Hoe**:
  1. Template: 1 pagina met secties over welke gegevens verzameld, grondslag, bewaartermijnen, verwerkers (Formspree, Cloudflare, Google Drive, Hostnet), rechten betrokkenen, contact.
  2. Link in footer van `index.html`, `diensten.html`, `over-mij.html`.
  3. Verwijzing vanuit contactformulier + chatbot eerste-opening-bericht.
- **Werk**: 2-3u als je copy-paste van een AVG-template vertrekt, minstens 1u voor review op eigen situatie.
- **Impact**: AVG-compliant (transparantie). Ook psychologisch: mensen vertrouwen een site met privacyverklaring meer.
- **Risico**: als je verkeerde informatie opneemt is dat erger dan niets. Laat review door iemand die basis-AVG kent of gebruik een gevalideerde generator.
- **Afhankelijk van**: -
- **Meting**: `jmmechanica.nl/privacy` laadt, bevat alle verwerkers.

### A5. Contactformulier: akkoord-checkbox
- **Wat**: verplichte checkbox *"Ik ga akkoord met verwerking zoals beschreven in de [privacyverklaring]"*.
- **Waarom**: G13 — AVG grondslag-duidelijkheid.
- **Hoe**: één input in `index.html:495-525`, met `required`-attribuut. Bij chatbot-opening: eerste bericht benoemt dat gesprek wordt opgeslagen.
- **Werk**: 30 minuten.
- **Impact**: AVG-grondslag (toestemming) vastgelegd.
- **Risico**: conversie kan licht dalen (~5-10% bij cookiebanner-achtig gedrag); aanvaardbaar.
- **Afhankelijk van**: A4.
- **Meting**: formulier kan niet verstuurd zonder akkoord.

### A6. Randomiseer follow-up drempel
- **Wat**: `checkFollowUps()` in dashboard.html:2308: verander `>= 5` naar `>= 5 + randomize(0-3)` per lead.
- **Waarom**: M4 — vermindert patroon-detectie.
- **Hoe**: bij zetten van status `benaderd`, log ook een `followupDrempel` (5-8 dagen random) per lead.
- **Werk**: 30 minuten.
- **Impact**: marginaal op open rate, hygiene-point.
- **Risico**: geen.
- **Afhankelijk van**: -
- **Meting**: verschillende leads hebben verschillende followupDrempel-waardes.

### A7. Mail-Tester eenmalige SPF/DKIM/DMARC check
- **Wat**: `jmmechanica.nl` mail-setup valideren.
- **Waarom**: M10 / Smartlead-patroon.
- **Hoe**: stuur een test-mail van `info@jmmechanica.nl` naar een nieuw Mail-Tester-adres (gratis), lees rapport, pas DNS-records aan als nodig.
- **Werk**: 30 min - 2u afhankelijk van fix-werk.
- **Impact**: deliverability-hygiene, vermindert spam-classificatie.
- **Risico**: DNS-aanpassingen kunnen bestaande mail breken — Hostnet-support bellen als onzeker.
- **Afhankelijk van**: Hostnet DNS-toegang.
- **Meting**: Mail-Tester score > 9/10.

### A8. Chatbot-leads → dashboard
- **Wat**: maak dat chatbot-conversaties ook in de dashboard-leads-lijst komen.
- **Waarom**: Fase 1 S3, Fase 3 §1 — chatbot-context bereikt Jair nu niet.
- **Hoe**: in `chatbot.js:159-174` **niet** naar `localStorage.jm_leads` (bezoeker), maar POST naar Worker-endpoint `/inbound-lead`. Worker slaat in KV op. Dashboard laadt inkomende leads uit KV naast de bestaande uitgaande.
- **Werk**: 4-6u (nieuwe Worker-endpoint + dashboard-inbound-kolom + styling om ze te onderscheiden).
- **Impact**: geen warme leads meer verliezen.
- **Risico**: conflictbij conflict met Formspree (2x genoteerd). Koppel via ID of datum dedup.
- **Afhankelijk van**: Worker + KV (allebei aanwezig).
- **Meting**: chatbot-gesprek test → verschijnt in dashboard.

### A9. Formspree verwerkersovereenkomst
- **Wat**: check of Formspree DPA (Data Processing Agreement) beschikbaar is, teken deze.
- **Waarom**: G10 — doorgifte aan V.S. verwerker.
- **Hoe**: inlog Formspree → account settings → download DPA. Als niet, overweeg overstap naar EU-provider (Plunk, Forms.io).
- **Werk**: 30 min (inloggen + download) tot 1 dag (overstap).
- **Impact**: compliance; verwaarloosbaar risico als er geen klachten komen.
- **Afhankelijk van**: Formspree-account.
- **Meting**: DPA in bezit (PDF).

**Sectie A totaal werk: 1-2 werkdagen, gespreid over 1 week.** Deze sectie moet eerst af — compliance en direct risico.

## Sectie B — Middellange (1-2 weken werk per item)

### B1. KvK-API-integratie voor lead-verrijking
- **Wat**: nieuwe stap in lead-zoek-flow: na Google-resultaat → KvK Basisprofiel-lookup op domein.
- **Waarom**: Z1, Z2, G4, P5 / M1 — rechtsvorm, SBI, adres, KvK-nummer.
- **Hoe**:
  1. Account op [developers.kvk.nl](https://developers.kvk.nl), gratis dev-key (100 calls/5min).
  2. Worker-endpoint `/enrich?domain=acme.nl` dat:
     - Zoekt met Zoeken API op bedrijfsnaam (afgeleid uit domein of Serper-titel).
     - Haalt Basisprofiel op voor de beste match.
     - Retourneert `{ kvkNumber, rechtsvorm, sbiCodes, adres, plaats, postcode }`.
  3. Lead-structuur uitbreiden met deze velden.
  4. UI: tag per lead toevoegen met SBI-branche (bijv. "10.51 Zuivelverwerking") + rechtsvorm.
  5. Filter op rechtsvorm: in "benaderd worden" flow alleen BV/NV/coöperatie automatisch; eenmanszaken flaggen voor handmatige toestemming.
- **Werk**: 1,5-2 dagen inclusief handmatig testen op 10 bestaande leads.
- **Impact**: elimineert false positives op consumer-sites, en maakt compliance-richtlijn (Fase 4 §2.4) uitvoerbaar.
- **Risico**: matching tussen Serper-titel en KvK-naam is fuzzy; soms mis je. Fallback: handmatig KvK-nr invoeren.
- **Afhankelijk van**: KvK dev-key.
- **Meting**: percentage leads met `rechtsvorm != null` na 2 weken (streven: >70%).

### B2. Contactheuristiek + e-mailverificatie
- **Wat**: proberen `info@`, `planning@`, `techniek@`, `onderhoud@` op het bedrijfsdomein. Plus optionele Hunter.io integratie voor echte emails.
- **Waarom**: Z1 / M2 — contactvelden nu 100% handmatig.
- **Hoe**:
  1. Eenvoudige functie: als `lead.contactEmail` leeg, stel 3 candidaten voor met "gok"-indicatie.
  2. Optioneel: ping Hunter.io `/domain-search?domain={domein}` — gratis 25/mnd, betaald vanaf €34/mnd. Betaald is vaak 80-95% accuracy.
  3. UI: "💡 Voorstellen" knop die auto-fill velden vult.
- **Werk**: 4u voor heuristiek, +4u voor Hunter-integratie.
- **Impact**: scheelt 2-3 min per lead (bezoek contactpagina). Op 5-10 leads/week = ~1u/week.
- **Risico**: info@-mails komen vaak in receptie-inbox en bereiken geen beslisser. Markeer als `onzeker`.
- **Afhankelijk van**: B1 (KvK-naam = fallback voor Hunter-search).
- **Meting**: afname handmatige contact-invoer tijd (zelfmeten: stopwatch 5 leads voor, 5 leads na).

### B3. Vacature-signaal als lead-trigger
- **Wat**: dagelijks scannen of bedrijven in lead-lijst recent vacatures hebben geplaatst.
- **Waarom**: Z3 / M5 — vacatures zijn nu geskipt, terwijl ze warm signaal zijn.
- **Hoe**:
  1. Simple scraper die per lead `google.nl/search?q=site:{domein} vacature OR onderhoudsmonteur` of `site:indeed.nl "{bedrijfsnaam}"` checkt.
  2. Als nieuw signaal → flag lead als "🔥 Vacature open".
  3. Run 1x/week via aparte GitHub Action (zoals de email scanner).
- **Werk**: 1-1,5 dag. Minder als je Serper-calls inzet (paar credits per check).
- **Impact**: kan conversie substantieel verhogen (bedrijf dat zoekt = bedrijf dat betaalt).
- **Risico**: Google anti-scraping; oplossing: via Serper heeft budget implicaties.
- **Afhankelijk van**: bestaande lead-lijst met domein-veld.
- **Meting**: aantal leads met "vacature"-flag / totaal; conversie-rate van vacature-leads vs anderen.

### B4. Berichtgeneratie per lead (LLM)
- **Wat**: vervang statisch `genereerEmail()` door LLM-aanroep die snippet + branche + rechtsvorm meeneemt.
- **Waarom**: Z4 / M6 — generieke templates hebben lage open rate (industry-gemiddelde ~20-30% open, ~2-5% reply).
- **Hoe**:
  1. Dashboard-knop "✨ Genereer met AI". Roept nieuwe Worker-endpoint `/generate-mail` aan.
  2. Worker stuurt prompt naar OpenAI API / Claude API met context: bedrijfsnaam, branche (SBI label), snippet, Jair's aanbod, beschikbaarheid.
  3. System prompt: "Schrijf een korte, persoonlijke, Nederlandstalige zakelijke mail..."
  4. Token-kosten: ~€0.001-0.003 per mail. 10/week = €0.10/mnd. Verwaarloosbaar.
- **Werk**: 1,5 dag inclusief prompt-tuning op 10 real-world leads.
- **Impact**: hoog — open rate 2-3x bij echte personalisatie (industry-benchmark).
- **Risico**:
  - LLM kan hallucineren → altijd handmatig controleren voor verzenden.
  - AVG: LLM-provider is verwerker. OpenAI heeft EU-DPA; overleg vooraf.
  - Kosten ontploffen als script in loop raakt → rate-limit op Worker.
- **Afhankelijk van**: B1 (SBI/rechtsvorm nodig), A4 (privacyverklaring moet verwerker vermelden).
- **Meting**: reply-rate op LLM-mails vs template-mails, over 20+ mails per arm.

### B5. Opt-out register / blacklist
- **Wat**: aparte lijst van afzenders die hebben afgemeld — mag **nooit** meer benaderd worden.
- **Waarom**: Tw 11.7 — opt-out moet gerespecteerd. Fase 4 §8.2.
- **Hoe**:
  1. Nieuwe KV-key `optout_emails`, `optout_domains`.
  2. Nieuwe dashboard-pagina "Afmeldingen" om handmatig toe te voegen.
  3. Zoek-flow checkt bij elk nieuw lead-resultaat de lijst → skip.
  4. Bestaande leads met match → `status=afgewezen` + reden "Opt-out".
  5. Inbound-mail met "stop"/"afmelden" → eenvoudige regex-detectie in scanner (optioneel, geavanceerder).
- **Werk**: 1 dag.
- **Impact**: compliance (AVG + Tw), geen juridisch staartje.
- **Risico**: te agressieve matching (heel domein blacklisten terwijl alleen persoon afmeldde) — begin conservatief.
- **Afhankelijk van**: A3 (opt-out moet in mail).
- **Meting**: aantal entries in opt-out; check dat ze bij zoekrondes echt niet terugkomen.

### B6. Conversie-learning (klant → query-gewicht)
- **Wat**: statussen `reactie`, `afspraak`, `klant` geven ook query-score+1 terug aan `leadAgent.queryScores`.
- **Waarom**: Z9, M11 — belangrijkste conversie-signaal gaat verloren.
- **Hoe**: in `zetLeadStatus()` (dashboard.html:2185): bij overgang naar reactie/afspraak/klant: zoek `leadAgent.queryScores[lead.bronQuery] += {1,2,3}` per conversie-stap.
- **Werk**: 2u.
- **Impact**: leer-lus wordt echt. Queries die klanten opleveren stijgen veel sneller in prioriteit.
- **Risico**: low data; 1 klant geeft veel gewicht. Normaliseer misschien ("gemiddelde conversie per query" i.p.v. score).
- **Afhankelijk van**: bestaande pipeline-flow.
- **Meting**: `queryScores` waarden voor winnende queries stijgen; visualiseer in dashboard.

### B7. Reply-detectie via IMAP
- **Wat**: wekelijks een script dat Hostnet-inbox checkt voor inkomende mails van e-mailadressen in `leadData` en automatisch `status=reactie` zet.
- **Waarom**: M7 — reactie nu handmatig, makkelijk om te vergeten.
- **Hoe**:
  1. Hergebruik scanner-logica (IMAP login werkt al).
  2. Nieuwe script `reply_detector.py`: fetch laatste 50 mails, match `from` tegen `leadData[].contactEmail`, zet status.
  3. Draai via GitHub Action of handmatig op Mac.
- **Werk**: 1 dag.
- **Impact**: geen reactie meer missen.
- **Risico**: false positives (een nieuwsbrief-mail vanuit een bedrijf dat je hebt benaderd). Whitelist: alleen single-mail, geen automatische "unsubscribe" headers.
- **Afhankelijk van**: scanner-infrastructuur, lead-email veld.
- **Meting**: hoe vaak status automatisch naar `reactie` gaat vs. handmatig.

### B8. Rooster-integratie in publieke chatbot
- **Wat**: chatbot-antwoorden op "wanneer ben je beschikbaar?" gebruiken `rooster` uit dashboard.
- **Waarom**: consistentere info; inkomende lead krijgt concrete beschikbaarheid.
- **Hoe**: Worker-endpoint `/availability` dat KV leest (uit beschikbaarheidslogica van lead-flow) → chatbot fetcht en rendert.
- **Werk**: 4u.
- **Impact**: middel — klant ervaart snelheid.
- **Risico**: rooster wordt deels zichtbaar (niet gevoelig, maar check).
- **Afhankelijk van**: rooster in KV (nu alleen localStorage).
- **Meting**: chatbot-antwoord bevat actuele datums.

**Sectie B totaal werk: 7-10 werkdagen, gespreid over 3-6 weken.**

## Sectie C — Strategisch (grotere bouwstenen)

### C1. Eén unified leads-model (inkomend + uitgaand)
- **Wat**: alle leads (chatbot, formulier, uitgaand, handmatig, referral) in één datamodel, met bron-veld en status.
- **Waarom**: Fase 3 §1 — data-silo's verhinderen overzicht.
- **Hoe**:
  1. Migreer alle inkomende naar zelfde `leadData`-structuur met `source` veld: `chatbot | form | outbound | manual | referral`.
  2. Dashboard: één lijst, filter op `source`.
  3. Statistics-pagina: conversie per bron.
- **Werk**: 2-3 dagen. Inclusief data-migratie (Formspree oude mails handmatig, chatbot vanuit A8).
- **Impact**: hoog — echte overview.
- **Risico**: complexiteitsschok. Doe in stappen.
- **Afhankelijk van**: A8.
- **Meting**: alle 5 bronnen renderen correct; conversie-dashboard klopt.

### C2. Moneybird-integratie
- **Wat**: bij status `klant` automatisch contact in Moneybird aanmaken.
- **Waarom**: M9 / ZZP-stack-patroon — voorkomt dubbel werk.
- **Hoe**: Moneybird REST API, één POST naar `/contacts` met naam + adres (uit KvK) + email. Eventueel bij eerste offerte-moment ook `estimate` voorbereiden.
- **Werk**: 1-2 dagen inclusief token-setup + test.
- **Impact**: bespaart 5 min per nieuwe klant.
- **Risico**: dubbele contacten bij fout; implementeer met dedup-check op KvK-nr.
- **Afhankelijk van**: B1 (KvK-nr + adres), Moneybird-abonnement.
- **Meting**: klant wordt in Moneybird zichtbaar.

### C3. Visitor-identification (lightweight Dealfront-clone)
- **Wat**: identificeer welke bedrijven op jmmechanica.nl komen via reverse-IP.
- **Waarom**: M8 — warme signalen missen je nu volledig.
- **Hoe**:
  1. Cloudflare Worker voor `jmmechanica.nl` die elke page-view logt in KV (ip, path, datum, referer).
  2. Nachtelijk script (GitHub Action) dat IP's tegen een IP-to-company API (IP2Location, IPinfo) matcht.
  3. Resultaat in dashboard "Website bezoekers"-tab.
- **Werk**: 3-4 dagen.
- **Impact**: potentieel hoog — als een bedrijf naar `/diensten` komt, is dat een sterker signaal dan een koude zoekquery.
- **Risico**:
  - **AVG**: IP-adressen zijn persoonsgegevens. Grondslag moet in privacyverklaring staan. Je moet bezoeker informeren.
  - **Praktisch**: met 50 bezoekers/mnd heeft de data-rijkdom een plafond.
  - **Cookies**: niet nodig voor IP-capture, dus geen cookiebanner.
- **Afhankelijk van**: A4 (privacyverklaring moet dit noemen). Cloudflare Workers (aanwezig).
- **Meting**: aantal geïdentificeerde bezoekers/mnd; hoeveel leiden tot handmatige actie.

### C4. Calendly-link per mail
- **Wat**: na eerste reactie of bij `afspraak`-status, includeer een Calendly-link met beschikbare tijdslots.
- **Waarom**: M12 / ZZP-stack-patroon.
- **Hoe**: Calendly gratis tier is voldoende. Link handmatig invoegen of via variabele in template.
- **Werk**: 2u (Calendly-account setup + link in template).
- **Impact**: lage frictie, klant boekt zelf.
- **Risico**: Calendly is Amerikaanse verwerker; benoem in privacyverklaring.
- **Afhankelijk van**: A4.
- **Meting**: booking rate uit Calendly-dashboard.

### C5. Cross-device sync voor dashboard-data (behalve uren)
- **Wat**: leads, rooster, opdrachtgevers, facturen-cache in KV opslaan zodat nieuw apparaat ze ziet.
- **Waarom**: Fase 1 S4 — single-device is een barrière.
- **Hoe**: uitbreiding van bestaand `/sync` endpoint met `type=leads|rooster|...`. Compressor bij transfer (JSON vaak groot).
- **Werk**: 2-3 dagen inclusief conflict-resolutie (wat als 2 apparaten tegelijk bewerken).
- **Impact**: rust; verlies-risico weg.
- **Risico**: meer data in KV → hogere Worker-kosten (nog ruim in free tier).
- **Afhankelijk van**: bestaand sync-mechanisme.
- **Meting**: iPad-test naast iPhone-test — zelfde leads zichtbaar.

**Sectie C totaal werk: 10-15 werkdagen, over maanden te spreiden.**

## Specifieke sectie — klantacquisitie (syntese)

Hieronder samengebald wat je terugvindt in A-C, in de structuur die de oorspronkelijke opdracht vroeg.

### 1. Betere relevantie-scoring in de bedrijvenzoeker
- **A2** (docs opschonen) + **B1** (KvK/SBI-filtering) + **B3** (vacature-signaal) + **B6** (conversie-learning).
- Verwacht effect: false-positive rate van ~40% → <15%; warmte van leads substantieel hoger.

### 2. Contactverrijking
- **B2** (info@/Hunter-heuristiek). Combineer met **B1** voor KvK-nummer.
- Verwacht effect: manueel contactwerk halveren.

### 3. Berichtgeneratie per lead met persoonlijke hooks
- **B4** (LLM-mail) + **B1**-data voor branche-referentie.
- Verwacht effect: open rate +30-80%, reply rate +50-150% (industry-benchmarks — niet gegarandeerd).

### 4. Opvolgflow met statusbeheer
- **A6** (random timing) + **B7** (reply-detectie) + **B5** (opt-out register).
- Verwacht effect: minder gemiste opvolgingen, minder "vergeten" leads, compliance.

### 5. Leerlus
- **B6** (klant-signaal) + **B3** (vacature-trigger voedt ook back).
- Verwacht effect: over 3-6 maanden queries die statistisch converteren krijgen dominantie.

## Prioriteitsmatrix (syntese van alles)

| Prio | Item | Sectie | Werk | Impact |
|---|---|---|---|---|
| 1 | A1 publieke scanner-data eraf | A | 2-4u | 🔴 Direct risico |
| 2 | A2 Google key roteren | A | 1u | 🔴 Security |
| 3 | A3 Opt-out in mails | A | 30min | 🟠 Compliance |
| 4 | A4 Privacyverklaring | A | 2-3u | 🟠 Compliance |
| 5 | A5 Akkoord checkbox | A | 30min | 🟡 Compliance |
| 6 | A6 Random follow-up drempel | A | 30min | 🟡 Hygiene |
| 7 | A7 Mail-Tester check | A | 1-2u | 🟡 Deliverability |
| 8 | A8 Chatbot-leads naar dashboard | A | 4-6u | 🟢 Acquisitie |
| 9 | A9 Formspree DPA | A | 30min-1d | 🟡 Compliance |
| 10 | B1 KvK verrijking | B | 1,5-2d | 🟢🟢 Acquisitie |
| 11 | B5 Opt-out register | B | 1d | 🟠 Compliance |
| 12 | B4 LLM-mail | B | 1,5d | 🟢🟢 Acquisitie |
| 13 | B2 Contactheuristiek | B | 1d | 🟢 Acquisitie |
| 14 | B6 Conversie-learning | B | 2u | 🟢 Acquisitie |
| 15 | B3 Vacature-signaal | B | 1-1,5d | 🟢🟢 Acquisitie |
| 16 | B7 Reply-detectie | B | 1d | 🟢 Efficiency |
| 17 | B8 Rooster in chatbot | B | 4u | 🟡 UX |
| 18 | C1 Unified leads model | C | 2-3d | 🟢 Overzicht |
| 19 | C2 Moneybird sync | C | 1-2d | 🟡 Efficiency |
| 20 | C3 Visitor-identification | C | 3-4d | 🟡 Warm signals |
| 21 | C4 Calendly in mail | C | 2u | 🟡 Conversie |
| 22 | C5 Cross-device sync | C | 2-3d | 🟡 UX |

## Aanbevolen volgorde

**Week 1: compliance + direct risico**
- A1, A2, A3, A4, A5, A6, A7, A9 (gezamenlijk ~1,5 werkdag verspreid).

**Week 2-3: acquisitie-kern**
- A8 (chatbot integratie) + B1 (KvK) — geven direct nieuwe data-kwaliteit.

**Week 4-5: personalisatie**
- B4 (LLM-mail) + B2 (contact-heuristiek).

**Week 6: compliance follow-through + learnings**
- B5 (opt-out register) + B6 (conversie-learning) — 1,5d samen.

**Week 7+: vacature + reply (afhankelijk van hoeveel bandbreedte)**
- B3 + B7.

**Maand 2+: strategisch**
- Evalueer wat het voorgaande heeft opgeleverd (reply-rate meten!). Beslis dan pas over C-items.

## Totaal werkschatting

- **Sectie A**: 10-14 uur (2 werkdagen verspreid).
- **Sectie B**: 40-55 uur (6-7 werkdagen).
- **Sectie C**: 40-60 uur (zeer afhankelijk van bandbreedte).

**Samen ruwweg 90-130 uur ingenieurs-werk.** Als eenmanszaak met 1-2u per week aan eigen tooling: 12-24 maanden. Met een productiviteitssprint (1 dag per week): 3-5 maanden. Dit is geen project dat in een weekend klaar is; zie het als een technische schuld-aflossing in tempo van wat je comfortable afhandelt.

## Meetmethoden per thema

| Meetpunt | Hoe meten | Baseline | Doel |
|---|---|---|---|
| False-positive % in leads | Handmatig 20 leads scoren | onbekend nu | <15% |
| Contact-invoer tijd / lead | Stopwatch 5 leads | onbekend nu | -50% |
| Open rate mails | (moeilijk zonder tracking; vraag om "stop"-response) | n.v.t. | n.v.t. |
| Reply rate | Nieuwe statussen `reactie` / verzonden mails | onbekend nu | +50% |
| Conversie naar klant | `klant`-status / benaderd | onbekend nu | +25% |
| Deliverability | Mail-Tester 1x/kwartaal | onbekend | >9/10 |
| Compliance-klachten | AP/ACM-klachten (hopelijk 0) | 0 | 0 |

Zonder baseline is alles relatief. Start met een **meetdag**: log de stand van zaken vandaag (~1u werk) voordat aanpassingen worden doorgevoerd.

## Risico's op systeemniveau

1. **Scope creep**: de analyse toont veel mogelijkheden. De grootste bedreiging is aan alles tegelijk beginnen. Volg de weekvolgorde strikt.
2. **Verkeerde prioriteit**: als feitelijk blijkt dat het systeem nauwelijks gebruikt wordt (zie aanname Fase 3 §0), zijn A-items de enige zinvolle. Groot investeren in B/C terwijl er per week 1 lead binnenkomt = niet rationeel.
3. **Compliance als excuus**: pas op dat compliance-werk (A3-A5, B5) niet alle aandacht opslokt terwijl de echte acquisitie-verbeteringen (B1, B4) blijven liggen. Balanceer.
4. **LLM-kosten**: als B4 buiten beheer loopt (bv. een loop die 1000x OpenAI aanroept) kan het snel €10-100 kosten. Hard rate-limit op Worker toevoegen (max 50 generaties/dag).
5. **Vendor lock-in op nieuwe services**: Hunter.io, KvK API, OpenAI. Elke nieuwe afhankelijkheid is een potentiële toekomstige technische schuld.

## Niet doen (expliciet)

Om de verleiding te weerstaan dingen te bouwen die wel interessant zijn maar niet passen:

- **Geen eigen ML-modeltraining** — pre-trained LLM's zijn voldoende, training vanuit scratch is weken werk met weinig data.
- **Geen LinkedIn-automation tools** — ToS-risico voor account-ban.
- **Geen A/B test framework** — volume te laag voor significantie.
- **Geen eigen inbox-warmup netwerk** — niet nodig op 10-30 mails/dag.
- **Geen CRM-platformvervanging** — Moneybird + dashboard dekken de behoefte.
- **Geen migratie naar React/Next.js voor dashboard** — vanilla JS werkt en is simpel.
