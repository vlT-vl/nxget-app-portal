import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IoCloudDownloadSharp } from 'react-icons/io5'
import { HiLockClosed, HiOutlineDocumentText, HiOutlineExclamationTriangle, HiOutlineTicket } from 'react-icons/hi2'
import LicenseModal from './LicenseModal.jsx'
import VoucherPanel from './VoucherPanel.jsx'
import { PLATFORM_META, getDownloadEntries, useLicense, useCategoryHues } from './DataContext.jsx'
import { VLT_CATEGORY } from '../lib/access.js'
import { useLang } from '../lib/uiText.js'
import '../css/downloadcard.css'

const formatRemaining = ms => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const VOUCHER_TRANSITION_MS = 400

// Stati: 'closed' (solo pill), 'opening'/'closing' (pill e pannello montati
// insieme, sovrapposti nella stessa cella della griglia — uno sparisce
// mentre l'altro compare, non in sequenza), 'open' (solo pannello).
const AppDownloadCard = ({ app, status, downloads, voucher }) => {
  const { t } = useLang()
  const [logoFailed, setLogoFailed] = useState(false)
  const [downloadingKey, setDownloadingKey] = useState(null)
  const [licenseOpen, setLicenseOpen] = useState(false)
  const [voucherPhase, setVoucherPhase] = useState('closed')
  const license = useLicense(app)
  const categoryHues = useCategoryHues()
  const panelRef = useRef(null)
  const pillRef = useRef(null)
  const voucherSlotRef = useRef(null)
  const voucherSlotInnerRef = useRef(null)

  useEffect(() => {
    const outer = voucherSlotRef.current
    const inner = voucherSlotInnerRef.current
    if (!outer || !inner || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      outer.style.height = `${entry.contentRect.height}px`
    })
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  // In chiusura il pannello resta montato (e quindi alto) per tutta la sua
  // animazione di uscita: senza questo, il ResizeObserver vedrebbe restringersi
  // il contenuto solo allo smontaggio finale, a transizione già finita, e la UI
  // sotto resterebbe ferma con un vuoto per 400ms invece di scorrere su subito.
  // Si anticipa qui l'altezza target (quella del pill, già montato accanto al
  // pannello uscente) così il contenitore si restringe in sincrono col fade.
  useLayoutEffect(() => {
    if (voucherPhase === 'closing' && voucherSlotRef.current && pillRef.current) {
      const pill = pillRef.current
      // In un grid container il margine di un figlio contribuisce alla
      // dimensione della traccia (a differenza del normale flusso a blocchi):
      // è quello che il ResizeObserver troverà a smontaggio avvenuto. Usare
      // solo `offsetHeight` (che non lo include) lascia il contenitore troppo
      // corto per tutta la dissolvenza, e il "salto" al valore corretto,
      // allo smontaggio del pannello, si vede come un rimbalzo finale.
      const marginBottom = parseFloat(getComputedStyle(pill).marginBottom) || 0
      voucherSlotRef.current.style.height = `${pill.offsetHeight + marginBottom}px`
    }
  }, [voucherPhase])

  const openVoucher = () => {
    if (voucherPhase !== 'closed') return
    setVoucherPhase('opening')
    setTimeout(() => setVoucherPhase('open'), VOUCHER_TRANSITION_MS)
  }

  const closeVoucher = () => {
    if (voucherPhase !== 'open') return
    setVoucherPhase('closing')
    setTimeout(() => setVoucherPhase('closed'), VOUCHER_TRANSITION_MS)
  }

  const showPill = voucherPhase !== 'open'
  const showPanel = voucherPhase !== 'closed'

  const triggerDownloadAnim = key => {
    setDownloadingKey(key)
    setTimeout(() => setDownloadingKey(k => (k === key ? null : k)), 1600)
  }

  const entries = getDownloadEntries(downloads)
  const locked = voucher.gated && !voucher.unlocked
  const repoLink = locked ? null : app.repo

  const focusPanel = () => {
    if (voucherPhase === 'closed') {
      openVoucher()
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        panelRef.current?.focus({ preventScroll: true })
      }, VOUCHER_TRANSITION_MS + 30)
      return
    }
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    panelRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <div className="download-header">
        <div className="download-card-icon-wrap">
          {!logoFailed && app.logo ? (
            <img
              className="download-card-logo"
              src={app.logo}
              alt=""
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="download-card-badge">{app.name.charAt(0)}</span>
          )}
        </div>

        <h1 className="download-card-name">{app.name}</h1>
        <p className="download-card-publisher">{t('downloadCard.by')} <strong>{app.publisher}</strong></p>

        <div className="download-card-tags">
          <span
            className={`detail-tag-pill${app.category === VLT_CATEGORY ? ' detail-tag-pill--vlt' : ''}`}
            style={{ '--tag-hue': categoryHues.get(app.category) }}
          >
            {app.category}
          </span>
        </div>
      </div>

      {voucher.gated && (
        <p className="voucher-disclaimer" role="note">
          <HiOutlineExclamationTriangle className="voucher-disclaimer-icon" />
          <span className="voucher-disclaimer-text">
            {locked
              ? t('voucher.disclaimerLocked')
              : t('voucher.disclaimerUnlocked', { time: formatRemaining(voucher.remainingMs) })}
          </span>
        </p>
      )}

      {locked ? (
        <>
          {entries.length > 0 && (
            <div className="download-card-actions">
              {entries.map(entry => {
                const Icon = PLATFORM_META[entry.platform].icon

                return (
                  <button
                    key={entry.key}
                    type="button"
                    className="download-btn download-btn--locked"
                    onClick={focusPanel}
                    title={t('voucher.lockedButton')}
                  >
                    <HiLockClosed className="download-lock-icon" />
                    <Icon className="download-btn-icon" />
                    <span>{entry.label}</span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="voucher-slot" ref={voucherSlotRef}>
            <div className="voucher-slot-inner" ref={voucherSlotInnerRef}>
              {showPill && (
                <button
                  ref={pillRef}
                  type="button"
                  className={`voucher-request-pill${voucherPhase === 'opening' ? ' voucher-request-pill--exit' : ''}`}
                  onClick={openVoucher}
                >
                  <HiOutlineTicket className="voucher-request-icon" />
                  {t('voucher.requestButton')}
                </button>
              )}

              {showPanel && (
                <div className={`voucher-panel-wrap${voucherPhase === 'closing' ? ' voucher-panel-wrap--exit' : ''}`}>
                  <VoucherPanel voucher={voucher} panelRef={panelRef} onClose={closeVoucher} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {status === 'loading' && (
            <p className="download-status">{t('downloadCard.fetching')}</p>
          )}

          {(status === 'error' || (status === 'ready' && entries.length === 0)) && (repoLink || app.url) && (
            <a
              className="download-btn download-btn--fallback"
              href={repoLink ? `${repoLink}/releases/latest` : app.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repoLink ? t('downloadCard.viewReleases') : t('downloadCard.visitWebsite')}
            </a>
          )}

          {status === 'ready' && entries.length > 0 && (
            <div className="download-card-actions">
              {entries.map(entry => {
                const Icon = PLATFORM_META[entry.platform].icon
                const isDownloading = downloadingKey === entry.key

                return (
                  <a
                    key={entry.key}
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`download-btn${isDownloading ? ' download-btn--downloading' : ''}`}
                    onClick={() => triggerDownloadAnim(entry.key)}
                  >
                    {isDownloading ? (
                      <IoCloudDownloadSharp className="download-progress-icon" />
                    ) : (
                      <>
                        <Icon className="download-btn-icon" />
                        <span>{entry.label}</span>
                      </>
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </>
      )}

      {license.status === 'ready' && (
        <div className="download-card-license">
          <button className="license-btn" type="button" onClick={() => setLicenseOpen(true)}>
            <HiOutlineDocumentText className="license-btn-icon" />
            <span>{t('license.button')}</span>
          </button>
        </div>
      )}

      {licenseOpen && license.status === 'ready' && <LicenseModal app={app} license={license} onClose={() => setLicenseOpen(false)} />}
    </>
  )
}

export default AppDownloadCard
