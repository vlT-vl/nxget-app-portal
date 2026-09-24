import { useEffect, useMemo, useState } from 'react'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import Hero from './Hero.jsx'
import AppCard from './AppCard.jsx'
import DownloadFlow from './DownloadFlow.jsx'
import NxgetLogo from './NxgetLogo.jsx'
import { useCatalog, useNewestAppIds } from './DataContext.jsx'
import { useLang } from '../lib/uiText.js'
import '../css/homeview.css'

const FEATURED_COUNT = 5
// Logo completo (icona a onda + scritta a macchina da scrivere, vedi
// nxgetlogo.css): l'onda finisce a 0.855s, la scritta parte a 0.95s e dura
// 0.7s ⇒ tutto composto a 1.65s. L'attesa lascia il logo intero a schermo
// solo un istante in più dopo, "il tempo di vederlo", non un'attesa vuota.
const SPLASH_HOLD_MS = 1950
const SPLASH_FADE_MS = 350

const HomeView = ({ onNav, onSelect, splashAlreadyPlayed = false, onSplashDone }) => {
  const { t } = useLang()
  const { apps, status } = useCatalog()
  const newestIds = useNewestAppIds()
  const [splashPhase, setSplashPhase] = useState(splashAlreadyPlayed ? 'done' : 'showing')

  useEffect(() => {
    if (splashAlreadyPlayed) return
    const holdTimer = setTimeout(() => setSplashPhase('fading'), SPLASH_HOLD_MS)
    return () => clearTimeout(holdTimer)
  }, [splashAlreadyPlayed])

  useEffect(() => {
    if (splashPhase !== 'fading') return
    const fadeTimer = setTimeout(() => {
      setSplashPhase('done')
      onSplashDone?.()
    }, SPLASH_FADE_MS)
    return () => clearTimeout(fadeTimer)
  }, [splashPhase, onSplashDone])

  const featured = useMemo(() => {
    const byId = new Map(apps.map(a => [a.id, a]))
    const newest = newestIds.map(id => byId.get(id)).filter(Boolean)
    const rest = apps.filter(a => !newestIds.includes(a.id))
    return [...newest, ...rest].slice(0, FEATURED_COUNT)
  }, [apps, newestIds])

  return (
    <>
      <div className="home-hero-wrap">
        {splashPhase !== 'done' && (
          <div className={`home-splash${splashPhase === 'fading' ? ' home-splash--out' : ''}`}>
            <NxgetLogo className="home-splash-icon" animated stacked />
          </div>
        )}

        <Hero appCount={apps.length} onSearch={q => onNav('apps', q)} />
      </div>

      {splashPhase === 'done' && (
        <>
          <section className="home-about">
            <div className="home-about-inner">
              <DownloadFlow className="home-about-flow" />

              <div className="home-about-text">
                <h2 className="section-title">{t('home.about.title')}</h2>
                {t('home.about.text').map(p => (
                  <p key={p} className="home-about-lead">{p}</p>
                ))}
                <button className="home-about-cta" onClick={() => onNav('features')}>
                  {t('home.about.cta')} <HiOutlineChevronRight />
                </button>
              </div>
            </div>
          </section>

          <section className="featured">
            <div className="featured-inner">
              <div className="featured-header">
                <div>
                  <h2 className="section-title">{t('home.featuredTitle')}</h2>
                  <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
                </div>
                <button className="featured-all-btn" onClick={() => onNav('apps')}>
                  {t('home.viewAll')}
                </button>
              </div>

              {status === 'loading' && apps.length === 0 && (
                <p className="apps-empty">{t('catalog.loading')}</p>
              )}

              {status === 'error' && apps.length === 0 && (
                <p className="apps-empty">{t('catalog.error')}</p>
              )}

              {featured.length > 0 && (
                <div className="apps-grid">
                  {featured.map((app, i) => <AppCard key={app.id} app={app} index={i} onSelect={onSelect} featured />)}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  )
}

export default HomeView
