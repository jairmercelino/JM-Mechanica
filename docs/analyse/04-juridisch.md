# Fase 4 — Juridisch & ethisch kader

*Focus: wat mag JM Mechanica wel/niet, en wat moet in de code zitten om compliant te blijven?*

## 0. Status & disclaimer

Deze analyse is niet-juridisch advies. Ik ben geen advocaat. Waar ik zeker ben, schrijf ik zeker; waar ik een interpretatie maak, markeer ik dat. Voor concrete handhavingsrisico's is een Nederlandse privacy-advocaat de aangewezen bron. Maar de basis-regels voor B2B cold outreach en handelsregistergebruik zijn redelijk duidelijk en worden hieronder gecheckt tegen de actuele stand van zaken (april 2026).

## 1. De grondslagenkaart voor koude acquisitie-e-mail in Nederland

Twee wettelijke kaders zijn tegelijk van toepassing:
- **Telecommunicatiewet art. 11.7** (Tw) — regelt of je überhaupt mag versturen (opt-in/opt-out, toezichthouder: ACM).
- **AVG/GDPR art. 6** — regelt op welke grondslag je persoonsgegevens (inclusief een zakelijk e-mailadres dat naar een persoon is te herleiden) mag verwerken (toezichthouder: AP).

Je moet aan **beide** kanten voldoen. Tw is vaak de bindende voorwaarde omdat die strenger is voor ongevraagde communicatie.

## 2. Tw 11.7 — wanneer is ongevraagde e-mail toegestaan?

