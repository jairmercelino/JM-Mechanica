# Fase 3 — Acquisitie-flow

*Focus: hoe loopt een lead van ontdekking tot klant? Waar zit de bottleneck?*

## 0. Belangrijke aanname vooraf

Ik heb de code geanalyseerd, niet het feitelijke gedrag. In de eerste vraagronde was mijn check-vraag: "gebruik je dit actief?" — die is onbeantwoord gebleven. Daarom schrijf ik deze fase op basis van wat het **systeem toestaat**, niet wat er daadwerkelijk mee gebeurt. Waar ik een aanname doe, markeer ik die expliciet als **[A]**. Als achteraf blijkt dat de flow anders loopt (bijvoorbeeld alles gebeurt via LinkedIn buiten het dashboard om), dan herzie ik dit document.

## 1. De vier inkomende kanalen

Op papier kunnen leads JM Mechanica op vier manieren bereiken:

| # | Kanaal | Wat het systeem doet | Wat komt er uit |
|---|---|---|---|
| 1 | **Contactformulier** `index.html` | POST naar Formspree `mlgoydqr` | E-mail naar `info@jmmechanica.nl` **[A]** |
| 2 | **Chatbot** `chatbot.js` | POST naar zelfde Formspree-endpoint bij score≥1 email/phone | Idem, met gesprekssamenvatting |
| 3 | **Telefoon** `+31 6 29 22 93 95` | n.v.t. (niet in systeem) | Direct gesprek, geen logging |
| 4 | **Mail** `info@jmmechanica.nl` | n.v.t. (buiten systeem) | In Hostnet-inbox, scanner leest 't niet als lead |

### Observatie 1: Formspree is de enige inkomende entry die traceerbaar is.
Alle andere inkomende leads (telefoon, rechtstreekse mail, WhatsApp, LinkedIn-bericht) bestaan alleen in Jair's hoofd of Hostnet-inbox. Er is geen "handmatig inkomende lead" input-veld in het dashboard. De chatbot-generatie van leads wordt tegelijk naar Formspree gestuurd **en** naar `localStorage.jm_leads` in de browser van de bezoeker (`index.html:832`, `chatbot.js:166`) — maar die laatste bereikt Jair niet.

### Observatie 2: inkomende ≠ uitgaande pipeline
De "Leads"-tab in het dashboard bevat **alleen uitgaande prospects** uit de bedrijvenzoeker. Inkomende chatbot/formulier-leads belanden daar niet. Voor inkomende leads is er:
- Een Formspree-mail (zonder opvolgsysteem)
- Geen dashboard-lijst
- Geen herinneringen
- Geen statusflow

Als dus een chatbot-lead niet dezelfde dag wordt teruggebeld, is er niets wat "over 5 dagen nog eens nabellen" signaleert.

## 2. De uitgaande acquisitie-flow (zoals gecodeerd)

Dit is de flow voor koude leads uit de bedrijvenzoeker.

```
  1. Zoek klanten            — gebruiker klikt "Zoek klanten"
     │
     ▼
  2. Agent haalt 10 zoekresultaten op via Serper
     │
     ▼
  3. Filter & dedup           — skip-domeinen, blockedDomains, bestaande
     │
     ▼
  4. Ruwe leads opgeslagen    — status="nieuw"
     │
     ▼
  5. Gebruiker beoordeelt     — like ⭐ / dislike ❌
     │
     ▼
  6. Per lead: klik open      — detail-panel opent
     │
     ▼
  7. Contactgegevens intikken — handmatig: naam, functie, email, tel
     │  (gebruiker moet naar bedrijfssite, zoekt contactpagina, kopieert)
     │
     ▼
  8. E-mail kopiëren          — klembord: "Aan: + Onderwerp: + Body"
     │
     ▼
  9. Plakken in webmail        — buiten systeem (Gmail/Hostnet)
     │
     ▼
 10. Klik "✅ Verstuurd"       — status → "benaderd", datum gezet
     │
     ▼
 11. 5 dagen wachten           — bij tab-bezoek: status → "followup"
     │
     ▼
 12. Follow-up mail genereren  — tweede template, kopiëren, plakken
     │
     ▼
 13. Gebruiker zet status     — handmatig: reactie / afspraak / klant / afgewezen
```

