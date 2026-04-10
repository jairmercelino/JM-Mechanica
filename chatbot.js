// JM Mechanica Chatbot — shared across all pages
let chatOpen=false, chatBezig=false;

const chat = {
  score: 0, besproken: new Set(), geschiedenis: [], leadVerstuurd: false,
  naam: null, email: null, telefoon: null, bedrijf: null, dienst: null, locatie: null, formulierAangeboden: false
};

const ANTWOORDEN = {
  identiteit: [
    'Ik ben de digitale assistent van JM Mechanica. Jair Mercelino is een allround monteur gespecialiseerd in storing en onderhoud van bedrijfsinstallaties in Noord-Holland.',
    'JM Mechanica is het bedrijf van Jair Mercelino \u2014 een ervaren allround monteur uit Zaandam, gespecialiseerd in industrieel onderhoud, storingen en projectwerk in Noord-Holland.',
    'Ik help u namens JM Mechanica. Jair Mercelino is de eigenaar \u2014 een allround monteur met 15+ jaar ervaring in de industrie, gevestigd in Zaandam.'
  ],
  diensten: [
    'JM Mechanica biedt drie kerndiensten:\n\n1. Storingen & Onderhoud \u2014 preventief en correctief onderhoud aan bedrijfsinstallaties\n2. TD Ondersteuning \u2014 versterking van uw technische dienst bij complexe storingen\n3. Projecten & Installaties \u2014 van installatie tot oplevering\n\nWaar kan ik u meer over vertellen?',
    'Onze drie specialiteiten:\n\n1. Storingen & Onderhoud \u2014 snel schakelen bij uitval en preventief onderhoud\n2. TD Ondersteuning \u2014 elektrotechnische en mechanische diagnoses\n3. Projectwerk \u2014 complete projectbegeleiding en installaties\n\nHeeft u een specifiek type klus in gedachten?',
    'JM Mechanica is breed inzetbaar met drie diensten:\n\n1. Storingsoplossing en preventief onderhoud\n2. Technische dienst ondersteuning bij complexe vraagstukken\n3. Projecten en installaties van A tot Z\n\nVoor welke dienst zoekt u ondersteuning?'
  ],
  tarief: [
    'Het uurtarief is \u20ac77,50 excl. btw. Reisuren worden doorberekend. Bij langdurige opdrachten is overleg over het tarief mogelijk.',
    'Wij hanteren \u20ac77,50 per uur excl. btw. Voor terugkerende opdrachten kijken we graag samen naar de mogelijkheden.',
    'Het tarief bedraagt \u20ac77,50 per uur exclusief btw. Bij een langdurig project is er ruimte voor maatwerkafspraken.'
  ],
  werkgebied: [
    'JM Mechanica is gevestigd in Zaandam en actief in heel Noord-Holland \u2014 Amsterdam, Alkmaar, Haarlem en omgeving. Buiten de regio in overleg.',
    'Ons werkgebied is primair Noord-Holland. Daarbuiten kijken we of inzet haalbaar is. In welke regio zit uw bedrijf?',
    'Vanuit Zaandam bedienen we heel Noord-Holland. Voor opdrachten daarbuiten is overleg mogelijk.'
  ],
  beschikbaar: [
    'Jair is beschikbaar voor losse klussen op vrije dagen en buiten vaste roostertijden. Wanneer zou u iemand nodig hebben?',
    'Er is regelmatig beschikbaarheid naast de vaste opdracht. Heeft u een idee van de gewenste periode of startdatum?',
    'Losse klussen en korte projecten zijn welkom. De planning hangt af van het rooster \u2014 vertel me meer over uw tijdlijn.'
  ],
  contact: [
    'U kunt Jair bereiken via het contactformulier op de homepage, of direct bellen op +31 6 29 22 93 95.',
    'De snelste weg is bellen: +31 6 29 22 93 95. Of mail naar info@jmmechanica.nl \u2014 Jair reageert dezelfde dag.',
    'Mail naar info@jmmechanica.nl, bel +31 6 29 22 93 95, of gebruik het formulier op de homepage.'
  ],
  begroeting: [
    'Goedendag! Waar kan ik u mee helpen? U kunt vragen stellen over onze diensten, tarieven, werkgebied of beschikbaarheid.',
    'Hallo! Fijn dat u contact opneemt met JM Mechanica. Waarmee kan ik u van dienst zijn?',
    'Welkom! Ik help u graag verder. Heeft u een vraag over onze diensten, het tarief of de beschikbaarheid?'
  ],
  certificering: [
    'Jair is VCA-VOL gecertificeerd en heeft ruime ervaring met mechanische, elektrotechnische en pneumatisch/hydraulische installaties.',
    'JM Mechanica werkt volgens VCA-VOL normen. Daarnaast heeft Jair ervaring als projectleider en met diverse industri\u00eble systemen.'
  ],
  ervaring: [
    'Jair heeft meer dan 15 jaar ervaring als allround monteur in de industrie, van voedselverwerking tot zware machinebouw.',
    'Met 15+ jaar ervaring in industri\u00eble omgevingen kent Jair de uitdagingen van productieomgevingen door en door.'
  ],
  onbekend: [
    'Ik kan u helpen met vragen over:\n\n- Onze diensten en specialiteiten\n- Tarieven en kosten\n- Werkgebied en locatie\n- Beschikbaarheid en planning\n- Certificeringen en ervaring\n- Contact opnemen met Jair\n\nWaar bent u naar op zoek?',
    'Daar heb ik niet direct een antwoord op. Ik kan u wel vertellen over onze diensten, tarieven (\u20ac77,50/uur), werkgebied (Noord-Holland), beschikbaarheid of certificeringen. Of bel Jair direct: +31 6 29 22 93 95.',
    'Die vraag kan ik het beste doorspelen aan Jair zelf. U kunt hem bereiken op +31 6 29 22 93 95 of via info@jmmechanica.nl. Ik help u verder met vragen over diensten, tarieven, werkgebied of beschikbaarheid.'
  ]
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function detecteerOnderwerp(tekst) {
  const t = tekst.toLowerCase().trim();
  if (/^(hallo|hoi|hey|hi|goedendag|goedemorgen|goedemiddag|goedenavond|dag|yo|welkom)(\s+(daar|zeg|even|allemaal))?[.!?\s]*$/i.test(t)) return 'begroeting';
  if (/wie ben|wie is|wie zijn|over jullie|over jou|over jm|vertel over|wat is jm|wat voor bedrijf/.test(t)) return 'identiteit';

  const naamMatch = t.match(/(?:ik\s+ben|mijn\s+naam\s+is|naam\s*[:\-]?\s*)([a-zA-Z\u00C0-\u00FF\s]{2,30})/i);
  if (naamMatch) { chat.naam = naamMatch[1].trim().replace(/^(ik\s+ben|mijn\s+naam\s+is)\s*/i, ''); if (chat.naam.length > 1) { chat.score += 2; chat.besproken.add('naam'); } }
  const emailMatch = t.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch) { chat.email = emailMatch[0]; chat.score += 3; chat.besproken.add('email'); }
  const telMatch = t.match(/(?:0[1-9][\s\-]?(?:\d[\s\-]?){7,9}|\+31[\s\-]?\d[\s\-]?(?:\d[\s\-]?){7,8})/);
  if (telMatch) { chat.telefoon = telMatch[0].replace(/[\s\-]/g, ''); chat.score += 3; chat.besproken.add('telefoon'); }
  const bedrijfMatch = t.match(/(?:bedrijf|firma|werk\s+bij|werk\s+voor|van\s+(?:bedrijf|firma)?)\s*[:\-]?\s*([a-zA-Z\u00C0-\u00FF0-9\s&.]{2,40})/i);
  if (bedrijfMatch && !bedrijfMatch[1].match(/^(een|het|de|mijn|uw)$/i)) { chat.bedrijf = bedrijfMatch[1].trim(); }

  const topics = [];
  if (/tarief|prijs|kosten|uur|btw|bedrag|rekening|betalen|wat kost|hoeveel/.test(t)) topics.push('tarief');
  if (/beschikbaar|wanneer|vrij|planning|agenda|starten|datum|hoe snel|inzetbaar|capaciteit/.test(t)) topics.push('beschikbaar');
  if (/dienst|werk|wat doe|wat kun|wat bied|installat|storing|onderhoud|monteur|project|td|technisch|reparati|preventief|specialit|werkzaamhed|activiteit|aanbod|wat voor/.test(t)) topics.push('diensten');
  if (/gebied|locatie|waar|regio|provincie|amsterdam|noord.holland|alkmaar|haarlem|zaandam|almere|utrecht/.test(t)) topics.push('werkgebied');
  if (/contact|offerte|bel|formulier|inschakelen|aanvragen|afspraak|gesprek/.test(t)) topics.push('contact');
  if (/vca|certificat|gecertificeerd|diploma|veiligheid|kwalificati/.test(t)) topics.push('certificering');
  if (/ervaring|jaar|achtergrond|cv|portfolio|referenti/.test(t)) topics.push('ervaring');
  if (/mail|email|e-mail|info@/.test(t) && !emailMatch) topics.push('contact');

  if (/storing/.test(t)) chat.dienst = 'Storingen & Onderhoud';
  if (/td|technische dienst/.test(t)) chat.dienst = 'TD Ondersteuning';
  if (/project|installat/.test(t)) chat.dienst = 'Projectwerk';

  const locMatch = t.match(/(?:in|bij|regio|omgeving)\s+([\w\u00C0-\u00FF\s-]{2,25})/i);
  if (locMatch) { chat.locatie = locMatch[1].trim(); chat.besproken.add('locatie'); }

  topics.forEach(tp => {
    if (tp === 'tarief' && !chat.besproken.has('tarief')) { chat.score += 1; chat.besproken.add('tarief'); }
    if (tp === 'beschikbaar' && !chat.besproken.has('beschikbaar')) { chat.score += 1; chat.besproken.add('beschikbaar'); }
    if (tp === 'werkgebied' && !chat.besproken.has('werkgebied')) { chat.score += 1; chat.besproken.add('locatie'); }
    if ((tp === 'diensten' || tp === 'certificering' || tp === 'ervaring') && !chat.besproken.has('dienst')) { chat.score += 1; chat.besproken.add('dienst'); }
  });

  if (topics.length === 0) return 'onbekend';
  const nieuw = topics.find(tp => !chat.besproken.has('antw_' + tp));
  return nieuw || topics[0];
}

