import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SiApple, SiLinux } from 'react-icons/si'
import { DiWindows } from 'react-icons/di'
import { load as parseYaml } from 'js-yaml'
import { isVoucherGated, VLT_CATEGORY } from '../lib/access.js'
import { buildCategoryHues } from '../lib/tagColor.js'

const REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/vlT-vl/nxget.packages/api'
const CATALOG_REFRESH_MS = 60 * 60 * 1000

const fetchCatalog = async () => {
  const indexRes = await fetch(`${REGISTRY_BASE_URL}/v1/index.json`)
  if (!indexRes.ok) throw new Error(`index.json: HTTP ${indexRes.status}`)
  const index = await indexRes.json()
  const results = await Promise.allSettled(
    index.apps.map(async entry => {
      const res = await fetch(entry.manifest)
      if (!res.ok) throw new Error(`manifest: HTTP ${res.status}`)
      const text = await res.text()
      const manifest = parseYaml(text)
      if (typeof manifest?.name !== 'string') throw new Error('manifest: invalid')
      return { ...manifest, __manifestText: text }
    })
  )
  const manifests = results.filter(r => r.status === 'fulfilled').map(r => r.value)
  if (!manifests.length && index.apps.length) throw new Error('no manifest could be loaded')
  return manifests.sort((a, b) => a.name.localeCompare(b.name))
}

export const PLATFORM_META = {
  windows: { label: 'Windows', icon: DiWindows, hue: 208 },
  macos:   { label: 'macOS',   icon: SiApple, hue: 295 },
  linux:   { label: 'Linux',   icon: SiLinux, hue: 35 },
}

export const ARCH_LABEL = { x64: 'x64', arm64: 'ARM64', universal: 'Universal' }

export const OS_VERSION_LABEL = { 14: 'Sonoma', 15: 'Sequoia', 26: 'Tahoe', 27: 'Golden Gate' }

export const getPlatforms = downloads => Object.keys(downloads)

export const getDownloadEntries = downloads =>
  Object.entries(downloads).flatMap(([platform, archMap]) => {
    const archKeys = Object.keys(archMap)
    return archKeys.flatMap(arch => {
      const osMap = archMap[arch]
      const osKeys = Object.keys(osMap)
      return osKeys.map(osVersion => {
        const { url, format } = osMap[osVersion]
        const parts = [PLATFORM_META[platform].label]
        if (format) parts.push(format)
        if (archKeys.length > 1) parts.push(ARCH_LABEL[arch])
        if (osVersion !== 'default') parts.push(`(${OS_VERSION_LABEL[osVersion] ?? osVersion})`)

        return {
          key: `${platform}-${arch}-${osVersion}`,
          platform,
          arch,
          osVersion: osVersion === 'default' ? null : osVersion,
          url,
          label: parts.join(' '),
        }
      })
    })
  })

const SNAPSHOT_CACHE_KEY = 'vlt-nxget-releases-snapshot'
const SNAPSHOT_TTL_MS = 60 * 60 * 1000
const RATE_LIMIT_FLOOR = 5

let rateLimited = false
let snapshotPromise = null

const readSnapshotCache = () => {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_CACHE_KEY))
  } catch {
    return null
  }
}

const writeSnapshotCache = snapshot => {
  try {
    localStorage.setItem(SNAPSHOT_CACHE_KEY, JSON.stringify({ snapshot, fetchedAt: Date.now() }))
  } catch {}
}

const parseRepo = repo => {
  const match = repo?.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/)
  return match ? { owner: match[1], name: match[2] } : null
}

const fetchSnapshot = () => {
  if (snapshotPromise) return snapshotPromise

  snapshotPromise = (async () => {
    const cached = readSnapshotCache()
    if (cached?.snapshot && Date.now() - cached.fetchedAt < SNAPSHOT_TTL_MS) return cached.snapshot

    const res = await fetch(`${REGISTRY_BASE_URL}/v1/releases.json`).catch(() => null)
    if (!res || !res.ok) return cached?.snapshot ?? { apps: {} }

    const snapshot = await res.json().catch(() => null)
    if (!snapshot?.apps) return cached?.snapshot ?? { apps: {} }

    writeSnapshotCache(snapshot)
    return snapshot
  })()

  snapshotPromise.then(() => { snapshotPromise = null })
  return snapshotPromise
}

