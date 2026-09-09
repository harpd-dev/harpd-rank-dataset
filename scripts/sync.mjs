#!/usr/bin/env node
/**
 * Sync the Harpd Rank public dataset from harpd.com into this repository.
 *
 *   node scripts/sync.mjs            # fetch and write
 *   node scripts/sync.mjs --check    # validate what is already committed
 *   node scripts/sync.mjs --origin=http://localhost:4322
 *
 * Zero dependencies (Node 18+ global fetch). No credentials: everything this
 * script reads is already public at https://harpd.com/data/.
 *
 * Two safety rules, because a public dataset that silently publishes an empty
 * snapshot is worse than one that is a week stale:
 *   1. Every endpoint must return 200 AND a non-empty record set. Otherwise the
 *      run aborts and nothing is written.
 *   2. `rank.json` must not shrink by more than 25% versus the previous
 *      committed copy. A drop that large means the upstream API is degraded,
 *      not that products disappeared.
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const CHECK_ONLY = args.includes('--check')
const ORIGIN = (args.find((a) => a.startsWith('--origin=')) || '').split('=')[1] || 'https://harpd.com'

/** endpoint path -> where it lands in this repo. */
const TARGETS = [
  ['/data/rank.json', 'rankings/rank.json'],
  ['/data/rank.csv', 'rankings/rank.csv'],
  ['/data/categories.json', 'rankings/categories.json'],
  ['/data/top-products.json', 'rankings/top-products.json'],
  ['/data/products.json', 'rankings/products.json'],
  ['/data/market-index.json', 'rankings/market-index.json'],
  ['/data/rank-open-data.json', 'rankings/rank-open-data.json'],
  ['/data/rank-history.json', 'rankings/rank-history.json'],
  ['/data/methodology.json', 'methodology/methodology.json'],
  ['/data/schema.json', 'methodology/schema.json'],
  ['/data/research.json', 'research/research.json'],
]

/** JSON Schemas are INFERRED from the live records, never hand-written: a
 * hand-written schema drifts from reality and then lies about the data. */
const SCHEMAS = [
  ['schema/rank.schema.json', 'rankings/rank.json', 'products', 'Harpd Rank overall board'],
  ['schema/categories.schema.json', 'rankings/categories.json', 'categories', 'Harpd Rank category boards'],
  ['schema/open-data.schema.json', 'rankings/rank-open-data.json', 'products', 'Harpd Rank objective (non-sponsored) metrics'],
]

const sha256 = (text) => createHash('sha256').update(text).digest('hex')
const now = () => new Date().toISOString()

