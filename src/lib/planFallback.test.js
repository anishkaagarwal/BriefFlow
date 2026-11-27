import { describe, it, expect } from 'vitest'
import { buildFallbackPlan } from './planFallback.js'

const input = {
  clientName: 'Acme',
  product: 'GlowBottle',
  brief: 'People forget to drink water. We want a fun reminder. Launching next month.',
  tone: 'bold-ugc',
}

describe('buildFallbackPlan', () => {
  it('returns the same plan for the same input', () => {
    const a = buildFallbackPlan(input)
    const b = buildFallbackPlan({ ...input })
    expect(a).toEqual(b)
    expect(a.scenes.map((s) => s.name)).toEqual(['Hook', 'Context', 'Product demo', 'CTA'])
    expect(a.variants).toHaveLength(3)
    expect(a.source).toBe('fallback')
  })

  it('changes the output when the tone changes', () => {
    const bold = buildFallbackPlan(input)
    const premium = buildFallbackPlan({ ...input, tone: 'premium' })
    expect(premium.toneLabel).not.toBe(bold.toneLabel)
    expect(premium.scenes[0].hook).not.toBe(bold.scenes[0].hook)
    expect(premium.variants.map((v) => v.hookLine)).not.toEqual(
      bold.variants.map((v) => v.hookLine),
    )
  })

  it('falls back to the trust tone for an unknown tone', () => {
    const unknown = buildFallbackPlan({ ...input, tone: 'nope' })
    const trust = buildFallbackPlan({ ...input, tone: 'trust' })
    expect(unknown).toEqual(trust)
  })
})