const matrixDownloads = app => {
  const downloads = {}
  for (const rule of app.assets || []) {
    downloads[rule.platform] ??= {}
    downloads[rule.platform][rule.arch] ??= {}
    downloads[rule.platform][rule.arch][rule.osVersion ?? 'default'] = { url: null, format: rule.format }
  }
  return downloads
}

const manifestVersion = app => (app.version == null ? null : String(app.version))

const compareVersions = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

const versionInfo = (app, releaseTag) => {
  const platformVersions = new Map()
  for (const rule of app.assets || []) {
    if (rule.version == null) continue
    const value = String(rule.version)
    const current = platformVersions.get(rule.platform)
    if (!current || compareVersions(value, current) > 0) platformVersions.set(rule.platform, value)
  }

  const distinctVersions = [...new Set(platformVersions.values())]
  const version = releaseTag
    ?? manifestVersion(app)
    ?? (distinctVersions.length === 1 ? distinctVersions[0] : null)

  const assetVersions = [...platformVersions.entries()]
    .filter(([, v]) => v !== version)
    .map(([platform, v]) => ({ key: platform, label: PLATFORM_META[platform].label, version: v }))

  return { version, assetVersions }
}

export const resolveAppDownloads = async app => {
  const entry = app.repo ? (await fetchSnapshot()).apps[app.id] : null

  if (isVoucherGated(app) && !app.unlocked) {
    return { status: 'locked', downloads: matrixDownloads(app), ...versionInfo(app, entry?.tag) }
  }

  const downloads = {}
  for (const rule of app.assets || []) {
    if (!rule.url) continue
    downloads[rule.platform] ??= {}
    downloads[rule.platform][rule.arch] ??= {}
    downloads[rule.platform][rule.arch][rule.osVersion ?? 'default'] = { url: rule.url, format: rule.format }
  }

  for (const [platform, archMap] of Object.entries(entry?.downloads || {})) {
    for (const [arch, osMap] of Object.entries(archMap)) {
      for (const [osVersion, download] of Object.entries(osMap)) {
        downloads[platform] ??= {}
        downloads[platform][arch] ??= {}
        downloads[platform][arch][osVersion] = download
      }
    }
  }

  const awaitsRelease = (app.assets || []).some(rule => !rule.url)
  if (awaitsRelease && !entry?.tag && !Object.keys(downloads).length) return { status: 'error', downloads, ...versionInfo(app, null) }

  return { status: 'ready', downloads, ...versionInfo(app, entry?.tag) }
}

export const resolveVersionHistory = async app => {
  if (!app.repo) return []
  const entry = (await fetchSnapshot()).apps[app.id]
  if (!entry?.history) return []

  return entry.history.map(r => ({
    tag: r.tag,
    name: r.name || r.tag,
    publishedAt: r.published_at,
    url: r.url,
  }))
}

export const resolveAllDownloads = async list => {
  const entries = await Promise.all(
    list.map(app => resolveAppDownloads(app).then(result => [app.id, result.downloads]).catch(() => [app.id, {}]))
  )
  return Object.fromEntries(entries)
}

const NEWEST_REPO = 'vlT-vl/nxget.packages'
const NEWEST_CACHE_KEY = 'vlt-nxget-newest-manifests'
const NEWEST_CACHE_TTL_MS = 60 * 60 * 1000
const MANIFEST_PATH_RE = /^manifests\/([^/]+)\/\1\.yaml$/

const readNewestCache = () => {
  try {
    return JSON.parse(localStorage.getItem(NEWEST_CACHE_KEY))
  } catch {
    return null
  }
}