### Stappen 7-9 en 11-12 zijn de bottleneck
Stap 7 (contactinfo zoeken) en stap 9 (plakken in webmail) zijn de tijdrovende, niet-geautomatiseerde momenten. Ruw geschat, per lead:
- Contactpagina vinden + naam + e-mail kopieren: **3-7 minuten** per bedrijf (aanname, hangt af van site-kwaliteit).
- E-mail kopiëren, plakken, versturen: **1-2 minuten**.
- Follow-up 5 dagen later handmatig: **idem, 1-2 minuten**.

Totaal per lead: **5-10 minuten**, waarvan ~70% buiten het systeem (in browser op hun website, in webmail).

Voor 10 leads per week = **50-100 minuten** verspreid, zonder dat het systeem dat helpt te verdelen of meet.

## 3. Bottleneck-analyse per stap

| Stap | Automatisering nu | Frictie | Automatisering mogelijk |
|---|---|---|---|
| 1-4 Lead vinden | Ja (via knop) | Laag | Al OK, wel kwaliteit-bottleneck (zie Fase 2) |
| 5 Beoordelen | UI, like/dislike | Laag | Al OK |
| 6-7 Contact vinden | **Nul** — gebruiker gaat naar de site | **Hoog** | Site-scraping voor `mailto:`, KvK-API voor adres/KvK-nr, Hunter.io / RocketReach voor emails |
| 8 E-mail opstellen | Template (generiek) | Middel | LLM-personalisatie per lead o.b.v. snippet+branche |
| 9 Versturen | **Nul** — plakken in webmail | **Middel** | IMAP/SMTP-send direct, of Gmail-API (oauth) |
| 10 Mark versturen | Knop | Laag | Automatisch bij daadwerkelijk versturen |
| 11 Follow-up detectie | 5 dagen automatisch | Laag | Mogelijk inbox-scan: "heeft dit e-mailadres gereageerd?" |
| 12 Follow-up mail | Template | Middel | LLM-variatie op basis van eerste mail |
| 13 Statusbeheer | Handmatig | Laag | Semi-automatisch uit inbox-monitoring |

**De grootste tijdsinvestering per lead zit in stap 6-7 (contact vinden) en stap 9 (versturen). Die samen zijn >70% van de handmatige tijd.**

## 4. CRM-functionaliteit — wat zit er wel/niet in

### Aanwezig:
- Pipeline met 7 statussen: `nieuw, liked, benaderd, followup, reactie, afspraak, klant` + `afgewezen` (dashboard.html:2182).
- Filter-tabs: alle / interessant / benaderd / pipeline / nieuw / verborgen (`dashboard.html:510-517`).
- Metrics: gevonden, interessant, benaderd, pipeline (`dashboard.html:2409-2416`).
- Follow-up auto-detectie (na 5 dagen `benaderd` → `followup`).
- Notities per lead (textarea).
- Contactvelden per lead.
- Beschikbaarheidsweergave uit rooster (komende 3 weken, `dashboard.html:2174-2178`), automatisch in e-mailtemplate gezet.

### Afwezig:
- **Geen activiteitshistorie per lead**. Je ziet niet "4 apr mail verstuurd, 9 apr follow-up, 11 apr geen reactie". Alleen laatste status en `datumBenaderd`.
- **Geen bijlage-support** — geen visitekaartje, offerte, portfolio-PDF aan e-mailtemplate.
- **Geen e-mailopen-tracking**. Je weet niet of het bericht geopend is.
- **Geen reactie-detectie**. Als klant reageert per e-mail naar `info@jmmechanica.nl`, moet Jair handmatig status `reactie` zetten.
- **Geen reminders/pushes**. Dashboard draait in browser; geen e-mailnotificaties of agenda-events.
- **Geen offertegeneratie** gekoppeld aan `klant`-status.
- **Geen integratie met Moneybird** — als lead → klant wordt, dan moet Jair de klant apart in Moneybird opvoeren. Dubbel werk.
- **Geen contactpersonen-lijst los van leads** — als dezelfde persoon bij 2 bedrijven werkt, of verhuist, moet je het bij elke lead apart bijhouden.
- **Geen bulk-acties** — elke lead wordt één voor één beoordeeld en beantwoord.

