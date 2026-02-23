import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

export function nowISO(): string {
  return new Date().toISOString()
}

export function ensureDirForFile(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true })
}

export function writeJSON(filePath: string, value: unknown): void {
  ensureDirForFile(filePath)
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

export function readJSON<T>(filePath: string): T {
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

export function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export function normalizeHeaderKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined

  const v = value.trim().toLowerCase()
  if (['yes', 'y', 'true', '1'].includes(v)) return true
  if (['no', 'n', 'false', '0'].includes(v)) return false
  return undefined
}

export function toISODate(value: unknown): string | undefined {
  const raw = asString(value)
  if (!raw) return undefined
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function mapByNormalizedHeader(
  row: Record<string, unknown>,
): Map<string, { header: string; value: unknown }> {
  const map = new Map<string, { header: string; value: unknown }>()
  for (const [header, value] of Object.entries(row)) {
    map.set(normalizeHeaderKey(header), { header, value })
  }
  return map
}

export function firstFieldByKeys(
  rowMap: Map<string, { header: string; value: unknown }>,
  keys: string[],
): { header: string; value: unknown } | undefined {
  for (const key of keys) {
    const exact = rowMap.get(normalizeHeaderKey(key))
    if (exact) return exact
  }

  const normalizedCandidates = keys.map((k) => normalizeHeaderKey(k))
  for (const [key, item] of rowMap.entries()) {
    if (normalizedCandidates.some((candidate) => key.includes(candidate))) {
      return item
    }
  }

  return undefined
}

export function parseArgs(argv: string[]): {
  flags: Record<string, string | boolean>
  positionals: string[]
} {
  const flags: Record<string, string | boolean> = {}
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      positionals.push(token)
      continue
    }

    const withoutPrefix = token.slice(2)
    const [key, inlineValue] = withoutPrefix.split('=', 2)
    if (inlineValue !== undefined) {
      flags[key] = inlineValue
      continue
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      flags[key] = true
      continue
    }

    flags[key] = next
    i += 1
  }

  return { flags, positionals }
}

export function requireStringFlag(
  flags: Record<string, string | boolean>,
  key: string,
  fallback?: string,
): string {
  const value = flags[key]
  if (typeof value === 'string' && value.trim().length > 0) return value
  if (fallback) return fallback
  throw new Error(`Missing required --${key}`)
}

export function optionalStringFlag(
  flags: Record<string, string | boolean>,
  key: string,
): string | undefined {
  const value = flags[key]
  if (typeof value === 'string' && value.trim().length > 0) return value
  return undefined
}

export function buildDefaultBatchId(): string {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const min = String(now.getUTCMinutes()).padStart(2, '0')
  return `${yyyy}${mm}${dd}-${hh}${min}`
}
