# Fase 7 — Zelf-review

*Doel: eerlijk teruglezen wat ik in Fase 1-6 geschreven heb, dingen corrigeren of nuanceren die te stellig of onvolledig waren, en toetsen of de voorstellen passen bij een eenmanszaak.*

## 1. Herzien: claims die ik te stellig maakte

### 1.1 Serper.dev-quota (correctie doorgevoerd)
**Oorspronkelijk**: ik schreef in Fase 1 §5 en Fase 2 §4.7 dat Serper een "gratis tier ~2500/maand" heeft.

**Waar**: de Serper gratis tier is een **eenmalige** grant van 2500 credits, geldig 6 maanden, geen maandelijks quotum. Bij intensief gebruik (~10+ zoekacties per dag) raakt die binnen enkele maanden op. Daarna kost een betaald pakket minimaal $50 voor 50k credits.

**Betekenis voor JM**: Fase 2's redenering "ruim binnen quota" bleef overeind bij 1-2 zoekacties per dag. Bij 10+ zoekacties per dag heb je binnen ~8 maanden betaald abonnement nodig. Ook: de "Auto-scan"-achtige uitbreiding uit Fase 6 B3 (wekelijkse vacature-check per lead) consumeert actief credits — bij 50 leads × 52 weken = 2600 credits/jr voor alleen dat signaal. Past net in het gratis pakket, maar marginaal.

**Actie**: Fase 1 en Fase 2 gecorrigeerd (zie commit).

### 1.2 Tw 11.7 en B2B e-mail (nuance doorgevoerd)
**Oorspronkelijk**: ik stelde in Fase 4 §2.2 dat e-mail naar rechtspersonen (BV/NV) zonder opt-in is toegestaan als het `info@`-adres publiekelijk bekend is. Dat was iets te stellig.

**Wat klopt**: Art 11.7 lid 2 Tw richt zich letterlijk op "abonnees die natuurlijke personen zijn" — rechtspersonen vallen daar niet onder. Dus de opt-in-regel geldt niet rechtstreeks voor rechtspersonen. Per bericht moet de afmeldmogelijkheid wél aanwezig zijn (lid 5).

**Wat grijs is**: ACM en DDMA-richtlijnen voegen de voorwaarde toe dat het adres publiekelijk bekend gemaakt moet zijn en expliciet gekoppeld aan de mededeling dat het voor reclame mag worden gebruikt. Dat staat niet letterlijk in de wet voor e-mail, wel voor telemarketing (sinds 2021). In een handhavingszaak kan ACM op die interpretatie terugvallen.

**Praktisch**: `info@bedrijf.nl` mailen met afmeldmogelijkheid is redelijk veilig. `jan@bedrijf.nl` mailen zonder dat die persoon dat adres gepubliceerd heeft voor marketing, is risicovoller.

**Actie**: Fase 4 §2.2 herschreven met grijs-gebied-nuance.

### 1.3 Open/reply-rate voorspellingen in Fase 6 B4
**Oorspronkelijk**: ik stelde dat LLM-gegenereerde mails "open rate 2-3x" en "reply rate 2-3x" kunnen geven.

**Waar**: dit zijn claims uit Lemlist-marketing-case-studies. Ze betreffen meestal verkoop-specifieke campagnes, niet eenmanszaak-monteurs met industrieprospects. Eerlijker framing: "potentieel hoger, meet je eigen resultaat".

**Actie**: Fase 6 B4 herformuleerd.

### 1.4 Werkschattingen in Fase 6
**Waar**: de inschattingen zijn **ranges** (bijv. 1,5-2 dagen). Voor iemand met weinig ervaring met KvK-API of LLM-prompts kan de bovenkant 2-3x tegenvallen. Voor iemand met veel frontend/API-ervaring is de onderkant realistisch.

**Actie**: ik heb het globaal correct gekaderd onder "Totaal werkschatting" — 90-130 uur is eerlijk. In Fase 7 expliciet benoemen: **neem de bovenkant van elke inschatting als realistische eerste gok**.

## 2. Herzien: aannames waar ik te ver doorging

### 2.1 Gebruik van het dashboard
In Fase 3 §0 markeerde ik expliciet dat ik niet weet of het lead-dashboard écht gebruikt wordt. Dit blijft een kernvraag. Zonder antwoord daarop is de hele Fase 6-B-sectie mogelijk overengineering.

