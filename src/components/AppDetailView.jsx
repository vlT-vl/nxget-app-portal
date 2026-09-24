import { useMemo, useState } from 'react'
import { HiArrowLeft, HiOutlineChevronDown, HiOutlineCommandLine, HiOutlineClipboard, HiOutlineCheck, HiOutlineGlobeAlt } from 'react-icons/hi2'
import { SiGithub } from 'react-icons/si'
import AppCard from './AppCard.jsx'
import AppDownloadCard from './AppDownloadCard.jsx'
import { useCatalog, PLATFORM_META, getPlatforms, useAppDownloads, useVersionHistory, useCategoryHues } from './DataContext.jsx'
import { VLT_CATEGORY } from '../lib/access.js'
import { useVoucher } from '../lib/voucherStore.js'
import { useLang } from '../lib/uiText.js'
import '../css/appdetailview.css'

const AppDetailView = ({ app, onBack, onSelect }) => {
  const { t, lang } = useLang()
  const [copied, setCopied] = useState(false)
  const { apps } = useCatalog()
  const categoryHues = useCategoryHues()
  const voucher = useVoucher(app)
  const locked = voucher.gated && !voucher.unlocked
  const repoLink = locked ? null : app.repo
  const source = useMemo(() => (voucher.unlocked ? { ...app, unlocked: true } : app), [app, voucher.unlocked])
  const { status, downloads, version, assetVersions } = useAppDownloads(source)
  const history = useVersionHistory(source)

  const command = `nxget install ${app.id}`

  const formatDate = iso => new Intl.DateTimeFormat(lang === 'it' ? 'it-IT' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(iso))

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard API unavailable — nothing to fall back to, just skip the feedback.
    }
  }

  const related = apps.filter(a => a.id !== app.id && a.category === app.category).slice(0, 4)

  return (
    <section className="app-detail">
      <div className="detail-inner">
        <button className="detail-back" onClick={onBack}>
          <HiArrowLeft /> {t('appDetail.back')}
        </button>

        <AppDownloadCard app={app} status={status} downloads={downloads} voucher={voucher} />

        <div className={`detail-columns${history.length > 0 ? ' detail-columns--split' : ''}`}>
          <div className="detail-info">
            <h2 className="detail-info-title">{t('appDetail.infoTitle')}</h2>

            {app.about?.[lang] && <p className="detail-info-about">{app.about[lang]}</p>}

            <div className="detail-info-grid">
              <div className="detail-info-field">
                <span className="detail-info-label">{t('appDetail.publisher')}</span>
                <span className="detail-info-value">{app.publisher}</span>
              </div>
              <div className="detail-info-field">
                <span className="detail-info-label">{t('appDetail.version')}</span>
                <span className="detail-info-value">
                  {status === 'loading' ? t('appDetail.loading') : (
                    <>
                      {version || (assetVersions.length === 0 && '—')}
                      {assetVersions.map(av => (
                        <span key={av.key} className={`detail-info-version-extra${version ? '' : ' detail-info-version-extra--solo'}`}>
                          {av.label} · {av.version}
                        </span>
                      ))}
                    </>
                  )}
                </span>
              </div>
              <div className="detail-info-field">
                <span className="detail-info-label">{t('appDetail.category')}</span>
                <div className="detail-info-tags">
                  <span
                    className={`detail-tag-pill${app.category === VLT_CATEGORY ? ' detail-tag-pill--vlt' : ''}`}
                    style={{ '--tag-hue': categoryHues.get(app.category) }}
                  >
                    {app.category}
                  </span>
                </div>
              </div>
              <div className="detail-info-field">
                <span className="detail-info-label">{t('appDetail.platforms')}</span>
                {status === 'loading' ? (
                  <span className="detail-info-value">{t('appDetail.loading')}</span>
                ) : getPlatforms(downloads).length > 0 ? (
                  <div className="detail-info-tags">
                    {getPlatforms(downloads).map(p => {
                      const Icon = PLATFORM_META[p].icon
                      return (
                        <span key={p} className="detail-tag-pill" style={{ '--tag-hue': PLATFORM_META[p].hue }}>
                          <Icon className="detail-tag-pill-icon" />
                          {PLATFORM_META[p].label}
                        </span>
                      )
                    })}
                  </div>
                ) : (
                  <span className="detail-info-value">—</span>
                )}
              </div>
              <div className="detail-info-field">
                <span className="detail-info-label">{t('appDetail.appId')}</span>
                <span className="detail-info-value">{app.id}</span>
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="detail-info detail-versions-card">
              <h2 className="detail-info-title">{t('appDetail.versionHistory')}</h2>
              <div className="detail-versions-scroll">
                <ol className="version-timeline">
                  {history.map(v => (
                    <li key={v.tag} className="version-item">
                      <span className="version-dot" aria-hidden="true" />
                      {locked ? (
                        <span className="version-pill version-pill--static">
                          <span className="version-pill-tag">{v.name}</span>
                        </span>
                      ) : (
                        <a className="version-pill" href={v.url} target="_blank" rel="noopener noreferrer">
                          <span className="version-pill-tag">{v.name}</span>
                        </a>
                      )}
                      <time className="version-date" dateTime={v.publishedAt}>{formatDate(v.publishedAt)}</time>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="detail-related">
            <h2 className="section-title">{t('appDetail.moreIn', { category: app.category })}</h2>
            <div className="apps-grid">
              {related.map((a, i) => <AppCard key={a.id} app={a} index={i} onSelect={onSelect} compact />)}
            </div>
          </div>
        )}

        <details className="detail-cli">
          <summary className="detail-cli-summary">
            <HiOutlineCommandLine className="detail-cli-icon" />
            <span className="detail-cli-summary-text">{t('appDetail.cliSummary')}</span>
            <span className="detail-soon-pill">{t('appDetail.comingSoon')}</span>
            <HiOutlineChevronDown className="detail-cli-chevron" />
          </summary>

          <div className="detail-cli-body">
            <div className="detail-command">
              <code>{command}</code>
              <button className="detail-copy-btn" onClick={copyCommand}>
                {copied ? <HiOutlineCheck /> : <HiOutlineClipboard />}
                {copied ? t('appDetail.copied') : t('appDetail.copy')}
              </button>
            </div>
            <p className="detail-install-note">
              {t('appDetail.cliNote')}
            </p>
          </div>
        </details>

        {(repoLink || app.url) && (
          <div className="detail-repo">
            {repoLink && (
              <a className="repo-pill" href={repoLink} target="_blank" rel="noopener noreferrer">
                <SiGithub className="repo-pill-icon" />
                <span>{t('downloadCard.viewOnGithub')}</span>
              </a>
            )}
            {app.url && (
              <a className="repo-pill" href={app.url} target="_blank" rel="noopener noreferrer">
                <HiOutlineGlobeAlt className="repo-pill-icon" />
                <span>{t('downloadCard.visitWebsite')}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default AppDetailView
