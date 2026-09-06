import { useState } from 'react'
import { buildFallbackPlan } from './lib/planFallback.js'

const TONES = [
  { key: 'bold-ugc', label: 'Bold & fast (UGC)' },
  { key: 'premium', label: 'Premium & minimal' },
  { key: 'trust', label: 'Trustworthy & explainer' },
  { key: 'playful', label: 'Fun & playful' },
]

function kindClass(nodeName) {
  if (nodeName === 'Brief') return 'kind-context'
  if (nodeName === 'Cast Actor') return 'kind-cast'
  if (nodeName === 'Generate Scene') return 'kind-generate'
  return 'kind-output'
}

function NodeChain({ chain, scene }) {
  return (
    <div className="node-chain">
      {chain.map((nodeName, idx) => (
        <div key={nodeName + idx} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={`node-card ${kindClass(nodeName)}`}>
            <div className="kind">{nodeName}</div>
            <div className="body">
              {nodeName === 'Brief' && scene.hook}
              {nodeName === 'Cast Actor' && scene.actorBrief}
              {nodeName === 'Generate Scene' && scene.shotType}
              {nodeName === 'Output Clip' && (scene.onScreenText || 'Final clip')}
            </div>
            {nodeName === 'Output Clip' && (
              <div className="sub">{scene.durationSec}s</div>
            )}
          </div>
          {idx < chain.length - 1 && <div className="connector" />}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [clientName, setClientName] = useState('')
  const [product, setProduct] = useState('')
  const [brief, setBrief] = useState('')
  const [tone, setTone] = useState('trust')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!brief.trim()) {
      setError('Add a brief first — even a rough one works.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, product, brief, tone }),
      })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      setPlan(data)
    } catch {
      // No serverless backend reachable (e.g. static preview) — build locally instead.
      setPlan(buildFallbackPlan({ clientName, product, brief, tone }))
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    if (!plan) return
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(plan.campaign || 'briefflow-plan').replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="mark">Brief<span>Flow</span></div>
        <div className="tagline">Brief in, production plan out — ready for the Creative Studio canvas.</div>
      </div>

      <div className="hero-badge-row">
        <span className="hero-badge">
          <span className="dot" /> Built for creative teams
        </span>
      </div>

      <div className="layout">
        <div className="brief-panel">
          <div className="field">
            <label>Client name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Northside Coffee"
            />
          </div>

          <div className="field">
            <label>Product / offer</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. the new cold brew concentrate"
            />
          </div>

          <div className="field">
            <label>Raw brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Paste whatever the client actually sent you — a Slack message, a half-formed idea, three bullet points. BriefFlow works from the mess."
            />
          </div>

          <div className="field">
            <label>Tone</label>
            <div className="tone-grid">
              {TONES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`tone-option ${tone === t.key ? 'active' : ''}`}
                  onClick={() => setTone(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Building plan…' : <>Generate production plan <span className="arrow">→</span></>}
          </button>

          {error && <div className="error-banner">{error}</div>}

          <div className="hint">
            messy brief in, main character energy out ✨ 4 scenes (hook → context → demo → CTA)
            + 3 hook variants to test — export as JSON, straight into Creative Studio.
          </div>
        </div>

        <div className="canvas">
          {!plan && (
            <div className="canvas-empty">
              your plan's about to render right here — node chains per scene, hook
              variants on deck. drop a brief and watch it cook 🍳
            </div>
          )}

          {plan && (
            <>
              <div className="campaign-header">
                <h1>{plan.campaign}</h1>
                <div className="meta">
                  tone: {plan.toneLabel} · {plan.scenes.length} scenes ·{' '}
                  <span className="source-tag">
                    {plan.source === 'model' ? 'generated live' : 'template mode'}
                  </span>
                </div>
              </div>

              {plan.scenes.map((scene) => (
                <div className="scene-row" key={scene.id}>
                  <div className="scene-label">
                    scene {scene.id} — {scene.name}
                  </div>
                  <NodeChain chain={scene.nodeChain} scene={scene} />
                </div>
              ))}

              <div className="variants-block">
                <h2>Hook variants to test</h2>
                <div className="variant-grid">
                  {plan.variants.map((v) => (
                    <div className="variant-card" key={v.label}>
                      <div className="label">{v.label}</div>
                      <div className="hook">{v.hookLine}</div>
                      <div className="cta">{v.cta}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="actions-row">
                <button className="ghost-btn" onClick={handleExport}>
                  Export plan as JSON
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
