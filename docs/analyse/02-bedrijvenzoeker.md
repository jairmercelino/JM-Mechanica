# Fase 2 — Bedrijvenzoeker diepgaand

*Focus: `dashboard.html:1881-2474` + `worker/index.js` + `jm_config.json` (lead-gerelateerd).*

## 1. Bronnen — waar komen de leads vandaan

### 1.1 Enige primaire bron: Serper.dev
De Worker proxyd naar `https://google.serper.dev/search` (`worker/index.js:107`) met parameters:
```json
{ "q": "<query>", "gl": "nl", "hl": "nl", "num": 10 }
```
Per aanroep dus maximaal **10 resultaten**, Nederland-geografie, Nederlandstalig. Geen advanced Google-operators (`site:`, `intitle:`, `AROUND()`, etc.) worden toegevoegd — alleen de ruwe string uit `LEAD_QUERIES`.

**Beperkingen van deze bron:**
- Alleen Google-organic resultaten. Dus geen bedrijven die niet indexeren (kleine productiebedrijven zonder site, of met alleen een Facebook-pagina die niet hoog rankt).
- Geen Places/Maps data: geen openingsuren, geen telefoonnummer, geen adres, geen recensies.
- Geen structured data: wat Google toont als "knowledge panel" of "rich result" is niet beschikbaar via Serper's `organic` array.

### 1.2 Secundaire bronnen: handmatig
- `voegHandmatigLeadToe()` (dashboard.html:2424): naam + URL + omschrijving intikken. Gebruikt voor referrals of leads gevonden buiten de zoeker.
- `openSlimGoogleZoek()` (dashboard.html:2456): opent Google direct in een nieuw tabblad zonder naar de dashboard terug te keren — manuel zoeken.

### 1.3 Wat ontbreekt
Er wordt **geen gebruik gemaakt** van bronnen die voor een NL-monteur juist waardevol zijn:

| Bron | Wat het zou leveren | Status |
|---|---|---|
| KvK Open Data API | SBI-code, adres, rechtsvorm, KvK-nr, branche | Niet gebruikt |
| KvK Dataservice (betaald) | Contactpersonen, historie, NL-compleet | Niet gebruikt |
| Company.info / Graydon | Financiele health, betaalgedrag, grootte | Niet gebruikt |
| Google Places / Maps API | Adres, telefoon, openingstijden, fotos | Niet gebruikt |
| Vacaturesites (scrape) | Signaal: ze hebben monteurs nodig NU | Wordt nu gefilterd als ruis (zie §2.1) |
| LinkedIn Sales Navigator | Beslissers per bedrijf | Niet gebruikt |
| Chatbot-conversaties | Inkomende warme leads | Bereikt dashboard niet (zie Fase 1, §3.1) |

## 2. Relevantie — hoe weegt het systeem?

Er zijn drie filters + een swak leer-signaal. Geen van alle kijkt naar de bedrijfsinhoud zelf.

### 2.1 Skip-domeinen (hardcoded, `dashboard.html:2034`)
```js
['indeed.com','nl.indeed.com','linkedin.com','nl.linkedin.com',
 'jooble.org','nl.jooble.org','nationalevacaturebank.nl',
 'werkzoeken.nl','careerjet.nl','bebee.com',
 'randstad.nl','tempo-team.nl','manpower.nl','yacht.nl','hays.nl','brunel.net']
```
15 domeinen. Allemaal vacaturesites of uitzenders. **Inconsistentie met de queries**: drie van de 25 queries (`dashboard.html:1899-1901`) zoeken juist naar vacatures ("vacature monteur technische dienst ..."). De intentie is duidelijk: vacatures zijn een signaal dat een bedrijf monteurs nodig heeft. Maar het systeem gooit de vacatures weg zonder het bedrijf af te leiden. Dat is een actieve bug in de scoring-aanpak.