## 5. Leerlus — wat leert het systeem van wat werkt?

Zie ook Fase 2 §2.4. Hier de acquisitie-specifieke kant:

| Signaal | Wordt gebruikt? | Waar? |
|---|---|---|
| Like op lead | Ja | +1 query-score; woorden → `likedKeywords` |
| Dislike op lead | Ja | -1 query-score; 2x → `blockedDomains` |
| Status `benaderd` | Nee | Alleen datumstamp, geen leersignaal |
| Status `reactie` (= de klant antwoordt!) | **Nee** | Belangrijkste warm-signaal wordt niet teruggevoed |
| Status `afspraak` | Nee | Idem |
| Status `klant` (= succes!) | **Nee** | Belangrijkste conversie-signaal wordt niet teruggevoed |
| Dag-van-de-week van versturen | Nee | Niet gelogd |
| Tijdstip versturen | Nee | Niet gelogd |
| Lengte e-mailbody | Nee | Templates zijn vast |
| Branche van bedrijf | Nee | Branche wordt niet vastgelegd |
| Hoelang duurde 'reactie' na 'benaderd' | Nee | Niet gemeten |

Ofwel: **de enige lering komt uit like/dislike op visuele lead-kaarten, niet uit of de benadering daadwerkelijk heeft gewerkt**. Een lead die je vóór verzending liked maar na afwijzing dislikte (= niet geïnteresseerd) scoort nog steeds als "like" bij de query. De hele pipeline voorbij `liked` is voor de agent onzichtbaar.

## 6. Kanaalmix — waar JM Mechanica leads probeert te krijgen

Uit de code en publieke site kan ik de volgende kanalen afleiden:

| Kanaal | Rol nu | Systeem-support |
|---|---|---|
| **SEO** (Google organic voor "monteur Noord-Holland" etc.) | Belangrijkste passief kanaal | Gericht op via meta-tags in `index.html` |
| **Contactformulier** | Inkomende warme leads | Formspree-doorstuur, geen opvolgsysteem |
| **Chatbot** | Inkomende middelwarme leads | Formspree-doorstuur, gesprek gaat verloren |
| **Direct mail (koud)** | Uitgaande koud kanaal | Semi-automatisch via lead-agent |
| **Telefoon koud** | Niet in systeem | Geen scripting, geen belquotum, geen call-log |
| **LinkedIn** | Onbekend **[A]** — waarschijnlijk handmatig | Geen integratie, queries skippen LinkedIn-resultaten |
| **Netwerk/referrals** | Onbekend **[A]** | Alleen `voegHandmatigLeadToe()` |
| **Fysiek langsgaan** | Onbekend **[A]** | Geen systeem-ondersteuning |

**Het systeem dekt dus alleen "inkomend via website (passief)" en "uitgaand koude e-mail (actief)". LinkedIn, telefoon, netwerk en fysiek zijn onzichtbaar voor het systeem.**

## 7. Concrete bottlenecks, gesorteerd op impact

| # | Bottleneck | Kost per lead | Hoe vaak | Jaarlijks kost |
|---|---|---|---|---|
| B1 | Contactgegevens handmatig zoeken op bedrijfssite | ~5 min | elke lead benaderd | aanzienlijk (bij 2/wk ≈ 8 uur/jr, bij 10/wk ≈ 40 uur/jr) |
| B2 | E-mail kopiëren + plakken in webmail | ~1-2 min | elke benaderde lead + elke follow-up | ~12-15 uur/jr bij 5/wk |
| B3 | Follow-up moment onthouden | variabel | elke benaderde lead | gemist gemak; leads die stilvallen |
| B4 | Inkomende reacties handmatig status bijwerken | ~1 min | elke reactie | klein, maar reactie-cijfer onbetrouwbaar |
| B5 | Chatbot-conversatie gaat verloren behalve samenvatting | context-verlies | elke chatbot-lead | warme leads verschralen |
| B6 | Geen templates voor telefonische acquisitie | n.v.t. | elke belpoging | helemaal buiten systeem |
| B7 | Geen koppeling naar Moneybird bij klant-status | ~5 min/klant | elke nieuwe klant | klein maar dubbel administratief werk |

