const HUES = [176, 28, 92, 152, 200, 230, 262, 320]

export const hashHue = text => {
  const sum = [...String(text)].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return HUES[sum % HUES.length]
}

// Colori delle pillole di categoria: un hash "cieco" per stringa può far
// cadere due categorie diverse sullo stesso slot per puro caso (successo con
// "Development"/"Multimedia"). Qui invece si ordinano le categorie
// realmente presenti nel catalogo e si assegna una tonalità diversa a
// ciascuna da una palette distanziata di 30° (mai nell'arco 0-59°/331-360°,
// riservato al rosso di vlT Software): finché le categorie non superano
// `CATEGORY_HUES.length`, nessuna coincide mai con un'altra. L'ordine
// alfabetico rende l'assegnazione stabile da un caricamento all'altro.
const CATEGORY_HUES = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

export const buildCategoryHues = categories => {
  const map = new Map()
  ;[...categories].sort((a, b) => a.localeCompare(b)).forEach((category, i) => {
    map.set(category, CATEGORY_HUES[i % CATEGORY_HUES.length])
  })
  return map
}
