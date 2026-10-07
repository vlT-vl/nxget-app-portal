import { useEffect, useMemo, useRef, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { HiOutlineChevronDown } from 'react-icons/hi2'
import { VscError } from 'react-icons/vsc'
import AppCard from './AppCard.jsx'
import CatalogTower, { CATALOG_RESTART_MS } from './CatalogTower.jsx'
import FlowGlyph from './FlowGlyph.jsx'
import NxgetLogo from './NxgetLogo.jsx'
import { useCatalog, PLATFORM_META, getPlatforms, resolveAllDownloads, useCategoryHues } from './DataContext.jsx'
import { getDescription } from '../lib/appText.js'
import { VLT_CATEGORY } from '../lib/access.js'
import { useLang } from '../lib/uiText.js'
import '../css/appsview.css'

const PLATFORMS = Object.keys(PLATFORM_META)
const PAGE_SIZE = 16
const MENU_CLOSE_MS = 180

const AppsView = ({ state, onStateChange, onSelect, titleAlreadyPlayed = false, onTitlePlayed }) => {
  const { t, lang } = useLang()
  const { apps, status, refreshCatalog } = useCatalog()
  const categoryHues = useCategoryHues()
  const { query, platform, category, page } = state
  const [downloadsByApp, setDownloadsByApp] = useState(null)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [platformClosing, setPlatformClosing] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryClosing, setCategoryClosing] = useState(false)
  const viewRef = useRef(null)
  const platformRef = useRef(null)
  const categoryRef = useRef(null)
  const headerRef = useRef(null)
  const searchInputRef = useRef(null)
  const [animateTitle] = useState(() => !titleAlreadyPlayed)
  const [headerOut, setHeaderOut] = useState(false)
  const [focusSearchOnMount] = useState(() => state.focusSearch)

  useEffect(() => {
    if (animateTitle) onTitlePlayed?.()
  }, [animateTitle, onTitlePlayed])

  useEffect(() => {
    if (focusSearchOnMount) searchInputRef.current?.focus()
  }, [focusSearchOnMount])

  useEffect(() => {
    const node = headerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderOut(!entry.isIntersecting),
      { rootMargin: '-90px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const closePlatformMenu = () => {
    setPlatformClosing(true)
    setTimeout(() => { setPlatformOpen(false); setPlatformClosing(false) }, MENU_CLOSE_MS)
  }

  const closeCategoryMenu = () => {
    setCategoryClosing(true)
    setTimeout(() => { setCategoryOpen(false); setCategoryClosing(false) }, MENU_CLOSE_MS)
  }

  const togglePlatformMenu = () => {
    if (platformOpen) closePlatformMenu()
    else {
      if (categoryOpen) closeCategoryMenu()
      setPlatformOpen(true)
    }
  }

  const toggleCategoryMenu = () => {
    if (categoryOpen) closeCategoryMenu()
    else {
      if (platformOpen) closePlatformMenu()
      setCategoryOpen(true)
    }
  }

  useEffect(() => {
    if (apps.length === 0) return
    let cancelled = false
    resolveAllDownloads(apps).then(result => { if (!cancelled) setDownloadsByApp(result) })
    return () => { cancelled = true }
  }, [apps])

  useEffect(() => {
    if (!platformOpen && !categoryOpen) return undefined
    const onPointerDown = e => {
      if (platformOpen && platformRef.current && !platformRef.current.contains(e.target)) closePlatformMenu()
      if (categoryOpen && categoryRef.current && !categoryRef.current.contains(e.target)) closeCategoryMenu()
    }
    const onKeyDown = e => {
      if (e.key !== 'Escape') return
      if (platformOpen) closePlatformMenu()
      if (categoryOpen) closeCategoryMenu()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [platformOpen, categoryOpen])

  const categories = useMemo(
    () => [...new Set(apps.map(app => app.category))].sort((a, b) => a.localeCompare(b)),
    [apps]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return apps.filter(app => {
      const matchesQuery = !q
        || app.name.toLowerCase().includes(q)
        || getDescription(app, lang).toLowerCase().includes(q)
        || getDescription(app, 'en').toLowerCase().includes(q)
        || app.category.toLowerCase().includes(q)
      const matchesPlatform = platform === 'all' || getPlatforms(downloadsByApp?.[app.id] || {}).includes(platform)
      const matchesCategory = category === 'all' || app.category === category
      return matchesQuery && matchesPlatform && matchesCategory
    })
  }, [apps, query, platform, category, downloadsByApp, lang])

  const resolving = platform !== 'all' && downloadsByApp === null
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const firstIndex = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(firstIndex, firstIndex + PAGE_SIZE)

  const scrollToTop = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    viewRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  const changeQuery = value => {
    onStateChange({ ...state, query: value, page: 1 })
    scrollToTop()
  }
  const changePlatform = value => {
    onStateChange({ ...state, platform: value, page: 1 })
    closePlatformMenu()
  }
  const changeCategory = value => {
    onStateChange({ ...state, category: value, page: 1 })
    closeCategoryMenu()
  }
  const hasActiveFilters = query.trim() !== '' || platform !== 'all' || category !== 'all'
  const searchActive = query.trim() !== ''
  const SelectedPlatformIcon = platform !== 'all' ? PLATFORM_META[platform].icon : null
  const clearFilters = () => {
    if (platformOpen) closePlatformMenu()
    if (categoryOpen) closeCategoryMenu()
    onStateChange({ ...state, query: '', platform: 'all', category: 'all', page: 1 })
  }
  const goToPage = n => {
    onStateChange({ ...state, page: n })
    scrollToTop()
  }

  return (
    <section className="apps-view" ref={viewRef}>
      <div className="apps-inner">
        <CatalogTower className="apps-bg" restartInterval={CATALOG_RESTART_MS} />
        <FlowGlyph className="apps-flow" />
        <NxgetLogo className="apps-parallax apps-parallax-diamond" iconOnly animated />
        <header
          ref={headerRef}
          className={`apps-page-header${animateTitle ? ' apps-page-header--animate' : ''}${headerOut ? ' apps-page-header--out' : ''}`}
        >
          <h1 className="section-title apps-title">
            <NxgetLogo className="apps-title-logo" iconOnly animated={animateTitle} />
            <span className="apps-title-text">{t('apps.title')}</span>
          </h1>
        </header>

        <div className="apps-controls">
          <div className={`apps-search${searchActive ? ' apps-search--active' : ''}`}>
            <HiOutlineSearch className="apps-search-icon" />
            <input
              ref={searchInputRef}
              type="search"
              className="apps-search-input"
              placeholder={t('search.placeholder')}
              value={query}
              onChange={e => changeQuery(e.target.value)}
              aria-label={t('search.ariaLabel')}
            />
          </div>

          <div className="apps-filter-groups">
            <div className="apps-filter-menu" ref={platformRef}>
              <button
                type="button"
                className={`apps-filter-toggle${platform !== 'all' ? ' apps-filter-toggle--active' : ''}`}
                onClick={togglePlatformMenu}
                aria-haspopup="listbox"
                aria-expanded={platformOpen && !platformClosing}
                style={platform !== 'all' ? { '--tag-hue': PLATFORM_META[platform].hue } : undefined}
              >
                {platform === 'all' ? t('apps.filterAllPlatforms') : (
                  <>
                    <SelectedPlatformIcon className="platform-chip-icon" aria-hidden="true" />
                    {PLATFORM_META[platform].label}
                  </>
                )}
                <HiOutlineChevronDown className="apps-filter-toggle-icon" />
              </button>

              {platformOpen && (
                <div
                  className={`apps-filter-stack${platformClosing ? ' apps-filter-stack--closing' : ''}`}
                  role="listbox"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={platform === 'all'}
                    className={`category-pill${platform === 'all' ? ' category-pill--active' : ''}`}
                    style={{ '--i': 0 }}
                    onClick={() => changePlatform('all')}
                  >
                    {t('apps.filterAllPlatforms')}
                  </button>
                  {PLATFORMS.map((p, i) => {
                    const Icon = PLATFORM_META[p].icon
                    return (
                      <button
                        key={p}
                        type="button"
                        role="option"
                        aria-selected={platform === p}
                        className={`category-pill platform-pill${platform === p ? ' category-pill--active' : ''}`}
                        style={{ '--tag-hue': PLATFORM_META[p].hue, '--i': i + 1 }}
                        onClick={() => changePlatform(p)}
                      >
                        <Icon className="platform-chip-icon" aria-hidden="true" />
                        {PLATFORM_META[p].label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {categories.length > 0 && (
              <div className="apps-filter-menu" ref={categoryRef}>
                <button
                  type="button"
                  className={`apps-filter-toggle${category !== 'all' ? ' apps-filter-toggle--active' : ''}${category === VLT_CATEGORY ? ' apps-filter-toggle--vlt' : ''}`}
                  onClick={toggleCategoryMenu}
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen && !categoryClosing}
                  style={category !== 'all' && category !== VLT_CATEGORY ? { '--tag-hue': categoryHues.get(category) } : undefined}
                >
                  {category === 'all' ? t('apps.filterCategory') : category}
                  <HiOutlineChevronDown className="apps-filter-toggle-icon" />
                </button>

                {categoryOpen && (
                  <div
                    className={`apps-filter-stack apps-filter-stack--scroll${categoryClosing ? ' apps-filter-stack--closing' : ''}`}
                    role="listbox"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={category === 'all'}
                      className={`category-pill${category === 'all' ? ' category-pill--active' : ''}`}
                      style={{ '--i': 0 }}
                      onClick={() => changeCategory('all')}
                    >
                      {t('apps.filterAll')}
                    </button>
                    {categories.map((c, i) => (
                      <button
                        key={c}
                        type="button"
                        role="option"
                        aria-selected={category === c}
                        className={`category-pill${c === VLT_CATEGORY ? ' category-pill--vlt' : ''}${category === c ? ' category-pill--active' : ''}`}
                        style={{ '--i': i + 1, ...(c === VLT_CATEGORY ? {} : { '--tag-hue': categoryHues.get(c) }) }}
                        onClick={() => changeCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className={`filters-clear${hasActiveFilters ? ' filters-clear--visible' : ''}`}
              onClick={clearFilters}
              aria-label={t('apps.clearFilters')}
              aria-hidden={!hasActiveFilters}
              tabIndex={hasActiveFilters ? 0 : -1}
            >
              <VscError className="filters-clear-icon" aria-hidden="true" />
              <span className="filters-clear-label">{t('apps.clearFilters')}</span>
            </button>
          </div>
        </div>

        {status === 'loading' && apps.length === 0 && (
          <p className="apps-empty">{t('catalog.loading')}</p>
        )}

        {status === 'error' && apps.length === 0 && (
          <p className="apps-empty">
            {t('catalog.error')}{' '}
            <button className="platform-chip" onClick={refreshCatalog}>{t('catalog.retry')}</button>
          </p>
        )}

        {apps.length > 0 && (
          resolving ? (
            <p className="apps-empty">{t('catalog.loading')}</p>
          ) : filtered.length > 0 ? (
            <>
              <div className="apps-grid" key={visible.map(app => app.id).join('|')}>
                {visible.map((app, i) => <AppCard key={app.id} app={app} index={i} onSelect={onSelect} />)}
              </div>

              {totalPages > 1 && (
                <nav className="apps-pager" aria-label={t('apps.pagination')}>
                  <p className="apps-pager-range">
                    {t('apps.range', { from: firstIndex + 1, to: firstIndex + visible.length, total: filtered.length })}
                  </p>
                  <div className="apps-pager-dots">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        className={`apps-dot${n === currentPage ? ' apps-dot--active' : ''}`}
                        onClick={() => goToPage(n)}
                        aria-label={t('apps.pageLabel', { page: n })}
                        aria-current={n === currentPage ? 'page' : undefined}
                      >
                        <span className="apps-dot-mark" />
                      </button>
                    ))}
                  </div>
                  <p className="apps-pager-label" key={currentPage} aria-live="polite">
                    {t('apps.pageOf', { page: currentPage, total: totalPages })}
                  </p>
                </nav>
              )}
            </>
          ) : (
            <p className="apps-empty">{query.trim() ? t('apps.empty', { query }) : t('apps.emptyFiltered')}</p>
          )
        )}
      </div>
    </section>
  )
}

export default AppsView
