import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SiApple, SiLinux } from 'react-icons/si'
import { DiWindows } from 'react-icons/di'
import { load as parseYaml } from 'js-yaml'
import { isVoucherGated, VLT_CATEGORY } from '../lib/access.js'
import { buildCategoryHues } from '../lib/tagColor.js'

const REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/vlT-vl/nxget.packages/api'
const CATALOG_REFRESH_MS = 60 * 60 * 1000

const fetchCatalog = async () => {
  const index = await fetch(`${REGISTRY_BASE_URL}/v1/index.json`).then(r => r.json())
  const manifests = await Promise.all(
    index.apps.map(async entry => {
      const text = await fetch(entry.manifest).then(r => r.text())
      return { ...parseYaml(text), __manifestText: text }
    })
  )
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

const RELEASE_CACHE_TTL_MS = 60 * 60 * 1000
const RATE_LIMIT_FLOOR = 5

const inFlight = new Map()
let rateLimited = false

const releaseCacheKey = repo => `vlt-nxget-releases:${repo}`

const readReleaseCache = repo => {
  try {
    return JSON.parse(localStorage.getItem(releaseCacheKey(repo)))
  } catch {
    return null
  }
}

const writeReleaseCache = (repo, releases, etag) => {
  try {
    localStorage.setItem(releaseCacheKey(repo), JSON.stringify({ releases, etag, fetchedAt: Date.now() }))
  } catch {}
}

const parseRepo = repo => {
  const match = repo?.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/)
  return match ? { owner: match[1], name: match[2] } : null
}

const trimRelease = r => ({
  tag_name: r.tag_name,
  name: r.name,
  published_at: r.published_at,
  html_url: r.html_url,
  prerelease: r.prerelease,
  draft: r.draft,
  assets: (r.assets || []).map(a => ({ name: a.name, browser_download_url: a.browser_download_url })),
})

const fetchReleases = repo => {
  if (inFlight.has(repo)) return inFlight.get(repo)

  const promise = (async () => {
    const parsed = parseRepo(repo)
    if (!parsed) return null

    const cached = readReleaseCache(repo)
    if (cached && Date.now() - cached.fetchedAt < RELEASE_CACHE_TTL_MS) return cached.releases

    if (rateLimited) return cached?.releases ?? null

    const headers = {}
    if (cached?.etag) headers['If-None-Match'] = cached.etag

    let res
    try {
      res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.name}/releases?per_page=10`, { headers })
    } catch {
      return cached?.releases ?? null
    }

    const remaining = Number(res.headers.get('x-ratelimit-remaining'))
    if (!Number.isNaN(remaining) && remaining <= RATE_LIMIT_FLOOR) rateLimited = true

    if (res.status === 304 && cached) {
      writeReleaseCache(repo, cached.releases, cached.etag)
      return cached.releases
    }
    if (res.status === 403 || res.status === 429) {
      rateLimited = true
      return cached?.releases ?? null
    }
    if (!res.ok) return cached?.releases ?? null

    const releases = (await res.json()).map(trimRelease)
    writeReleaseCache(repo, releases, res.headers.get('etag'))
    return releases
  })()

  inFlight.set(repo, promise)
  promise.finally(() => inFlight.delete(repo))
  return promise
}

const pickRelease = (releases, app) =>
  releases?.find(r => !r.prerelease && !r.draft && (!app.releasePrefix || r.tag_name.startsWith(app.releasePrefix)))

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

export const resolveAppDownloads = async (app, { needVersion = true } = {}) => {
  if (isVoucherGated(app) && !app.unlocked) {
    const release = app.repo ? pickRelease(await fetchReleases(app.repo), app) : null
    return { status: 'locked', downloads: matrixDownloads(app), ...versionInfo(app, release?.tag_name) }
  }

  const downloads = {}
  for (const rule of app.assets || []) {
    if (!rule.url) continue
    downloads[rule.platform] ??= {}
    downloads[rule.platform][rule.arch] ??= {}
    downloads[rule.platform][rule.arch][rule.osVersion ?? 'default'] = { url: rule.url, format: rule.format }
  }

  const matchRules = (app.assets || []).filter(rule => rule.match)
  if (!matchRules.length && !(app.repo && needVersion)) return { status: 'ready', downloads, ...versionInfo(app, null) }

  const releases = await fetchReleases(app.repo)
  const release = pickRelease(releases, app)
  if (!matchRules.length) return { status: 'ready', downloads, ...versionInfo(app, release?.tag_name) }
  if (!release) return { status: Object.keys(downloads).length ? 'ready' : 'error', downloads, ...versionInfo(app, null) }

  const rules = matchRules.map(rule => ({ ...rule, regex: new RegExp(rule.match, 'i') }))
  for (const asset of release.assets || []) {
    const rule = rules.find(r => r.regex.test(asset.name))
    if (!rule) continue
    downloads[rule.platform] ??= {}
    downloads[rule.platform][rule.arch] ??= {}
    downloads[rule.platform][rule.arch][rule.osVersion ?? 'default'] = { url: asset.browser_download_url, format: rule.format }
  }

  return { status: 'ready', downloads, ...versionInfo(app, release.tag_name) }
}

export const resolveVersionHistory = async app => {
  const releases = await fetchReleases(app.repo)
  if (!releases) return []

  return releases
    .filter(r => !app.releasePrefix || r.tag_name.startsWith(app.releasePrefix))
    .map(r => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      publishedAt: r.published_at,
      url: r.html_url,
    }))
}

export const resolveAllDownloads = async list => {
  const entries = await Promise.all(
    list.map(app => resolveAppDownloads(app, { needVersion: false }).then(result => [app.id, result.downloads]).catch(() => [app.id, {}]))
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

let registryStatusPromise = null

const fetchRegistryStatus = () => {
  if (registryStatusPromise) return registryStatusPromise

  registryStatusPromise = (async () => {
    const cached = readRegistryStatusCache()
    if (cached && Date.now() - cached.fetchedAt < REGISTRY_STATUS_TTL_MS) return cached
    if (rateLimited) return cached ?? { online: true, updatedAt: null }

    const res = await fetch(`https://api.github.com/repos/${NEWEST_REPO}/commits?sha=api&per_page=1`).catch(() => null)
    if (!res) return cached ?? { online: false, updatedAt: null }
    trackRateLimit(res)
    if (!res.ok) return cached ?? { online: false, updatedAt: null }

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