const get = async (path) => {
  const url = `${ORIGIN}${path}`
  const response = await fetch(url, { headers: { Accept: '*/*' }, signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`)
  return response.text()
}

const write = async (relative, body) => {
  const target = join(ROOT, relative)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, body, 'utf8')
  return target
}

/** Minimal JSON-Schema inference over real records. */
const inferSchema = (title, rows) => {
  const typeOf = (value) => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    if (Number.isInteger(value)) return 'integer'
    return typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : typeof value === 'object' ? 'object' : 'string'
  }
  const seen = new Map()
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (!seen.has(key)) seen.set(key, new Set())
      seen.get(key).add(typeOf(value))
    }
  }
  const properties = {}
  const required = []
  for (const [key, types] of seen) {
    const list = [...types]
    // null always coexists with a real type; drop it from the type union but
    // keep the field optional so validators do not reject genuine nulls.
    const concrete = list.filter((t) => t !== 'null')
    properties[key] = { type: concrete.length === 1 ? concrete[0] : concrete }
    if (types.size === rows.length || ![...types].includes('null')) {
      if (rows.every((row) => key in row && row[key] !== null)) required.push(key)
    }
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title,
    type: 'object',
    properties,
    required: required.sort(),
    additionalProperties: true,
  }
}

const main = async () => {
  if (CHECK_ONLY) {
    let failures = 0
    for (const [, relative] of TARGETS) {
      try {
        const text = await readFile(join(ROOT, relative), 'utf8')
        if (relative.endsWith('.json')) JSON.parse(text)
        if (!text.trim()) throw new Error('empty file')
      } catch (error) {
        failures += 1
        console.error(`  FAIL ${relative}: ${error.message}`)
      }
    }
    console.log(failures === 0 ? `check OK — ${TARGETS.length} files valid` : `check FAILED — ${failures} file(s)`)
    process.exit(failures === 0 ? 0 : 1)
  }

  console.log(`syncing from ${ORIGIN}`)
  const fetched = []
  for (const [path, relative] of TARGETS) {
    const body = await get(path)
    if (!body.trim()) throw new Error(`${path} returned an empty body — aborting`)
    if (relative.endsWith('.json')) JSON.parse(body) // fail loudly on truncated JSON
    fetched.push({ path, relative, body })
    console.log(`  fetched ${path} (${body.length} bytes)`)
  }

  // Abort rather than publish a degraded snapshot.
  const rankJson = JSON.parse(fetched.find((f) => f.relative === 'rankings/rank.json').body)
  if (!Array.isArray(rankJson.products) || rankJson.products.length === 0) {
    throw new Error('rank.json has no products — upstream looks degraded, aborting')
  }
  try {
    const previous = JSON.parse(await readFile(join(ROOT, 'rankings/rank.json'), 'utf8'))
    const before = previous.products?.length ?? 0
    const after = rankJson.products.length
    if (before > 0 && after < before * 0.75) {
      throw new Error(`rank.json shrank from ${before} to ${after} products (>25%) — refusing to publish`)
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error // first run has no previous copy
  }

  for (const { relative, body } of fetched) await write(relative, body)

  // Monthly snapshot: frozen, citable copy keyed by the upstream period.
  const history = JSON.parse(fetched.find((f) => f.relative === 'rankings/rank-history.json').body)
  const periods = Array.isArray(history.periods) ? history.periods : []
  const period = periods.map((p) => p.periodKey).filter(Boolean).sort().at(-1)
    || new Date().toISOString().slice(0, 7)

  const snapshotFiles = [
    ['/data/rank.json', `snapshots/${period}/rank.json`],
    ['/data/rank.csv', `snapshots/${period}/rank.csv`],
    ['/data/categories.json', `snapshots/${period}/categories.json`],
    ['/data/market-index.json', `snapshots/${period}/market-index.json`],
  ]
  for (const [path, relative] of snapshotFiles) {
    await write(relative, fetched.find((f) => f.path === path).body)
  }

  const manifest = {
    generatedAt: now(),
    origin: ORIGIN,
    period,
    products: rankJson.products.length,
    categories: JSON.parse(fetched.find((f) => f.relative === 'rankings/categories.json').body).categories?.length ?? 0,
    files: [
      ...fetched.map(({ relative, body }) => ({ path: relative, bytes: body.length, sha256: sha256(body) })),
      ...snapshotFiles.map(([, relative]) => ({ path: relative, snapshot: true })),
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    methodology: 'https://harpd.com/rank/methodology/',
  }
  await write(`snapshots/${period}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`)
  await write('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)

  for (const [schemaPath, dataPath, recordsKey, title] of SCHEMAS) {
    const rows = JSON.parse(fetched.find((f) => f.relative === dataPath).body)[recordsKey]
    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn(`  skip ${schemaPath}: ${dataPath} has no "${recordsKey}" records`)
      continue
    }
    await write(schemaPath, `${JSON.stringify(inferSchema(title, rows), null, 2)}\n`)
    console.log(`  inferred ${schemaPath} from ${rows.length} records`)
  }

  console.log(`\ndone — ${rankJson.products.length} products, period ${period}`)
  console.log('next: git add -A && git commit -m "data: sync <date>"')
}

main().catch((error) => {
  console.error(`\nsync FAILED: ${error.message}`)
  process.exit(1)
})
