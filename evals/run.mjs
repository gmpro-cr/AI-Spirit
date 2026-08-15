#!/usr/bin/env node
/**
 * Persona response eval runner.
 *
 *   node evals/run.mjs --dry-run          list cases and the call budget
 *   node evals/run.mjs                    run everything
 *   node evals/run.mjs --only osho        run one persona
 *   node evals/run.mjs --limit 3          run the first N cases
 *
 * Auth: /api/chat rejects anything without a Supabase bearer token, so supply
 * one of
 *   EVAL_BEARER_TOKEN=<access token>                    (copy from the browser)
 *   EVAL_USER_EMAIL=... EVAL_USER_PASSWORD=...          (a dedicated test account)
 *
 * Target: EVAL_BASE_URL, default http://localhost:3111.
 *
 * Budget matters. The OpenRouter account is on the free tier at 50 model calls
 * per day, and a multi-turn case spends one per turn — so the runner prints
 * the budget before spending anything and refuses to start if the run alone
 * would exhaust the day.
 */

import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

import { CASES } from './cases.mjs'
import { INITIAL_PERSONAS } from '../data/personas.js'
import { looksLikeLeakedReasoning } from '../lib/gemini.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const DAILY_MODEL_CALL_BUDGET = 50

function loadEnv() {
    const path = join(ROOT, '.env.local')
    if (!existsSync(path)) return
    for (const line of readFileSync(path, 'utf-8').split('\n')) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
}

function parseArgs(argv) {
    const args = { dryRun: false, only: null, limit: null }
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--dry-run') args.dryRun = true
        else if (argv[i] === '--only') args.only = argv[++i]
        else if (argv[i] === '--limit') args.limit = Number(argv[++i])
    }
    return args
}

async function getToken() {
    if (process.env.EVAL_BEARER_TOKEN) return process.env.EVAL_BEARER_TOKEN

    const { EVAL_USER_EMAIL, EVAL_USER_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env
    if (!EVAL_USER_EMAIL || !EVAL_USER_PASSWORD) {
        throw new Error(
            'No credentials. Set EVAL_BEARER_TOKEN, or EVAL_USER_EMAIL and EVAL_USER_PASSWORD for a test account.'
        )
    }

    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: EVAL_USER_EMAIL,
        password: EVAL_USER_PASSWORD,
    })
    if (error) throw new Error(`Sign-in failed: ${error.message}`)
    return data.session.access_token
}

/** 'nvidia/nemotron-3-nano-30b-a3b:free' -> 'nemotron-3-nano-30b' */
function shortModel(model) {
    if (!model) return 'unknown'
    return model.split('/').pop().replace(/:free$/, '')
}

function findPersona(slug) {
    const persona = INITIAL_PERSONAS.find((p) => p.slug === slug)
    if (!persona) throw new Error(`Unknown persona slug: ${slug}`)
    return persona
}

/**
 * Run one case's turns in order; return the reply to the final turn and the
 * model that produced it.
 *
 * A turn is either a string (sent to the case's persona) or
 * `{ persona, text }`. Switching persona mid-case starts a fresh conversation
 * and a fresh history — which is exactly what the memory-isolation cases need:
 * anything the second persona knows had to come through the cross-conversation
 * memory layer, not through the transcript.
 */