const writeNewestCache = ids => {
  try {
    localStorage.setItem(NEWEST_CACHE_KEY, JSON.stringify({ ids, fetchedAt: Date.now() }))
  } catch {}
}

const trackRateLimit = res => {
  const remaining = Number(res.headers.get('x-ratelimit-remaining'))
  if (!Number.isNaN(remaining) && remaining <= RATE_LIMIT_FLOOR) rateLimited = true
}

const commitManifestIds = async sha => {
  const res = await fetch(`https://api.github.com/repos/${NEWEST_REPO}/commits/${sha}`).catch(() => null)
  if (!res) return []
  trackRateLimit(res)
  if (!res.ok) return []

  const data = await res.json().catch(() => null)
  return (data?.files || [])
    .filter(file => file.status !== 'removed')
    .map(file => file.filename.match(MANIFEST_PATH_RE)?.[1])
    .filter(Boolean)
}

let newestPromise = null

const fetchNewestManifestIds = () => {
  if (newestPromise) return newestPromise

  newestPromise = (async () => {
    const cached = readNewestCache()
    if (cached && Date.now() - cached.fetchedAt < NEWEST_CACHE_TTL_MS) return cached.ids
    if (rateLimited) return cached?.ids ?? []

    const res = await fetch(
      `https://api.github.com/repos/${NEWEST_REPO}/commits?sha=api&path=manifests&per_page=2`
    ).catch(() => null)
    if (!res) return cached?.ids ?? []
    trackRateLimit(res)
    if (!res.ok) return cached?.ids ?? []

    const commits = await res.json().catch(() => null)
    if (!Array.isArray(commits)) return cached?.ids ?? []

    const perCommit = await Promise.all(commits.map(c => commitManifestIds(c.sha)))
    const ids = [...new Set(perCommit.flat())]

    writeNewestCache(ids)
    return ids
  })()

  newestPromise.finally(() => { newestPromise = null })
  return newestPromise
}

const REGISTRY_STATUS_CACHE_KEY = 'vlt-nxget-registry-status'
const REGISTRY_STATUS_TTL_MS = 60 * 60 * 1000

const readRegistryStatusCache = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_STATUS_CACHE_KEY))
  } catch {
    return null
  }
}

const writeRegistryStatusCache = data => {
  try {
    localStorage.setItem(REGISTRY_STATUS_CACHE_KEY, JSON.stringify({ ...data, fetchedAt: Date.now() }))
  } catch {}
}

const probeRegistry = async () => {
  const res = await fetch(`${REGISTRY_BASE_URL}/v1/index.json`, { method: 'HEAD' }).catch(() => null)
  return Boolean(res?.ok)
}

let registryStatusPromise = null

const fetchRegistryStatus = () => {
  if (registryStatusPromise) return registryStatusPromise

  registryStatusPromise = (async () => {
    const cached = readRegistryStatusCache()
    if (cached && Date.now() - cached.fetchedAt < REGISTRY_STATUS_TTL_MS) return cached
    if (rateLimited) return cached ?? { online: true, updatedAt: null }

    const res = await fetch(`https://api.github.com/repos/${NEWEST_REPO}/commits?sha=api&per_page=1`).catch(() => null)
    if (res) trackRateLimit(res)
    if (!res?.ok) return { online: await probeRegistry(), updatedAt: cached?.updatedAt ?? null }

    const commits = await res.json().catch(() => null)
    const data = { online: true, updatedAt: commits?.[0]?.commit?.author?.date ?? null }
    writeRegistryStatusCache(data)
    return data
  })()

  registryStatusPromise.finally(() => { registryStatusPromise = null })
  return registryStatusPromise
}

export const useRegistryStatus = () => {
  const [state, setState] = useState({ status: 'loading', updatedAt: null })

  useEffect(() => {
    let cancelled = false

    fetchRegistryStatus().then(result => {
      if (!cancelled) setState({ status: result.online ? 'online' : 'offline', updatedAt: result.updatedAt })
    })

    return () => { cancelled = true }
  }, [])

  return state
}

