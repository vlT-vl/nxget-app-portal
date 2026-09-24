import { HiOutlineCommandLine, HiOutlineBolt, HiOutlineArrowPath, HiOutlineCube, HiOutlineCircleStack, HiOutlineMagnifyingGlass, HiOutlineCpuChip, HiOutlineArrowDownTray, HiOutlineComputerDesktop, HiOutlineRectangleStack, HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi2'
import { SiGithub } from 'react-icons/si'
import { useLang } from '../lib/uiText.js'
import '../css/cliview.css'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL
const ICONS = [HiOutlineCube, HiOutlineArrowPath, HiOutlineBolt]
const WHY_ICONS = [HiOutlineRectangleStack, HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineClock]
const STEP_ICONS = [HiOutlineCircleStack, HiOutlineMagnifyingGlass, HiOutlineCpuChip, HiOutlineArrowDownTray]
const STATUS_ICONS = [HiOutlineCircleStack, HiOutlineComputerDesktop, HiOutlineCommandLine]
const PREVIEW_COMMANDS = ['nxget install keepassxc', 'nxget update']

const CliView = () => {
  const { t } = useLang()
  const intro = t('cli.intro')
  const roadmap = t('cli.roadmap')
  const why = t('cli.why')
  const steps = t('cli.steps')
  const status = t('cli.status')

  return (
    <section className="cli-view">
      <div className="cli-inner">
        <div className="cli-head">
          <HiOutlineCommandLine className="cli-icon" />
          <span className="hero-eyebrow">{t('cli.eyebrow')}</span>
          <h1 className="cli-title">{t('cli.title')}</h1>
          {intro.map(p => (
            <p key={p} className="cli-text">{p}</p>
          ))}
        </div>

        <div className="cli-roadmap">
          {roadmap.map((r, i) => {
            const Icon = ICONS[i]
            return (
              <div key={r.title} className="cli-roadmap-card" style={{ '--i': i }}>
                <Icon className="cli-roadmap-icon" />
                <h3 className="cli-roadmap-title">{r.title}</h3>
                <code className="cli-roadmap-cmd">{r.cmd}</code>
                <p className="cli-roadmap-text">{r.text}</p>
              </div>
            )
          })}
        </div>

        <section className="cli-section">
          <header className="cli-section-header">
            <h2 className="section-title">{t('cli.whyTitle')}</h2>
            <p className="section-subtitle">{t('cli.whySubtitle')}</p>
          </header>

          <div className="cli-why">
            {why.map((w, i) => {
              const Icon = WHY_ICONS[i]
              return (
                <div key={w.title} className="cli-roadmap-card" style={{ '--i': i }}>
                  <Icon className="cli-roadmap-icon" />
                  <h3 className="cli-roadmap-title">{w.title}</h3>
                  <p className="cli-roadmap-text">{w.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="cli-section">
          <h2 className="section-title">{t('cli.previewTitle')}</h2>
          <div className="cli-terminal" role="img" aria-label={t('cli.previewNote')}>
            <div className="cli-terminal-bar" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="cli-terminal-body" aria-hidden="true">
              {PREVIEW_COMMANDS.map(cmd => (
                <div key={cmd} className="cli-terminal-line">
                  <span className="cli-terminal-prompt">$</span> {cmd}
                </div>
              ))}
            </div>
          </div>
          <p className="section-subtitle">{t('cli.previewNote')}</p>
        </section>

        <section className="cli-section">
          <header className="cli-section-header">
            <h2 className="section-title">{t('cli.howTitle')}</h2>
            <p className="section-subtitle">{t('cli.howSubtitle')}</p>
          </header>

          <ol className="cli-steps">
            {steps.map((s, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <li key={s.title} className="cli-step" style={{ '--i': i }}>
                  <span className="cli-step-num"><Icon /></span>
                  <div>
                    <h3 className="cli-roadmap-title">{s.title}</h3>
                    <p className="cli-roadmap-text">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="cli-section">
          <header className="cli-section-header">
            <h2 className="section-title">{t('cli.statusTitle')}</h2>
            <p className="section-subtitle">{t('cli.statusSubtitle')}</p>
          </header>

          <ul className="cli-status">
            {status.map((s, i) => {
              const Icon = STATUS_ICONS[i]
              return (
                <li key={s.title} className="cli-status-row" style={{ '--i': i }}>
                  <span className="cli-step-num"><Icon /></span>
                  <div>
                    <div className="cli-status-head">
                      <h3 className="cli-roadmap-title">{s.title}</h3>
                      <span className={`cli-status-badge cli-status-badge--${s.state}`}>{s.label}</span>
                    </div>
                    <p className="cli-roadmap-text">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {GITHUB_URL && (
          <a className="cta-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <SiGithub /> {t('cli.cta')}
          </a>
        )}
      </div>
    </section>
  )
}

export default CliView
