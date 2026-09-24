import { useState } from 'react'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import { PLATFORM_META, getPlatforms, useAppDownloads, useCategoryHues } from './DataContext.jsx'
import { VLT_CATEGORY } from '../lib/access.js'
import { getDescription } from '../lib/appText.js'
import { hashHue } from '../lib/tagColor.js'
import { useLang } from '../lib/uiText.js'
import '../css/appcard.css'

const AppCard = ({ app, index = 0, onSelect, compact = false, featured = false }) => {
  const { lang } = useLang()
  const [logoFailed, setLogoFailed] = useState(false)
  const { downloads } = useAppDownloads(app)
  const categoryHues = useCategoryHues()
  const isVlt = app.category === VLT_CATEGORY

  return (
    <button
      type="button"
      className={`app-card${compact ? ' app-card--compact' : ''}${featured ? ' app-card--featured' : ''}${featured && isVlt ? ' app-card--featured-vlt' : ''}`}
      onClick={() => onSelect(app)}
      style={{ '--i': index, '--tag-hue': categoryHues.get(app.category) }}
    >
      <HiOutlineChevronRight className="app-card-ext" />

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
                {featured && <Icon className="app-platform-chip-icon" aria-hidden="true" />}
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
