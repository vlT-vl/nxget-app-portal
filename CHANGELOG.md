# Changelog

Le funzionalità principali del portale, in ordine cronologico inverso.

## 2026-10-13 — 0.1.2 / R131026

- Il catalogo non legge più le release direttamente da GitHub: legge il file
  `v1/releases.json` del registro `nxget.packages`, con una sola richiesta per
  visita, cache locale di un'ora e uso della cache anche scaduta se la rete
  fallisce. Rimossa la risoluzione delle release repo per repo (selezione
  della release, regex e cache per repo). Restano le chiamate dirette
  all'API GitHub per lo stato del registro e per le app nuove: una visita a freddo passa da 54 a 4 richieste, sul limite di
  60 richieste/ora per IP.
- Caricamento del catalogo più robusto: controllo dello stato HTTP e
  `Promise.allSettled`, così un manifest danneggiato non blocca più l'intero
  catalogo.
- Risolto il caso Thaw, in cui nelle ultime 10 release non c'era nessuna
  release stabile.
- Barra di ricerca della pagina Applicazioni più grande (come i filtri accanto)
  e cliccabile in ogni punto, così non serve più un secondo clic per
  attivarla. Arrivando con «Scopri le app» dalla Home è già attiva e pronta a
  digitare; con la navbar o tornando da un dettaglio non prende il focus. Il
  bordo sinistro non presenta più la fascia scura: negli stati aperti il tema
  chiaro conserva un bordo glass luminoso e la pillola non crea più un ritaglio
  arrotondato interno durante il compositing.
- Rimossi dal portale gli ultimi residui della logica di match degli asset,
  ora a carico del registro, e aggiornati i testi «Come funziona» che la
  descrivevano ancora.
- La pillola del registro in Home non dipende più dalla quota dell'API GitHub
  per sapere se il registro è raggiungibile: se la chiamata ai commit fallisce
  (per esempio 403 a quota esaurita) il portale verifica il registro con una
  richiesta a raw.githubusercontent.com, mostra «attivo» se risponde e conserva
  l'ultima data nota. L'ultimo aggiornamento resta quello dell'ultimo commit
  del branch `api`, letto dalla UI come prima.
- Il pulsante «Indietro» nella card di dettaglio è ora una pillola più grande,
  con testo pieno, bordo sempre visibile e sfondo neutro al passaggio del mouse.
- Il portale usa ora Open Sans locale nei pesi 300, 400, 600 e 700 con licenza
  Apache 2.0 in tutta l'interfaccia, tranne menu e selettore della lingua nella
  navbar, che restano in Montserrat da Google Fonts per scelta dell'utente. Il
  peso 500 continua a usare il fallback Regular 400; i caratteri monospaziati
  di manifest YAML, voucher e licenze restano invariati.

## 2026-10-07

- La Home ha ora un pulsante animato "Scopri le app" (logo nxget + freccia)
  che porta alla pagina App con il campo di ricerca già pronto per scrivere.
- Sotto, due nuove pillole animate: una conta il numero di app disponibili,
  l'altra mostra lo stato "live" del registro remoto e data e ora del suo
  ultimo aggiornamento.
- Uniformate dimensioni e comportamento delle card in Home e nella sezione
  delle app correlate, mantenendo tag, colori e piattaforme coerenti.
- Rifinita App Discovery: barra ricerca e filtri più compatta e leggibile,
  menu glass senza scrollbar visibile, decorazioni di sfondo centrate nella
  viewport e logo nxget animato senza rotazioni.
- App Detail è ora una card glass completa con il manifest YAML integrale
  animato in digitazione sullo sfondo, confinato nella card e totalmente
  indipendente da scroll, puntatore e layout della pagina.
- Aggiornata la pagina About attorno all'idea alla base di nxget e rimossa
  l'intestazione secondaria ridondante.
- Aggiornate alle ultime patch compatibili `js-yaml`, Vite e il plugin React
  di Vite.
- Corretta la build di produzione affinché conservi sia `backdrop-filter`
  standard sia il prefisso WebKit e non perda il blur delle superfici glass.
