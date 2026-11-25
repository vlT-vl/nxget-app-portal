import {
  HiOutlineArrowDownTray, HiOutlineCheckCircle, HiOutlineCommandLine, HiOutlineQueueList, HiOutlineCpuChip,
  HiOutlineRectangleStack, HiOutlineBolt, HiOutlineShieldCheck, HiOutlineComputerDesktop, HiOutlineCircleStack,
  HiOutlineTag, HiOutlineSquares2X2,
} from 'react-icons/hi2'
import { SiGithub } from 'react-icons/si'
import DocPage from './DocPage.jsx'
import { useLang } from '../lib/uiText.js'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL
const PREVIEW_COMMAND = 'nxget install keepassxc'
const PREVIEW_ROWS = [
  { id: 'keepassxc', pct: 100 },
  { id: 'vlc', pct: 64 },
  { id: 'obs-studio', pct: 28 },
]

const ICONS = {
  roadmap: [HiOutlineCommandLine, HiOutlineQueueList, HiOutlineCpuChip],
  why: [HiOutlineRectangleStack, HiOutlineBolt, HiOutlineShieldCheck, HiOutlineComputerDesktop],
  steps: [HiOutlineCircleStack, HiOutlineTag, HiOutlineCpuChip, HiOutlineArrowDownTray],
  status: [HiOutlineCircleStack, HiOutlineSquares2X2, HiOutlineComputerDesktop],
}

const CompanionPreview = ({ t }) => (
  <div className="cmp rv rv--zoom" role="img" aria-label={t('cli.previewNote')}>
    <div className="cmp-window" aria-hidden="true">
      <div className="cmp-bar">
        <span /><span /><span />
        <em className="cmp-bar-title">nxget companion</em>
        <b className="cmp-bar-tag">{t('cli.previewLabel')}</b>
      </div>

      <div className="cmp-body">
        <div className="cmp-input">
          <span className="cmp-input-prompt">&gt;</span>
          <span className="cmp-input-text">{PREVIEW_COMMAND}</span>
        </div>

        <ul className="cmp-list">
          {PREVIEW_ROWS.map((r, i) => (
            <li key={r.id} className="cmp-row" style={{ '--i': i, '--pct': `${r.pct}%` }}>
              <span className="cmp-row-name">{r.id}</span>
              <span className="cmp-row-track"><span className="cmp-row-fill" /></span>
              <span className="cmp-row-state">
                {r.pct === 100
                  ? <><HiOutlineCheckCircle /> {t('cli.previewDone')}</>
                  : <><HiOutlineArrowDownTray /> {t('cli.previewDownloading')}</>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <p className="cmp-note">{t('cli.previewNote')}</p>
  </div>
)

const CliView = () => {
  const { t } = useLang()

  const groups = [
    { title: t('cli.roadmapTitle'), subtitle: t('cli.roadmapSubtitle'), items: t('cli.roadmap'), icons: ICONS.roadmap },
    { title: t('cli.whyTitle'), subtitle: t('cli.whySubtitle'), items: t('cli.why'), icons: ICONS.why },
    { title: t('cli.howTitle'), subtitle: t('cli.howSubtitle'), items: t('cli.steps'), icons: ICONS.steps },
    {
      title: t('cli.statusTitle'),
      subtitle: t('cli.statusSubtitle'),
      icons: ICONS.status,
      items: t('cli.status').map(s => ({ title: s.title, text: s.text, badge: { label: s.label, state: s.state } })),
    },
  ]

  return (
    <DocPage
      eyebrow={t('cli.eyebrow')}
      title={t('cli.title')}
      lead={t('cli.intro')}
      visual={<CompanionPreview t={t} />}
      groups={groups}
      footer={GITHUB_URL ? {
        label: 'GitHub',
        text: t('cli.cta'),
        cta: 'GitHub',
        icon: <SiGithub />,
        href: GITHUB_URL,
      } : null}
    />
  )
}

export default CliView
