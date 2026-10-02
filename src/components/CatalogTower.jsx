import { useEffect, useState } from 'react'
import catalogRaw from '../res/catalog.svg?raw'
import '../css/catalogtower.css'

const VIEWBOX_W = 431
const VIEWBOX_H = 537

// Intervallo condiviso di riavvio: chi vuole lo stesso comportamento della
// pagina App Discovery importa questa costante invece di scriverne una
// propria, così i due punti non possono disallinearsi nel tempo.
export const CATALOG_RESTART_MS = 12000

const ROOT_OPEN = '<g fill="none" fill-rule="evenodd">'
const ROOT_CLOSE = '</g></svg>'

// Ogni intervallo raggruppa i figli diretti del gruppo radice che
// compongono, nell'SVG originale, un singolo elemento visivo del disegno
// (un cubo, il suo bagliore, un fascio di linee "pioggia"...). Confini
// individuati leggendo colori/transform reali del file, non a occhio.
const ENTRY_RANGES = [
  [0, 4],
  [4, 9],
  [9, 17],
  [17, 27],
  [27, 33],
  [33, 44],
  [44, 50],
  [50, 51],
]

const namespaceIds = svg => svg
  .replace(/\bid="([^"]+)"/g, (_, id) => `id="ct-${id}"`)
  .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#ct-${id})`)
  .replace(/xlink:href="#([^"]+)"/g, (_, id) => `xlink:href="#ct-${id}"`)

const splitTopLevelChildren = inner => {
  const tagRe = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g
  const children = []
  let depth = 0
  let start = 0
  let match

  while ((match = tagRe.exec(inner))) {
    const [full, closing, , , selfClose] = match
    const tagEnd = match.index + full.length
    if (!closing && !selfClose) {
      depth += 1
    } else if (closing) {
      depth -= 1
      if (depth === 0) { children.push(inner.slice(start, tagEnd)); start = tagEnd }
    } else if (selfClose && depth === 0) {
      children.push(inner.slice(start, tagEnd)); start = tagEnd
    }
  }
  return children
}

const buildCatalogSvg = () => {
  const svg = namespaceIds(catalogRaw)
  const rootStart = svg.indexOf(ROOT_OPEN) + ROOT_OPEN.length
  const rootEnd = svg.length - ROOT_CLOSE.length
  const inner = svg.slice(rootStart, rootEnd)
  const children = splitTopLevelChildren(inner)

  const groups = ENTRY_RANGES.map(([from, to], i) =>
    `<g class="catalog-entry catalog-entry-${i}">${children.slice(from, to).join('')}</g>`
  ).join('')

  let out = `${svg.slice(0, rootStart)}${groups}${svg.slice(rootEnd)}`
  out = out.replace(
    /<svg width="431" height="537"/,
    '<svg width="431" height="537" viewBox="0 0 431 537"'
  )
  return out
}

const CATALOG_SVG = buildCatalogSvg()
const ENTRY_STAGGER_S = 0.3
const ENTRY_DURATION_S = 1
const ENTRY_TOTAL_S = ENTRY_STAGGER_S * (ENTRY_RANGES.length - 1) + ENTRY_DURATION_S
const IDLE_START_S = ENTRY_TOTAL_S + 0.2

// `restartInterval` (ms) è opzionale: se presente, ogni tot tempo l'intera
// sequenza (ingresso + idle) riparte da capo, cambiando la `key` del nodo
// SVG così React lo rimonta da zero. Senza la prop il componente si
// comporta come sempre: ingresso una tantum, poi solo idle in loop.
const CatalogTower = ({ className = '', restartInterval }) => {
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (!restartInterval) return
    const id = setInterval(() => setResetKey(k => k + 1), restartInterval)
    return () => clearInterval(id)
  }, [restartInterval])

  return (
    <div
      key={resetKey}
      className={`catalog-tower${className ? ` ${className}` : ''}`}
      style={{ '--idle-start': `${IDLE_START_S.toFixed(2)}s`, aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: CATALOG_SVG }}
    />
  )
}

export default CatalogTower