Als het dashboard nu nauwelijks wordt gebruikt en de feitelijke acquisitie via LinkedIn/telefoon/netwerk gaat, dan:
- Fase 6 A-items zijn nog steeds nuttig (compliance is compliance).
- Fase 6 B-items renderen minder waarde en zouden pas na bevestiging "ja, dit ga ik actief gebruiken" moeten.
- Strategisch belangrijker: **eerst vaststellen of het lead-systeem überhaupt de juiste vorm van acquisitie is voor JM Mechanica**, voordat je het verder bouwt.

### 2.2 Formspree DPA + routing
Nog steeds onbevestigd of Formspree automatisch naar `info@jmmechanica.nl` stuurt. Niet geverifieerd in het repo. Fase 1 en Fase 4 markeerden dit wel als aanname. Actie: in deze review herhaald.

### 2.3 iCloud map "Jaarcijfers JM Mechanica 2022-2025"
Niet geopend. Geen code dus niet direct relevant. Wel potentieel gevoelig (bedrijfsdata op iCloud = V.S. cloud storage, GDPR-aanknopingspunt). Niet in scope van deze analyse, maar het bestaan is genoemd in Fase 1 §1.

### 2.4 Geen end-to-end test uitgevoerd
Ik heb niet:
- De Worker daadwerkelijk aangeroepen met een echte query.
- De GitHub Action handmatig laten draaien.
- Het dashboard op een nieuw apparaat getest.
- Een Serper-credits-check gedaan.
- Formspree-submissions gecheckt.

Deze zijn technisch haalbaar maar kostten tijd. Het merendeel van de code-observaties is correct uit de broncode af te leiden, maar de **feitelijke gedrag** van het live systeem zou nog bevestiging verdienen. Aanbeveling in Fase 6 heeft hier niet direct op gewezen.

## 3. Juridische houdbaarheid — extra toets

### 3.1 "Zijn de voorstellen uit Fase 6 juridisch houdbaar in NL?"

Ga ik per acquisitie-voorstel langs:

| Voorstel | Juridisch houdbaar? | Opmerking |
|---|---|---|
| A3 Opt-out in elke mail | Ja | Verplicht onder Tw 11.7 lid 5 |
| A4 Privacyverklaring | Ja | Verplicht onder AVG art 13/14 |
| A5 Akkoord-checkbox | Ja | Helpt grondslag vastleggen |
| B1 KvK-verrijking | **Ja, mits** NMI gerespecteerd + doelbinding + privacyverklaring vermeldt dit | — |
| B2 Contactheuristiek `info@`, `sales@` | Grijs. Voor BV's mogelijk OK met afmelding. Voor personen-mails (`jan@`) risicovoller | Fase 4 §2.2 nuance |
| B2 Hunter.io | **Let op**: Hunter.io is V.S. verwerker. Vereist DPA + vermelding in privacyverklaring + rechtsgrondslag. Hunter biedt EU-DPA. | Check hun compliance-pagina |
| B3 Vacature-scraper | **Mogelijk niet** als Indeed/LinkedIn direct gescraped worden. Via Serper → via Google SERP = indirect, acceptabeler | Vermijd direct LinkedIn-scraping |
| B4 LLM-mail | Ja, mits: content handmatig gereviewd, LLM-provider in privacyverklaring, geen persoonsgegevens van derde in prompt zonder grondslag | OpenAI heeft EU-DPA |
| B5 Opt-out register | Ja | Helpt juist compliance |
| B6 Conversie-learning | Ja | Geen externe verwerking |
| B7 Reply-detectie IMAP | Ja | Eigen mailbox, eigen gegevens |
| C3 Visitor-identification | **Grijs**. IP's zijn persoonsgegevens. Heldere grondslag + privacyverklaring nodig. Dealfront claimt GDPR-safe maar dat is hun constructie. | Voor eenmanszaak: laat deze eerst liggen tot compliance-basis solide is |

**Kritieke nuance**: de kwalificatie "juridisch houdbaar" hangt af van hoe het uitgevoerd wordt, niet alleen van het voorstel. Voorbeeld: B4 LLM-mail zonder handmatige review kan zomaar hallucinaties bevatten die feitelijk onjuiste claims maken — dan is niet meer AVG de grootste zorg maar aansprakelijkheid/reputatie.