**Ontbreekt in skiplijst**: algemene nieuwssites (`nu.nl`, `fd.nl`, `rtvnh.nl`), directories (`telefoonboek.nl`, `companywall.nl`), Wikipedia, recept-/consumentensites, startpagina-achtige aggregators, `bedrijven.nl`, `openstreetmap.org`. Die kunnen per query als hoogste resultaat opduiken.

### 2.2 Geblokkeerde domeinen (dynamisch, `dashboard.html:2114-2116`)
Na **2 dislikes** van hetzelfde domein komt het in `leadAgent.blockedDomains` en wordt het bij volgende zoekacties geskipt (`dashboard.html:2040`). Werkt, maar:
- Vereist actieve gebruikersinput. Gebruiker moet eerst twee slechte resultaten tegenkomen voor het leert.
- Geen timer/vervalsing — geblokkeerd = permanent. Als een site vroeger irrelevant was maar nu wel, blijft hij geblokkeerd.

### 2.3 Dedup op domein (`dashboard.html:2042`)
```js
if (leadData.some(l => l.domein === r.domein)) return;
```
Eén lead per domein ooit. Voorkomt herhaling bij nieuwe zoekrondes. **Nadeel**: als de eerste treffer een subpagina was (`/vacatures/monteur` i.p.v. `/over-ons`), krijgt de gebruiker later geen kans meer om een betere landing-URL van hetzelfde bedrijf te pakken. Het eerste domein-occurrence bepaalt alles.

### 2.4 Query-scoring (leer-lus, `dashboard.html:2089, 2111`)
```js
// Like:
leadAgent.queryScores[bronQuery] += 1
// Dislike:
leadAgent.queryScores[bronQuery] -= 1
```
Queries waaruit gelikete leads kwamen scoren hoger en komen eerder in de rotatie (`dashboard.html:1969-1972`). Plus: keywords uit gelikete titels worden opgeslagen (`likedKeywords`) en wanneer er ≥3 zijn, genereert de agent afgeleide queries:
```js
`"${kw}" fabriek productie noord-holland`
`"${kw}" bedrijf nederland vacature monteur`
```
(`dashboard.html:1963-1964`)

**Problemen:**
- Keyword-extractie is naïef: splitst op whitespace, pakt titelwoorden > 3 letters, stript accenten. Veel titels zijn "Welkom bij Bakkerij X" of "Bakkerij X | Industriële broodproductie" — dan belanden "welkom", "bakkerij", "industriële" als keywords. "Welkom" en "bakkerij" zijn in stopwoorden gezet (`dashboard.html:2123`), "industriële" niet per se: `replace(/[^a-zà-ÿ\s]/g, '')` gevolgd door split → "industriele" (zonder accent) of "industriële" met accent, afhankelijk van input. Goede stop-woordlijst is beperkt (32 woorden); woorden als `online`, `home`, `welkom`, `contact`, `productie`, `nederland` komen terug in de gegenereerde queries.
- Gegenereerde queries zijn **letterlijk** `"{keyword}" fabriek productie noord-holland`. Twee quotes dwingen exact-match af. Als het keyword een common noun is (`productie`, `bakker`), krijg je vooral al gevonden bedrijven terug → duplicaat-skip → 0 nieuwe leads.
- Geen aggregatie: als dezelfde query 5x gelikete leads heeft opgeleverd, wordt hij gewoon 5x eerder gekozen maar de agent weet niet dat hij "voedingsindustrie" sterk vindt en "distributiecentrum" zwak.

### 2.5 Wat de scoring **niet** meeweegt
- Branche (SBI) — onbekend.
- Bedrijfsgrootte — onbekend.
- Locatie — query-afhankelijk, niet per-lead geverifieerd (resultaat "Noord-Holland" kan over Limburg gaan).
- Of er een technische dienst is.
- Of er recent vacatures stonden.
- Of de site een `/contact`-pagina heeft.
- Of het bedrijf B2B of B2C is.
- Hoe lang het bedrijf bestaat / financiële stabiliteit.
- Afstand tot Zaandam / reistijd.