**De belangrijkste quick-win zit in B1 (contact-extractie) en B2 (verzending) — samen goed voor ~80% van de operationele frictie.**

## 8. Eén concrete walk-through

Stel: zondagavond. Jair opent dashboard, klikt "Zoek klanten". De agent vindt 7 nieuwe leads. Jair gaat door de kaarten:

1. Lead 1 (metaalbewerker in Zaandam) — klik ⭐. Titel = "Home | MetaalX BV".
2. Klikt de kaart open. Geen contactnaam, geen e-mail.
3. Opent in nieuw tabblad de bedrijfssite. Gaat naar /contact. Kopieert "info@metaalx.nl" en "afdeling planning".
4. Plakt terug in dashboard contactvelden.
5. E-mailtemplate toont:
   ```
   Beste afdeling planning,
   Ik ben Jair Mercelino van JM Mechanica. [...]
   Ik kwam Home | MetaalX tegen [...]
   ```
   ← "Home | MetaalX" in body is cosmetisch verkeerd.
6. Jair past dat niet aan in de template (er is geen edit-UI). Hij kopieert naar Gmail, past daar handmatig "Home | MetaalX" aan naar "MetaalX" + past de aanhef aan naar "Geachte heer/mevrouw" omdat "afdeling planning" als aanhef vreemd is.
7. Verstuurt vanuit Gmail. Terug in dashboard: klik "✅ Verstuurd". Status = benaderd.
8. Dag 6: Jair opent dashboard, ziet bij deze lead "⚠️ Follow-up!" — klikt "Follow-up mail", kopieert, plakt in Gmail, verstuurt, klikt "✅ Verstuurd" opnieuw.
9. Dag 14: geen reactie gekomen. Jair zet handmatig status "afgewezen" via de pipeline-knoppen. Geen melding "2 weken stil, afwijzen?" — moet zelf gebeuren.
10. Als er wel een reactie was gekomen, zou Jair die in Gmail hebben gezien. Moet dan terug naar dashboard om status "reactie" te zetten. Tot die tijd is de status nog "benaderd" (of is inmiddels "followup" omdat 5-dagen-grens bereikt).

**Dit voorbeeld laat zien: de bottleneck is niet "geen leads vinden" — het is de operationele tijd per lead tussen vinden en verzenden, en het feit dat inkomende reacties buiten het systeem vallen.**

## 9. Samenvatting en voeding voor fase 6

- **Hoogste prioriteit voor verbetering**: B1 (contactverrijking) en B2 (verzend-integratie).
- **Tweede**: leer-lus uitbreiden voorbij like/dislike — de statussen `reactie/afspraak/klant` teruggeven als conversie-signaal.
- **Derde**: inkomende kanalen (chatbot + formulier) integreren in het lead-dashboard, zodat alle leads op één plek zijn.
- **Niet-geautomatiseerde kanalen** (telefoon, LinkedIn, netwerk) uitmaken of ze in scope horen — dat is een strategische vraag, geen technische.

Quantitatief schrappen we in Fase 6 waarschijnlijk 3 stappen van de 13 in de flow door automatisering, wat op **5-10 minuten per lead** scheelt — afhankelijk van volume een significante tijdwinst.

## 10. Aannames expliciet

- **[A1]** Formspree stuurt echt naar `info@jmmechanica.nl` — repo bewijst dit niet, moet in Formspree-dashboard bevestigd.
- **[A2]** Jair gebruikt de Leads-tab actief — niet bevestigd; een deel van deze analyse is hypothetisch indien het feitelijk anders is.
- **[A3]** LinkedIn, bellen en netwerk lopen parallel buiten het systeem — aannemelijk uit afwezigheid van features, niet bevestigd.
- **[A4]** De 5-dagen follow-up grens is bewust gekozen — in NL B2B is 7-10 dagen gebruikelijker, 5 kan snel aanvoelen.
- **[A5]** Inkomende mails vanuit benaderde bedrijven komen in Hostnet-inbox en worden buiten het systeem beantwoord. Niet geverifieerd.
