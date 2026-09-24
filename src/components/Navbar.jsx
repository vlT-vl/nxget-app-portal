import '../css/navbar.css'
import Theme from './Theme.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import NxgetLogo from './NxgetLogo.jsx'
import { SiGithub } from 'react-icons/si'
import { useLang } from '../lib/uiText.js'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL

const LINKS = ['home', 'apps', 'features', 'cli', 'about']

const Navbar = ({ view, onNav, hidden = false }) => {
  const { t } = useLang()

  return (
    <nav className={`navbar${hidden ? ' navbar--hidden' : ''}`}>
      <button className="navbar-logo" onClick={() => onNav('home')} aria-label={t('nav.home')}>
        <NxgetLogo />
      </button>

      <ul className="nav-links">
        {LINKS.map(v => (
          <li key={v}>
            <button
              className={`nav-btn${view === v ? ' nav-btn--active' : ''}`}
              onClick={() => onNav(v)}
            >
              {t(`nav.${v}`)}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar-socials">
        {GITHUB_URL && (
          <a className="navbar-social-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <SiGithub />
          </a>
        )}
        <LanguageToggle />
        <Theme />
      </div>
    </nav>
  )
}

export default Navbar
