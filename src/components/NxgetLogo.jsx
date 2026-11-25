import logoSvgRaw from '../res/nxget-logo.svg?raw'
import iconSvgRaw from '../res/nxget-icon.svg?raw'
import '../css/nxgetlogo.css'

// Strips the file's fixed id="title" — the logo renders multiple times at once
// (navbar, footer, about modal, home splash...), and duplicate ids are invalid HTML.
const baseMarkup = logoSvgRaw.replace(' id="title"', '')
const baseIconMarkup = iconSvgRaw.replace(' id="title"', '')

// I 10 facet del rombo (icona), in ordine "a onda" dall'alto verso il basso
// (centroidi calcolati dai vertici reali di ciascun path, non a occhio):
// individuano l'ordine in cui i facet compaiono quando il logo animato entra
// in scena. Stringhe esatte del file originale, mai riscritte a mano.
const FACET_WAVE_ORDER = [
  'M17.306 10.025l5.742 9.946 5.742-9.946z',
  'M11.564 19.97l5.742-9.945 5.742 9.946z',
  'M23.048 19.97l5.742-9.945 5.742 9.946z',
  'M11.564 19.97l5.742 9.947 5.742-9.946z',
  'M5.822 29.917l5.742-9.946 5.742 9.946z',
  'M28.79 29.917l5.742-9.946 5.743 9.946z',
  'M23.048 19.97l5.742 9.947 5.742-9.946zm5.742 9.947l5.742 9.945 5.743-9.945z',
  'M5.822 29.917l5.742 9.945 5.742-9.945z',
  'M17.306 29.917l5.742 9.945 5.742-9.945z',
  'M23.048 39.862l5.742-9.945 5.742 9.945z',
]

const WORDMARK_NEEDLE = '<path fill="var(--soft-fill)" fill-rule="evenodd" d="'

// Per la variante "impilata" (icona sopra, scritta sotto, dimensionate in modo
// indipendente) serve la scritta come SVG a sé — nel file originale è un
// unico path dentro un gruppo con la propria trasformazione. Il riquadro
// "0 0 2016 452" non è a occhio: è il min/max reale dei punti del path
// (tutti comandi M/L/Z assoluti, verificato — nessuna trasformazione da
// riapplicare, il path stesso parte già da (0,0)).
const WORDMARK_VIEWBOX = '0 0 2016 452'
const wordmarkMatch = logoSvgRaw.match(/<path fill="var\(--soft-fill\)" fill-rule="evenodd" d="([^"]+)"\/>/)
const wordmarkD = wordmarkMatch ? wordmarkMatch[1] : ''

const tagFacet = (svg, d, cls) => {
  const needle = `d="${d}"`
  if (svg.split(needle).length - 1 !== 1) return svg
  return svg.replace(needle, `${needle} class="${cls}"`)
}

const wrapWordmark = svg => {
  const start = svg.indexOf(WORDMARK_NEEDLE)
  if (start === -1) return svg
  const end = svg.indexOf('/>', start)
  if (end === -1) return svg
  const tagEnd = end + 2
  return `${svg.slice(0, start)}<g class="nxget-type-wrap">${svg.slice(start, tagEnd)}</g>${svg.slice(tagEnd)}`
}

const tagFacets = svg => {
  FACET_WAVE_ORDER.forEach((d, i) => { svg = tagFacet(svg, d, `nxget-wave nxget-wave-${i}`) })
  return svg
}

const animatedMarkup = wrapWordmark(tagFacets(baseMarkup))
const animatedIconMarkup = tagFacets(baseIconMarkup)

const plainWordmarkMarkup = `<svg viewBox="${WORDMARK_VIEWBOX}"><path fill="currentColor" d="${wordmarkD}"/></svg>`
const animatedWordmarkMarkup = `<svg viewBox="${WORDMARK_VIEWBOX}"><g class="nxget-type-wrap"><path fill="currentColor" d="${wordmarkD}"/></g></svg>`

const traceMarkup = (
  <svg className="nxget-trace" viewBox="0 0 700 700" aria-hidden="true">
    <path className="nxget-trace-path" d="M200.3 -11.5 L501.6 -11.5 L634.3 218.4 L767.1 448.3 L616.4 709.2 L85.5 709.2 L-65.2 448.3 L67.6 218.4 Z" pathLength="1" />
  </svg>
)

const NxgetLogo = ({ className = '', animated = false, iconOnly = false, stacked = false }) => {
  if (stacked) {
    return (
      <div className={`nxget-logo nxget-logo--stacked${className ? ` ${className}` : ''}${animated ? ' nxget-logo--animated' : ''}`}>
        <div className="nxget-logo-icon">
          <div className="nxget-logo-icon-art" dangerouslySetInnerHTML={{ __html: animated ? animatedIconMarkup : baseIconMarkup }} />
          {animated && traceMarkup}
        </div>
        <div className="nxget-logo-word" dangerouslySetInnerHTML={{ __html: animated ? animatedWordmarkMarkup : plainWordmarkMarkup }} />
      </div>
    )
  }

  return (
    <div
      className={`nxget-logo${className ? ` ${className}` : ''}${animated ? ' nxget-logo--animated' : ''}`}
      dangerouslySetInnerHTML={{
        __html: iconOnly
          ? (animated ? animatedIconMarkup : baseIconMarkup)
          : (animated ? animatedMarkup : baseMarkup),
      }}
    />
  )
}

export default NxgetLogo
