#!/usr/bin/env python3
"""
JM Mechanica — E-mail scanner met PDF download
Scant beide inboxen, herkent facturen en slaat PDF bijlagen op
in kwartaal mappen op je Mac. Geen handmatig werk nodig.

GEBRUIK:
  Dubbelklik op START_SCANNER.command

INSTALLATIE (eenmalig):
  pip3 install pypdf --break-system-packages
"""

import imaplib
import email
import re
import json
import os
import io
import subprocess
import webbrowser
import shutil
from email.header import decode_header
from datetime import datetime

SCRIPT_MAP    = os.path.dirname(os.path.abspath(__file__))
CONFIG_PAD    = os.path.join(SCRIPT_MAP, 'jm_config.json')
RESULTAAT_PAD = os.path.join(SCRIPT_MAP, 'jm_scan_resultaat.json')
DASHBOARD_PAD = os.path.join(SCRIPT_MAP, 'jm_dashboard.html')
MAPPEN_PAD    = os.path.join(SCRIPT_MAP, 'Facturen')

# ── GITHUB INSTELLINGEN ──
GITHUB_TOKEN = "GITHUB_TOKEN_HIER"
GITHUB_REPO  = "jairmercelino/JM-Mechanica"

FACTUUR_PATRONEN = [
    r'factuur\s*#?\s*\d+', r'invoice\s*#?\s*\d+', r'factuurnummer',
    r'factuurdatum', r'te betalen', r'automatisch afgeschreven',
    r'automatische incasso', r'betaalbevestiging', r'uw factuur',
    r'totaal bedrag', r'totaalbedrag', r'totaal te betalen',
]

BEDRAG_PATRONEN = [
    r'totaal\s+(?:bedrag\s+)?te\s+betalen\s*[:\-]?\s*[€$]?\s*([\d.,]+)',
    r'totaalbedrag\s*[:\-]?\s*[€$]?\s*([\d.,]+)',
    r'in\s+rekening\s+gebracht\s*[:\-]?\s*[€$]?\s*([\d.,]+)',
    r'totaal\s+incl\.?\s*(?:btw)?\s*[:\-]?\s*[€$]?\s*([\d.,]+)',
    r'totaalprijs\s+incl\.?\s*[:\-]?\s*[€$]?\s*([\d.,]+)',
    r'te\s+betalen\s*[:\-]?\s*[€$]?\s*([\d.,]+)',
]

MAAND_MAP = {
    'jan':1,'feb':2,'mar':3,'mrt':3,'apr':4,'may':5,'mei':5,
    'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'okt':10,'nov':11,'dec':12,
    'ja':1,'fe':2,'ma':3,'ap':4,'me':5,'ju':6,'jl':7,'au':8,'se':9,'ok':10,'no':11,'de':12
}