- Allargate a una misura condivisa le card in evidenza della Home e quelle
  correlate in App Detail, evitando tagli di publisher e ritorni a capo delle
  piattaforme anche con i dati più lunghi presenti nel catalogo.
- Le quattro app correlate di App Detail restano sempre su un'unica riga e
  sfruttano tutta la larghezza disponibile; sulle viewport più strette la riga
  scorre orizzontalmente senza mostrare scrollbar.

## 2026-10-06

- L'intestazione della pagina App ora mostra il logo nxget (in bianco o
  nero in base al tema) al posto della vecchia icona a quattro quadrati,
  senza più sottotitolo.
- Le card delle app sono ora semi-trasparenti con effetto vetro smerigliato,
  lasciando intravedere l'illustrazione decorativa di sfondo, che ora
  fluttua lentamente invece di restare ferma; contrasto rialzato nel tema
  chiaro, dove risultava troppo slavato.
- Ricerca e filtri della pagina App riuniti in un'unica barra con effetto
  vetro, che scorre con la pagina e resta in vista sopra le card durante lo
  scroll. Il filtro piattaforma è ora un menu a tendina come quello di
  categoria, con le opzioni che compaiono in sequenza verticale; la ricerca
  resta espansa finché contiene del testo, non solo al passaggio del mouse.
- Il bottone "Cancella filtri" ora mostra la sola icona, con l'etichetta
  che compare al passaggio del mouse.
- Corretti diversi problemi di visualizzazione su schermi piccoli: nomi di
  sviluppatori lunghi che uscivano dalla card, bottoni di download che non
  andavano a capo, e un suggerimento a comparsa (pagina Home) che poteva
  uscire dallo schermo.

## 2026-10-05

- Le app con build diverse per versione di macOS (es. OnyX) ora mostrano un
  bottone di download distinto per ciascuna versione del sistema, invece di
  perderne alcuni.
- Corretta la formattazione su mobile del modale "Info" e delle pillole di
  filtro nella pagina App; aggiunta una pillola "Cancella filtri" per
  azzerare ricerca, piattaforma e categoria con un solo tocco.
- Il bottone di download dell'ultima build macOS (es. Golden Gate per
  OnyX) ora riporta sempre il nome in codice della versione di sistema,
  anche quando è l'unica per quella architettura. La "Versione attuale"
  nella scheda app ora mostra sempre e solo l'ultima versione, con più
  righe solo quando piattaforme diverse (Windows/macOS/Linux) hanno
  davvero versioni diverse.
- Pillola "Tutti gli OS" attiva nella pagina App: tolto il rosso acceso,
  ora un tono neutro coerente col resto dell'interfaccia.

## 2026-10-02

- Durata dello sblocco del voucher ora decisa dal titolare al momento
  dell'emissione (prima era fissa per tutti).

## 2026-09-24

- First public release, published on GitHub Pages with automatic deploy on every push to `main`.
- About: the vlT logo now links to lorenzoveronesi.it.

## 2026-09-23

- Illustrazione della Home animata: al posto dell'immagine statica in Hero,
  un componente che disegna il catalogo a pezzi in ingresso, con una
  piccola animazione continua dopo.
- La stessa illustrazione animata è usata anche come sfondo della pagina
  App, con l'animazione che si ripete periodicamente — ora anche in Home.
- Pagina App: nuovo elemento decorativo a destra, un'eco astratta e
  semplificata dello schema del flusso di download della Home (solo linea,
  nodi e un pacchetto che scorre, senza dettagli), in parallasse speculare
  al catalogo animato a sinistra.
- Pagina App: le due decorazioni in parallasse più piccole e spostate più
  all'esterno, visibili solo sugli schermi abbastanza larghi da non
  finire coperte dalle card.
- Pagina About: il logo nxget in cima alla pagina ora si "assembla" —
  l'icona a rombo entra un facet alla volta a onda, poi la scritta compare
  con un effetto a macchina da scrivere.
- Home: nuovo splash alla primissima apertura del sito (una sola volta per
  visita, non si ripete tornando in Home) — il logo nxget (icona sopra,
  scritta "battuta a macchina" sotto) si compone al centro della pagina,
  con menu e footer nascosti finché non finisce.