### 3.2 De mogelijk zwakste juridische schakel in het totaalpakket
**Geautomatiseerde koude e-mail op basis van scraping** — ook al gaat het via Serper (= Google organic) en niet direct op scraping: de inhoud die je verzamelt is persoonsgegevens-die-publiek-staan-maar-niet-voor-deze-doel-zijn-vrijgegeven. Dat is wat AP in theorie kan aankaarten. In de praktijk zijn handhavingszaken tegen kleine ondernemers zeer zeldzaam — maar niet onmogelijk.

## 4. ZZP-fit — passen de voorstellen bij tijd + geld van één persoon?

### 4.1 Geld
| Voorstel | Vaste kosten/mnd | Eenmalig |
|---|---|---|
| A-items (alle) | €0 | 0 |
| B1 KvK dev-key | €0 (gratis dev) | 0 |
| B2 Hunter.io | €0-30 | 0 |
| B3 Vacature-scraper | €0 (binnen bestaande Serper) | 0 |
| B4 LLM OpenAI/Claude | €1-5 bij 10 mails/week | 0 |
| C2 Moneybird | Al actief | 0 |
| C3 Visitor-identification | €0-10 (IP2Location gratis tier) | 0 |
| C4 Calendly | €0 (gratis tier) | 0 |

**Totaal extra kosten voor volledige uitvoering: €5-50/mnd.** Past bij ZZP.

Maar: als vaste acquisitie-uitgaven €500/mnd zouden moeten opleveren om rationeel te zijn, dan moet de verbetering leiden tot ≥ 1 extra klant-uur per maand buiten wat er nu binnenkomt. Dat is een realistische drempel.

### 4.2 Tijd
Totaal 90-130 uur (Fase 6). Voor een eenmanszaak dat primair monteurswerk levert:
- **1-2 uur per week** aan eigen tooling = 12-24 maanden doorlooptijd. Risico: tegen die tijd is de context veranderd.
- **1 dag per week** (sprint-modus) = 3-5 maanden. Gezonder tempo maar vereist dat Jair een dag niet in de werkplaats is.

Realistisch advies:
- **Sectie A** (~14u): in één week sprinten.
- **Sectie B**: 1-2 items per maand oppakken, in evenementen van 4-8u.
- **Sectie C**: pas nadat A+B-effect is gemeten; niet zomaar alles bouwen.

### 4.3 Kennis
Sommige voorstellen vereisen kennis die een allround monteur niet per se heeft:
- **LLM-prompt-engineering** (B4): basiskennis volstaat maar iteratie is nodig.
- **Worker-programming** (B1, B8, C5): JM Mechanica heeft al een Worker, dus de basis is er. Nieuwe endpoints toevoegen is een refactor, geen greenfield.
- **KvK-API authenticatie** (B1): standaard OAuth/key — geen obstakel.
- **IMAP-handling** (B7): gedeeld met bestaande scanner — kennis beschikbaar.

Geen van de voorstellen vereist technologie die vreemd is aan het bestaande systeem. Dat is goed — **het plan zit binnen de comfort-zone van de bestaande stack**.

### 4.4 Onderhoud
Elk nieuw voorstel is ook onderhoudslast:
- B1 KvK-verrijking — API-changes elk jaar mogelijk.
- B3 Vacature-scraper — Google kan anti-scraping aanscherpen.
- B4 LLM-mail — modelversie-changes, prompt-drift.
- C3 Visitor-identification — IP-databases verouderen snel.

Voor elk nieuw component: ~0,5-1u/mnd aan "onverwacht gebroken" risico. Bij 5 nieuwe components = 2,5-5u/mnd onderhoud. **Beheersbaar maar niet gratis**.

## 5. Waar ik vaag bleef — expliciet

Dingen die ik niet gekwantificeerd heb maar wel had moeten:

- **Huidig aantal leads in systeem**: niet gemeten (zou via `localStorage` moeten).
- **Huidige conversieratio nieuw → klant**: niet gemeten.
- **Huidige reply rate op koude mails**: niet gemeten.
- **Huidig aantal chatbot-conversaties per maand**: niet gemeten.
- **Huidig aantal Formspree-submissions per maand**: niet gemeten.
- **Hoeveel tijd Jair nu per week aan acquisitie besteed**: niet gemeten.

Zonder baselines zijn doelen zoals "open rate +30%" niet te toetsen. Dit is het eerste wat in een meetdag moet gebeuren vóór grote veranderingen.

