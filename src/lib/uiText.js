import { createContext, createElement, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vlt-lang'
const LANGS = new Set(['it', 'en'])
const DEFAULT_LANG = 'it'

export const uiText = {
  it: {
    nav: {
      home: 'Home',
      apps: 'App',
      features: 'Perché nxget',
      cli: 'CLI',
      about: 'About',
    },
    search: {
      placeholder: "Cerca un'app...",
      ariaLabel: "Cerca un'app",
      button: 'Cerca',
    },
    hero: {
      eyebrow: 'Portale open · nessuna registrazione richiesta',
      titleBefore: 'Il tuo hub per software',
      titleAccent: 'multipiattaforma',
      titleAfter: '',
      subtitle: 'Un unico hub per trovare e scaricare le tue applicazioni per Windows, macOS e Linux — con link diretti alle fonti ufficiali.',
      stat: '{count} app disponibili e in crescita',
    },
    home: {
      featuredTitle: 'In evidenza',
      featuredSubtitle: 'Uno sguardo veloce ad alcune app della libreria.',
      viewAll: 'Vedi tutte le app',
      about: {
        title: "Cos'è nxget",
        text: [
          'nxget raccoglie in un unico posto le applicazioni per Windows, macOS e Linux: legge i manifest di un registry pubblico, li trasforma in pulsanti di download sempre aggiornati e ti porta dritto al file pubblicato dallo sviluppatore, senza passare da server propri.',
          "Non c'è un account da creare né un backend da attraversare: catalogo e release si leggono dal vivo nel tuo browser e restano aggiornati senza bisogno di ripubblicare il portale. Lo stesso registry alimenterà presto anche una CLI da terminale, con lo stesso catalogo di oggi.",
        ],
        cta: 'Scopri come funziona nxget',
      },
    },
    flow: {
      alt: 'Schema del flusso: i manifest del registry remoto passano dal portale nxget e diventano link di download.',
      nodes: [
        { eyebrow: '1 · Origine', title: 'Il registry nxget.packages', text: "Un registry pubblico su GitHub con un manifest scritto a mano per ogni app: nome, sviluppatore, descrizione, categoria e le regole per riconoscere i file da scaricare. È l'unica fonte del catalogo." },
        { eyebrow: '2 · Il portale', title: 'nxget, il cuore del sistema', text: 'Legge i manifest dal registry, interroga le release delle app e trasforma ogni manifest in pulsanti di download, uno per piattaforma e architettura. Non ospita e non conserva nessun programma.' },
        { eyebrow: '3 · Il download', title: 'Il pacchetto, direttamente da te', text: "Il pacchetto elaborato dai manifest porta al file pubblicato dallo sviluppatore: lo scarichi direttamente e lo installi nel tuo ambiente, senza passare da server di nxget." },
      ],
    },
    apps: {
      title: 'Applicazioni',
      subtitle: 'Sfoglia la libreria e scarica dalla fonte ufficiale.',
      filterAll: 'Tutte',
      filterCategory: 'Categoria',
      empty: 'Nessuna app trovata per "{query}".',
      emptyFiltered: 'Nessuna app trovata con questi filtri.',
      range: '{from}–{to} di {total} app',
      pagination: 'Paginazione',
      pageLabel: 'Pagina {page}',
      pageOf: 'Pagina {page} di {total}',
    },
    catalog: {
      loading: 'Caricamento del catalogo…',
      error: 'Impossibile caricare il catalogo al momento.',
      retry: 'Riprova',
    },
    features: {
      subtitle: 'Una vetrina pensata per essere semplice, trasparente e sicura.',
      items: [
        { title: 'Multipiattaforma', text: 'Ogni app mostra i download per Windows, macOS e Linux. Dove esistono più architetture (x64, ARM64) o più formati (EXE, MSI, DMG, DEB, AppImage) trovi un pulsante per ciascuna, senza dover indovinare quale scegliere.' },
        { title: 'Selezionate a mano', text: "Il catalogo non è un elenco generato in automatico: ogni app viene scelta una per una e descritta da un manifest scritto a mano. Niente bundle, niente adware." },
        { title: 'Fonti ufficiali', text: 'Nessun mirror di terze parti: i pulsanti puntano ai file pubblicati dagli sviluppatori nelle release GitHub del progetto oppure, per il software chiuso, al link di download del produttore.' },
        { title: 'Catalogo aperto', text: 'Il catalogo vive in un registry pubblico su GitHub, nxget.packages: un manifest YAML per app, leggibile da chiunque e condiviso dal portale e dalla futura CLI.' },
        { title: 'Sempre aggiornato', text: 'Catalogo e release sono letti dal vivo mentre navighi, e il catalogo si riaggiorna da solo ogni ora: quando esce una nuova versione il portale la mostra, senza bisogno di un nuovo deploy.' },
        { title: 'CLI in arrivo', text: 'Lo stesso catalogo alimenterà un client da terminale per installare e aggiornare le app su ogni piattaforma. Trovi i dettagli nella pagina CLI.' },
      ],
      howTitle: 'Come funziona',
      howSubtitle: 'Dal registry al pulsante di download, passo per passo.',
      steps: [
        { title: 'Il catalogo arriva dal registry', text: "All'apertura il portale legge l'indice di nxget.packages, poi il manifest di ogni app, e lo rilegge da solo ogni ora finché resta aperto. Aggiungere o correggere un'app significa modificare un manifest, non ripubblicare il portale." },
        { title: 'Le release si leggono dal vivo', text: 'Per le app con una repo GitHub il portale interroga le release più recenti, escludendo bozze e prerelease, e ne ricava versione e cronologia. Il software chiuso ha invece un link di download fisso nel manifest: nessuna chiamata di rete.' },
        { title: 'Ogni file viene riconosciuto', text: 'Il nome di ogni file della release viene confrontato con le regole del manifest per stabilire piattaforma, architettura e formato. Nascono così pulsanti distinti, come Windows EXE x64 o Linux AppImage ARM64, mai un unico pulsante generico.' },
        { title: 'Scarichi dalla fonte', text: 'Il clic porta direttamente al file pubblicato dallo sviluppatore. Il portale non ospita i programmi e non li fa passare da server propri: è una vetrina, non un mirror.' },
      ],
      knowTitle: 'Dettagli che contano',
      knowSubtitle: "Pensato per l'uso di tutti i giorni.",
      know: [
        { title: 'Sai cosa stai scaricando', text: "Ogni app ha la sua pagina con sviluppatore, descrizione, versione attuale e cronologia delle ultime versioni: vedi cosa scarichi e quanto è recente, prima di cliccare." },
        { title: 'Licenza a portata di clic', text: "Dove la licenza del software è disponibile, un pulsante la apre subito nella pagina dell'app, così puoi leggerne i termini prima di installare." },
        { title: 'Cerca e filtra', text: 'Una ricerca libera per nome e descrizione e un filtro per piattaforma (Windows, macOS, Linux) ti mostrano solo le app che girano sul tuo sistema.' },
        { title: 'App simili a portata di mano', text: 'In fondo a ogni pagina trovi altre app della stessa categoria, per scoprire alternative e software affine senza tornare al catalogo.' },
        { title: 'Sito ufficiale e repo a un clic', text: "Da ogni app raggiungi il sito ufficiale e, quando esiste, la pagina del progetto su GitHub: puoi sempre verificare la fonte di quello che scarichi." },
        { title: 'Nella tua lingua, nel tuo tema', text: "Interfaccia in italiano e in inglese, tema chiaro o scuro: il portale ricorda le tue preferenze e funziona bene anche da telefono." },
      ],
    },
    cli: {
      eyebrow: 'Roadmap',
      title: 'La CLI di nxget arriva presto',
      intro: [
        "Il portale ti aiuta a trovare il download giusto; la CLI servirà a non doverlo cercare più. Stiamo costruendo un client da riga di comando per installare e aggiornare le app del catalogo su Windows, macOS e Linux.",
        "Non nasce come progetto separato: usa lo stesso registry del portale, nxget.packages. Un'app aggiunta al catalogo diventerà disponibile sia sul sito sia da terminale, senza mantenere due elenchi.",
      ],
      roadmap: [
        { title: 'Installa', cmd: 'nxget install <id>', text: "Scarica e installa un'app del catalogo con un solo comando, usando l'id che vedi in ogni pagina di dettaglio (lo stesso del box \"Installa con la CLI di nxget\")." },
        { title: 'Aggiorna', cmd: 'nxget update', text: 'Controlla le release più recenti e mantiene aggiornate le app installate, senza tornare sul sito a scaricare a mano ogni nuova versione.' },
        { title: 'Cross-OS', cmd: 'Windows · macOS · Linux', text: "Un'unica CLI con gli stessi comandi su tutti i sistemi, che sceglie da sola il pacchetto adatto al tuo sistema operativo e alla tua architettura." },
      ],
      whyTitle: 'Perché una CLI',
      whySubtitle: 'Cosa cambia rispetto a scaricare dal sito.',
      why: [
        { title: 'Un catalogo, due modi di usarlo', text: 'Sfogli dal portale quando vuoi scoprire, installi da terminale quando sai già cosa ti serve: le app sono le stesse.' },
        { title: 'Meno passaggi a mano', text: 'Niente ricerca della pagina giusta, del file giusto e del formato giusto: un comando al posto di un giro tra sito e cartella Download.' },
        { title: 'Sempre dalla fonte ufficiale', text: 'Come sul portale, i file arrivano da chi li pubblica: release del progetto o link del produttore, senza mirror di terze parti.' },
        { title: 'Aggiornamenti senza rincorrerli', text: 'Invece di controllare app per app se è uscita una nuova versione, un solo comando le confronta con le release più recenti.' },
      ],
      previewTitle: 'Come sarà',
      previewNote: 'Anteprima dei comandi previsti: la CLI non è ancora disponibile.',
      howTitle: 'Come funzionerà',
      howSubtitle: 'Gli stessi passaggi del portale, eseguiti dal terminale.',
      steps: [
        { title: 'Legge lo stesso registry', text: 'Userà nxget.packages, il registry pubblico che alimenta il portale: stesse app, stessi manifest, nessun secondo catalogo da mantenere.' },
        { title: 'Trova la release giusta', text: 'Risolverà le release come fa il portale: ultima release stabile della repo GitHub indicata nel manifest oppure, per il software chiuso, il link di download fisso.' },
        { title: 'Individua il tuo pacchetto', text: 'Confrontando i nomi dei file con le regole del manifest riconoscerà il pacchetto adatto al tuo sistema operativo, alla tua architettura e al formato previsto.' },
        { title: 'Scarica e installa', text: "Scaricherà il file dalla fonte ufficiale e ne avvierà l'installazione, senza passare da server di nxget." },
      ],
      statusTitle: 'A che punto siamo',
      statusSubtitle: 'Cosa esiste già e cosa è ancora da fare.',
      status: [
        { label: 'Disponibile', state: 'done', title: 'Registry nxget.packages', text: 'Il registry pubblico con un manifest per app è online e già usato dal portale.' },
        { label: 'Disponibile', state: 'done', title: 'Portale', text: 'Catalogo, download per piattaforma e architettura, cronologia versioni: quello che stai usando adesso.' },
        { label: 'Pianificata', state: 'planned', title: 'CLI', text: 'Vivrà in una repo dedicata, nxget.cli. Il design è ancora da definire, compresi i dettagli di installazione per ogni formato di pacchetto.' },
      ],
      cta: 'Segui lo sviluppo su GitHub',
    },
    about: {
      eyebrow: 'Chi siamo',
      title: 'Da dove viene nxget',
      refBlog: 'Il blog personale di Keivan Beigi — "The Day AppGet Died"',
      infoPill: 'INFO',
      copyright: 'Copyright © 2026 vlT di Veronesi Lorenzo — Tutti i diritti riservati',
    },
    appDetail: {
      back: 'Indietro',
      versionHistory: 'Cronologia versioni',
      infoTitle: 'Informazioni',
      publisher: 'Sviluppatore',
      version: 'Versione attuale',
      category: 'Categoria',
      platforms: 'Piattaforme',
      appId: 'ID app',
      loading: 'Caricamento…',
      moreIn: 'Altre app in {category}',
      cliSummary: 'Installa con la CLI di nxget',
      comingSoon: 'In arrivo',
      copy: 'Copia',
      copied: 'Copiato',
      cliNote: 'La CLI non è ancora disponibile — per ora usa i download qui sopra.',
    },
    downloadCard: {
      by: 'di',
      viewOnGithub: 'Vedi su GitHub',
      visitWebsite: 'Visita il sito ufficiale',
      fetching: "Recupero dell'ultima release…",
      viewReleases: 'Vedi le release su GitHub',
    },
    license: {
      button: 'Licenza',
      eyebrow: 'Licenza',
      title: 'Licenza di {name}',
      openSource: 'Apri su GitHub',
      close: 'Chiudi',
    },
    voucher: {
      disclaimerLocked: 'Questo software è distribuito esclusivamente su concessione del titolare. Scaricarlo senza un voucher valido non è autorizzato e viola le condizioni della licenza.',
      disclaimerUnlocked: 'Download concesso tramite voucher personale: violarne i termini viola la licenza. Disponibile ancora per {time}, poi ne serve uno nuovo.',
      lockedButton: 'Download bloccato: richiedi il voucher',
      requestButton: 'Richiedi voucher',
      close: 'Chiudi',
      title: 'Richiedi il voucher di download',
      intro: 'Inserisci nome e cognome (sole lettere, massimo 24 caratteri in tutto): verrà generato il tuo codice richiesta personale, che contiene il tuo nome.',
      firstName: 'Nome',
      lastName: 'Cognome',
      generate: 'Genera codice richiesta',
      requestFor: 'Codice richiesta di {name}',
      sendToBefore: 'Invia questo codice a',
      sendToAfter: '(email o richiesta): riceverai il tuo voucher completo, da incollare qui sotto.',
      change: 'Modifica nome e cognome',
      redeemLabel: 'Hai già ricevuto il voucher completo?',
      redeemPlaceholder: 'Incolla il voucher completo (131 caratteri)',
      redeem: 'Sblocca',
      err: {
        name: 'Inserisci nome e cognome con sole lettere (massimo 24 caratteri in tutto, spazi inclusi).',
        format: 'Inserisci il voucher completo, di 131 caratteri: controlla di averlo copiato per intero.',
        app: 'Questo voucher è stato emesso per un altro software.',
        invalid: 'Voucher non valido.',
        used: 'Questo voucher è già stato usato: ne serve uno nuovo.',
        unavailable: 'Il sistema di voucher non è ancora attivo su questo sito: riprova più tardi.',
        unsupported: 'Questo browser non supporta la verifica dei voucher: aggiornalo o usane uno più recente.',
      },
    },
    aboutModal: {
      eyebrow: 'Info',
      version: 'Versione',
      build: 'Build',
      updated: 'Aggiornato',
      title: 'nxget app portal',
      close: 'Chiudi',
      notice: 'nxget è un progetto vlT.',
      rights: 'Tutti i diritti riservati.',
    },
    footer: {
      tagline: 'Il tuo portale open per software multipiattaforma.',
      builtWith: 'Realizzato con',
      and: 'e',
    },
    theme: {
      switchToLight: 'Passa al tema chiaro',
      switchToDark: 'Passa al tema scuro',
      light: 'Tema chiaro',
      dark: 'Tema scuro',
    },
    lang: {
      switchTo: 'Passa all\'inglese',
    },
  },
  en: {
    nav: {
      home: 'Home',
      apps: 'Apps',
      features: 'Why nxget',
      cli: 'CLI',
      about: 'About',
    },
    search: {
      placeholder: 'Search for an app...',
      ariaLabel: 'Search for an app',
      button: 'Search',
    },
    hero: {
      eyebrow: 'Open portal · no sign-up required',
      titleBefore: 'Your hub for',
      titleAccent: 'cross-platform',
      titleAfter: ' software',
      subtitle: 'One place to discover and download applications available on Windows, macOS and Linux — with direct links to their official sources.',
      stat: '{count} apps available and growing',
    },
    home: {
      featuredTitle: 'Featured',
      featuredSubtitle: 'A quick look at a few apps from the library.',
      viewAll: 'View all apps',
      about: {
        title: 'What nxget is',
        text: [
          "nxget brings applications for Windows, macOS and Linux together in one place: it reads the manifests of a public registry, turns them into download buttons that are always current, and takes you straight to the file the developer published, without going through its own servers.",
          "There's no account to create and no backend in the way: the catalog and its releases are read live in your browser and stay current without the portal ever needing to be redeployed. The same registry will soon power a terminal CLI too, built on today's very catalog.",
        ],
        cta: 'See how nxget works',
      },
    },
    flow: {
      alt: 'Flow diagram: the manifests from the remote registry go through the nxget portal and become download links.',
      nodes: [
        { eyebrow: '1 · Source', title: 'The nxget.packages registry', text: 'A public registry on GitHub with a hand-written manifest for every app: name, developer, description, category and the rules to recognize the files to download. It is the single source of the catalog.' },
        { eyebrow: '2 · The portal', title: 'nxget, the heart of the system', text: 'It reads the manifests from the registry, queries the apps\' releases and turns each manifest into download buttons, one per platform and architecture. It hosts and stores no program.' },
        { eyebrow: '3 · The download', title: 'The package, straight to you', text: 'The package built from the manifests leads to the file the developer published: you download it directly and install it in your own environment, without going through any nxget server.' },
      ],
    },
    apps: {
      title: 'Applications',
      subtitle: 'Browse the library and download from the official source.',
      filterAll: 'All',
      filterCategory: 'Category',
      empty: 'No app found for "{query}".',
      emptyFiltered: 'No app matches these filters.',
      range: '{from}–{to} of {total} apps',
      pagination: 'Pagination',
      pageLabel: 'Page {page}',
      pageOf: 'Page {page} of {total}',
    },
    catalog: {
      loading: 'Loading the catalog…',
      error: "Couldn't load the catalog right now.",
      retry: 'Retry',
    },
    features: {
      subtitle: 'A showcase built to be simple, transparent and safe.',
      items: [
        { title: 'Cross-Platform', text: 'Every app shows its downloads for Windows, macOS and Linux. Where several architectures (x64, ARM64) or formats (EXE, MSI, DMG, DEB, AppImage) exist, you get one button for each, so you never have to guess which one to pick.' },
        { title: 'Hand-Picked', text: 'The catalog is not an auto-generated list: every app is chosen one by one and described by a hand-written manifest. No bundles, no adware.' },
        { title: 'Official Sources', text: "No third-party mirrors: buttons point to the files developers publish in the project's GitHub releases or, for closed-source software, to the vendor's own download link." },
        { title: 'Open Catalog', text: 'The catalog lives in a public registry on GitHub, nxget.packages: one YAML manifest per app, readable by anyone and shared by the portal and the upcoming CLI.' },
        { title: 'Always Up to Date', text: 'Catalog and releases are read live as you browse, and the catalog refreshes itself every hour: when a new version ships, the portal shows it without needing a new deploy.' },
        { title: 'CLI Coming Soon', text: 'The same catalog will power a terminal client to install and update apps on every platform. The CLI page has the details.' },
      ],
      howTitle: 'How it works',
      howSubtitle: 'From the registry to the download button, step by step.',
      steps: [
        { title: 'The catalog comes from the registry', text: "On load the portal reads the nxget.packages index, then each app's manifest, and re-reads it on its own every hour while it stays open. Adding or fixing an app means editing a manifest, not redeploying the portal." },
        { title: 'Releases are read live', text: "For apps with a GitHub repo the portal queries the latest releases, skipping drafts and prereleases, and derives version and history from them. Closed-source software instead has a fixed download link in its manifest: no network call at all." },
        { title: 'Every file is recognized', text: "Each release file name is matched against the manifest's rules to work out platform, architecture and format. That's how you get distinct buttons like Windows EXE x64 or Linux AppImage ARM64, never a single generic one." },
        { title: 'You download from the source', text: "The click goes straight to the file the developer published. The portal doesn't host the programs and doesn't route them through its own servers: it's a showcase, not a mirror." },
      ],
      knowTitle: 'Details that matter',
      knowSubtitle: 'Built for everyday use.',
      know: [
        { title: "Know what you're downloading", text: "Every app has its own page with developer, description, current version and a history of recent versions: you see what you're getting and how recent it is before you click." },
        { title: 'License one click away', text: "Where the software's license is available, a button opens it right on the app page, so you can read its terms before installing." },
        { title: 'Search and filter', text: 'Free-text search by name and description plus a platform filter (Windows, macOS, Linux) show you only the apps that run on your system.' },
        { title: 'Similar apps at hand', text: 'At the bottom of every page you find more apps from the same category, to discover alternatives and related software without going back to the catalog.' },
        { title: 'Official site and repo one click away', text: "From every app you can reach the official website and, when there is one, the project's GitHub page: you can always check the source of what you download." },
        { title: 'Your language, your theme', text: 'Interface in Italian and English, light or dark theme: the portal remembers your preferences and works well on a phone too.' },
      ],
    },
    cli: {
      eyebrow: 'Roadmap',
      title: 'The nxget CLI is coming soon',
      intro: [
        "The portal helps you find the right download; the CLI will spare you from looking for it at all. We're building a command-line client to install and update the apps in the catalog on Windows, macOS and Linux.",
        "It isn't a separate project: it uses the same registry as the portal, nxget.packages. An app added to the catalog will show up both on the site and in the terminal, with no second list to maintain.",
      ],
      roadmap: [
        { title: 'Install', cmd: 'nxget install <id>', text: 'Download and install a catalog app with a single command, using the id shown on every detail page (the same one in the "Install with the nxget CLI" box).' },
        { title: 'Update', cmd: 'nxget update', text: 'Checks the latest releases and keeps your installed apps current, without going back to the site to download every new version by hand.' },
        { title: 'Cross-OS', cmd: 'Windows · macOS · Linux', text: 'One CLI with the same commands everywhere, picking the package that fits your operating system and architecture on its own.' },
      ],
      whyTitle: 'Why a CLI',
      whySubtitle: 'What changes compared to downloading from the site.',
      why: [
        { title: 'One catalog, two ways to use it', text: 'Browse the portal when you want to discover, install from the terminal when you already know what you need: the apps are the same.' },
        { title: 'Fewer manual steps', text: 'No hunting for the right page, the right file and the right format: one command instead of a trip between the site and your Downloads folder.' },
        { title: 'Always from the official source', text: "As on the portal, files come from whoever publishes them: the project's releases or the vendor's link, with no third-party mirrors." },
        { title: 'Updates without chasing them', text: 'Instead of checking app by app whether a new version is out, a single command compares them with the latest releases.' },
      ],
      previewTitle: 'What it will look like',
      previewNote: 'Preview of the planned commands: the CLI is not available yet.',
      howTitle: 'How it will work',
      howSubtitle: 'The same steps as the portal, run from the terminal.',
      steps: [
        { title: 'Reads the same registry', text: 'It will use nxget.packages, the public registry that powers the portal: same apps, same manifests, no second catalog to maintain.' },
        { title: 'Finds the right release', text: "It will resolve releases the way the portal does: the latest stable release of the GitHub repo named in the manifest or, for closed-source software, the fixed download link." },
        { title: 'Picks your package', text: "By matching file names against the manifest's rules it will recognize the package that fits your operating system, your architecture and the expected format." },
        { title: 'Downloads and installs', text: "It will download the file from the official source and start its installation, without going through any nxget server." },
      ],
      statusTitle: 'Where we are',
      statusSubtitle: "What already exists and what's still to do.",
      status: [
        { label: 'Available', state: 'done', title: 'nxget.packages registry', text: 'The public registry with one manifest per app is online and already used by the portal.' },
        { label: 'Available', state: 'done', title: 'Portal', text: 'Catalog, per-platform and per-architecture downloads, version history: what you are using right now.' },
        { label: 'Planned', state: 'planned', title: 'CLI', text: 'It will live in a dedicated repo, nxget.cli. The design is still to be defined, including installation details for each package format.' },
      ],
      cta: 'Follow development on GitHub',
    },
    about: {
      eyebrow: 'About',
      title: 'Where nxget comes from',
      refBlog: 'Keivan Beigi\'s blog — "The Day AppGet Died"',
      infoPill: 'INFO',
      copyright: 'Copyright © 2026 vlT di Veronesi Lorenzo — All rights reserved',
    },
    appDetail: {
      back: 'Back',
      versionHistory: 'Version history',
      infoTitle: 'Information',
      publisher: 'Publisher',
      version: 'Current version',
      category: 'Category',
      platforms: 'Platforms',
      appId: 'App ID',
      loading: 'Loading…',
      moreIn: 'More {category}',
      cliSummary: 'Install with the nxget CLI',
      comingSoon: 'Coming soon',
      copy: 'Copy',
      copied: 'Copied',
      cliNote: "The CLI isn't out yet — for now, use the downloads above.",
    },
    downloadCard: {
      by: 'by',
      viewOnGithub: 'View on GitHub',
      visitWebsite: 'Visit official website',
      fetching: 'Fetching the latest release…',
      viewReleases: 'View releases on GitHub',
    },
    license: {
      button: 'License',
      eyebrow: 'License',
      title: '{name} license',
      openSource: 'Open on GitHub',
      close: 'Close',
    },
    voucher: {
      disclaimerLocked: "This software is distributed exclusively by the owner's permission. Downloading it without a valid voucher is not authorized and violates the license terms.",
      disclaimerUnlocked: 'Download granted through a personal voucher: misusing it violates the license. Available for another {time}, then a new one is required.',
      lockedButton: 'Download locked: request the voucher',
      requestButton: 'Request voucher',
      close: 'Close',
      title: 'Request the download voucher',
      intro: 'Enter your first and last name (letters only, 24 characters max in total): your personal request code will be generated, and it contains your name.',
      firstName: 'First name',
      lastName: 'Last name',
      generate: 'Generate request code',
      requestFor: "{name}'s request code",
      sendToBefore: 'Send this code to',
      sendToAfter: '(email or request): you will get your complete voucher, to paste below.',
      change: 'Change first and last name',
      redeemLabel: 'Already got your complete voucher?',
      redeemPlaceholder: 'Paste the complete voucher (131 characters)',
      redeem: 'Unlock',
      err: {
        name: 'Enter a first and last name using letters only (24 characters max in total, spaces included).',
        format: 'Enter the complete 131-character voucher: check that you copied all of it.',
        app: 'This voucher was issued for a different software.',
        invalid: 'This voucher is not valid.',
        used: 'This voucher has already been used: a new one is required.',
        unavailable: "The voucher system isn't active on this site yet: please try again later.",
        unsupported: 'This browser cannot verify vouchers: please update it or use a newer one.',
      },
    },
    aboutModal: {
      eyebrow: 'Info',
      version: 'Version',
      build: 'Build',
      updated: 'Updated',
      title: 'nxget app portal',
      close: 'Close',
      notice: 'nxget is a vlT project.',
      rights: 'All rights reserved.',
    },
    footer: {
      tagline: 'Your open portal for cross-platform software.',
      builtWith: 'Built with',
      and: '&',
    },
    theme: {
      switchToLight: 'Switch to light theme',
      switchToDark: 'Switch to dark theme',
      light: 'Light theme',
      dark: 'Dark theme',
    },
    lang: {
      switchTo: 'Switch to Italian',
    },
  },
}

const getPath = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj)

const interpolate = (value, vars) => {
  if (typeof value !== 'string' || !vars) return value
  return value.replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''))
}

export const getLangPreference = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGS.has(saved)) return saved
  } catch {
    // localStorage unavailable (privacy mode, etc.): fall back to the default.
  }
  return DEFAULT_LANG
}

export const setLangPreference = lang => {
  const normalized = LANGS.has(lang) ? lang : DEFAULT_LANG
  try {
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    // The <html lang> attribute is still updated by the provider regardless.
  }
  return normalized
}

const LanguageContext = createContext(null)

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(getLangPreference)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = next => setLangState(setLangPreference(next))
  const toggleLang = () => setLang(lang === 'it' ? 'en' : 'it')
  const t = (key, vars) => interpolate(getPath(uiText[lang], key) ?? key, vars)

  return createElement(LanguageContext.Provider, { value: { lang, setLang, toggleLang, t } }, children)
}

export const useLang = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
