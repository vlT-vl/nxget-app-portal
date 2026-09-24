import { useEffect, useMemo, useRef, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { HiOutlineChevronDown } from 'react-icons/hi2'
import AppCard from './AppCard.jsx'
import CatalogTower, { CATALOG_RESTART_MS } from './CatalogTower.jsx'
import FlowGlyph from './FlowGlyph.jsx'
import { useCatalog, PLATFORM_META, getPlatforms, resolveAllDownloads, useCategoryHues } from './DataContext.jsx'
import { getDescription } from '../lib/appText.js'
import { VLT_CATEGORY } from '../lib/access.js'
import { useLang } from '../lib/uiText.js'
import '../css/appsview.css'

const PLATFORMS = Object.keys(PLATFORM_META)
const PAGE_SIZE = 15
const CATEGORY_CLOSE_MS = 180

const AppsView = ({ state, onStateChange, onSelect }) => {
  const { t, lang } = useLang()
  const { apps, status, refreshCatalog } = useCatalog()
  const categoryHues = useCategoryHues()
  const { query, platform, category, page } = state
  const [downloadsByApp, setDownloadsByApp] = useState(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryClosing, setCategoryClosing] = useState(false)
  const viewRef = useRef(null)
  const categoryRef = useRef(null)

  const closeCategoryMenu = () => {
    setCategoryClosing(true)
    setTimeout(() => { setCategoryOpen(false); setCategoryClosing(false) }, CATEGORY_CLOSE_MS)
  }

  const toggleCategoryMenu = () => {
    if (categoryOpen) closeCategoryMenu()
    else setCategoryOpen(true)
  }

  useEffect(() => {
    if (apps.length === 0) return
    let cancelled = false
    resolveAllDownloads(apps).then(result => { if (!cancelled) setDownloadsByApp(result) })
    return () => { cancelled = true }
  }, [apps])

  useEffect(() => {
    if (!categoryOpen) return undefined
    const onPointerDown = e => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) closeCategoryMenu()
    }
    const onKeyDown = e => { if (e.key === 'Escape') closeCategoryMenu() }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [categoryOpen])

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

  const changeQuery = value => onStateChange({ ...state, query: value, page: 1 })
  const changePlatform = value => onStateChange({ ...state, platform: value, page: 1 })
  const changeCategory = value => {
    onStateChange({ ...state, category: value, page: 1 })
    closeCategoryMenu()
  }
  const goToPage = n => {
    onStateChange({ ...state, page: n })
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    viewRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <section className="apps-view" ref={viewRef}>
      <div className="apps-inner">
        <CatalogTower className="apps-bg" restartInterval={CATALOG_RESTART_MS} />
        <FlowGlyph className="apps-flow" />
        <header className="apps-page-header">
          <h1 className="section-title">{t('apps.title')}</h1>
          <p className="section-subtitle">{t('apps.subtitle')}</p>
        </header>

        <div className="apps-search">
          <HiOutlineSearch className="apps-search-icon" />
          <input
            type="search"
            className="apps-search-input"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={e => changeQuery(e.target.value)}
            aria-label={t('search.ariaLabel')}
            autoFocus
          />
        </div>

        <div className="apps-filters">
          <div className="platform-filter">
            <button
              className={`platform-chip${platform === 'all' ? ' platform-chip--active' : ''}`}
              onClick={() => changePlatform('all')}
            >
              {t('apps.filterAll')}
            </button>
            {PLATFORMS.map(p => (
              <button
                key={p}
                className={`platform-chip${platform === p ? ' platform-chip--active' : ''}`}
                onClick={() => changePlatform(p)}
              >
                {PLATFORM_META[p].label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="category-filter" ref={categoryRef}>
              <button
                type="button"
                className={`category-filter-toggle${category !== 'all' ? ' category-filter-toggle--active' : ''}${category === VLT_CATEGORY ? ' category-filter-toggle--vlt' : ''}`}
                onClick={toggleCategoryMenu}
                aria-haspopup="listbox"
                aria-expanded={categoryOpen && !categoryClosing}
                style={category !== 'all' && category !== VLT_CATEGORY ? { '--tag-hue': categoryHues.get(category) } : undefined}
              >
                {category === 'all' ? t('apps.filterCategory') : category}
                <HiOutlineChevronDown className="category-filter-icon" />
              </button>

              {categoryOpen && (
                <div
                  className={`category-filter-panel${categoryClosing ? ' category-filter-panel--closing' : ''}`}
                  role="listbox"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={category === 'all'}
                    className={`category-pill${category === 'all' ? ' category-pill--active' : ''}`}
                    onClick={() => changeCategory('all')}
                  >
                    {t('apps.filterAll')}
                  </button>
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      role="option"
                      aria-selected={category === c}
                      className={`category-pill${c === VLT_CATEGORY ? ' category-pill--vlt' : ''}${category === c ? ' category-pill--active' : ''}`}
                      style={c === VLT_CATEGORY ? undefined : { '--tag-hue': categoryHues.get(c) }}
                      onClick={() => changeCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
