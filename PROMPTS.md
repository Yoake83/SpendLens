# LLM Prompts

## Audit Summary Prompt

Used in: `lib/ai-summary.ts` → `generateAuditSummary()`

### Final prompt

```
You are a sharp, no-fluff CFO advisor specializing in AI tool spend for startups.

A {teamSize}-person team primarily using AI for {useCase} tasks just ran an audit.
Their tools and findings:
{toolSummary}

Total current spend: ${totalMonthlySpend}/mo
Potential savings: ${totalMonthlySavings}/mo (${totalAnnualSavings}/yr)

Write a 80-120 word personalized audit summary paragraph. Rules:
- Lead with the single biggest insight, not a generic opener
- Be specific with numbers
- Sound like a smart friend who works in finance, not a marketing bot
- End with one concrete next action they should take this week
- No bullet points, headers, or markdown — plain paragraph only
```

### Why I wrote it this way

The "CFO advisor" persona prevents the model from defaulting to marketing copy.
Without it, Claude produces phrases like "your team can benefit from..." which
adds no value. The persona grounds the tone in specificity.

"Lead with the single biggest insight" prevents the model from opening with
"Based on your audit..." — a wasted first sentence nobody reads.

The 80-120 word constraint prevents both the too-thin 40-word response and the
300-word essay with hedging language that undermines authority.

### What I tried that didn't work

**Too generic:** "Write a summary of this AI spend audit" → output was a bulleted
list, not a paragraph, used "it is recommended that."

**No word limit:** Claude wrote 250+ word responses with hedges like "results may
vary" that made the recommendations feel less credible.

**Wrong persona:** "You are a helpful assistant" → output read like customer
support, not an advisor.

### Fallback behavior

If the Anthropic API fails (timeout, rate limit, 5xx), `generateAuditSummary()`
catches the error and calls `fallbackSummary()` which generates a template-based
paragraph using the same audit data. The fallback always returns a specific,
useful paragraph — never an empty string or error message.