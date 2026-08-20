#!/usr/bin/env node
/**
 * Regenerate data/popularity.json — the popularity snapshot the persona grid
 * paints from on first frame.
 *
 *   npm run popularity            # from production
 *   POPULARITY_SOURCE=http://localhost:3111 npm run popularity
 *
 * Why a committed file rather than a build-time fetch: the grid renders from
 * the static catalogue before any network call resolves, so the ordering data
 * has to be present in the bundle. Fetching it during `next build` would put a
 * live network dependency on every deploy and still leave local dev unordered.
 * A snapshot goes stale between regenerations, which is fine — catalogue order
 * is arbitrary, so even a month-old ranking is a better first paint than none.
 *
 * Reads the public /api/persona-views endpoint, so no credentials are needed.
 */

import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'data', 'popularity.json')
const SOURCE = process.env.POPULARITY_SOURCE || 'https://ai-spirit.in'

const res = await fetch(`${SOURCE}/api/persona-views`)
if (!res.ok) {
    console.error(`  ${SOURCE}/api/persona-views returned ${res.status}`)
    process.exit(1)
}

const { views } = await res.json()
if (!Array.isArray(views) || views.length === 0) {
    console.error('  No view rows returned; refusing to write an empty snapshot.')
    process.exit(1)
}

// Same shape as the statsMap built in pages/personas.js, so the two merge
// without any translation at the call site.
const snapshot = {}
for (const row of views) {
    if (!row?.persona_slug) continue
    snapshot[row.persona_slug] = {
        message_count: row.message_count || 0,
        view_count: row.view_count || 0,
    }
}

const ordered = Object.fromEntries(
    Object.entries(snapshot).sort((a, b) => b[1].message_count - a[1].message_count)
)

writeFileSync(OUT, JSON.stringify(ordered, null, 2) + '\n')

const top = Object.entries(ordered).slice(0, 5)
console.log(`\n  Wrote ${Object.keys(ordered).length} personas to data/popularity.json`)
console.log(`  source: ${SOURCE}`)
console.log('  top:    ' + top.map(([slug, s]) => `${slug} (${s.message_count})`).join(', ') + '\n')