## 6. Wat ik **niet** heb geraadpleegd (eerlijk)

- **Jair zelf** — behalve de startchat. Veel aannames zouden in één gesprek te bevestigen of ontkrachten zijn.
- **De git-history beyond de laatste ~10 commits** — oude ontwerpbeslissingen blijven onzichtbaar.
- **Formspree-dashboard** — om submission-stroom te zien.
- **Serper-dashboard** — om huidig verbruik te zien.
- **Live dashboard-localStorage dump** — om werkelijke leads te zien.
- **Bestaande commerciële offertes / mailwissels met Certos** — context voor wat "goede" acquisitie eruit ziet.

Deze data zou sommige conclusies aanscherpen. De analyse is daarom een **redelijke-eerste-benadering** — niet het laatste woord.

## 7. Versterking samenvatting: wat ik overeind laat na review

Na alle nuances, deze hoofdclaims blijven overeind:

1. **Het systeem is architectonisch gezond maar compliance-zwak**. Fase 1 en Fase 4 samen: de techniek werkt, de juridische randvoorwaarden staan niet op orde.
2. **De bedrijvenzoeker is volume-gelimiteerd door eigen queries** — niet door API's. Verbetering zit in relevantie, niet in hoger volume.
3. **Het acquisitie-proces is 70% tijd buiten het systeem** (contact zoeken, mail plakken). Automatisering hier heeft de grootste hefboom.
4. **De leer-lus is oppervlakkig** (alleen like/dislike, geen conversie-signalen).
5. **Het systeem weet niets van rechtsvorm / branche / intent** — drie toevoegingen die concreet via KvK-API op te lossen zijn.

Elk van deze punten is een stelling waarvan ik kan aangeven met welke code-observatie het gesubstantieerd is.

## 8. Prioriteit-check van Fase 6

Zou ik, nadat ik alles heb teruggelezen, de prioriteit in Fase 6 herzien?

Ja, één kleine wijziging: **A1 (scanner-data eraf)** zou ik nu iets minder hoog prioriteren dan ik deed. De data staat al sinds april 2026 publiek; verdere commits stoppen is belangrijk, maar het is geen ramp-situatie. **A2-A4 (compliance voor nieuwe verzendingen)** zou ik éérder willen — elke dag dat de acquisitie-mail zonder opt-out/privacy wordt verstuurd is een nieuw compliance-gat.

Voorgestelde nieuwe volgorde voor week 1:
1. A3 opt-out in mails (30 min — halt bij de poort)
2. A4 privacyverklaring (2-3u)
3. A5 akkoord-checkbox (30 min)
4. A1 scanner-output uit nieuwe commits (2-4u)
5. A2 Google key roteren (1u)
6. A6, A7 (hygiene)
7. A9 Formspree DPA
8. A8 chatbot naar dashboard (groter stuk, kan naar begin week 2)

Dit zet compliance-bij-verzending vóór compliance-in-history. Rationeel.

## 9. Tevredenheidscheck

Op schaal 1-10 — hoe tevreden ben ik over de verschillende fases?

| Fase | Score | Waarom |
|---|---|---|
| 1 Huidige staat | 8 | Grondig, met regelnummers, wel: één quota-fout (gecorrigeerd) |
| 2 Bedrijvenzoeker | 9 | Sterk; alle zwaktes onderbouwd |
| 3 Acquisitie-flow | 7 | Veel aannames gemarkeerd, maar daardoor voorspellend zwak |
| 4 Juridisch | 7 | Goed onderbouwd met bronnen, was iets te stellig bij rechtspersonen (gecorrigeerd) |
| 5 Vergelijking | 8 | Concreet over patronen, kostenaannames voorzichtig |
| 6 Verbeterplan | 7 | Praktisch maar ambitieus; mogelijk overengineered voor eenmanszaak |
| 7 Zelf-review | ?? | Nu |

De zwakste is Fase 3 omdat die leunt op aannames over feitelijk gebruik die niet te verifiëren zijn zonder Jair te spreken.

## 10. Aanbevolen volgende stap voor Jair (1 zin)

Lees `00-samenvatting.md` in 2 minuten; kies dan of je de week-1 compliance-sprint start of eerst wilt afstemmen op onduidelijke punten (met name of je het lead-dashboard actief gebruikt).