async function runCase(testCase, { baseUrl, token }) {
    let currentSlug = null
    let persona = null
    let history = []
    let conversationId = null
    let reply = ''
    let model = null

    for (const rawTurn of testCase.turns) {
        const turn = typeof rawTurn === 'string' ? { persona: testCase.persona, text: rawTurn } : rawTurn

        if (turn.persona !== currentSlug) {
            currentSlug = turn.persona
            persona = findPersona(currentSlug)
            history = []
            conversationId = null
        }

        history.push({ role: 'user', content: turn.text })

        const res = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                persona,
                personaId: persona.id || persona.slug,
                message: turn.text,
                conversationHistory: history,
                conversationId,
                userProfile: null,
                stream: false,
            }),
        })

        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.error || 'no body'}`)

        reply = body.response || ''
        model = body.model || model
        conversationId = body.conversationId || conversationId
        history.push({ role: 'assistant', content: reply })
    }

    return { reply, model }
}

/** Deterministic assertions. Returns a list of failure strings. */
function checkAssertions(testCase, reply) {
    const failures = []
    const text = String(reply || '')

    if (!text.trim()) {
        return ['empty reply']
    }

    // Shared with production: the same guard that catches a model leaking its
    // scratchpad into the answer.
    if (looksLikeLeakedReasoning(text)) {
        failures.push('reasoning leak detected')
    }

    if (testCase.minChars && text.length < testCase.minChars) {
        failures.push(`too short: ${text.length} < ${testCase.minChars}`)
    }
    if (testCase.maxChars && text.length > testCase.maxChars) {
        failures.push(`too long: ${text.length} > ${testCase.maxChars}`)
    }

    for (const re of testCase.required || []) {
        if (!re.test(text)) failures.push(`missing required ${re}`)
    }

    if (testCase.requireAny?.length) {
        if (!testCase.requireAny.some((re) => re.test(text))) {
            failures.push(`none of ${testCase.requireAny.join(', ')} matched`)
        }
    }

    for (const re of testCase.forbidden || []) {
        if (re.test(text)) failures.push(`matched forbidden ${re}`)
    }

    return failures
}

async function main() {
    loadEnv()
    const args = parseArgs(process.argv.slice(2))
    const baseUrl = process.env.EVAL_BASE_URL || 'http://localhost:3111'

    let cases = CASES
    if (args.only) cases = cases.filter((c) => c.persona === args.only || c.id.startsWith(args.only))
    if (args.limit) cases = cases.slice(0, args.limit)

    const calls = cases.reduce((n, c) => n + c.turns.length, 0)

    console.log(`\n  ${cases.length} cases, ${calls} model calls, target ${baseUrl}\n`)

    if (args.dryRun) {
        for (const c of cases) console.log(`    ${c.id.padEnd(50)} ${c.turns.length} turn(s)`)
        console.log('\n  dry run, nothing sent\n')
        return
    }

    if (calls > DAILY_MODEL_CALL_BUDGET) {
        console.error(
            `  Refusing to start: ${calls} calls exceeds the ${DAILY_MODEL_CALL_BUDGET}/day free-tier budget.\n` +
            `  Narrow the run with --only or --limit.\n`
        )
        process.exit(2)
    }

    const token = await getToken()

    const results = []
    for (const testCase of cases) {
        process.stdout.write(`  ${testCase.id.padEnd(50)}`)
        try {
            const { reply, model } = await runCase(testCase, { baseUrl, token })
            const failures = checkAssertions(testCase, reply)
            results.push({ id: testCase.id, failures, reply, model })
            // Naming the model matters: the free chain falls through, so the
            // same case can pass on qwen and fail on nemotron.
            console.log(`${failures.length ? 'FAIL' : 'pass'}  ${shortModel(model)}`)
            for (const f of failures) console.log(`      - ${f}`)
        } catch (err) {
            results.push({ id: testCase.id, failures: [`error: ${err.message}`], reply: '', model: null })
            console.log('ERROR')
            console.log(`      - ${err.message}`)
        }
    }

    const failed = results.filter((r) => r.failures.length)
    console.log(`\n  ${results.length - failed.length}/${results.length} passed`)

    const byModel = results.reduce((acc, r) => {
        const key = shortModel(r.model)
        acc[key] = acc[key] || { pass: 0, fail: 0 }
        acc[key][r.failures.length ? 'fail' : 'pass']++
        return acc
    }, {})
    console.log(
        '  by model: ' +
        Object.entries(byModel).map(([m, v]) => `${m} ${v.pass}/${v.pass + v.fail}`).join('   ') +
        '\n'
    )

    if (failed.length) {
        console.log('  Failing replies:\n')
        for (const r of failed) {
            console.log(`  ── ${r.id}   [${shortModel(r.model)}]`)
            console.log(`     ${r.reply.slice(0, 300).replace(/\n/g, '\n     ') || '(empty)'}\n`)
        }
        process.exit(1)
    }
}

main().catch((err) => {
    console.error(`\n  ${err.message}\n`)
    process.exit(2)
})
