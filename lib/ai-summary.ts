import Anthropic from "@anthropic-ai/sdk";
import { AuditResult } from "./audit-engine";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  const { totalMonthlySavings, totalAnnualSavings, results, input } = result;

  const toolSummary = results
    .map((r) => `${r.toolName} (${r.planName}): $${r.currentMonthlySpend}/mo — ${r.recommendation.reason}`)
    .join("\n");

  const prompt = `You are a sharp, no-fluff CFO advisor specializing in AI tool spend for startups.

A ${input.teamSize}-person team primarily using AI for ${input.useCase} tasks just ran an audit.
Their tools and findings:
${toolSummary}

Total current spend: $${result.totalMonthlySpend}/mo
Potential savings: $${totalMonthlySavings}/mo ($${totalAnnualSavings}/yr)

Write a 80-120 word personalized audit summary paragraph. Rules:
- Lead with the single biggest insight, not a generic opener
- Be specific with numbers
- Sound like a smart friend who works in finance, not a marketing bot
- End with one concrete next action they should take this week
- No bullet points, headers, or markdown — plain paragraph only`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const content = message.content[0];
    if (content.type === "text") return content.text;
    return fallbackSummary(result);
  } catch (err) {
    console.error("Anthropic API error — using fallback:", err);
    return fallbackSummary(result);
  }
}

function fallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, results, input } = result;

  if (result.isAlreadyOptimal) {
    return `Your ${input.teamSize}-person team is spending $${result.totalMonthlySpend}/month on AI tools and the audit didn't find obvious waste — you're on plans that match your team size and ${input.useCase} use case. Set a quarterly reminder to re-run this audit as pricing changes frequently.`;
  }

  const topSaving = [...results].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `Your ${input.teamSize}-person team is spending $${result.totalMonthlySpend}/month on AI tools, and this audit found $${totalMonthlySavings}/month ($${totalAnnualSavings}/year) in potential savings. The biggest opportunity is ${topSaving.toolName}: ${topSaving.recommendation.reason} Start there — it's the fastest win with no capability trade-off.`;
}