## 3. Opgeslagen data per bedrijf

Volledige lead-structuur (`dashboard.html:2044-2055, 2443-2444`):

| Veld | Bron | Vers? |
|---|---|---|
| `id` | Client, timestamp+random | n.v.t. |
| `titel` | Serper `item.title` | Moment van zoeken |
| `snippet` | Serper `item.snippet` | Moment van zoeken |
| `url` | Serper `item.link` | Moment van zoeken |
| `domein` | Afgeleid van url | n.v.t. |
| `afbeelding` | Niet gevuld (`item.image=null` in worker) | — |
| `bronQuery` | Query-string op moment van vinden | n.v.t. |
| `status` | Eigen pipeline | Wordt bijgewerkt bij acties |
| `datum` | ISO-date van toevoegen | Fixed |
| `datumBenaderd` | Wanneer status → benaderd | Fixed |
| `laatsteActie` | Laatste status-wijziging | Bijgewerkt |
| `contactNaam/Functie/Email/Telefoon` | **Handmatig** invullen per lead | Alleen wat gebruiker tikt |
| `notities` | Vrije tekst | Handmatig |

**Niet opgeslagen** (en zou waardevol zijn): KvK-nummer, rechtsvorm, adres, postcode, plaats, SBI, aantal FTE, website-taal, laatste site-wijziging, vacatures-signalen.

### Versheid in de praktijk
Een lead die 3 maanden oud is bevat nog steeds de snippet-tekst van 3 maanden geleden. Er is **geen re-scrape, geen re-validate**. Mogelijke gevolgen:
- Bedrijf is verhuisd / opgeheven / overgenomen → gebruiker benadert een kostenpost.
- Contactpersoon is weggegaan → e-mail bounced of mail gaat naar iemand die er niets mee kan.
- Vacature die het signaal gaf is gevuld → de reden voor benadering is weg.

Het systeem heeft **geen mechanisme** voor:
- Verversen van bestaande leads (periodieke re-check).
- Detecteren van dode links.
- Herverificatie van contact-emails.
- Signaleren dat een bedrijf onlangs een vacature heeft gepubliceerd (dynamische trigger).

## 4. Zwakke plekken — lijst

### 4.1 False positives (leads die geen lead zijn)
- **Nieuwssites en blogs** die toevallig in een query scoren. Geen filter.
- **Directory-sites** (`telefoonboek.nl`, `bedrijven.nl`, `openkamer.com`): geen filter.
- **Wikipedia, Wikiwand**: geen filter.
- **Webshops in voedingsindustrie** (queries als "zuivelfabriek" pakken ook consumer brands): geen B2B vs B2C-filter.
- **Eigen site** (`jmmechanica.nl`): niet geskipt, zou kunnen opduiken op generieke queries.
- **Concurrenten**: geen actieve filter. "ZZP monteur Zaandam" zou concurrenten opleveren.

### 4.2 Gemiste bedrijven
- **Bedrijven zonder website** — nergens vindbaar via Google-organic. KvK-API zou deze leveren (SBI + locatie).
- **Bedrijven met lage SEO** — veel industriële MKB's hebben brochurewebsites die niet voor "onderhoudsmonteur" ranken. Ze bestaan, hebben monteurs nodig, maar komen niet voorbij.
- **Bedrijven op industrieterreinen die niet in Google's Knowledge Graph staan** — maar wel op Openstreetmap.
- **Bedrijven die net een vacature hebben geplaatst** — het sterkste warmtesignaal gaat verloren omdat Indeed/LinkedIn wordt geskipt.
- **Bedrijven waarvan alleen een LinkedIn-company page bestaat** — geblokkeerd.

### 4.3 Verouderde contactinfo
- Contactgegevens ingetikt bij lead X kunnen 6 maanden later nog in het systeem staan terwijl de persoon weg is. Geen expiry, geen reminder "check of dit nog klopt".
- Bouncen van e-mails wordt niet gelogd (er wordt sowieso niets verstuurd vanuit het systeem, zie Fase 3). Als Jair handmatig merkt dat mail bounced, is er geen veld om dat in een lead te registreren dan notities.