function bouwAntwoord(onderwerp, gebruikerTekst) {
  chat.geschiedenis.push({ rol: 'gebruiker', tekst: gebruikerTekst, onderwerp });
  chat.besproken.add('antw_' + onderwerp);
  let antwoord = pickRandom(ANTWOORDEN[onderwerp] || ANTWOORDEN.onbekend);

  if (onderwerp === 'tarief' && chat.besproken.has('antw_diensten')) antwoord += ' Dit tarief geldt voor alle genoemde diensten.';
  if (onderwerp === 'beschikbaar' && chat.dienst) antwoord += ' Voor ' + chat.dienst.toLowerCase() + ' is er doorgaans goede beschikbaarheid.';
  if (onderwerp === 'werkgebied' && chat.locatie) antwoord += ' ' + chat.locatie + ' valt binnen ons bereik.';
  if (chat.naam && !chat.besproken.has('naam_bevestigd')) { antwoord = 'Leuk kennis te maken, ' + chat.naam + '! ' + antwoord; chat.besproken.add('naam_bevestigd'); }

  if (chat.score >= 3 && !chat.leadVerstuurd && !chat.formulierAangeboden) {
    chat.formulierAangeboden = true;
    setTimeout(function() {
      antwoordMetDelay('Op basis van ons gesprek denk ik dat Jair u goed kan helpen. Wilt u dat ik uw gegevens doorstuur zodat hij vandaag nog contact opneemt? U kunt ook direct bellen op +31 6 29 22 93 95.', 0);
      setTimeout(toonLeadKnoppen, 2200);
    }, 2000);
  }
  if ((chat.email || chat.telefoon) && !chat.leadVerstuurd) verstuurLeadNotificatie();

  chat.geschiedenis.push({ rol: 'assistent', tekst: antwoord, onderwerp });
  return antwoord;
}

