# SpendLens — AI Spend Audit Tool

**Free tool for startup founders and engineering managers to find out if they're overspending on AI tools.** Enter what your team pays for Cursor, Claude, GitHub Copilot, ChatGPT, and more — get an instant breakdown of where you're overspending and total potential savings.

Built as a lead-generation asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

---

## Screenshots

> Add screenshots here after first deploy

---

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/spendlens
cd spendlens
npm install
cp .env.example .env.local
# Fill in all env vars (see .env.example)
npm run dev
```

Open http://localhost:3000

## Deploy

```bash
npx vercel
# Add env vars in Vercel dashboard
```

---

## Decisions

1. **Next.js App Router** — Server Components let us fetch audit data server-side for correct OG tags on shareable URLs without a client waterfall.

2. **Hardcoded audit rules, not AI for the math** — Deterministic TypeScript makes savings numbers auditable, testable, and hallucination-free. AI used only for the natural-language summary.

3. **Supabase** — Free tier, TypeScript client, no credit card required. Trade-off: vendor lock-in vs. own Postgres at scale.

4. **Resend over SES** — Simpler API, no domain DNS headache, 100 free emails/day. Trade-off: not suitable for bulk sends.

5. **localStorage for form persistence** — No backend needed, works across reloads. Trade-off: lost if user clears storage. Acceptable for a single-session tool.

---

Live URL: _Add after deploy_