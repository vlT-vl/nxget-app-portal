const PREVIEW_MAX = 120

const clip = sentence => {
  if (sentence.length <= PREVIEW_MAX) return sentence
  const head = sentence.slice(0, PREVIEW_MAX)
  const cut = Math.max(head.lastIndexOf(','), head.lastIndexOf(';'), head.lastIndexOf(':'), head.lastIndexOf(' —'))
  return `${head.slice(0, cut > PREVIEW_MAX * 0.5 ? cut : head.lastIndexOf(' '))}…`
}

const firstSentence = text => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return clip(flat.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? flat)
}

export const getDescription = (app, lang) => {
  const { description, about } = app
  if (description && typeof description === 'object') {
    return description[lang] ?? description.en ?? Object.values(description)[0] ?? ''
  }
  if (lang !== 'en' && about?.[lang]) return firstSentence(about[lang])
  return description ?? ''
}