function toonLeadKnoppen() {
  var container = document.createElement('div');
  container.className = 'chat-bericht assistent';
  container.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
  var hasForm = !!document.getElementById('contact-form');
  container.innerHTML =
    (hasForm ? '<button onclick="vulFormulierIn()" style="background:#f97316;color:#fff;border:none;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Formulier invullen</button>' :
     '<button onclick="window.location.href=\'index.html#contact\'" style="background:#f97316;color:#fff;border:none;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Naar contactformulier</button>') +
    '<button onclick="window.location.href=\'tel:+31629229395\'" style="background:#022448;color:#fff;border:none;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Bel +31 6 29 22 93 95</button>';
  document.getElementById('chat-berichten').appendChild(container);
  scrollChatOnder();
}

function vulFormulierIn() {
  var section = document.getElementById('contact');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
  setTimeout(function() {
    var f = document.getElementById('contact-form');
    if (!f) { window.location.href = 'index.html#contact'; return; }
    if (chat.naam) f.querySelector('[name=naam]').value = chat.naam;
    if (chat.email) f.querySelector('[name=email]').value = chat.email;
    if (chat.bedrijf) f.querySelector('[name=bedrijf]').value = chat.bedrijf;
    if (chat.dienst) { var sel = f.querySelector('[name=type]'); for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text.indexOf(chat.dienst.split(' ')[0]) >= 0) { sel.selectedIndex = i; break; } } }
    var samenvatting = chat.geschiedenis.filter(function(m){return m.rol==='gebruiker';}).map(function(m){return m.tekst;}).join(' | ');
    if (samenvatting) f.querySelector('[name=omschrijving]').value = 'Via chatbot: ' + samenvatting;
    antwoordMetDelay('Het formulier is ingevuld. Controleer de velden en klik op Versturen!', 0);
  }, 600);
  chatOpen = false;
  document.getElementById('chat-venster').style.display = 'none';
}