- Pannello di richiesta voucher nascosto dietro un pulsante ("Richiedi
  voucher"), con apertura/chiusura animata invece di essere sempre visibile.
- Disclaimer del voucher: stesso aspetto prima e dopo lo sblocco del
  download, testo centrato.
- Filtro per categoria della pagina App: ora si chiude con un'animazione,
  non solo in apertura.
- Corretto: due categorie diverse non hanno più mai lo stesso colore (o uno
  troppo simile), ovunque compaiano nel sito.

## 2026-09-22

- Nuova sezione "Cos'è nxget" in Home, con lo schema animato del flusso di
  download (registry → portale → download) accanto a un testo introduttivo.
- Sezione "In evidenza" della Home ridisegnata: card più piccole, che
  mostrano per prime le app aggiunte più di recente al catalogo.
- Pagina App: nuovo filtro per categoria, accanto a quello per piattaforma.
- Pagina App: corretto lo sfondo illustrato che saltava posizione quando i
  filtri cambiavano il numero di risultati.

## 2026-09-21

- Pagina "Perché nxget": aggiunto uno schema animato che spiega il flusso
  registry → portale → download, con dettagli al passaggio del mouse.
- Pagine "Perché nxget" e "CLI" riscritte con più dettagli su funzionamento,
  roadmap e stato del progetto.
- Il portale non si descrive più come "open source" (licenza proprietaria).
- Pagina App: ricerca, filtri e pagina corrente restano impostati tornando
  dal dettaglio di un'app; aggiunta la paginazione del catalogo.
- Pagina App: griglia più larga, con un'illustrazione di sfondo.
- Corretto un bug per cui il filtro per piattaforma poteva risultare vuoto
  (cache locale troppo pesante).
- Pagina di dettaglio: layout più ampio, informazioni e cronologia versioni
  affiancate su schermi larghi.
- Corretta la versione/cronologia mancante per un'app con solo link fissi.
- Pulsante Licenza: compare solo quando una licenza è stata trovata
  davvero.
- Le app della categoria riservata `vlT Software` mostrano sempre versione
  e cronologia; restano bloccati solo i download, sbloccabili con un
  voucher personale firmato digitalmente (non falsificabile).
- Descrizioni delle app nelle card mostrate in italiano quando l'interfaccia
  è in italiano.
- Pagina About: card finale con logo animato e copyright.

## 2026-09-18

- Supporto per app distribuite con un link di download fisso, oltre a
  quelle che pubblicano release su GitHub.
- Corretta l'icona della piattaforma macOS.
- Download: pulsanti per piattaforma resi uniformi indipendentemente dal
  numero di formati disponibili.

## 2026-09-17

- Il catalogo delle app viene ora letto in tempo reale dal registry
  separato `nxget.packages`, invece che da un elenco incluso nel portale:
  aggiungere o aggiornare un'app non richiede più una nuova pubblicazione
  del sito.
- Irrobustita la lettura delle release GitHub contro i limiti di richieste
  orarie dell'API.

## 2026-09-16

- Aggiunta la pubblicazione automatica del sito a ogni aggiornamento del
  codice.

## 2026-09-15

- Pagina di dettaglio app: descrizione estesa, tag colorati per piattaforma
  e categoria, cronologia delle versioni.
- Aggiunto un pulsante verso il sito ufficiale dell'app, accanto a quello
  verso GitHub.

## 2026-09-14

- Aggiunta un'illustrazione alla home page.
- Catalogo ridotto alle sole app che offrono un download diretto verificabile.
- I pulsanti di download sono ora risolti in tempo reale dall'ultima
  versione pubblicata di ogni app, con un pulsante per ogni piattaforma e
  architettura disponibile.
- Aggiunta una pagina "About" con la storia del progetto.
- Interfaccia bilingue italiano/inglese, italiano di default.

## 2026-09-11

- Prima versione del portale: home page, catalogo delle app sfogliabile e
  filtrabile per piattaforma, pagina "Perché nxget", pagina di dettaglio per
  ogni app con download multipiattaforma, tema chiaro/scuro.
