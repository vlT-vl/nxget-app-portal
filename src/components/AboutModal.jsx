import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../css/aboutmodal.css'
import { HiXMark } from 'react-icons/hi2'
import { FiInfo } from 'react-icons/fi'
import NxgetLogo from './NxgetLogo.jsx'
import { useLang } from '../lib/uiText.js'
import pkg from '../../package.json'

const stripCaret = v => v?.replace(/^[\^~]/, '') ?? '—'

const STACK = [
  { label: 'React',       value: stripCaret(pkg.dependencies.react) },
  { label: 'Vite',        value: stripCaret(pkg.devDependencies.vite) },
  { label: 'React Icons', value: stripCaret(pkg.dependencies['react-icons']) },
]

const AboutModal = ({ onClose }) => {
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
      <div className="amo-card" onClick={e => e.stopPropagation()}>

        <div className="amo-header">
          <div className="amo-header-left">
            <FiInfo className="amo-header-icon" />
            <div>
              <span className="amo-eyebrow">{t('aboutModal.eyebrow')}</span>
              <h2 className="amo-title">{t('aboutModal.title')}</h2>
              <span className="amo-subtitle">
                v{pkg.version} · {pkg.build} · {pkg.updated}
              </span>
            </div>
          </div>
          <button className="amo-close" onClick={onClose} aria-label={t('aboutModal.close')}>
            <HiXMark />
          </button>
        </div>

        <div className="amo-body">
          <div className="amo-logos">
            <NxgetLogo className="amo-nxget-logo" />
          </div>

          <div className="amo-grid">
            <div className="amo-field">
              <span className="amo-field-label">{t('aboutModal.version')}</span>
              <span className="amo-field-value">{pkg.version}</span>
            </div>
            <div className="amo-field">
              <span className="amo-field-label">{t('aboutModal.build')}</span>
              <span className="amo-field-value">{pkg.build}</span>
            </div>
            <div className="amo-field">
              <span className="amo-field-label">{t('aboutModal.updated')}</span>
              <span className="amo-field-value">{pkg.updated}</span>
            </div>
          </div>

          <div className="amo-grid">
            {STACK.map(s => (
              <div className="amo-field" key={s.label}>
                <span className="amo-field-label">{s.label}</span>
                <span className="amo-field-value">{s.value}</span>
              </div>
            ))}
          </div>

          <p className="amo-notice">
            {t('aboutModal.notice')}<br />
            © 2026 vlT · Veronesi Lorenzo. {t('aboutModal.rights')}
          </p>
        </div>

      </div>
    </div>,
    document.body
  )
}

export default AboutModal
