import { useRef, useState } from 'react'
import '../css/app.css'
import Navbar from './Navbar.jsx'
import HomeView from './HomeView.jsx'
import AppsView from './AppsView.jsx'
import FeaturesView from './FeaturesView.jsx'
import CliView from './CliView.jsx'
import AboutView from './AboutView.jsx'
import AppDetailView from './AppDetailView.jsx'
import NxgetLogo from './NxgetLogo.jsx'
import AboutModal from './AboutModal.jsx'
import { SiGithub, SiReact, SiVite } from 'react-icons/si'
import { useLang } from '../lib/uiText.js'
import pkg from '../../package.json'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL
const INITIAL_APPS_STATE = { query: '', platform: 'all', category: 'all', page: 1 }

const App = () => {
  const { t } = useLang()
  const [view, setView] = useState('home')
  const [appsState, setAppsState] = useState(INITIAL_APPS_STATE)
  const savedScroll = useRef(0)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [returnView, setReturnView] = useState('home')
  // Una tantum per sessione: `HomeView` si rimonta ogni volta che si torna
  // in Home (stesso `<main key={view}>` di sempre), ma questo flag vive
  // qui, non dentro `HomeView`, quindi non si resetta con lei — passato giù
  // come "l'ho già visto", una sola vera esecuzione dello splash finché la
  // pagina non viene ricaricata.
  const [homeSplashDone, setHomeSplashDone] = useState(false)
  const homeSplashActive = view === 'home' && !homeSplashDone

  const nav = (v, q = '') => {
    if (v === 'apps') setAppsState({ ...INITIAL_APPS_STATE, query: q })
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setView(returnView)
    if (returnView === 'apps') {
      const top = savedScroll.current
      requestAnimationFrame(() => window.scrollTo({ top, behavior: 'auto' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const openDetail = app => {
    if (view === 'apps') savedScroll.current = window.scrollY
    setSelectedApp(app)
    setReturnView(view === 'app-detail' ? returnView : view)
    setView('app-detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container">
      <Navbar view={view} onNav={nav} hidden={homeSplashActive} />
      <main key={view} className="view-content">
        {view === 'home'       && (
          <HomeView
            onNav={nav}
            onSelect={openDetail}
            splashAlreadyPlayed={homeSplashDone}
            onSplashDone={() => setHomeSplashDone(true)}
          />
        )}
        {view === 'apps'       && <AppsView state={appsState} onStateChange={setAppsState} onSelect={openDetail} />}
        {view === 'features'   && <FeaturesView />}
        {view === 'cli'        && <CliView />}
        {view === 'about'      && <AboutView onOpenAbout={() => setAboutOpen(true)} />}
        {view === 'app-detail' && selectedApp && (
          <AppDetailView key={selectedApp.id} app={selectedApp} onBack={goBack} onSelect={openDetail} />
        )}
      </main>

      <footer className={`ftr${homeSplashActive ? ' ftr--hidden' : ''}`}>
        <div className="ftr-body">
          <div className="ftr-brand">
            <button className="ftr-logo-btn" onClick={() => nav('home')} aria-label={t('nav.home')}>
              <NxgetLogo />
            </button>
            <p className="ftr-tagline">{t('footer.tagline')}</p>
          </div>

          <div className="ftr-actions">
            {GITHUB_URL && (
              <a className="ftr-social-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <SiGithub />
              </a>
            )}
            <button className="ftr-version" onClick={() => setAboutOpen(true)}>
              v{pkg.version}{pkg.build ? ` · ${pkg.build}` : ''}
            </button>
          </div>
        </div>

        <div className="ftr-bottom">
          <span className="ftr-copy">© 2026 vlT · Veronesi Lorenzo</span>
          <span className="ftr-sep">·</span>
          <span className="ftr-stack">
            {t('footer.builtWith')} <SiReact className="ftr-stack-icon" /> React {t('footer.and')} <SiVite className="ftr-stack-icon" /> Vite
          </span>
        </div>
      </footer>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}

export default App
