import '../css/flowglyph.css'

// Eco astratta di DownloadFlow, senza dettagli: nessuna icona, nessun testo,
// nessun popup — solo linea, tre nodi spogli e un pacchetto che scorre in
// loop. Pensata come decorazione (es. il lato destro della pagina App,
// speculare al catalogo animato a sinistra), non come spiegazione del
// flusso: quella resta solo in Home, dentro DownloadFlow.
const VIEWBOX_W = 60
const VIEWBOX_H = 320

const NODES = [
  { cy: 26, r: 7 },
  { cy: 160, r: 9 },
  { cy: 294, r: 7 },
]

const CYCLE_S = 5
const PACKET_START = 0.04
const PACKET_END = 0.88
const ENTRY_S = 0.5

const startY = NODES[0].cy + NODES[0].r
const endY = NODES[NODES.length - 1].cy - NODES[NODES.length - 1].r
const dist = endY - startY

const ringDelay = node => {
  const progress = node === NODES[0] ? 0 : node === NODES[NODES.length - 1] ? 1 : (node.cy - node.r - startY) / dist
  const at = PACKET_START + progress * (PACKET_END - PACKET_START)
  return (ENTRY_S + at * CYCLE_S).toFixed(2)
}

const FlowGlyph = ({ className = '' }) => (
  <div className={`flow-glyph${className ? ` ${className}` : ''}`} aria-hidden="true">
    <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="flow-glyph-svg">
      <line className="flow-glyph-line" x1={VIEWBOX_W / 2} y1={NODES[0].cy} x2={VIEWBOX_W / 2} y2={NODES[2].cy} />
      {NODES.map((n, i) => (
        <circle key={`ring-${i}`} className="flow-glyph-ring" cx={VIEWBOX_W / 2} cy={n.cy} r={n.r} style={{ animationDelay: `${ringDelay(n)}s` }} />
      ))}
      {NODES.map((n, i) => (
        <circle key={`node-${i}`} className="flow-glyph-node" cx={VIEWBOX_W / 2} cy={n.cy} r={n.r} />
      ))}
      <circle
        className="flow-glyph-packet"
        cx={VIEWBOX_W / 2}
        cy={startY}
        r={4}
        style={{ '--dist': `${dist}px`, animationDelay: `${ENTRY_S.toFixed(2)}s` }}
      />
    </svg>
  </div>
)

export default FlowGlyph