def keychain_wachtwoord(account, service):
    """Haal wachtwoord op uit macOS Keychain."""
    try:
        result = subprocess.run(
            ['security', 'find-generic-password', '-a', account, '-s', service, '-w'],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


def laad_config():
    if not os.path.exists(CONFIG_PAD):
        print(f"FOUT: jm_config.json niet gevonden in {SCRIPT_MAP}")
        exit(1)
    with open(CONFIG_PAD, 'r', encoding='utf-8') as f:
        config = json.load(f)

    # Op macOS: wachtwoorden uit Keychain halen als ze niet in config staan
    is_ci = os.environ.get('CI') == 'true'
    if not is_ci:
        keychain_map = {
            'jwz.jjm@gmail.com': 'jm-scanner-gmail',
            'info@jmmechanica.nl': 'jm-scanner-hostnet',
        }
        for inbox in config.get('inboxen', []):
            service = keychain_map.get(inbox['adres'])
            if service:
                ww = keychain_wachtwoord(inbox['adres'], service)
                if ww:
                    inbox['wachtwoord'] = ww

    return config


def datum_naar_kwartaal(datum_str):
    """Zet datum string om naar (jaar, kwartaal) tuple."""
    if not datum_str:
        return None, None
    jaar_match = re.search(r'\b(20\d{2})\b', datum_str)
    jaar = int(jaar_match.group(1)) if jaar_match else datetime.now().year

    maand = None
    tokens = datum_str.lower().replace(',','').split()
    for token in tokens:
        if token.isdigit(): continue
        if MAAND_MAP.get(token[:3]): maand = MAAND_MAP[token[:3]]; break
        if MAAND_MAP.get(token[:2]): maand = MAAND_MAP[token[:2]]; break

    if not maand:
        return jaar, None

    kw = 1 if maand <= 3 else 2 if maand <= 6 else 3 if maand <= 9 else 4
    return jaar, kw


def maak_map(jaar, kw):
    """Maak kwartaal map aan als die nog niet bestaat."""
    pad = os.path.join(MAPPEN_PAD, f"{jaar} Q{kw}")
    os.makedirs(pad, exist_ok=True)
    return pad


def decode_str(s):
    if s is None: return ""
    try:
        decoded, encoding = decode_header(s)[0]
        if isinstance(decoded, bytes):
            return decoded.decode(encoding or 'utf-8', errors='ignore')
        return str(decoded)
    except: return str(s)


def extraheer_weeknummer(pdf_tekst):
    """Haal weeknummer op uit PDF tekst."""
    if not pdf_tekst:
        return None
    # Zoek patronen zoals "Week 1", "Week 48", "week 1-2", "w48", "CW48"
    patronen = [
        r'week\s*(\d{1,2})',
        r'wk\.?\s*(\d{1,2})',
        r'cw\s*(\d{1,2})',
        r'w\.?\s*(\d{1,2})\b',
        r'week\s*(\d{1,2})\s*(?:t/m|to|-)\s*(\d{1,2})',
    ]
    for patroon in patronen:
        match = re.search(patroon, pdf_tekst.lower())
        if match:
            week = int(match.group(1))
            if 1 <= week <= 53:
                # Check of het een range is (Week 46 t/m 48)
                if match.lastindex >= 2:
                    week2 = int(match.group(2))
                    return f"Week {week}-{week2}"
                return f"Week {week}"
    return None


def extraheer_datum_uit_pdf(pdf_tekst):
    """Haal datum op uit PDF tekst."""
    if not pdf_tekst:
        return None
    # Zoek datum patronen
    patronen = [
        r'(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](20\d{2})',  # 21/01/2026
        r'(20\d{2})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})',  # 2026-01-21
    ]
    for patroon in patronen:
        match = re.search(patroon, pdf_tekst)
        if match:
            return match.group(0).replace('/','-').replace('.','-')
    return None


def maak_bestandsnaam_schoon(naam, afz_naam, datum_str, pdf_tekst=""):
    """Maak een nette bestandsnaam op basis van afzender."""
    afz_lower = afz_naam.lower()
    datum_kort = re.search(r'(\d+)\s+(\w+)\s+(20\d{2})', datum_str)
    datum_tag = datum_kort.group(0).replace(' ','_') if datum_kort else datum_str[:10].replace(' ','_')
    afz_schoon = re.sub(r'[^\w]', '_', afz_naam).strip('_')

    # Certos — gebruik weeknummer uit PDF
    if 'certos' in afz_lower:
        weeknr = extraheer_weeknummer(pdf_tekst)
        if weeknr:
            return f"Certos_{weeknr.replace(' ','_')}.pdf"
        datum_pdf = extraheer_datum_uit_pdf(pdf_tekst)
        if datum_pdf:
            return f"Certos_{datum_pdf}.pdf"
        return f"Certos_{datum_tag}.pdf"

    # Alle andere afzenders — afzendernaam + datum
    naam_schoon = re.sub(r'[^\w\s\-\.]', '', naam).strip()
    if not naam_schoon or naam_schoon.lower() in ['invoice.pdf', 'factuur.pdf', 'invoice', 'factuur', '.pdf']:
        return f"{afz_schoon}_{datum_tag}.pdf"

    if not naam_schoon.lower().endswith('.pdf'):
        naam_schoon += '.pdf'
    return naam_schoon


def lees_pdf_tekst(data):
    """Lees tekst uit PDF bytes."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(data))
        tekst = ""
        for pagina in reader.pages:
            tekst += pagina.extract_text() or ""
        return tekst[:1500]
    except:
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(data))
            tekst = ""
            for pagina in reader.pages:
                tekst += pagina.extract_text() or ""
            return tekst[:1500]
        except:
            return ""


def haal_inhoud(msg):
    """Haal tekst en PDF bijlagen op uit e-mail."""
    tekst = ""
    pdfs = []  # lijst van (bestandsnaam, bytes)

    if msg.is_multipart():
        for deel in msg.walk():
            ct = deel.get_content_type()
            cd = str(deel.get('Content-Disposition', ''))
            bestandsnaam = deel.get_filename('') or ''

            if ct == "text/plain" and 'attachment' not in cd:
                try:
                    tekst += deel.get_payload(decode=True).decode('utf-8', errors='ignore')
                except: pass

            elif ct == "application/pdf" or (
                'attachment' in cd and bestandsnaam.lower().endswith('.pdf')
            ):
                try:
                    data = deel.get_payload(decode=True)
                    if data:
                        pdfs.append((decode_str(bestandsnaam), data))
                except: pass
    else:
        try:
            tekst = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        except: pass

    return tekst[:600], pdfs


def _parse_bedrag(bedrag_str):
    """Parse een bedrag string naar float. Retourneert None bij ongeldige waarde."""
    bedrag_str = bedrag_str.strip().lstrip('€$').strip()
    if not bedrag_str:
        return None
    try:
        # Check of het een factuurnummer is (>6 cijfers voor de decimaal)
        cijfers_voor = re.match(r'^[\d.]+', bedrag_str)
        if cijfers_voor:
            schoon = cijfers_voor.group().replace('.', '')
            if len(schoon) > 6:
                return None

        if ',' in bedrag_str and '.' in bedrag_str:
            val = float(bedrag_str.replace('.', '').replace(',', '.'))
        elif ',' in bedrag_str:
            val = float(bedrag_str.replace(',', '.'))
        else:
            val = float(bedrag_str)

        if val < 0.50 or val > 9999:
            return None
        return val
    except (ValueError, TypeError):
        return None


def _fmt_euro(val):
    """Format float als Nederlandse euro string."""
    return f"€ {val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')


def detecteer_bedrag(tekst, pdf_tekst, afzender=""):
    """Detecteer het exacte eindbedrag met prioriteit op gelabelde bedragen."""

    # Prioriteit 1: Gelabelde bedragen (Totaal, Te betalen, etc.)
    LABEL_PATRONEN = [
        (r'totaal\s+(?:bedrag\s+)?te\s+betalen\s*[:\-]?\s*[€$]?\s*([\d.,]+)',  'totaal te betalen'),
        (r'totaalbedrag\s*[:\-]?\s*[€$]?\s*([\d.,]+)',                          'totaalbedrag'),
        (r'factuurbedrag\s*[:\-]?\s*[€$]?\s*([\d.,]+)',                          'factuurbedrag'),
        (r'totaal\s+incl\.?\s*(?:btw)?\s*[:\-]?\s*[€$]?\s*([\d.,]+)',           'totaal incl btw'),
        (r'totaalprijs\s+incl\.?\s*[:\-]?\s*[€$]?\s*([\d.,]+)',                  'totaalprijs incl'),
        (r'te\s+betalen\s*[:\-]?\s*[€$]?\s*([\d.,]+)',                           'te betalen'),
        (r'in\s+rekening\s+gebracht\s*[:\-]?\s*[€$]?\s*([\d.,]+)',               'in rekening gebracht'),
        (r'factuur\s+(?:bedrag|totaal)\s*[:\-]?\s*[€$]?\s*([\d.,]+)',            'factuur bedrag/totaal'),
        (r'netto\s+(?:te\s+)?betalen\s*[:\-]?\s*[€$]?\s*([\d.,]+)',              'netto betalen'),
        (r'verschuldigd\s+bedrag\s*[:\-]?\s*[€$]?\s*([\d.,]+)',                  'verschuldigd bedrag'),
    ]

    # Certos-specifiek: zoek het laatste/hoogste "totaal" bedrag (niet subtotalen)
    is_certos = 'certos' in afzender.lower()
    CERTOS_PATRONEN = [
        (r'totaal\s+netto\s+loon\s*[:\-]?\s*[€$]?\s*([\d.,]+)',  'certos totaal netto loon'),
        (r'netto\s+(?:uit\s+te\s+betalen|uitbetaling)\s*[:\-]?\s*[€$]?\s*([\d.,]+)', 'certos netto uitbetaling'),
        (r'uit\s+te\s+betalen\s*[:\-]?\s*[€$]?\s*([\d.,]+)',     'certos uit te betalen'),
    ]

    for bron_naam, bron in [('pdf', pdf_tekst), ('email', tekst)]:
        if not bron:
            continue
        bron_lower = bron.lower()

        # Certos specifieke patronen eerst
        if is_certos:
            for patroon, label in CERTOS_PATRONEN:
                match = re.search(patroon, bron_lower)
                if match:
                    val = _parse_bedrag(match.group(1))
                    if val:
                        print(f"    💰 Bedrag gevonden: {_fmt_euro(val)} [{label}] ({bron_naam})")
                        return _fmt_euro(val)

        # Gelabelde patronen
        for patroon, label in LABEL_PATRONEN:
            # Zoek alle matches en neem de laatste (vaak het eindtotaal)
            matches = list(re.finditer(patroon, bron_lower))
            if matches:
                match = matches[-1]
                val = _parse_bedrag(match.group(1))
                if val:
                    print(f"    💰 Bedrag gevonden: {_fmt_euro(val)} [{label}] ({bron_naam})")
                    return _fmt_euro(val)

    # Prioriteit 2: Bedragen met € teken
    alle = ((pdf_tekst or '') + ' ' + (tekst or '')).lower()
    euro_matches = list(re.finditer(r'€\s*([\d.,]+)', alle))
    if euro_matches:
        # Neem het laatste € bedrag (meestal het totaal)
        for match in reversed(euro_matches):
            val = _parse_bedrag(match.group(1))
            if val:
                print(f"    💰 Bedrag gevonden: {_fmt_euro(val)} [€ teken] (fallback)")
                return _fmt_euro(val)

    # Prioriteit 3: Losse getallen met decimalen (laatste resort)
    for m in re.findall(r'(?<!\d)(\d{1,4}[.,]\d{2})(?!\d)', alle):
        val = _parse_bedrag(m)
        if val:
            print(f"    💰 Bedrag gevonden: {_fmt_euro(val)} [los getal] (fallback)")
            return _fmt_euro(val)

    print(f"    ⚠️  Geen bedrag gevonden")
    return "onbekend"


def is_reclame(van, onderwerp, tekst, negeerlijst):
    alles = (van + ' ' + onderwerp + ' ' + tekst).lower()
    return any(k.lower() in alles for k in negeerlijst)


def match_afzender(van, onderwerp, tekst, afzenders):
    alles = (van + ' ' + onderwerp + ' ' + tekst).lower()
    for afz in afzenders:
        for zoekterm in afz['zoek']:
            if zoekterm.lower() in alles:
                return afz
    return None


def heeft_factuurpatroon(onderwerp, tekst, pdf_tekst):
    alles = (onderwerp + ' ' + tekst + ' ' + pdf_tekst).lower()
    return any(re.search(p, alles) for p in FACTUUR_PATRONEN)


def scan_inbox(config, afzenders, negeerlijst, aantal):
    print(f"\n  Verbinding: {config['naam']} ({config['adres']})...")
    resultaten = {'Inkomsten': [], '100% aftrekbaar': [], 'Deels aftrekbaar': [], 'Onbekende factuur': []}

    try:
        mail = imaplib.IMAP4_SSL(config['server'], config['port'])
        mail.login(config['adres'], config['wachtwoord'])
        print(f"  OK — Ingelogd!")
    except Exception as e:
        print(f"  FOUT: {e}")
        if 'gmail' in config['server']:
            print("  Gmail vereist een App-wachtwoord.")
            print("  Ga naar: myaccount.google.com > Beveiliging > App-wachtwoorden")
        return resultaten

    mail.select("INBOX")
    _, berichten = mail.search(None, "ALL")
    ids = berichten[0].split()
    laatste = ids[-aantal:]
    print(f"  {len(laatste)} e-mails scannen...")

    gevonden = 0
    genegeerd = 0
    opgeslagen = 0

    for num in reversed(laatste):
        try:
            _, data = mail.fetch(num, '(RFC822)')
            msg = email.message_from_bytes(data[0][1])
            van       = decode_str(msg.get('From', ''))
            onderwerp = decode_str(msg.get('Subject', ''))
            datum_raw = msg.get('Date', '')
            datum     = datum_raw[:25] if datum_raw else ''
            tekst, pdfs = haal_inhoud(msg)

            if is_reclame(van, onderwerp, tekst, negeerlijst):
                genegeerd += 1
                continue

            pdf_tekst = ""
            for _, pdf_bytes in pdfs:
                pdf_tekst += lees_pdf_tekst(pdf_bytes)

            if is_reclame('', '', tekst, negeerlijst):
                genegeerd += 1
                continue

            afz = match_afzender(van, onderwerp, tekst, afzenders)
            bedrag = detecteer_bedrag(tekst, pdf_tekst, afzender=van)

            if afz:
                cat = 'Inkomsten' if afz['cat'] == 'inkomsten' else \
                      '100% aftrekbaar' if afz['cat'] == '100' else 'Deels aftrekbaar'

                # PDF opslaan in kwartaal map
                jaar, kw = datum_naar_kwartaal(datum)
                if jaar and kw and pdfs:
                    map_pad = maak_map(jaar, kw)
                    for pdf_naam, pdf_bytes in pdfs:
                        pdf_t = lees_pdf_tekst(pdf_bytes)
                        nette_naam = maak_bestandsnaam_schoon(pdf_naam, afz['naam'], datum, pdf_t)
                        bestand_pad = os.path.join(map_pad, nette_naam)
                        if not os.path.exists(bestand_pad):
                            with open(bestand_pad, 'wb') as f:
                                f.write(pdf_bytes)
                            opgeslagen += 1

                resultaten[cat].append({
                    'van': afz['naam'], 'onderwerp': onderwerp[:60],
                    'datum': datum, 'bedrag': bedrag,
                    'omschrijving': afz['omschrijving'],
                    'heeft_pdf': len(pdfs) > 0,
                    'inbox': config['naam']
                })
                gevonden += 1

            elif heeft_factuurpatroon(onderwerp, tekst, pdf_tekst) and bedrag != 'onbekend':
                # Ook onbekende facturen met PDF opslaan
                jaar, kw = datum_naar_kwartaal(datum)
                if jaar and kw and pdfs:
                    map_pad = maak_map(jaar, kw)
                    for pdf_naam, pdf_bytes in pdfs:
                        pdf_t = lees_pdf_tekst(pdf_bytes)
                        nette_naam = maak_bestandsnaam_schoon(pdf_naam, 'Onbekend', datum, pdf_t)
                        bestand_pad = os.path.join(map_pad, f"CONTROLEER_{nette_naam}")
                        if not os.path.exists(bestand_pad):
                            with open(bestand_pad, 'wb') as f:
                                f.write(pdf_bytes)
                            opgeslagen += 1

                resultaten['Onbekende factuur'].append({
                    'van': van[:50], 'onderwerp': onderwerp[:60],
                    'datum': datum, 'bedrag': bedrag,
                    'omschrijving': 'Controleer zelf — voeg toe aan jm_config.json',
                    'heeft_pdf': len(pdfs) > 0,
                    'inbox': config['naam']
                })
                gevonden += 1

        except: pass

    print(f"  Gevonden: {gevonden} | PDF's opgeslagen: {opgeslagen} | Genegeerd: {genegeerd}")
    mail.logout()
    return resultaten


def print_resultaten(alle):
    print(f"\n{'='*62}")
    print(f"  JM MECHANICA — FACTUUR OVERZICHT")
    print(f"  {datetime.now().strftime('%d-%m-%Y %H:%M')}")
    print(f"{'='*62}")

    tot100 = totDeels = totInkomsten = 0.0

    for cat in ['Inkomsten', '100% aftrekbaar', 'Deels aftrekbaar', 'Onbekende factuur']:
        items = alle.get(cat, [])
        if not items: continue

        labels = {
            'Inkomsten':        'INKOMSTEN (Certos)',
            '100% aftrekbaar':  'VOLLEDIG AFTREKBAAR',
            'Deels aftrekbaar': 'DEELS AFTREKBAAR',
            'Onbekende factuur':'CONTROLEER ZELF'
        }
        print(f"\n  {labels[cat]} ({len(items)} stuks)")
        print(f"  {'-'*58}")

        cat_tot = 0.0
        for e in items:
            pdf_tag = " [PDF]" if e.get('heeft_pdf') else ""
            print(f"  {e['datum'][:10].ljust(12)} {e['van'][:26].ljust(28)} {e['bedrag'].ljust(14)}{pdf_tag}")
            print(f"             {e['omschrijving'][:55]}")
            if e['bedrag'] != 'onbekend':
                try:
                    val = float(e['bedrag'].replace('€','').replace(' ','').replace('.','').replace(',','.'))
                    cat_tot += val
                    if cat == 'Inkomsten': totInkomsten += val
                    elif cat == '100% aftrekbaar': tot100 += val
                    elif cat == 'Deels aftrekbaar': totDeels += val
                except: pass

        if cat_tot > 0:
            print(f"  {'-'*58}")
            print(f"  Subtotaal: € {cat_tot:,.2f}".replace(',','X').replace('.',',').replace('X','.'))

    schat = tot100 + (totDeels * 0.70)
    print(f"\n{'='*62}")
    print(f"  SAMENVATTING")
    print(f"  Inkomsten (Certos):   € {totInkomsten:,.2f}".replace(',','X').replace('.',',').replace('X','.'))
    print(f"  Volledig aftrekbaar:  € {tot100:,.2f}".replace(',','X').replace('.',',').replace('X','.'))
    print(f"  Deels aftrekbaar:     € {totDeels:,.2f}".replace(',','X').replace('.',',').replace('X','.'))
    print(f"  Geschat terug:        € {schat:,.2f}".replace(',','X').replace('.',',').replace('X','.'))
    print(f"{'='*62}")

    # Toon welke mappen zijn aangemaakt
    if os.path.exists(MAPPEN_PAD):
        mappen = sorted([m for m in os.listdir(MAPPEN_PAD) if os.path.isdir(os.path.join(MAPPEN_PAD, m))])
        if mappen:
            print(f"\n  PDF's opgeslagen in: {MAPPEN_PAD}")
            for m in mappen:
                map_pad = os.path.join(MAPPEN_PAD, m)
                bestanden = [f for f in os.listdir(map_pad) if f.endswith('.pdf')]
                print(f"  {m}/ — {len(bestanden)} PDF('s)")


def main():
    print("\n" + "="*62)
    print("  JM MECHANICA — E-MAIL SCANNER MET PDF DOWNLOAD")
    print(f"  {datetime.now().strftime('%d-%m-%Y %H:%M')}")
    print("="*62)

    try:
        import pypdf
    except ImportError:
        print("\n  pypdf installeren...")
        os.system("pip3 install pypdf --break-system-packages -q")

    config_data = laad_config()
    afzenders   = config_data.get('afzenders', [])
    negeerlijst = config_data.get('altijd_negeren', [])
    aantal      = config_data.get('aantal_emails', 150)

    # Maak hoofdmap aan
    os.makedirs(MAPPEN_PAD, exist_ok=True)

    alle = {'Inkomsten': [], '100% aftrekbaar': [], 'Deels aftrekbaar': [], 'Onbekende factuur': []}

    for inbox in config_data.get('inboxen', []):
        resultaten = scan_inbox(inbox, afzenders, negeerlijst, aantal)
        for cat, items in resultaten.items():
            alle[cat].extend(items)

    print_resultaten(alle)

    with open(RESULTAAT_PAD, 'w', encoding='utf-8') as f:
        json.dump(alle, f, ensure_ascii=False, indent=2)
    print(f"\nOpgeslagen als: jm_scan_resultaat.json")

    # In CI-modus (GitHub Actions) geen Finder/browser openen
    if not os.environ.get('CI'):
        if os.path.exists(MAPPEN_PAD):
            os.system(f'open "{MAPPEN_PAD}"')
        if os.path.exists(DASHBOARD_PAD):
            webbrowser.open(f"file://{DASHBOARD_PAD}")

    print("Klaar!\n")


if __name__ == "__main__":
    main()
