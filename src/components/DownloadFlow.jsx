import { useLang } from '../lib/uiText.js'
import flowRaw from '../res/nxget-download-flow.svg?raw'
import '../css/downloadflow.css'

const FLOW_NODES = [
  { left: 48.2, top: 18.4, size: 50.5 },
  { left: 47.7, top: 52.9, size: 27 },
  { left: 48.2, top: 85.6, size: 31.5 },
]

const VIEWBOX_W = 222
const VIEWBOX_H = 548
const FLOW_CYCLE_S = 5
const PACKET_START = 0.04
const PACKET_END = 0.88

const NODE_STAGGER_S = 0.3
const NODE_ENTRY_DURATION_S = 1
const ENTRY_TOTAL_S = NODE_STAGGER_S * (FLOW_NODES.length - 1) + NODE_ENTRY_DURATION_S
const LINE_FADE_DURATION_S = 0.45
const LOOP_START_S = ENTRY_TOTAL_S + LINE_FADE_DURATION_S

const NODE_ELEMENTS = [
  [
    '<circle cx="107" cy="101" r="56" fill="#000000" opacity="0.5"/>',
    '<circle cx="107" cy="101" r="53" fill="#ffffff" stroke="#b8b8ae" stroke-width="1.4" opacity="0.7"/>',
    '<circle cx="107" cy="101" r="48" fill="#24292d"/>',
    '<path d="M98.5 106.5C91.5 105.7 86.3 99.8 86.3 92.8C86.3 85.2 92.4 79 100 79C106.1 79 111.3 82.8 113.2 88.4C114.6 88 116 87.8 117.4 87.8C123.6 87.8 128.6 92.9 128.6 99.2C128.6 105.2 124 110.1 118.1 110.5" fill="none" stroke="#f7f8f8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
  ],
  [
    '<circle cx="106" cy="290" r="29" fill="#24292d"/>',
    '<circle cx="106" cy="290" r="30" fill="#000000" opacity="0.5"/>',
  ],
  [
    '<circle cx="107" cy="469" r="34" fill="#24292d"/>',
    '<circle cx="107" cy="469" r="35" fill="#000000" opacity="0.5"/>',
  ],
]

const NODE_ICON_TAGS = [
  '<g transform="translate(97, 102) scale(0.03)">',
  '<g transform="translate(86, 267) scale(0.06)">',
  '<g transform="translate(73, 385) scale(0.3)">',
]

const tagEntry = (svg, needle, cls) => {
  if (svg.split(needle).length - 1 !== 1) return svg
  return svg.replace(needle, needle.replace(/\/>$/, ` class="flow-entry ${cls}"/>`))
}

const wrapNodeIcon = (svg, openTag, cls) => {
  const start = svg.indexOf(openTag)
  if (start === -1) return svg

  const tagRe = /<\/?g\b[^>]*>/g
  tagRe.lastIndex = start
  let depth = 0
  let end = -1
  let match
  while ((match = tagRe.exec(svg))) {
    if (match[0].startsWith('</g')) {
      depth -= 1
      if (depth === 0) { end = tagRe.lastIndex; break }
    } else if (!match[0].endsWith('/>')) {
      depth += 1
    }
  }
  if (end === -1) return svg

  return `${svg.slice(0, start)}<g class="flow-entry ${cls}">${svg.slice(start, end)}</g>${svg.slice(end)}`
}

const buildFlowSvg = () => {
  const nodes = FLOW_NODES.map(n => ({
    cx: (n.left * VIEWBOX_W) / 100,
    cy: (n.top * VIEWBOX_H) / 100,
    r: (n.size * VIEWBOX_W) / 200,
  }))
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  const startY = first.cy + first.r
  const dist = last.cy - last.r - startY

  const rings = nodes.map((n, i) => {
    const progress = i === 0 ? null : i === nodes.length - 1 ? 1 : (n.cy - n.r - startY) / dist
    const at = progress === null ? 0 : PACKET_START + progress * (PACKET_END - PACKET_START)
    const delay = (LOOP_START_S + at * FLOW_CYCLE_S).toFixed(2)
    return `<circle class="flow-ring" cx="${n.cx.toFixed(2)}" cy="${n.cy.toFixed(2)}" r="${n.r.toFixed(2)}" style="animation-delay:${delay}s"/>`
  }).join('')
  const packet = `<circle class="flow-packet" cx="${first.cx.toFixed(2)}" cy="${startY.toFixed(2)}" r="4" style="--dist:${dist.toFixed(2)}px;animation-delay:${LOOP_START_S.toFixed(2)}s"/>`

  let svg = flowRaw
    .replace(/<style>[\s\S]*?<\/style>/, '')
    .replace(/<line[^>]*\/>/, line => line + rings + packet)

  NODE_ELEMENTS.forEach((elements, i) => {
    elements.forEach(needle => { svg = tagEntry(svg, needle, `flow-entry-${i}`) })
  })
  NODE_ICON_TAGS.forEach((openTag, i) => { svg = wrapNodeIcon(svg, openTag, `flow-entry-${i}`) })

  return svg
}

const FLOW_SVG = buildFlowSvg()

const DownloadFlow = ({ className = '' }) => {
  const { t } = useLang()
  const nodes = t('flow.nodes')

  return (
    <div
      className={`download-flow${className ? ` ${className}` : ''}`}
      style={{ '--entry-total': `${ENTRY_TOTAL_S.toFixed(2)}s`, '--loop-start': `${LOOP_START_S.toFixed(2)}s` }}
    >
      <div
        className="download-flow-art"
        role="img"
        aria-label={t('flow.alt')}
        dangerouslySetInnerHTML={{ __html: FLOW_SVG }}
      />
      {nodes.map((node, i) => {
        const { left, top, size } = FLOW_NODES[i]
        return (
          <div
            key={node.title}
            className="flow-node"
            style={{ left: `${left}%`, top: `${top}%`, width: `${size}%` }}
          >
            <button type="button" className="flow-hot" aria-label={node.title} aria-describedby={`flow-pop-${i}`} />
            <div className="flow-pop" id={`flow-pop-${i}`} role="tooltip">
              <span className="flow-pop-eyebrow">{node.eyebrow}</span>
              <h3 className="flow-pop-title">{node.title}</h3>
              <p className="flow-pop-text">{node.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DownloadFlow
