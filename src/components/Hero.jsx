import { useEffect, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi2'
import { useLang } from '../lib/uiText.js'
import { useRegistryStatus } from './DataContext.jsx'
import NxgetLogo from './NxgetLogo.jsx'
import CatalogTower, { CATALOG_RESTART_MS } from './CatalogTower.jsx'
import '../css/hero.css'

const COUNT_ANIM_MS = 900

const Hero = ({ onSearch, appCount, visible = true, discoverAlreadyPlayed = false, onDiscoverPlayed }) => {
  const { t, lang } = useLang()
  const [displayCount, setDisplayCount] = useState(0)
  const [animateLogo, setAnimateLogo] = useState(false)
  const registry = useRegistryStatus()

  useEffect(() => {
    if (!visible || discoverAlreadyPlayed || animateLogo) return
    setAnimateLogo(true)
    onDiscoverPlayed?.()
  }, [visible, discoverAlreadyPlayed, animateLogo, onDiscoverPlayed])

  useEffect(() => {
    if (!visible || !appCount) {
      setDisplayCount(0)
      return
    }

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplayCount(appCount)
      return
    }

    let current = 0
    setDisplayCount(0)
    const stepMs = Math.max(16, Math.round(COUNT_ANIM_MS / appCount))
    const id = setInterval(() => {
      current += 1
      setDisplayCount(current)
      if (current >= appCount) clearInterval(id)
    }, stepMs)

    return () => clearInterval(id)
  }, [appCount, visible])

  const formatUpdated = iso => {
    const date = new Date(iso)
    const locale = lang === 'it' ? 'it-IT' : 'en-US'
    return {
      date: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date),
      time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date),
    }
  }

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-eyebrow">{t('hero.eyebrow')}</span>
          <h1 className="hero-title">
            {t('hero.titleBefore')} <span className="hero-title-accent">{t('hero.titleAccent')}</span>{t('hero.titleAfter')}
          </h1>
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>

          <div className="hero-discover-group">
            <div className="hero-discover-anim">
              <div className="hero-discover-wrap">
                <div className="hero-discover-texture" />
                <button type="button" className="hero-discover" onClick={onSearch}>
                  <NxgetLogo iconOnly animated={animateLogo} className="hero-discover-logo" />
                  <span className="hero-discover-label">{t('hero.discoverCta')}</span>
                  <HiOutlineArrowRight className="hero-discover-arrow" />
                </button>
              </div>
            </div>

            <div className="hero-stats">
              <span className="hero-stat-pill">
                <span className={`hero-stat-value${appCount === 0 ? ' hero-stat-value--loading' : ''}`}>{displayCount}</span>
                <span className="hero-stat-label">{t('hero.stat.apps')}</span>
              </span>

              <span className={`hero-stat-pill hero-stat-pill--registry${registry.status === 'offline' ? ' hero-stat-pill--offline' : ''}`}>
                <span className={`hero-live-dot${registry.status === 'offline' ? ' hero-live-dot--offline' : ''}`} />
                <span className="hero-stat-label">
                  {registry.status === 'offline' ? t('hero.stat.offline') : t('hero.stat.live')}
                  {registry.updatedAt ? ` · ${t('hero.stat.updated', formatUpdated(registry.updatedAt))}` : ''}
                </span>
              </span>
            </div>
          </div>
        </div>

        <CatalogTower className="hero-illustration" restartInterval={CATALOG_RESTART_MS} />
      </div>
    </section>
  )
}

export default Hero
