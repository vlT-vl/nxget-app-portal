import {
  HiOutlineGlobeAlt, HiOutlineHandThumbUp, HiOutlineShieldCheck, HiOutlineCodeBracket, HiOutlineArrowPath,
  HiOutlineComputerDesktop, HiOutlineCodeBracketSquare, HiOutlineFire, HiOutlineRocketLaunch, HiOutlineCube,
  HiOutlineCircleStack, HiOutlineTag, HiOutlineMagnifyingGlass, HiOutlineArrowTopRightOnSquare,
  HiOutlineInformationCircle, HiOutlineDocumentText, HiOutlineSquares2X2, HiOutlineLanguage, HiOutlineArrowRight,
} from 'react-icons/hi2'
import DocPage from './DocPage.jsx'
import { useLang } from '../lib/uiText.js'

const ICONS = {
  items: [HiOutlineGlobeAlt, HiOutlineHandThumbUp, HiOutlineShieldCheck, HiOutlineCodeBracket, HiOutlineArrowPath, HiOutlineComputerDesktop],
  open: [HiOutlineCodeBracketSquare, HiOutlineFire, HiOutlineRocketLaunch, HiOutlineCube],
  steps: [HiOutlineCircleStack, HiOutlineTag, HiOutlineMagnifyingGlass, HiOutlineArrowTopRightOnSquare],
  know: [HiOutlineInformationCircle, HiOutlineDocumentText, HiOutlineMagnifyingGlass, HiOutlineSquares2X2, HiOutlineArrowTopRightOnSquare, HiOutlineLanguage],
}

const FeaturesView = ({ onNav }) => {
  const { t } = useLang()

  const groups = [
    { title: t('nav.features'), subtitle: t('features.subtitle'), items: t('features.items'), icons: ICONS.items },
    { title: t('features.openTitle'), subtitle: t('features.openSubtitle'), items: t('features.open'), icons: ICONS.open },
    { title: t('features.howTitle'), subtitle: t('features.howSubtitle'), items: t('features.steps'), icons: ICONS.steps },
    { title: t('features.knowTitle'), subtitle: t('features.knowSubtitle'), items: t('features.know'), icons: ICONS.know },
  ]

  return (
    <DocPage
      eyebrow={t('features.eyebrow')}
      title={t('nav.features')}
      lead={[t('features.subtitle')]}
      groups={groups}
      footer={{
        label: t('features.ctaLabel'),
        text: t('features.ctaText'),
        cta: t('features.ctaButton'),
        icon: <HiOutlineArrowRight />,
        onClick: () => onNav('apps'),
      }}
    />
  )
}

export default FeaturesView