### 4.4 Duplicaten
- **Zelfde bedrijf op meerdere domeinen**: `acme.nl` en `acme-benelux.com` worden gezien als verschillende bedrijven. Hetzelfde geldt voor `acmegroup.com` en `acme.nl`. Geen fuzzy matching op bedrijfsnaam of KvK-nummer.
- **Holding vs werkmaatschappij**: Unilever Nederland vs Unilever B.V. — beide krijgen eigen lead als verschillende domeinen.
- **Zelfde domein met slash-path**: door dedup-op-domein niet een issue, maar betekent dat eerste hit altijd wint.

### 4.5 Naïviteit e-mail-generator
`genereerEmail` (`dashboard.html:2219`):
- Strip BV/NV-suffix van `lead.titel` voor bedrijfsnaam. Maar `titel` is een Google-search-title — vaak niet de bedrijfsnaam. Voorbeelden uit waarschijnlijke zoekresultaten:
  - "Over ons - BakkerX Voedingsindustrie BV" → bedrijf wordt "Over ons - BakkerX Voedingsindustrie". Fout.
  - "BakkerX — Home" → bedrijf wordt "BakkerX — Home". Fout.
  - "Home | BakkerX" → met `replace(/\s*[-–|:].*/g, '')` → "Home". Fout.
  - Goede case: "BakkerX BV" → "BakkerX". Zeldzaam.
- Zonder contactnaam (meestal): `Goedendag` als aanhef. Klinkt onpersoonlijk in NL (`Geachte heer/mevrouw` of een naam werkt beter).
- Tekstsjabloon is identiek voor elke lead buiten bedrijfsnaam. Geen referentie naar branche, geen referentie naar de snippet-inhoud, geen referentie naar waarom dit specifieke bedrijf geraakt wordt.
- Follow-up is óók identiek op bedrijfsnaam na.

### 4.6 Leer-lus bijna symbolisch
- Likes leiden alleen tot query-herweging + keyword-opbouw voor gegenereerde queries. Ze leiden niet tot:
  - Aanscherping van skiplijst.
  - Branche-voorkeur (SBI-gewogen).
  - Regio-voorkeur.
  - Uitsluiting van bepaalde site-structuren (nieuwssites, blogs).
- Dislikes: alleen domein-blokkade na 2x. Geen generalisatie (".org dislike" → alle .org skippen is ook niet gewenst, maar er zit niks tussenin).
- Er wordt niet geleerd van "klant geworden": `status=klant` leads hebben nergens verhoogd effect. Dat is wel het belangrijkste signaal (een klant is de ultieme positieve bevestiging).

### 4.7 Operationele limieten
- **Zoekquota**: Serper gratis tier is een **eenmalige 2500 credits**, 6 maanden geldig — geen maandelijkse hernieuwing. Per zoekactie 1 query = 1 credit = 10 resultaten. Bij 1x/dag zoeken → ~180 queries in 6 mnd → ruim binnen. Intensiever (10+/dag) → tier binnen maanden op, dan betaald pakket nodig (~$50 voor 50k credits). Check huidig verbruik op serper.dev/dashboard.
- **25 queries × 10 resultaten = theoretisch 250 unieke domeinen** in de hele historie. Veel van die 250 worden geskipt of geduplicateerd → realistisch misschien 80-150 bruikbare leads over alle queries heen. Daarna levert opnieuw zoeken niets op totdat Google zijn rankings verandert.

### 4.8 UI-verwarring
- "Zoekacties: N (wekelijks)" (`dashboard.html:2420`) — maar er is geen wekelijkse teller, alleen een totaal. Misleidend.
- "Agent klaar om te zoeken" suggereert proactiviteit, maar de agent doet niets buiten wat gebruiker met de knop triggert. Er is geen cronjob, geen achtergrond-trigger.
- "Slim zoeken via Google" (`openSlimGoogleZoek`) en "Zoek klanten" gebruiken beide `kiesBesteQuery` — maar de eerste opent Google in een tab (gebruiker moet handmatig knippen/plakken), de tweede triggert de API. Onduidelijk voor gebruiker welke de moeite waard is.

