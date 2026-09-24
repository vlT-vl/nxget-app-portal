# Changelog

Le funzionalità principali del portale, in ordine cronologico inverso.

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
