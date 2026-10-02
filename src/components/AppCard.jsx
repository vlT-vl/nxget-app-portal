import { useState } from 'react'
import { HiOutlineTag, HiOutlineGlobeAlt } from 'react-icons/hi2'
import { SiGithub } from 'react-icons/si'
import { PLATFORM_META, getPlatforms, useAppDownloads, useCategoryHues } from './DataContext.jsx'
import { VLT_CATEGORY } from '../lib/access.js'
import { getDescription } from '../lib/appText.js'
import { hashHue } from '../lib/tagColor.js'
import { useVoucher } from '../lib/voucherStore.js'
import { useLang } from '../lib/uiText.js'
import '../css/appcard.css'

const versionLabel = version => (/^[0-9]/.test(version) ? `v${version}` : version)

const openExternal = (e, url) => {
  e.stopPropagation()
  window.open(url, '_blank', 'noopener,noreferrer')
}

const stopKeyThenOpen = (e, url) => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  openExternal(e, url)
}

const AppCard = ({ app, index = 0, onSelect, compact = false, featured = false }) => {
  const { lang, t } = useLang()
  const [logoFailed, setLogoFailed] = useState(false)
  const { downloads, version } = useAppDownloads(app)
  const categoryHues = useCategoryHues()
  const isVlt = app.category === VLT_CATEGORY
  const voucher = useVoucher(app)
  const locked = voucher.gated && !voucher.unlocked

  return (
    <button
      type="button"
      className={`app-card${compact ? ' app-card--compact' : ''}${featured ? ' app-card--featured' : ''}${featured && isVlt ? ' app-card--featured-vlt' : ''}`}
      onClick={() => onSelect(app)}
      style={{ '--i': index, '--tag-hue': categoryHues.get(app.category) }}
    >
      <div className="app-card-header">
        <div className="app-logo-wrap">
          {!logoFailed && app.logo ? (
            <img
              className="app-logo"
              src={app.logo}
              alt=""
              loading="lazy"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="app-badge" style={{ '--badge-hue': hashHue(app.name) }}>
              {app.name.charAt(0)}
            </span>
          )}
        </div>
        {!compact && (
          <div className="app-card-badges">
            {app.publisher && <span className="app-publisher-pill">{app.publisher}</span>}
            {version && (
              <span className="app-version-pill">
                <HiOutlineTag className="app-version-pill-icon" aria-hidden="true" />
                {versionLabel(version)}
              </span>
            )}
            {!locked && (app.repo || app.url) && (
              <div className="app-card-links">
                {app.repo && (
                  <span
                    className="app-card-link-btn"
                    role="link"
                    tabIndex={0}
                    aria-label={t('downloadCard.viewOnGithub')}
                    onClick={e => openExternal(e, app.repo)}
                    onKeyDown={e => stopKeyThenOpen(e, app.repo)}
                  >
                    <SiGithub />
                  </span>
                )}
                {app.url && (
                  <span
                    className="app-card-link-btn"
                    role="link"
                    tabIndex={0}
                    aria-label={t('downloadCard.visitWebsite')}
                    onClick={e => openExternal(e, app.url)}
                    onKeyDown={e => stopKeyThenOpen(e, app.url)}
                  >
                    <HiOutlineGlobeAlt />
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <h3 className="app-name">{app.name}</h3>
      <span className={`app-category${isVlt ? ' app-category--vlt' : ''}`}>
        {app.category}
      </span>

      {!compact && !featured && <p className="app-desc">{getDescription(app, lang)}</p>}

      {!compact && (
        <div className="app-platforms">
          {getPlatforms(downloads).map(p => {
            const Icon = PLATFORM_META[p].icon
            return (
              <span key={p} className="app-platform-chip">
                <Icon className="app-platform-chip-icon" aria-hidden="true" />
                {PLATFORM_META[p].label}
              </span>
            )
          })}
        </div>
      )}
    </button>
  )
}

export default AppCard
