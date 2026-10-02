const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const NAME_SYMBOLS = "abcdefghijklmnopqrstuvwxyz -'"
const MESSAGE_PREFIX = 'nxget-voucher-v10:'
const FINGERPRINT_PREFIX = 'nxget-voucher-fingerprint-v10:'
const NAME_LENGTH = 24
const TAIL_LENGTH = 4
const REQUEST_LENGTH = NAME_LENGTH + TAIL_LENGTH
const EXPIRY_LENGTH = 5
const EXPIRY_EPOCH_MS = Date.UTC(2025, 0, 1)
const MAX_EXPIRY_MINUTES = 2 ** (5 * EXPIRY_LENGTH) - 1
const PAYLOAD_LENGTH = REQUEST_LENGTH + EXPIRY_LENGTH
const SIGNATURE_BYTES = 64
const SIGNATURE_LENGTH = 103

const encoder = new TextEncoder()

const VOUCHER_LENGTH = PAYLOAD_LENGTH + SIGNATURE_LENGTH

const cleanCode = text => text.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1')

const encodeBig = (value, length) => {
  let out = ''
  for (let i = length - 1; i >= 0; i--) out += ALPHABET[Number((value >> BigInt(5 * i)) & 31n)]
  return out
}

const decodeBig = text => {
  let value = 0n
  for (const ch of cleanCode(text)) {
    const digit = ALPHABET.indexOf(ch)
    if (digit < 0) throw new Error('format')
    value = (value << 5n) | BigInt(digit)
  }
  return value
}

const bytesToBig = bytes => bytes.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n)

const bigToBytes = (value, length) => Uint8Array.from({ length }, (_, i) => Number((value >> BigInt(8 * (length - 1 - i))) & 255n))

const toHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

const sha256 = async bytes => toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))

const fnv32 = text => {
  let hash = 0x811c9dc5
  for (const byte of encoder.encode(text)) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash
}

export const appTag = appId => fnv32(`app:${appId}`) & 0x3ff

export const normalizeName = value => value.normalize('NFC').replace(/\s+/g, ' ').trim()

const foldName = value => normalizeName(value).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘`]/g, "'").toLowerCase()

const titleCase = value => value.replace(/(^|[\s'-])([a-z])/g, (_, before, letter) => before + letter.toUpperCase())

export const encodeRequest = ({ firstName, lastName, appId }) => {
  if (!normalizeName(firstName) || !normalizeName(lastName)) throw new Error('name')

  const name = foldName(`${firstName} ${lastName}`)
  if (name.length > NAME_LENGTH || [...name].some(ch => !NAME_SYMBOLS.includes(ch))) throw new Error('name')

  const nonce = new Uint8Array(2)
  crypto.getRandomValues(nonce)
  const tail = (BigInt(appTag(appId)) << 10n) | (bytesToBig(nonce) & 0x3ffn)

  return [...name.padEnd(NAME_LENGTH, ' ')].map(ch => ALPHABET[NAME_SYMBOLS.indexOf(ch)]).join('') + encodeBig(tail, TAIL_LENGTH)
}

export const decodeRequest = code => {
  const clean = cleanCode(code)
  if (clean.length !== REQUEST_LENGTH) throw new Error('format')

  const letters = [...clean.slice(0, NAME_LENGTH)].map(ch => NAME_SYMBOLS[ALPHABET.indexOf(ch)])
  if (letters.includes(undefined)) throw new Error('format')

  const name = titleCase(letters.join('').trim())
  if (!name) throw new Error('format')

  const tail = decodeBig(clean.slice(NAME_LENGTH))
  return { code: clean, name, appTag: Number(tail >> 10n), nonce: Number(tail & 0x3ffn) }
}

export const encodeExpiry = expiresAtMs => {
  const minutes = Math.round((expiresAtMs - EXPIRY_EPOCH_MS) / 60000)
  if (minutes < 0 || minutes > MAX_EXPIRY_MINUTES) throw new Error('duration')
  return encodeBig(BigInt(minutes), EXPIRY_LENGTH)
}

export const decodeExpiry = text => {
  const clean = cleanCode(text)
  if (clean.length !== EXPIRY_LENGTH) throw new Error('format')
  return EXPIRY_EPOCH_MS + Number(decodeBig(clean)) * 60000
}

export const encodePayload = (requestCode, expiresAtMs) => `${cleanCode(requestCode)}${encodeExpiry(expiresAtMs)}`

export const decodePayload = code => {
  const clean = cleanCode(code)
  if (clean.length !== PAYLOAD_LENGTH) throw new Error('format')
  const decoded = decodeRequest(clean.slice(0, REQUEST_LENGTH))
  return { ...decoded, expiresAt: decodeExpiry(clean.slice(REQUEST_LENGTH)) }
}

export const voucherMessage = payloadCode => encoder.encode(MESSAGE_PREFIX + cleanCode(payloadCode))

export const encodeSignature = bytes => encodeBig(bytesToBig(bytes), SIGNATURE_LENGTH)

const decodeSignature = text => {
  if (cleanCode(text).length !== SIGNATURE_LENGTH) throw new Error('format')
  const value = decodeBig(text)
  if (value >> BigInt(SIGNATURE_BYTES * 8)) throw new Error('format')
  return bigToBytes(value, SIGNATURE_BYTES)
}

export const formatVoucher = (payloadCode, signature) => `${cleanCode(payloadCode)}${cleanCode(signature)}`

export const parseVoucherInput = text => {
  const clean = cleanCode(text)
  return clean.length === VOUCHER_LENGTH
    ? { payload: clean.slice(0, PAYLOAD_LENGTH), signature: clean.slice(PAYLOAD_LENGTH) }
    : null
}

export const voucherFingerprint = voucher => sha256(encoder.encode(FINGERPRINT_PREFIX + cleanCode(voucher)))

export const verifyVoucher = async ({ payload, signature, appId, publicKey }) => {
  let decoded
  let signatureBytes
  try {
    decoded = decodePayload(payload)
    signatureBytes = decodeSignature(signature)
  } catch {
    return { ok: false, reason: 'format' }
  }

  if (decoded.appTag !== appTag(appId)) return { ok: false, reason: 'app' }
  if (!publicKey) return { ok: false, reason: 'invalid' }

  let valid
  try {
    const key = await crypto.subtle.importKey('jwk', { kty: 'OKP', crv: 'Ed25519', x: publicKey }, { name: 'Ed25519' }, false, ['verify'])
    valid = await crypto.subtle.verify({ name: 'Ed25519' }, key, signatureBytes, voucherMessage(payload))
  } catch (error) {
    return { ok: false, reason: error?.name === 'NotSupportedError' ? 'unsupported' : 'invalid' }
  }

  if (!valid) return { ok: false, reason: 'invalid' }
  if (decoded.expiresAt <= Date.now()) return { ok: false, reason: 'expired' }

  return { ok: true, expiresAt: decoded.expiresAt, fingerprint: await voucherFingerprint(formatVoucher(payload, signature)) }
}
