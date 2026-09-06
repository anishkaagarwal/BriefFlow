// Deterministic, template-based plan builder.
// Used when no GOOGLE_API_KEY is configured (or the live call fails),
// so the product still works end-to-end for anyone trying it live.

const TONE_LIBRARY = {
  'bold-ugc': {
    label: 'Bold & fast (UGC)',
    voice: 'punchy, first-person, phone-shot energy',
    hooks: [
      (p) => `POV: I found ${p} and I'm not shutting up about it.`,
      (p) => `Nobody told me ${p} could do this.`,
      (p) => `Okay wait, ${p} actually changed my routine.`,
    ],
  },
  premium: {
    label: 'Premium & minimal',
    voice: 'restrained, considered, one idea per shot',
    hooks: [
      (p) => `${p}. Made for people who notice the details.`,
      (p) => `Some things are worth doing properly. ${p} is one of them.`,
      (p) => `Less noise. More ${p}.`,
    ],
  },
  trust: {
    label: 'Trustworthy & explainer',
    voice: 'clear, credible, benefit-led',
    hooks: [
      (p) => `Here's exactly how ${p} works, in under 30 seconds.`,
      (p) => `Why thousands are switching to ${p} this month.`,
      (p) => `${p}: what it does, and why it matters.`,
    ],
  },
  playful: {
    label: 'Fun & playful',
    voice: 'light, a little cheeky, quick cuts',
    hooks: [
      (p) => `${p} walks into a room. Chaos ensues (the good kind).`,
      (p) => `We asked people to try ${p}. This happened.`,
      (p) => `${p}, but make it fun.`,
    ],
  },
}

function firstSentence(text) {
  const trimmed = (text || '').trim()
  if (!trimmed) return 'the product'
  const match = trimmed.match(/^[^.!?]+[.!?]?/)
  return (match ? match[0] : trimmed).replace(/[.!?]$/, '')
}

export function buildFallbackPlan({ clientName, product, brief, tone }) {
  const toneKey = TONE_LIBRARY[tone] ? tone : 'trust'
  const t = TONE_LIBRARY[toneKey]
  const productName = product?.trim() || 'the product'
  const coreIdea = firstSentence(brief) || productName
  const client = clientName?.trim() || 'the client'

  const scenes = [
    {
      id: 1,
      name: 'Hook',
      hook: t.hooks[0](productName),
      actorBrief: `Relatable, camera-facing talent — talks directly to viewer, ${t.voice}.`,
      shotType: 'Close-up, handheld, vertical 9:16',
      onScreenText: t.hooks[0](productName).slice(0, 40),
      durationSec: 4,
      nodeChain: ['Brief', 'Cast Actor', 'Generate Scene', 'Output Clip'],
    },
    {
      id: 2,
      name: 'Context',
      hook: `The problem: ${coreIdea}.`,
      actorBrief: 'Same talent, slightly wider shot, establishing the everyday problem.',
      shotType: 'Medium shot, natural light',
      onScreenText: 'The problem, in one line',
      durationSec: 5,
      nodeChain: ['Brief', 'Cast Actor', 'Generate Scene', 'Output Clip'],
    },
    {
      id: 3,
      name: 'Product demo',
      hook: `${productName} solves it — shown, not told.`,
      actorBrief: 'Hands-on demo with the product in frame, talent narrates benefit, not features.',
      shotType: 'Insert shots + talent reaction, quick cuts',
      onScreenText: 'Show the moment it clicks',
      durationSec: 8,
      nodeChain: ['Brief', 'Cast Actor', 'Generate Scene', 'Output Clip'],
    },
    {
      id: 4,
      name: 'CTA',
      hook: `${client}: your move.`,
      actorBrief: 'Direct address, confident close, clear next step.',
      shotType: 'Close-up, on-brand end card overlay',
      onScreenText: `Get ${productName} today`,
      durationSec: 3,
      nodeChain: ['Brief', 'Generate Scene', 'Output Clip'],
    },
  ]

  const variants = [
    {
      label: 'Problem-first',
      hookLine: t.hooks[1] ? t.hooks[1](productName) : t.hooks[0](productName),
      cta: `Try ${productName} now`,
    },
    {
      label: 'Social proof',
      hookLine: `People are already switching to ${productName} — here's why.`,
      cta: `See why everyone's talking about ${productName}`,
    },
    {
      label: 'Bold claim',
      hookLine: t.hooks[2] ? t.hooks[2](productName) : t.hooks[0](productName),
      cta: `Get ${productName}`,
    },
  ]

  return {
    campaign: `${client} × ${productName}`,
    toneLabel: t.label,
    scenes,
    variants,
    source: 'fallback',
  }
}
