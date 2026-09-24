import { useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { useLang } from '../lib/uiText.js'
import CatalogTower, { CATALOG_RESTART_MS } from './CatalogTower.jsx'
import '../css/hero.css'

const Hero = ({ onSearch, appCount }) => {
  const { t } = useLang()
  const [text, setText] = useState('')

  const submit = e => {
    e.preventDefault()
    onSearch(text)
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

          <form className="hero-search" onSubmit={submit} role="search">
            <HiOutlineSearch className="hero-search-icon" />
            <input
              type="search"
              className="hero-search-input"
              placeholder={t('search.placeholder')}
              value={text}
              onChange={e => setText(e.target.value)}
              aria-label={t('search.ariaLabel')}
            />
            <button type="submit" className="hero-search-btn">{t('search.button')}</button>
          </form>

          <p className="hero-stat">{t('hero.stat', { count: appCount })}</p>
        </div>

        <CatalogTower className="hero-illustration" restartInterval={CATALOG_RESTART_MS} />
      </div>
    </section>
  )
}

export default Hero