## 5. Concrete metingen uit huidige staat

Zonder directe toegang tot `localStorage` kan ik niet precies tellen hoeveel leads erin zitten. Wel observaties uit de code:

- Bij elke zoekactie worden **hooguit 10 ruwe resultaten** opgehaald.
- Van die 10 worden er ~2-5 geskipt (skip-domeinen + dedup + blockedDomains) — aanname, zonder meting.
- Blijft per zoekactie ~5-8 nieuwe leads.
- Eerste "ronde" door alle 25 queries (~200 leads) levert max 80-150 bruikbare domeinen op.
- Daarna diminishing returns: dezelfde queries → dezelfde rankings → vooral dubbelen.

**Het systeem is dus volumegelimiteerd door het aantal queries, niet door API-quota.** Het ceiling zit in de eigen query-lijst, niet in Serper.

## 6. Samengevat: zwaktes gesorteerd op impact

| # | Zwakte | Impact | Oorzaak |
|---|---|---|---|
| Z1 | Geen echte contactverrijking — e-mail/telefoon/beslisser zijn handmatig | Hoog (verzending blijft hand-werk) | Geen externe API, geen site-scraping |
| Z2 | Geen branche-/SBI-filtering | Hoog (false positives van consumenten-sites) | Geen KvK-koppeling |
| Z3 | Vacatures worden weggegooid terwijl dat het sterkste signaal is | Hoog (warme leads worden koude leads) | `skipDomeinen` conflicteert met intent |
| Z4 | E-mail-template is template — geen personalisatie per lead | Hoog (open rate blijft laag) | `genereerEmail` gebruikt alleen titel |
| Z5 | Geen versheids-mechanisme | Middel (ouder = meer ruis) | Geen re-check, geen expiry |
| Z6 | Queries zijn een eindige pool; agent leert niet nieuwe queries zelf te genereren | Middel (plafond ~150 leads) | Template-queries in code |
| Z7 | Dedup op domein verbergt beter kandidaat-URLs van zelfde bedrijf | Laag-middel | Eerste-hit-wint |
| Z8 | Titel-woord-extractie produceert ruis als keywords | Middel (gegenereerde queries slaan er naast) | Naïeve stopwoordlijst |
| Z9 | Klantstatus voedt geen extra scoring-gewicht terug | Middel (laat signaal liggen) | Leer-lus alleen op like/dislike |
| Z10 | Geen filter voor Wikipedia/directories/nieuwssites | Laag (extra handwerk) | Skiplijst te smal |
| Z11 | Bedrijfsnaam-afleiding uit pagetitel levert vaak rommel | Laag (cosmetisch in mail) | Regex-strip is fragiel |
| Z12 | Geen duplicaat-detectie op bedrijfsnaam/KvK | Laag (meerdere domeinen = meerdere leads) | Geen authoritative key |

De vier hoogste (Z1-Z4) zijn de belangrijkste voor Fase 6. Z5-Z9 zijn medium-prioriteit. Z10-Z12 zijn poetswerk.

## 7. Aannames expliciet (niet geverifieerd)

- Serper gratis tier = 2500 queries/maand. Moet op serper.dev/dashboard bevestigd.
- Het aantal leads in `leadData` is nu onbekend — kan alleen vanuit de gebruiker gevisualiseerd worden.
- Aanname dat gebruiker de "Verstuurd"-knop consequent klikt. Als niet, dan staan leads eeuwig op `liked` en komen nooit op `followup`.
- Aanname dat `localStorage` niet door cache-clear of device-wissel is verloren. Op mobiel Safari kan dat gebeuren (ITP). De leads zouden dan weg zijn — geen backup.
