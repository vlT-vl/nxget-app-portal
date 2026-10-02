import { useEffect, useRef, useState } from 'react'
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2'
import { FiInfo } from 'react-icons/fi'
import NxgetLogo from './NxgetLogo.jsx'
import VltLogo from './VltLogo.jsx'
import { useLang } from '../lib/uiText.js'
import aboutTextIt from '../content/about.it.txt?raw'
import aboutTextEn from '../content/about.en.txt?raw'
import '../css/aboutview.css'

const ABOUT_TEXT = { it: aboutTextIt, en: aboutTextEn }

const AboutView = ({ onOpenAbout }) => {
  const { lang, t } = useLang()
  const paragraphs = ABOUT_TEXT[lang].trim().split(/\n\s*\n/)
  const brandRef = useRef(null)
  const [brandVisible, setBrandVisible] = useState(false)

  useEffect(() => {
    const node = brandRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setBrandVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setBrandVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const references = [
    { label: t('about.refBlog'), href: 'https://keivan.io/the-day-appget-died/' },
  ]

  return (
    <section className="about-view">
      <div className="about-inner">
        <div className="about-logo-wrap">
          <NxgetLogo className="about-logo" animated />
        </div>

        <span className="hero-eyebrow">{t('about.eyebrow')}</span>
        <h1 className="about-title">{t('about.title')}</h1>

        {paragraphs.map((p, i) => (
          <p key={i} className="about-paragraph" style={{ '--i': i }}>{p}</p>
        ))}

        <div ref={brandRef} className={`about-brand${brandVisible ? ' about-brand--in' : ''}`}>
          <a className="about-brand-link" href="https://lorenzoveronesi.it" target="_blank" rel="noopener noreferrer" aria-label="lorenzoveronesi.it">
            <VltLogo size="1.9rem" staticExpanded />
          </a>
          <p className="about-copyright">{t('about.copyright')}</p>
        </div>

        <div className="about-refs">
          {references.map(ref => (
            <a key={ref.href} className="about-ref-link" href={ref.href} target="_blank" rel="noopener noreferrer">
              {ref.label} <HiOutlineArrowTopRightOnSquare />
            </a>
          ))}
        </div>

        <button type="button" className="about-info-pill" onClick={onOpenAbout}>
          <FiInfo /> {t('about.infoPill')}
        </button>
      </div>
    </section>
  )
}

export default AboutView
