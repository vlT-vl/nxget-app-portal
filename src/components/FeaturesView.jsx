import { HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineCodeBracket, HiOutlineArrowPath, HiOutlineCommandLine, HiOutlineHandThumbUp, HiOutlineInformationCircle, HiOutlineDocumentText, HiOutlineLanguage, HiOutlineMagnifyingGlass, HiOutlineSquares2X2, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2'
import { useLang } from '../lib/uiText.js'
import '../css/featuresview.css'

const ICONS = [HiOutlineGlobeAlt, HiOutlineHandThumbUp, HiOutlineShieldCheck, HiOutlineCodeBracket, HiOutlineArrowPath, HiOutlineCommandLine]
const KNOW_ICONS = [HiOutlineInformationCircle, HiOutlineDocumentText, HiOutlineMagnifyingGlass, HiOutlineSquares2X2, HiOutlineArrowTopRightOnSquare, HiOutlineLanguage]

const FeaturesView = () => {
  const { t } = useLang()
  const items = t('features.items')
  const steps = t('features.steps')
  const know = t('features.know')

  return (
    <section className="features-view">
      <div className="features-inner">
        <header className="features-page-header">
          <h1 className="section-title">{t('nav.features')}</h1>
          <p className="section-subtitle">{t('features.subtitle')}</p>
        </header>

        <div className="features-grid">
          {items.map((f, i) => {
            const Icon = ICONS[i]
            return (
              <div key={f.title} className="feature-card" style={{ '--i': i }}>
                <Icon className="feature-icon" />
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
              </div>
            )
          })}
        </div>

        <section className="features-section">
          <header className="features-section-header">
            <h2 className="section-title">{t('features.howTitle')}</h2>
            <p className="section-subtitle">{t('features.howSubtitle')}</p>
          </header>

          <ol className="how-steps">
            {steps.map((s, i) => (
              <li key={s.title} className="how-step" style={{ '--i': i }}>
                <span className="how-step-num">{i + 1}</span>
                <h3 className="feature-title">{s.title}</h3>
                <p className="feature-text">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="features-section">
          <header className="features-section-header">
            <h2 className="section-title">{t('features.knowTitle')}</h2>
            <p className="section-subtitle">{t('features.knowSubtitle')}</p>
          </header>

          <div className="know-grid">
            {know.map((k, i) => {
              const Icon = KNOW_ICONS[i]
              return (
                <div key={k.title} className="feature-card" style={{ '--i': i }}>
                  <Icon className="feature-icon" />
                  <h3 className="feature-title">{k.title}</h3>
                  <p className="feature-text">{k.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}

export default FeaturesView