### 2.1 Hoofdregel
Ongevraagde elektronische communicatie voor commerciële, ideële of charitatieve doeleinden is verboden zonder voorafgaande toestemming van de ontvanger (opt-in). [ACM](https://www.acm.nl/nl/verkoop-aan-consumenten/reclame-en-verleiden/spam-voorkomen-uw-reclame)

### 2.2 Uitzondering 1 — rechtspersonen
Voor rechtspersonen (BV, NV, stichting, vereniging, coöperatie) geldt een **soepeler regime**. Het is toegestaan een rechtspersoon ongevraagd te e-mailen **als**:
1. Het gaat om een zakelijk, algemeen bekend gemaakt e-mailadres zoals `info@bedrijf.nl`; OF
2. Er is een andere publiek kenbare aanduiding dat dit adres voor zakelijke berichten bedoeld is.

En ongeacht dit moet **elk** bericht aan een rechtspersoon bevatten:
- Duidelijke identificatie van de afzender.
- Een eenvoudige, gratis opt-out (afmeldmogelijkheid).

Bron: [Rijksoverheid](https://www.rijksoverheid.nl/onderwerpen/telecommunicatie/vraag-en-antwoord/wat-doen-tegen-spam), [ACM B2B spam](https://www.acm.nl/nl/telecom/zakelijk-abonnement-voor-bellen-en-internet/spam).

### 2.3 Uitzondering 2 — bestaande klantrelatie (soft opt-in)
Tw 11.7 lid 4: als je het adres hebt gekregen in het kader van een verkoop en je verstuurt "soortgelijke" producten/diensten, mag je zonder opt-in mailen — mits elke mail een opt-out bevat.

**Per 1 juli 2026** wordt deze soft opt-in **voor telemarketing** afgeschaft; voor e-mail blijft ze vooralsnog bestaan maar de richting is duidelijk: opt-in wordt standaard. [Legalz](https://www.legalz.nl/blog/telemarketing-het-einde-van-de-soft-opt-in-per-1-juli-2026) / [DMCC](https://dmcc.nl/nieuws/update-dmcc-legt-uit-wetswijziging-opt-in-telemarketing/).

### 2.4 **Kritiek punt: eenmanszaken = natuurlijke personen**
Eenmanszaken, VOF-vennoten en ZZP'ers zijn juridisch **natuurlijke personen**, geen rechtspersonen. Voor hen geldt de hoofdregel uit 2.1: **expliciete opt-in verplicht**. De rechtspersoon-uitzondering geldt **niet**. Dit is bevestigd door DDMA: *"zelfstandigen gebruiken vaak hetzelfde nummer/adres voor werk als privé, daarom heeft de wetgever besloten hen te beschermen"* ([DDMA](https://ddma.nl/kennisbank/gdpr-de-4-grootste-mythes-over-dataverwerking-in-b2b-marketing/)).

Voor JM Mechanica's bedrijvenzoeker is dit heel relevant: **veel MKB in de NL industrie zijn BV/NV, maar een aanzienlijk deel is ook eenmanszaak of VOF**. Je weet uit een Google-zoekresultaat niet welke rechtsvorm een bedrijf heeft. Daarom:

- Zonder KvK-lookup weet je niet of een lead een natuurlijk persoon of rechtspersoon is.
- Zonder die zekerheid loop je het risico dat een deel van de koude e-mails juridisch niet toegestaan is.
- Enige veilige route: KvK-nummer en rechtsvorm opzoeken vóór verzending en alleen rechtspersonen benaderen, óf alleen generieke `info@`-adressen.

### 2.5 KvK Non-Mailing Indicator (NMI)
Bedrijven kunnen bij de KvK een NMI aanvragen: een vlag die zegt "dit adres mag niet voor reclame gebruikt worden". De NMI is zichtbaar op een KvK-uittreksel. Wie de NMI negeert, overtreedt.

Bron: [KvK NMI](https://www.kvk.nl/over-het-handelsregister/de-non-mailing-indicator/).

Voor JM Mechanica: **de NMI wordt op dit moment niet gecheckt** (de bedrijvenzoeker gebruikt alleen Google-results, niet het KvK-register). Als straks wel KvK-data wordt gebruikt, moet de NMI als filter in de leaddata opgenomen worden.

## 3. AVG/GDPR — grondslag voor B2B cold e-mail

### 3.1 Welke grondslag?
Voor B2B cold outreach is de praktische grondslag **gerechtvaardigd belang** (art 6 lid 1f AVG): jouw commerciële belang vs. de rechten/vrijheden van de ontvanger. Je moet een drietoets doen:

1. **Doeltoets**: is het doel legitiem? (commerciële benadering van een potentiële zakelijke klant — ja.)
2. **Noodzakelijkheidstoets**: kan het doel niet met minder ingrijpende middelen? (hierbij: gerichte, relevante mail i.p.v. bulk.)
3. **Belangenafweging**: wegen de belangen van de ontvanger niet zwaarder? (hangt af van relevantie, volume, mogelijkheid tot afmelden.)

Deze afweging **moet gedocumenteerd** kunnen worden. In de praktijk: een kort LIA-document (Legitimate Interest Assessment) per outreach-campagne. [DDMA](https://ddma.nl/kennisbank/gdpr-de-4-grootste-mythes-over-dataverwerking-in-b2b-marketing/).

### 3.2 Verwerkingsverantwoordelijke-verplichtingen
Als Jair persoonsgegevens (naam, e-mail, functie) van leads opslaat in het dashboard, is hij verwerkingsverantwoordelijke. Verplichtingen:

- **Privacyverklaring** op de website (transparantie). **JM Mechanica heeft op dit moment geen privacyverklaring** (geen `privacy` in `index.html`, `diensten.html`, `over-mij.html`, `sitemap.xml`, `robots.txt`). Dit is een concrete nalatigheid.
- **Register van verwerkingsactiviteiten** (art 30 AVG) — ook voor eenmanszaken, onder bepaalde voorwaarden verplicht.
- **Bewaartermijn** vastleggen. Praktisch voor leads: 1-2 jaar na laatste contact, of tot dat een opt-out is verwerkt. Geen harde wettelijke termijn.
- **Recht op inzage, correctie, verwijdering**. Iemand die op de hoogte is van de verwerking kan deze rechten uitoefenen.
- **Data-lek-melding**: bij een datalek met risico voor betrokkenen binnen 72 uur melden bij AP.

### 3.3 Welke persoonsgegevens verzamelt het huidige systeem?

Gelopen door `dashboard.html` en `chatbot.js`:

| Bron | Gegevens | Bewaring |
|---|---|---|
| Lead-agent (uitgaand) | bedrijfsnaam, domein, snippet, contactNaam, contactFunctie, contactEmail, contactTelefoon, notities, status-historie | `localStorage` onbeperkt |
| Chatbot (inkomend) | naam, email, telefoon, bedrijf, dienst, locatie, gespreksgeschiedenis | `localStorage` bezoeker + Formspree-mail |
| Contactformulier (inkomend) | naam, bedrijf, email, type-dienst, omschrijving | Formspree-mail |
| Mailscanner | afzender, onderwerp, bedragen, PDF-bijlagen (facturen) | jsonfile + `localStorage` |
| Klok/uren | datum, starttijd, eindtijd, opdrachtgever | `localStorage` + Cloudflare KV |

**Observaties:**
- **Geen bewaartermijn vastgelegd** voor leads, chatbot-leads of scannerresultaten.
- **Notities per lead** (dashboard.html:2403) kunnen vrije-vorm persoonlijke informatie bevatten — hogere risicocategorie.
- **Chatbot bewaart gespreksgeschiedenis** in bezoekersbrowser én stuurt samenvatting naar Formspree (uitbesteding) — moet in privacyverklaring.
- **Mailscanner heeft toegang tot IMAP** (Gmail + Hostnet). Dat is een zeer ruime scope. Er is geen scheiding tussen zakelijke en privé-mail (`jwz.jjm@gmail.com` is privé). De scanner leest dus **alle** mails, niet alleen zakelijke. Zeer breed datapersoonsinvasie, tenzij de scanner de output goed filtert — wat hij doet via `altijd_negeren`, maar niet waterdicht.
- **`localStorage` is client-side**, maar wordt bij sync via Cloudflare Worker ook in KV opgeslagen voor uren. Leads staan alleen lokaal → data-portabiliteit is niet geïmplementeerd (inzageverzoeken zouden niet eenvoudig te beantwoorden zijn).

## 4. LinkedIn — wat mag wel/niet?

LinkedIn's User Agreement verbiedt expliciet ([LinkedIn User Agreement](https://www.linkedin.com/legal/user-agreement)):

- **Section 8.2 Don't #2**: *"Develop, support or use software, devices, scripts, robots or any other means or processes (such as crawlers, browser plugins and add-ons or any other technology) to scrape or copy the Services"*
- **Section 8.2 Don't #13**: *"Use bots or other unauthorized automated methods to access the Services, add or download contacts, send or redirect messages, create, comment on, like, share, or re-share posts"*

Gevolg:
- **Scraping van LinkedIn is verboden** per ToS, ook al is het in de VS civielrechtelijk (hiQ-zaak) niet automatisch strafbaar. [Nubela](https://nubela.co/blog/is-scraping-linkedin-legal-in-2026/).
- **Bulk-automatisering van berichten/connectieverzoeken** schendt ToS — kan leiden tot account-restrictie of -ban.
- **Browser-extensies voor automation** (Dux-Soup, Waalaxy) — LinkedIn heeft in maart 2025 een campagne gedaan tegen Apollo.io en Seamless.ai extensies.

**Praktische interpretatie voor JM Mechanica:**
- Manueel LinkedIn gebruiken (ook bellen-zoekopdrachten, connectieverzoeken met gepersonaliseerde tekst) is toegestaan en normaal.
- Via Sales Navigator-abonnement is uitgebreider zoeken binnen ToS legitiem.
- Automatiseren van LinkedIn-outreach of berichten met een tool = risico op ban. Zeer af te raden voor een eenmanszaak waarvoor het LinkedIn-profiel een marketingkanaal is.

## 5. KvK Handelsregister — commerciële benadering

### 5.1 Openbaarheid
Het Handelsregister is openbaar. Adresgegevens van bedrijven zijn vrij opvraagbaar via KvK-uittreksel (€3,65/stuk) of de betaalde KvK Dataservice / Open Data API (gratis basisniveau, betaalde upgrade). [KvK Over het Handelsregister](https://www.kvk.nl/over-het-handelsregister/).

### 5.2 Beperkingen op commercieel gebruik
- **NMI moet gerespecteerd worden**. Adressen met Non-Mailing Indicator mogen niet gebruikt worden voor reclame.
- **Woonadressen van eenmanszaken** zijn sinds 2022 standaard afgeschermd voor het publieke domein. Je kunt dit niet omzeilen.
- **Bulk-adressenbestanden** waren tot 2022 makkelijk beschikbaar; nu zijn die voor reclamedoeleinden niet meer leverbaar, enkel voor selecte doeleinden.

### 5.3 Adressenbestanden-bestelservice
De KvK levert bedrijfsadressenbestanden **niet meer voor reclamedoeleinden** sinds de wetswijziging die volgde op klachten over agressieve commerciële benadering. Adressenbestanden zijn wel beschikbaar voor andere doeleinden (marktonderzoek, beleid, wetenschap) — maar niet om koude cold-mail campagnes te voeden.

### 5.4 KvK Open Data API
De [Handelsregister Zoeken API](https://developers.kvk.nl/) is gratis basaal (100 calls/dag op dev-key) en levert rechtsvorm, SBI, adres, handelsnaam. **Wel gebruik voor B2B-research toegestaan**, maar het doel moet gerechtvaardigd blijven (AVG grondslag).

Voor JM Mechanica: gebruiken van deze API voor verrijking van leads (rechtsvorm check, SBI-filter) is op zich toegestaan en juridisch gezonder dan alleen Google-zoekresultaten gebruiken — *mits* de NMI niet wordt genegeerd en de benadering zelf aan Tw 11.7 voldoet.

## 6. Audit van huidige code — compliance-gaten

Concreet per module:

### 6.1 `dashboard.html` — Leads + e-mail-generator

| # | Regel | Gat | Risico |
|---|---|---|---|
| G1 | `genereerEmail()` (2219-2258) | **Geen opt-out link/tekst** | Tw 11.7 overtreding bij elke verzonden mail |
| G2 | `genereerEmail()` | Geen privacyverklaring-verwijzing | AVG-transparantie-gat |
| G3 | `leadData` in localStorage | **Geen bewaartermijn** | AVG art 5 overtreding |
| G4 | Lead-agent | Geen rechtsvorm-check (BV vs eenmanszaak) | Tw 11.7 overtreding bij eenmanszaken |
| G5 | Lead-agent | Geen NMI-check | Tw 11.7 overtreding |
| G6 | Notitieveld per lead (2403) | Vrije tekst, persoonsgegevens mogelijk | Doelbinding mogelijk overschreden |
| G7 | `slaContactOp()` | Geen logging van grondslag/bron/datum verzameling | AVG art 5 (verantwoordingsplicht) |
| G8 | `laadVanGoogleDrive()` etc. | Uploads bevatten PDF's met facturen → persoonsgegevens | Google Drive-verwerker (verwerkersovereenkomst aanbevolen) |

### 6.2 `index.html` + `chatbot.js` — publiek

| # | Regel | Gat | Risico |
|---|---|---|---|
| G9 | Geen privacyverklaring op site | `privacy` staat nergens in html/sitemap/robots | AVG-transparantie-gat |
| G10 | Formspree-verwerker | Geen vermelding van doorgifte aan Formspree (V.S. bedrijf) | AVG art 13/14 gat + mogelijk art 44-49 (doorgifte buiten EER) |
| G11 | `chatbot.js:166` schrijft naar `localStorage.jm_leads` van bezoeker | Bezoeker weet niet dat gesprek opgeslagen wordt | AVG-transparantie-gat |
| G12 | Geen cookiebanner | Niet strikt nodig als geen tracking-cookies | Laag risico, wel checken: Tailwind CDN, Formspree? |
| G13 | Contactformulier heeft honeypot `_gotcha` maar geen checkbox/akkoord met privacyverklaring | Art 6 grondslag onduidelijk | AVG-grondslag gat |

### 6.3 `jm_email_scanner.py` + GitHub Action

| # | Regel | Gat | Risico |
|---|---|---|---|
| G14 | Scanner leest ALLE mails uit Gmail + Hostnet (IMAP ALL search, r.396-398) | Inclusief privé-mail `jwz.jjm@gmail.com` | Zakelijke/privé scheiding ontbreekt; GDPR doelbinding |
| G15 | Bedragen + afzenderinfo worden gecommit naar publiek git repo via GitHub Action | `jm_scan_resultaat.json` is publiek | **Bedrijfsgevoelige financiële data is publiek leesbaar** |
| G16 | `~/Desktop/JM/jm_config.json` bevat plaintext IMAP-wachtwoorden | Lokale schijf | Security-risico bij backup/sync |
| G17 | `JM_CONFIG_JSON` GitHub Secret bevat wachtwoorden | Acceptabel, maar als Secret lekt → IMAP-toegang | Security + privacy |

### 6.4 `worker/index.js`

| # | Regel | Gat | Risico |
|---|---|---|---|
| G18 | Session tokens in KV | TTL 7 dagen — OK | Acceptabel |
| G19 | PIN-only voor `/sync` (uren) | Geen rate-limiting | Brute-force mogelijk |
| G20 | CORS-configuratie laat `localhost:3000` toe altijd | Dev-hole in productie | Laag security-risico |

### 6.5 `worker/DEPLOY.md`
- **G21**: bevat een gecommitteerde Google API key `AIzaSyAM48uGnbdjMn4unW6R4EVC8ueDcEDHLCM` (r.19) in plaintext. Moet **geroteerd** worden bij Google Cloud. De key staat nu in git history, zelfs als je het bestand nu schoonmaakt.

## 7. Specifiek risico `jm_scan_resultaat.json` in publiek repo

Dit is een **belangrijk punt**.

Op dit moment commit de GitHub Action elke dag een bestand met:
- Afzendernamen (Certos, Alicia, Ziggo, etc.)
- Bedragen tot op de cent (zie r.14: `€ 2.058,36`)
- Datums van facturen
- Onderwerpen van mails

Dit staat openbaar op github.com/jairmercelino/JM-Mechanica/blob/main/jm_scan_resultaat.json en wordt automatisch door zoekmachines geïndexeerd (behalve via `robots.txt Disallow: /jm_scan_resultaat.json` — maar dat werkt alleen voor jmmechanica.nl, niet voor GitHub).

**Implicaties**:
- Concurrenten kunnen zien hoeveel JM Mechanica factureert bij Certos.
- Leveranciers kunnen zien welke software/gereedschap gekocht wordt.
- Google/Bing indexeren GitHub-repo's standaard.
- Dit is **commercieel gevoelige informatie** die ongewild extern leesbaar is.

**Aanbeveling**: óf `jm_scan_resultaat.json` in `.gitignore` en cross-device-sync via een private bucket, óf het resultaat encrypten voor commit (minder praktisch).

## 8. Minimale eisen voor compliance — "wat moet in de code"

Wat technisch in de code moet zitten om juridisch verdedigbaar te zijn:

### 8.1 Voor elk uitgaand bericht (lead-mail)
- [ ] Afzenderidentificatie: naam + bedrijf + contact. **Nu OK**.
- [ ] Eenvoudige opt-out: een zin als *"Geen interesse? Laat het me weten, dan staak ik het contact."* of een link/e-mail voor afmelding. **Nu ontbreekt**.
- [ ] Link naar privacyverklaring. **Nu ontbreekt** (verklaring zelf ontbreekt ook).
- [ ] Logging per mail: wanneer verstuurd, op welke grondslag, door wie. **Nu ontbreekt**.

### 8.2 Voor de lead-verzameling
- [ ] Bron per lead registreren (welke zoekquery, welke datum, of handmatig). **Nu bijna OK**: `bronQuery` en `datum` zijn er, maar geen AVG-grondslag-veld.
- [ ] Rechtsvorm-check voor verzending (BV/NV vs natuurlijk persoon). **Nu ontbreekt**.
- [ ] NMI-check (als KvK-data gebruikt wordt). **Nu ontbreekt; ook niet relevant zolang geen KvK-data**.
- [ ] Opt-out/blacklist-register: wie heeft afgemeld? **Nu ontbreekt**.
- [ ] Bewaartermijn-hook: automatische verwijdering na N jaar of na opt-out. **Nu ontbreekt**.

### 8.3 Voor de publieke site
- [ ] Privacyverklaring op dedicated pagina met cookies/formspree/chatbot uitleg. **Nu ontbreekt**.
- [ ] Checkbox in contactformulier: *"Ik ga akkoord met verwerking conform [privacyverklaring]"*. **Nu ontbreekt**.
- [ ] Chatbot-opening-zin met korte mededeling over opslag gespreksgeschiedenis. **Nu ontbreekt**.
- [ ] Verwerkersovereenkomst met Formspree (of overstappen naar EU-provider als die geen DPA biedt). **Nu onbekend**.

### 8.4 Voor de scanner
- [ ] Verwerkingsdoel beperken: alleen facturen (of herkenbare patronen) loggen, niet alle afzenders. **Gedeeltelijk aanwezig via `altijd_negeren`**.
- [ ] Persoonsgegevens in output beperken of anonimiseren. **Nu geen filter — namen van opdrachtgevers staan erin**.
- [ ] Output **niet in publiek repo** committen. **Op dit moment wel publiek** → belangrijkste actie.

### 8.5 Voor data-opslag
- [ ] Bewaartermijnen per categorie data documenteren.
- [ ] Recht-op-inzage-/-verwijderings-flow (kan handmatig als de volume klein is).
- [ ] Data-breach-procedure kort beschreven (wat als KV wordt gelekt? wat als `localStorage` via backup gelekt wordt?).

## 9. Ethiek — een ondergrens

Naast het juridische is er een ethisch minimum dat niet in wetsartikelen staat:

- **Volume-matiging**: als Jair per dag 50+ mails stuurt wordt dat spam ongeacht de juridische uitzonderingen — Google/Outlook-spam-filters gaan dan triggeren. Ethisch: max 5-15 mails per dag, gericht op best passende bedrijven.
- **Relevantie**: een mail naar een consumentgerichte bakkerij-keten waar jouw storingsdienst niet relevant is, is ook voor de ontvanger een irritatie. De "relevantie-gat" uit Fase 2 heeft dus niet alleen effect op conversion, maar ook op gezondheid van deliverability + reputatie.
- **Respect voor eerdere afwijzing**: als iemand afwijst, mag je bedrijf 2 jaar later niet opnieuw benaderd worden met hetzelfde voorstel — ethisch. Blacklist per domein + per contactpersoon.
- **Transparantie van AI-gebruik**: als in de toekomst LLM's worden ingezet om mails te schrijven per lead, is het netjes (en in sommige jurisdicties mogelijk verplicht) om dat in de mail te vermelden of in elk geval niet te doen alsof het handgeschreven was.

## 10. Samenvatting — top 5 handhavingsrisico's + prioriteit

| # | Risico | Kans op handhaving | Prioriteit |
|---|---|---|---|
| P1 | **Geen opt-out in lead-mails** → Tw 11.7 | Middel (ACM klacht mogelijk) | Hoog — simpel te fixen |
| P2 | **Geen privacyverklaring op site** → AVG | Laag-middel (AP, bij klacht) | Hoog — simpel te fixen |
| P3 | **`jm_scan_resultaat.json` publiek** → commerciële schade + mogelijk AVG-lek | Hoog (discovery door derden) | Direct fixen |
| P4 | **Google API key in git history** (G21) | Laag (alleen misbruik als key nog werkt) | Roteren, niet herhalen |
| P5 | **Eenmanszaken in cold-mail zonder opt-in** → Tw 11.7 | Middel (ACM) | Middel — via KvK-check te voorkomen |

Deze vijf zijn de directe actiepunten die in Fase 6 concreet worden opgenomen. Alle andere G#-punten uit §6 zijn secundair of pas relevant bij groei/uitbreiding.

## 11. Verwijzingen (bronnen)

- [ACM — Spam voorkomen in uw reclame](https://www.acm.nl/nl/verkoop-aan-consumenten/reclame-en-verleiden/spam-voorkomen-uw-reclame)
- [ACM — Spam (zakelijk)](https://www.acm.nl/nl/telecom/zakelijk-abonnement-voor-bellen-en-internet/spam)
- [Rijksoverheid — Wat kan ik doen tegen spam](https://www.rijksoverheid.nl/onderwerpen/telecommunicatie/vraag-en-antwoord/wat-doen-tegen-spam)
- [DDMA — GDPR mythes B2B marketing](https://ddma.nl/kennisbank/gdpr-de-4-grootste-mythes-over-dataverwerking-in-b2b-marketing/)
- [Legalz — Einde soft opt-in per 1 juli 2026](https://www.legalz.nl/blog/telemarketing-het-einde-van-de-soft-opt-in-per-1-juli-2026)
- [DMCC — Wetswijziging opt-in telemarketing](https://dmcc.nl/nieuws/update-dmcc-legt-uit-wetswijziging-opt-in-telemarketing/)
- [KvK — Non-Mailing-Indicator](https://www.kvk.nl/over-het-handelsregister/de-non-mailing-indicator/)
- [KvK — Minder ongewenste reclame](https://www.kvk.nl/over-het-handelsregister/hoe-beperk-je-ongewenste-commerciele-benadering/)
- [LinkedIn User Agreement](https://www.linkedin.com/legal/user-agreement)
- [LinkedIn Prohibited software and extensions](https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions)
- [Nubela — Is Scraping LinkedIn Legal in 2026](https://nubela.co/blog/is-scraping-linkedin-legal-in-2026/)
- [ICTRecht — Is opt-in nodig voor nieuwsbrief aan klanten](https://www.ictrecht.nl/blog/is-opt-in-nodig-voor-een-nieuwsbrief-aan-klanten)
