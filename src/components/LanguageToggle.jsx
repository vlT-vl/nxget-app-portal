import { useLang } from '../lib/uiText.js'
import '../css/languagetoggle.css'

const LanguageToggle = ({ className = '' }) => {
  const { lang, toggleLang, t } = useLang()

  return (
    <button
      className={`lang-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleLang}
      aria-label={t('lang.switchTo')}
      title={t('lang.switchTo')}
    >
      {lang.toUpperCase()}
    </button>
  )
}

export default LanguageToggle
