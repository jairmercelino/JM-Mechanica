# Samenvatting — analyse JM Mechanica eenmanszaak-systeem

*Lees-tijd: 2 minuten. Volledige analyse in fase-documenten 01-07.*

## Wat staat er nu

Een static site + dashboard op GitHub Pages, één Cloudflare Worker als backend-proxy, een Python e-mailscanner als GitHub Action, en een publieke chatbot. Dashboard is PWA, uren worden gesynchroniseerd via KV-storage, leads bestaan alleen in één browser. Facturen komen dagelijks binnen via scanner → commit → site. Techniek werkt, login-bug en scroll-bug vandaag gefixed.

## De drie grootste problemen

1. **Compliance-gaten bij cold outreach**. Elke verstuurde lead-mail mist wettelijk verplichte opt-out (Tw 11.7) en de site mist privacyverklaring (AVG art 13). Risico is klein qua handhaving maar reëel — en de fix is twee uur werk.
2. **De bedrijvenzoeker is volume-begrensd door eigen queries**, niet door API's. 25 hardcoded Google-zoektermen + 15 geskipte domeinen = plafond van ~150 leads waarna de pool leeg is. Geen branche/SBI-filtering, geen rechtsvorm-check, vacatures (het sterkste warm signaal) worden actief weggegooid.
3. **70% van de acquisitie-tijd zit buiten het systeem**. Contact zoeken op de bedrijfssite + e-mail plakken in Gmail = 5-10 min per lead. Dat is de grootste hefboom voor automatisering.

## Verrassende bevindingen

- `jm_scan_resultaat.json` staat publiek op GitHub → bedragen van Certos-facturen zijn zoekbaar. Stop met committen (Fase 6 A1).
- Een Google API key (`AIzaSy...`) staat hardcoded in `worker/DEPLOY.md`; git history heeft hem bewaard. Roteren.
- `~/Desktop/JM/jm_config.json` heeft plaintext IMAP-wachtwoorden op lokale schijf. Repo-kopie is schoon (Keychain). Desktop-kopie mag weg.
- Chatbot-conversaties bereiken het dashboard niet — data-silo.
- Eenmanszaken/ZZP'ers zijn juridisch natuurlijke personen → strikt opt-in vereist. De bedrijvenzoeker weet niet welke leads rechtspersonen zijn.

## Wat nu te doen — de volgorde die werkt

**Week 1 — compliance-sprint (~14 uur gespreid):**
- Opt-out in elke lead-mail (30 min).
- Privacyverklaring op site (2-3u).
- Akkoord-checkbox bij contactformulier (30 min).
- Scanner-output uit git commits (2-4u).
- Google API key roteren (1u).
- Mail-Tester eenmalige DNS-check (1u).
- Chatbot-leads naar dashboard (4-6u).

**Week 2-5 — acquisitie-kern:**
- KvK-verrijking (rechtsvorm + SBI) toevoegen aan lead-flow (~2 dagen).
- LLM-gebaseerde personalisatie per lead-mail (~1,5 dag).
- `info@/sales@` contact-heuristiek + optioneel Hunter.io (~1 dag).

**Week 6+ — compliance follow-through + leer-lus:**
- Opt-out register / blacklist (~1 dag).
- Conversie-signalen (klant → query-gewicht) terugvoeden (~2u).
- Eventueel: vacature-signaal en reply-detectie.

**Pas daarna:** unified leads-model, Moneybird-sync, visitor-identification, cross-device sync.

## Wat te laten

- Geen eigen LinkedIn-automation (ToS-ban risico).
- Geen eigen ML-modellen (pre-trained LLM's zijn voldoende).
- Geen A/B test framework (te laag volume).
- Geen CRM-platformvervanging (Moneybird + dashboard volstaan).
- Geen migratie naar React (vanilla JS werkt).

## Kosten na uitvoering

Extra vaste kosten: **€5-50/maand** (OpenAI-credits + optioneel Hunter.io + IP2Location-tier). Past bij eenmanszaak mits het 1 extra klant-uur per maand oplevert.

## Wat ik niet zeker weet

Drie open vragen (zie Fase 3 §0 en Fase 7 §2):
- Gebruik je het lead-dashboard actief of gaat acquisitie vooral via LinkedIn/telefoon/netwerk?
- Stuurt Formspree wel naar `info@jmmechanica.nl`?
- Is er een baseline (reply rate, aantal leads) om tegen te meten?

Als de eerste vraag "nee" is, zijn de Sectie-B-voorstellen mogelijk overengineering. Dan is de actiepunt beperkt tot week 1.

## Totaal werk voor volledige uitvoering

90-130 uur. Bij 1 dag/week: ~3-5 maanden. Bij 1-2u/week: 12-24 maanden. Begin met week 1 en meet daarna.

## Volledige analyse

- [01-huidige-staat.md](01-huidige-staat.md) — architectuur per module
- [02-bedrijvenzoeker.md](02-bedrijvenzoeker.md) — lead-system diepgaand
- [03-acquisitie-flow.md](03-acquisitie-flow.md) — bottleneck-analyse
- [04-juridisch.md](04-juridisch.md) — AVG, Tw 11.7, LinkedIn, KvK
- [05-vergelijking.md](05-vergelijking.md) — Apollo/Cognism/Instantly vs eigen systeem
- [06-verbeterplan.md](06-verbeterplan.md) — concrete items met werk + impact
- [07-zelfreview.md](07-zelfreview.md) — correcties en nuances