function verstuurLeadNotificatie() {
  if (chat.leadVerstuurd) return;
  chat.leadVerstuurd = true;
  var samenvatting = chat.geschiedenis.map(function(m){ return (m.rol === 'gebruiker' ? 'Klant: ' : 'Bot: ') + m.tekst; }).join('\n');
  var ld = { naam: chat.naam||'Onbekend', email: chat.email||'-', telefoon: chat.telefoon||'-', bedrijf: chat.bedrijf||'-', dienst: chat.dienst||'-', locatie: chat.locatie||'-', score: chat.score, gesprek: samenvatting, bron: 'chatbot', datum: new Date().toISOString() };

  // Opslaan in localStorage voor dashboard
  try { var leads = JSON.parse(localStorage.getItem('jm_leads') || '[]'); leads.unshift(ld); localStorage.setItem('jm_leads', JSON.stringify(leads)); } catch(e) {}

  // Verstuur naar Formspree
  fetch('https://formspree.io/f/mlgoydqr', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ _subject: 'Chatbot Lead (score ' + ld.score + ') — ' + ld.naam, naam: ld.naam, email: ld.email, telefoon: ld.telefoon, bedrijf: ld.bedrijf, dienst: ld.dienst, locatie: ld.locatie, score: ld.score, gesprek: samenvatting })
  }).catch(function(){});
}

function voegChatToe(rol, tekst) {
  var d = document.createElement('div'); d.className = 'chat-bericht ' + rol;
  if (rol === 'assistent') {
    d.innerHTML = tekst.replace(/\n/g, '<br>').replace(/((\+31|0)\s?\d[\s\-]?(\d[\s\-]?){7,8})/g, '<a href="tel:$1" style="color:#f97316;font-weight:700;text-decoration:none;">$1</a>').replace(/(info@jmmechanica\.nl)/g, '<a href="mailto:$1" style="color:#f97316;font-weight:700;text-decoration:none;">$1</a>');
  } else { d.textContent = tekst; }
  document.getElementById('chat-berichten').appendChild(d); scrollChatOnder();
}
function scrollChatOnder() { var e = document.getElementById('chat-berichten'); e.scrollTop = e.scrollHeight; }

function antwoordMetDelay(tekst, delay) {
  chatBezig = true; document.getElementById('chat-stuur').disabled = true;
  var typingDelay = 1000 + Math.random() * 800;
  setTimeout(function() {
    var t = document.createElement('div'); t.className='chat-typing'; t.id='chat-typing-indicator'; t.innerHTML='<span></span><span></span><span></span>';
    document.getElementById('chat-berichten').appendChild(t); scrollChatOnder();
    setTimeout(function() { var i=document.getElementById('chat-typing-indicator'); if(i)i.remove(); voegChatToe('assistent',tekst); chatBezig=false; document.getElementById('chat-stuur').disabled=false; document.getElementById('chat-input').focus(); }, typingDelay);
  }, delay || 0);
}

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chat-venster').style.display = chatOpen ? 'flex' : 'none';
  document.getElementById('chat-badge').style.display = 'none';
  if (chatOpen) {
    var b = document.getElementById('chat-berichten');
    if (b.children.length === 0) antwoordMetDelay('Goedendag! Ik ben de assistent van JM Mechanica. Stel gerust uw vraag over onze diensten, tarieven of beschikbaarheid.', 300);
    else document.getElementById('chat-input').focus();
  }
}

function verstuurChat() {
  if (chatBezig) return; var i = document.getElementById('chat-input'); var t = i.value.trim(); if (!t) return;
  i.value = ''; i.style.height = 'auto'; voegChatToe('gebruiker', t);
  var onderwerp = detecteerOnderwerp(t); var antwoord = bouwAntwoord(onderwerp, t); antwoordMetDelay(antwoord);
}