const LICENSE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'COPYING']
const RAW_HOST = 'https://raw.githubusercontent.com'
const licenseCache = new Map()

const toRawUrl = url => url.replace(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/, `${RAW_HOST}/$1/$2/$3`)

const toPageUrl = url => url.replace(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(.+)$/, 'https://github.com/$1/$2/blob/$3')

const declaredLicenseUrl = app => (typeof app.license === 'string' ? app.license : app.license?.url) ?? null

const licenseCandidates = app => {
  const declared = declaredLicenseUrl(app)
  if (declared) return [{ raw: toRawUrl(declared), page: toPageUrl(declared) }]
  if (isVoucherGated(app)) return []

  const parsed = parseRepo(app.repo)
  if (!parsed) return []

  return LICENSE_FILES.map(file => ({
    raw: `${RAW_HOST}/${parsed.owner}/${parsed.name}/HEAD/${file}`,
    page: `https://github.com/${parsed.owner}/${parsed.name}/blob/HEAD/${file}`,
  }))
}

export const resolveLicense = app => {
  if (licenseCache.has(app.id)) return licenseCache.get(app.id)

  const promise = (async () => {
    let transient = false
    for (const candidate of licenseCandidates(app)) {
      const res = await fetch(candidate.raw).catch(() => null)
      if (!res) {
        transient = true
        continue
      }
      if (!res.ok) continue
      const text = await res.text().catch(() => '')
      if (text.trim()) return { status: 'ready', text, url: candidate.page }
    }
    return { status: 'missing', transient }
  })()

  licenseCache.set(app.id, promise)
  promise.then(result => { if (result.status === 'missing' && result.transient) licenseCache.delete(app.id) })
  return promise
}

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
  const [catalog, setCatalog] = useState({ apps: [], status: 'loading', error: null })
  const aliveRef = useRef(true)

  const loadCatalog = () => fetchCatalog()
    .then(apps => { if (aliveRef.current) setCatalog({ apps, status: 'ready', error: null }) })
    .catch(error => {
      if (!aliveRef.current) return
      console.error('nxget: failed to load the app catalog', error)
      setCatalog(prev => (prev.apps.length ? prev : { apps: [], status: 'error', error }))
    })

  useEffect(() => {
    aliveRef.current = true
    loadCatalog()
    const id = setInterval(loadCatalog, CATALOG_REFRESH_MS)
    return () => {
      aliveRef.current = false
      clearInterval(id)
    }
  }, [])

  const value = { ...catalog, refreshCatalog: loadCatalog }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useCatalog = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useCatalog must be used within a DataProvider')
  return ctx
}

export const useAppDownloads = app => {
  const [state, setState] = useState({ status: 'loading', downloads: {}, version: null, assetVersions: [] })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', downloads: {}, version: null, assetVersions: [] })

    resolveAppDownloads(app).then(result => {
      if (!cancelled) setState(result)
    })

    return () => { cancelled = true }
  }, [app.id, app.repo, app.unlocked, app.version])

  return state
}

export const useLicense = app => {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    resolveLicense(app).then(result => {
      if (!cancelled) setState(result)
    })

    return () => { cancelled = true }
  }, [app.id, app.repo, declaredLicenseUrl(app)])

  return state
}

export const useCategoryHues = () => {
  const { apps } = useCatalog()
  return useMemo(() => {
    const categories = [...new Set(apps.map(app => app.category))].filter(c => c !== VLT_CATEGORY)
    return buildCategoryHues(categories)
  }, [apps])
}

export const useNewestAppIds = () => {
  const [ids, setIds] = useState([])

  useEffect(() => {
    let cancelled = false

    fetchNewestManifestIds().then(result => {
      if (!cancelled) setIds(result)
    })

    return () => { cancelled = true }
  }, [])

  return ids
}

export const useVersionHistory = app => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    let cancelled = false
    setHistory([])

    resolveVersionHistory(app).then(result => {
      if (!cancelled) setHistory(result)
    })

    return () => { cancelled = true }
  }, [app.id, app.repo, app.unlocked])

  return history
}
