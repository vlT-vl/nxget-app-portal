import { useEffect, useMemo, useState } from 'react'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import Hero from './Hero.jsx'
import AppCard from './AppCard.jsx'
import DownloadFlow from './DownloadFlow.jsx'
import NxgetLogo from './NxgetLogo.jsx'
import { useCatalog, useNewestAppIds } from './DataContext.jsx'
import { useLang } from '../lib/uiText.js'
import '../css/homeview.css'

const FEATURED_COUNT = 4
const SPLASH_HOLD_MS = 3400
const SPLASH_FADE_MS = 750

const HomeView = ({ onNav, onSelect, splashAlreadyPlayed = false, onSplashDone, discoverAlreadyPlayed = false, onDiscoverPlayed }) => {
  const { t } = useLang()
  const { apps, status } = useCatalog()
  const newestIds = useNewestAppIds()
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [splashPhase, setSplashPhase] = useState(splashAlreadyPlayed || reduceMotion ? 'done' : 'showing')

  useEffect(() => {
    if (splashPhase === 'done') return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = prev }
  }, [splashPhase])

  useEffect(() => {
    if (splashAlreadyPlayed || reduceMotion) {
      if (!splashAlreadyPlayed) onSplashDone?.()
      return
    }
    const holdTimer = setTimeout(() => setSplashPhase('fading'), SPLASH_HOLD_MS)
    return () => clearTimeout(holdTimer)
  }, [splashAlreadyPlayed, reduceMotion, onSplashDone])

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
            <div className="home-splash-stage">
              <NxgetLogo className="home-splash-icon" animated stacked />
              <p className="home-splash-tagline">
                {t('splash.tagline').split(' ').map((w, i) => (
                  <span key={i} className="home-splash-word" style={{ '--w': i }}>{w}</span>
                ))}
              </p>
            </div>
          </div>
        )}

        <Hero
          appCount={apps.length}
          onSearch={() => onNav('apps', '', true)}
          visible={splashPhase !== 'showing'}
          discoverAlreadyPlayed={discoverAlreadyPlayed}
          onDiscoverPlayed={onDiscoverPlayed}
        />
      </div>

      {splashPhase === 'done' && (
        <>
          <section className="home-about sec-fx">
            <div className="home-about-inner">
              <DownloadFlow className="home-about-flow rv rv--zoom" />

              <div className="home-about-text rv rv--left">
                <h2 className="section-title title-shine rv">{t('home.about.title')}</h2>
                {t('home.about.text').map(p => (
                  <p key={p} className="home-about-lead">{p}</p>
                ))}
                <button className="home-about-cta btn-shine" onClick={() => onNav('features')}>
                  {t('home.about.cta')} <HiOutlineChevronRight />
                </button>
              </div>
            </div>
          </section>

          <section className="featured sec-fx sec-fx--left">
            <div className="featured-inner">
              <div className="featured-header rv">
                <div>
                  <h2 className="section-title title-shine rv">{t('home.featuredTitle')}</h2>
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
