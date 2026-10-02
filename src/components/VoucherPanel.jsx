import { useState } from 'react'
import { HiOutlineCheck, HiOutlineClipboard, HiOutlineLockClosed, HiXMark } from 'react-icons/hi2'
import { VOUCHER_CONTACT } from '../lib/voucherStore.js'
import { useLang } from '../lib/uiText.js'
import '../css/voucherpanel.css'

const VoucherPanel = ({ voucher, panelRef, onClose }) => {
  const { t } = useLang()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [code, setCode] = useState('')
  const [requestError, setRequestError] = useState(false)
  const [redeemError, setRedeemError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const { entry } = voucher
  const request = entry?.request

  const submitRequest = e => {
    e.preventDefault()
    setRequestError(!voucher.createRequest(firstName, lastName).ok)
  }

  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(request)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const submitRedeem = async e => {
    e.preventDefault()
    setBusy(true)
    const result = await voucher.redeem(code)
    setBusy(false)
    setRedeemError(result.ok ? null : result.reason)
  }

  return (
    <div className="voucher-panel" ref={panelRef} tabIndex={-1}>
      <div className="voucher-panel-header">
        <h2 className="voucher-title">
          <HiOutlineLockClosed className="voucher-title-icon" />
          {t('voucher.title')}
        </h2>
        {onClose && (
          <button type="button" className="voucher-panel-dismiss" onClick={onClose} aria-label={t('voucher.close')}>
            <HiXMark />
          </button>
        )}
      </div>

      {!request ? (
        <form className="voucher-block" onSubmit={submitRequest}>
          <p className="voucher-hint">{t('voucher.intro')}</p>
          <div className="voucher-row">
            <input
              className="voucher-input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder={t('voucher.firstName')}
              aria-label={t('voucher.firstName')}
              autoComplete="given-name"
              maxLength={24}
            />
            <input
              className="voucher-input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder={t('voucher.lastName')}
              aria-label={t('voucher.lastName')}
              autoComplete="family-name"
              maxLength={24}
            />
          </div>
          {requestError && <p className="voucher-error" role="alert">{t('voucher.err.name')}</p>}
          <button className="voucher-btn voucher-btn--primary" type="submit">{t('voucher.generate')}</button>
        </form>
      ) : (
        <div className="voucher-block">
          <span className="voucher-label">
            {t('voucher.requestFor', { name: `${entry.firstName} ${entry.lastName}` })}
          </span>
          <div className="voucher-code">
            <code className="voucher-code-text" aria-label={request}>
              {request.match(/.{1,4}/g).map((group, i) => <span key={i}>{group}</span>)}
            </code>
            <button className="voucher-copy" type="button" onClick={copyRequest}>
              {copied ? <HiOutlineCheck /> : <HiOutlineClipboard />}
              {copied ? t('appDetail.copied') : t('appDetail.copy')}
            </button>
          </div>
          <p className="voucher-hint">
            {t('voucher.sendToBefore')} <strong className="voucher-contact">{VOUCHER_CONTACT}</strong> {t('voucher.sendToAfter')}
          </p>
          <button className="voucher-link" type="button" onClick={voucher.changeRequest}>{t('voucher.change')}</button>
        </div>
      )}

      <form className="voucher-block voucher-redeem" onSubmit={submitRedeem}>
        <span className="voucher-label">{t('voucher.redeemLabel')}</span>
        <div className="voucher-row">
          <input
            className="voucher-input voucher-input--code"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={t('voucher.redeemPlaceholder')}
            aria-label={t('voucher.redeemPlaceholder')}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="voucher-btn" type="submit" disabled={busy || !code.trim()}>{t('voucher.redeem')}</button>
        </div>
        {redeemError && <p className="voucher-error" role="alert">{t(`voucher.err.${redeemError}`)}</p>}
      </form>
    </div>
  )
}

export default VoucherPanel
