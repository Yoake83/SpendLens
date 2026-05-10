Day 1 — 2025-05-11
Hours worked: 5
What I did:
Scaffolded the full Next.js 14 project with TypeScript, Tailwind CSS, and App Router.
Built the core pricing data layer in lib/pricing.ts covering all 8 required tools
(Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf)
with every plan and price sourced from official vendor pages.
Implemented the audit engine in lib/audit-engine.ts — pure deterministic TypeScript
rules, no AI involved in the math. Each tool has specific logic: for example, Claude Team
flags as a downgrade when seats < 5 because the minimum value of the admin console only
kicks in at that threshold.
Built the spend input form (app/page.tsx) with localStorage persistence so the form
survives page reloads. Built the results page (components/AuditResultClient.tsx) with
per-tool breakdown cards, savings hero, Credex CTA for high-savings audits, share URL,
and lead capture form with honeypot abuse protection.
Added AI summary generation via Anthropic API (lib/ai-summary.ts) with a hardcoded
fallback that fires if the API call fails. Set up Supabase client for audit persistence
and Resend for transactional email. Added API routes for /api/audit and /api/lead.
Wrote 9 Vitest tests covering the core audit engine rules. Set up GitHub Actions CI
workflow that runs lint + typecheck + tests on every push to main. Added all 12 required
markdown files: README, ARCHITECTURE, DEVLOG, PRICING_DATA, PROMPTS, TESTS, GTM,
ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS, REFLECTION.
Fixed a hydration mismatch warning caused by browser autofill extensions injecting
fdprocessedid attributes — added suppressHydrationWarning to all form inputs and
a mounted state guard for localStorage reads.
What I learned:
The audit engine logic is harder to get right than it looks. "Downgrade plan" sounds
simple but requires understanding what actually differentiates tiers — SSO, seat
minimums, rate limits — not just price per seat. Spent time reading actual vendor
pricing pages to make the reasoning defensible to a finance person.
Also learned that React SSR hydration mismatches can be triggered by browser extensions,
not just code bugs. The fix is suppressHydrationWarning on affected elements plus
delaying localStorage reads until after mount with a mounted state.
Blockers / what I'm stuck on:
Need to create Supabase project and get real API keys before the app can run end-to-end.
Resend requires domain verification for sending emails. Will tackle both Day 2 morning.
Haven't started user interview outreach yet — sending DMs tonight.
Plan for tomorrow:

Create Supabase project and run audits table migration
Get Anthropic API key and Resend API key
Fill in .env.local and test full audit flow locally end to end
Deploy to Vercel and get a live URL
Add live URL to README
Send cold DMs for user interviews (need 3 completed by Day 6)
Update DEVLOG Day 2 entry
## Day 2 — 2025-05-10

**Hours worked:** 

**What I did:**
Set up Supabase project and ran audits table migration. Got Anthropic API key
and Resend API key. Created .env.local and tested the full audit flow locally end to end — form submission, AI summary generation, Supabase persistence,
results page render. Fixed hydration mismatch . Deployed to Vercel at [URL].
Verified the shareable URL works and OG tags render correctly.

**What I learned:**
[Something real — e.g. "The Anthropic API has a cold start delay that made the audit feel slow — added a loading state to the form button"]

**Blockers / what I'm stuck on:**
["Resend domain verification takes 24h so emails aren't sending yet — will fix Day 3"]

**Plan for tomorrow:**
Polish the results page UI, improve mobile layout, add loading skeleton,
run Lighthouse audit and fix accessibility score.