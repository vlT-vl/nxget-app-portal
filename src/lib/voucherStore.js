import { useEffect, useState } from 'react'
import { decodeRequest, encodeRequest, normalizeName, parseVoucherInput, verifyVoucher } from './voucher.js'
import { isVoucherGated } from './access.js'

export const VOUCHER_CONTACT = 'veronesilorenzo@outlook.com'
export const UNLOCK_MINUTES = 10

const STORAGE_KEY = 'vlt-nxget-vouchers'
const USED_KEY = 'vlt-nxget-used-vouchers'
const USED_LIMIT = 200
const UNLOCK_MS = UNLOCK_MINUTES * 60 * 1000

const PUBLIC_KEY = import.meta.env.VITE_VOUCHER_PUBLIC_KEY || null

const read = key => {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return false
  }
}

const saveEntry = (appId, entry) => {
  const store = read(STORAGE_KEY) ?? {}
  if (entry) store[appId] = entry
  else delete store[appId]
  write(STORAGE_KEY, store)
}

const readEntry = appId => {
  const entry = (read(STORAGE_KEY) ?? {})[appId] ?? null
  if (!entry) return null

  if (entry.unlockedUntil) {
    if (entry.unlockedUntil > Date.now()) return entry
    saveEntry(appId, null)
    return null
  }

  try {
    decodeRequest(entry.request)
  } catch {
    return null
  }

  if ('completion' in entry) {
    const { request, firstName, lastName } = entry
    saveEntry(appId, { request, firstName, lastName })
    return { request, firstName, lastName }
  }
  return entry
}

export const useVoucher = app => {
  const gated = isVoucherGated(app)
  const [entry, setEntry] = useState(() => readEntry(app.id))
  const [now, setNow] = useState(() => Date.now())

  const save = next => {
    saveEntry(app.id, next)
    setEntry(next)
  }

  useEffect(() => {
    setEntry(readEntry(app.id))
  }, [app.id])

  const unlockedUntil = entry?.unlockedUntil ?? 0

  useEffect(() => {
    if (!unlockedUntil) return
    const tick = () => {
      if (Date.now() >= unlockedUntil) save(null)
      else setNow(Date.now())
    }
    tick()
    const id = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [unlockedUntil, app.id])

  const unlocked = gated && unlockedUntil > now

  const createRequest = (firstName, lastName) => {
    try {
      const request = encodeRequest({ firstName, lastName, appId: app.id })
      save({ request, firstName: normalizeName(firstName), lastName: normalizeName(lastName) })
      return { ok: true }
    } catch {
      return { ok: false, reason: 'name' }
    }
  }

  const changeRequest = () => save(null)

  const redeem = async text => {
    if (!PUBLIC_KEY) return { ok: false, reason: 'unavailable' }

    const parsed = parseVoucherInput(text)
    if (!parsed) return { ok: false, reason: 'format' }

    const result = await verifyVoucher({ request: parsed.request, signature: parsed.signature, appId: app.id, publicKey: PUBLIC_KEY })
    if (!result.ok) return result

    const used = read(USED_KEY) ?? []
    if (used.includes(result.fingerprint)) return { ok: false, reason: 'used' }
    write(USED_KEY, [...used, result.fingerprint].slice(-USED_LIMIT))

    save({ unlockedUntil: Date.now() + UNLOCK_MS })
    return { ok: true }
  }

  return { gated, unlocked, remainingMs: unlocked ? unlockedUntil - now : 0, entry, createRequest, changeRequest, redeem }
}
