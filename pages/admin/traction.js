// GTM traction dashboard — internal admin view.
// Visit /admin/traction. In production you'll be prompted for the admin token.
// In dev (NODE_ENV !== production) auth is skipped.

import Head from 'next/head'
import { useEffect, useState, useCallback } from 'react'

const WINDOWS = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

export default function TractionDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)
  const [token, setToken] = useState('')

  const load = useCallback(
    async (d, t) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/traction?days=${d}`, {
          headers: t ? { 'x-admin-token': t } : {},
        })
        if (res.status === 403) {
          setError('Forbidden — set an admin token below.')
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''
    setToken(saved)
    load(days, saved)
  }, [days, load])

  const handleTokenSubmit = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') localStorage.setItem('admin_token', token)
    load(days, token)
  }

  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : '—')

  return (
    <>
      <Head>
        <title>Traction — Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-[100dvh] bg-white text-black px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">Internal</p>
              <h1 className="font-display text-4xl md:text-5xl text-black">Traction</h1>
              <p className="text-sm text-black/40 mt-2">
                Which categories are pulling weight. {data?.totals?.generatedAt && (
                  <span>· refreshed {new Date(data.totals.generatedAt).toLocaleTimeString()}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 p-1 rounded-full ring-1 ring-black/[0.06] bg-black/[0.02]">
              {WINDOWS.map((w) => (
                <button
                  key={w.days}
                  onClick={() => setDays(w.days)}
                  className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-colors ${
                    days === w.days
                      ? 'bg-black text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </header>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Admin token (only relevant in production) */}
          {error?.includes('Forbidden') && (
            <form onSubmit={handleTokenSubmit} className="mb-8 flex items-center gap-3">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Admin token (matches ADMIN_TOKEN env var)"
                className="flex-1 max-w-md px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/90 transition-colors"
              >
                Save & retry
              </button>
            </form>
          )}

          {loading && !data && (
            <div className="text-sm text-black/40">Loading…</div>
          )}

          {data && (
            <>
              {/* Totals */}
              <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
                <Stat label="Signups" value={fmt(data.totals.signups)} sub={`last ${data.totals.windowDays}d`} />
                <Stat label="Active (24h)" value={fmt(data.totals.activeUsers1d)} sub="users w/ msg" />
                <Stat label="Active (7d)" value={fmt(data.totals.activeUsers7d)} sub="users w/ msg" />
                <Stat label="Conversations" value={fmt(data.totals.totalConversations)} sub={`last ${data.totals.windowDays}d`} />
                <Stat label="User messages" value={fmt(data.totals.totalUserMessages)} sub={`last ${data.totals.windowDays}d`} />
              </section>

              {/* By category */}
              <section className="p-1.5 rounded-3xl ring-1 ring-black/[0.06] bg-black/[0.02]">
                <div className="bg-white rounded-[calc(1.5rem-0.375rem)] border border-black/[0.05] overflow-hidden">
                  <header className="px-6 py-5 border-b border-black/[0.05] flex items-baseline justify-between">
                    <h2 className="font-display text-xl text-black">By category (first-touch)</h2>
                    <p className="text-xs text-black/40">Anchored on the category of each user&apos;s first conversation.</p>
                  </header>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-widest text-black/40 border-b border-black/[0.05]">
                          <Th>Category</Th>
                          <Th align="right">Users</Th>
                          <Th align="right">Convos</Th>
                          <Th align="right">Msgs</Th>
                          <Th align="right">Msgs / user</Th>
                          <Th align="right">D2 retention</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.byCategory.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-black/40">
                              No data yet in this window.
                            </td>
                          </tr>
                        )}
                        {data.byCategory.map((b) => (
                          <tr key={b.category} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02] transition-colors">
                            <Td className="font-medium text-black">{b.category}</Td>
                            <Td align="right">{fmt(b.users)}</Td>
                            <Td align="right">{fmt(b.conversations)}</Td>
                            <Td align="right">{fmt(b.messages)}</Td>
                            <Td align="right">{b.msgsPerUser}</Td>
                            <Td align="right">
                              <span className={`inline-flex items-center justify-end gap-1.5 ${b.retentionPct >= 30 ? 'text-emerald-600' : b.retentionPct >= 15 ? 'text-black/70' : 'text-black/30'}`}>
                                <span className="font-medium">{b.retentionPct}%</span>
                                <span className="text-xs text-black/30">({b.retainedDay2})</span>
                              </span>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <p className="mt-6 text-xs text-black/30 leading-relaxed max-w-2xl">
                <strong>Day-2 retention</strong> = % of users whose first message and most recent message are at least 24h apart. <strong>Msgs / user</strong> includes user-side messages only (assistant replies excluded). Categories below 15% retention are usually noise unless users-count is meaningful — wait for ~50+ users per row before drawing conclusions.
              </p>
            </>
          )}
        </div>
      </main>
    </>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="p-1.5 rounded-2xl ring-1 ring-black/[0.06] bg-black/[0.02]">
      <div className="bg-white rounded-[calc(1rem-0.375rem)] border border-black/[0.05] px-5 py-5">
        <div className="text-[10px] uppercase tracking-widest text-black/40 mb-2">{label}</div>
        <div className="font-display text-3xl text-black leading-none">{value}</div>
        {sub && <div className="text-[10px] text-black/30 mt-2">{sub}</div>}
      </div>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-6 py-3 font-semibold text-${align}`}>
      {children}
    </th>
  )
}

function Td({ children, align = 'left', className = '' }) {
  return (
    <td className={`px-6 py-4 text-${align} text-black/70 ${className}`}>
      {children}
    </td>
  )
}
