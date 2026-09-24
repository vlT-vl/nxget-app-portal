import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HiArrowTopRightOnSquare, HiOutlineDocumentText, HiXMark } from 'react-icons/hi2'
import { useLang } from '../lib/uiText.js'
import '../css/aboutmodal.css'
import '../css/licensemodal.css'

const LicenseModal = ({ app, license, onClose }) => {
  const { t } = useLang()

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="amo-overlay" onClick={onClose}>
      <div
        className="amo-card lic-card"
        role="dialog"
        aria-modal="true"
        aria-label={t('license.title', { name: app.name })}
        onClick={e => e.stopPropagation()}
      >
        <div className="amo-header">
          <div className="amo-header-left">
            <HiOutlineDocumentText className="amo-header-icon" />
            <div>
              <span className="amo-eyebrow">{t('license.eyebrow')}</span>
              <h2 className="amo-title">{t('license.title', { name: app.name })}</h2>
            </div>
          </div>
          <button className="amo-close" onClick={onClose} aria-label={t('license.close')}>
            <HiXMark />
          </button>
        </div>

        <div className="lic-body">
          <pre className="lic-text">{license.text}</pre>

          <a className="lic-source" href={license.url} target="_blank" rel="noopener noreferrer">
            <HiArrowTopRightOnSquare />
            <span>{t('license.openSource')}</span>
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default LicenseModal
