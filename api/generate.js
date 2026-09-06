import { buildFallbackPlan } from '../src/lib/planFallback.js'

const SYSTEM_PROMPT = `You are a senior creative producer at a video ad studio that casts real, licensed actors for brand content. Given a rough client brief, you turn it into a production-ready plan for a 15-25 second short-form video ad.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "campaign": "string, e.g. 'ClientName x ProductName'",
  "toneLabel": "short string describing the tone used",
  "scenes": [
    {
      "id": number,
      "name": "Hook" | "Context" | "Product demo" | "CTA",
      "hook": "the line/action that carries this scene",
      "actorBrief": "one sentence describing what the actor should do/be",
      "shotType": "camera/framing direction, one short phrase",
      "onScreenText": "short on-screen text overlay, under 40 chars",
      "durationSec": number,
      "nodeChain": ["Brief", "Cast Actor", "Generate Scene", "Output Clip"]
    }
  ],
  "variants": [
    { "label": "short variant name", "hookLine": "alternate hook line", "cta": "alternate call to action" }
  ]
}

Always return exactly 4 scenes (Hook, Context, Product demo, CTA) and exactly 3 variants. Keep every string short and usable as real production notes, not vague marketing copy.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' })
    return
  }

  const { clientName = '', product = '', brief = '', tone = 'trust' } = req.body || {}

  if (!brief.trim()) {
    res.status(400).json({ error: 'Brief text is required.' })
    return
  }

  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    res.status(200).json(buildFallbackPlan({ clientName, product, brief, tone }))
    return
  }

  try {
    const userMessage = `Client: ${clientName || 'Unspecified'}\nProduct: ${product || 'Unspecified'}\nTone: ${tone}\nRaw brief:\n${brief}`

    const model = 'gemini-3.6-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            maxOutputTokens: 3000,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API responded ${response.status}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought && p.text)
      .map((p) => p.text)
      .join('') || ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    parsed.source = 'model'
    res.status(200).json(parsed)
  } catch (err) {
    console.error('Falling back to template plan:', err.message)
    res.status(200).json(buildFallbackPlan({ clientName, product, brief, tone }))
  }
}
