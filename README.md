# BriefFlow

**Turn a messy client brief into a production-ready plan — before it ever hits the Creative Studio canvas.**

Built for the HexCoded product-role assessment.

## Why this

HexCoded lets you make brand content with real, licensed actors. The gap it doesn't (and
shouldn't) solve itself is *upstream* of that: a client sends a vague brief, and someone
has to turn it into an actual shot-by-shot plan — which scenes, which actor energy, what's
on screen, what to test — before anyone opens a workflow canvas at all. That back-and-forth
is exactly what HexCoded's own founders have described as the slow part of making content
with brands and actors.

BriefFlow is a small agent that closes that gap: paste in a rough brief, pick a tone, and
it returns a 4-scene node plan (Hook → Context → Product demo → CTA) plus 3 alternate hook
variants to A/B test — structured the same way a HexCoded workflow node chain would expect
(Brief → Cast Actor → Generate Scene → Output Clip), and exportable as JSON.

## How it works

- **Frontend**: React + Vite. Node-graph canvas UI, styled after a lightweight workflow
  editor rather than a marketing page.
- **Backend**: one Vercel serverless function (`/api/generate`) that calls Google's Gemini
  API with a strict JSON schema to produce the plan.
- **Fallback**: if no API key is configured (or the call fails for any reason), the app
  falls back to a deterministic, tone-aware template generator (`src/lib/planFallback.js`)
  so the live demo never breaks, even without any keys set.

## Run locally

```bash
npm install
npm run dev
```

This runs the frontend only — without a serverless backend, "Generate" falls back to the
local template generator automatically, so it still works.

## Deploy (Vercel, no CLI needed)

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import that repo. Vercel auto-detects
   the Vite framework and the `/api` folder as serverless functions — no config needed.
3. (Optional, for live model output instead of template mode) In the Vercel project's
   **Settings → Environment Variables**, add:
   - `GOOGLE_API_KEY` = your Google AI (Gemini) API key
4. Deploy. Done — you'll get a `*.vercel.app` URL.

Without step 3, the app still works end-to-end in template mode — useful if you don't want
to wire up a key just to demo it.

## What I'd build next

- Let a user drag scenes to reorder, split, or merge — real node-canvas editing, not just
  read-only output.
- A "cast suggestion" step that maps each scene's `actorBrief` to an actual HexCoded actor
  profile, so the plan is genuinely one click from being rendered.
- Team review: turn the export into a shareable link a client can comment on, instead of a
  JSON download.
