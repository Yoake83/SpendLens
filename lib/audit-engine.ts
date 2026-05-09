import { getToolById, getPlanById, UseCase } from "./pricing";

export interface ToolEntry {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export type RecommendationType =
  | "downgrade_plan" | "upgrade_plan" | "switch_tool"
  | "use_credits" | "optimal" | "reduce_seats";

export interface Recommendation {
  type: RecommendationType;
  targetToolId?: string;
  targetPlanId?: string;
  reason: string;
  monthlySavings: number;
}

export interface ToolAuditResult {
  toolId: string;
  toolName: string;
  planName: string;
  currentMonthlySpend: number;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  recommendation: Recommendation;
}

export interface AuditResult {
  input: AuditInput;
  results: ToolAuditResult[];
  totalMonthlySpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isAlreadyOptimal: boolean;
  highSavingsOpportunity: boolean;
}

function auditCursorPlan(entry: ToolEntry, useCase: UseCase): Recommendation {
  const { planId, seats } = entry;
  if (planId === "enterprise" && seats <= 50) {
    return { type: "downgrade_plan", targetToolId: "cursor", targetPlanId: "business", reason: `Enterprise is for large orgs needing on-prem or custom SLAs. At ${seats} seats, Business gives the same admin controls at $40/seat vs ~$100/seat.`, monthlySavings: (100 - 40) * seats };
  }
  if (planId === "business" && seats <= 2) {
    return { type: "downgrade_plan", targetToolId: "cursor", targetPlanId: "pro", reason: `Business adds SSO and a usage dashboard — unnecessary for a ${seats}-person team. Pro at $20/seat covers all core coding features.`, monthlySavings: (40 - 20) * seats };
  }
  if (useCase !== "coding" && planId === "pro") {
    return { type: "switch_tool", targetToolId: "claude", targetPlanId: "pro", reason: `Cursor is built for coding. For ${useCase} tasks, Claude Pro at $20/seat gives better results.`, monthlySavings: 0 };
  }
  if (planId === "pro" && useCase === "coding") {
    return { type: "use_credits", reason: `Cursor Pro is reasonable at $20/seat. Consider sourcing through Credex for a discount if your team is 5+ seats.`, monthlySavings: 20 * seats * 0.2 };
  }
  return { type: "optimal", reason: "Plan is well-matched to your team size and use case.", monthlySavings: 0 };
}

function auditCopilotPlan(entry: ToolEntry, useCase: UseCase): Recommendation {
  const { planId, seats } = entry;
  if (useCase !== "coding") {
    return { type: "switch_tool", targetToolId: "claude", targetPlanId: "pro", reason: `GitHub Copilot is a code completion tool. For ${useCase} tasks, Claude or ChatGPT will serve you better at a similar cost.`, monthlySavings: entry.monthlySpend };
  }
  if (planId === "enterprise" && seats < 50) {
    return { type: "downgrade_plan", targetToolId: "github_copilot", targetPlanId: "business", reason: `Copilot Enterprise's fine-tuned model training is meaningful for 50+ eng orgs. At ${seats} seats, Business at $19/seat gives all the policy controls you need.`, monthlySavings: (39 - 19) * seats };
  }
  if (planId === "business" && seats <= 3) {
    return { type: "downgrade_plan", targetToolId: "github_copilot", targetPlanId: "individual", reason: `Business adds audit logs and org policy controls. For ${seats} people, Individual at $10/seat has identical coding features. You're paying $9/seat/month for admin overhead you don't need.`, monthlySavings: (19 - 10) * seats };
  }
  return { type: "optimal", reason: "Plan is appropriate for your team size and coding use case.", monthlySavings: 0 };
}

function auditClaudePlan(entry: ToolEntry, useCase: UseCase, teamSize: number): Recommendation {
  const { planId, seats } = entry;
  if (planId === "team" && seats < 5) {
    return { type: "downgrade_plan", targetToolId: "claude", targetPlanId: "pro", reason: `Claude Team has minimum effective value at 5+ seats. For ${seats} users, Pro at $20/seat gives the same daily usage — you're paying a $10/seat premium for an admin console you don't need yet.`, monthlySavings: (30 - 20) * seats };
  }
  if (planId === "max_20x" && teamSize <= 3) {
    return { type: "downgrade_plan", targetToolId: "claude", targetPlanId: "max_5x", reason: `Max 20x is for power users running extended-thinking tasks at scale. For a ${teamSize}-person team, Max 5x at $100/seat provides the same extended thinking at 50% cost.`, monthlySavings: (200 - 100) * seats };
  }
  if (planId === "enterprise" && seats < 25) {
    return { type: "downgrade_plan", targetToolId: "claude", targetPlanId: "team", reason: `Claude Enterprise is designed for 25+ seat deployments with custom data governance. At ${seats} seats, Team at $30/seat gives admin console and higher limits without the enterprise contract.`, monthlySavings: (60 - 30) * seats };
  }
  return { type: "optimal", reason: "Claude plan is well-matched to your team and use case.", monthlySavings: 0 };
}

function auditChatGPTPlan(entry: ToolEntry, useCase: UseCase, teamSize: number): Recommendation {
  const { planId, seats } = entry;
  if (planId === "team" && seats < 3) {
    return { type: "downgrade_plan", targetToolId: "chatgpt", targetPlanId: "plus", reason: `ChatGPT Team adds workspace features for collaboration. At ${seats} seats, the $10/seat premium over Plus buys admin features not valuable until you have 3+ regular users.`, monthlySavings: (30 - 20) * seats };
  }
  if (planId === "enterprise" && seats < 20) {
    return { type: "downgrade_plan", targetToolId: "chatgpt", targetPlanId: "team", reason: `ChatGPT Enterprise is priced for orgs needing custom data agreements and SLAs. At ${seats} seats, Team covers your usage needs at half the price.`, monthlySavings: (60 - 30) * seats };
  }
  if ((planId === "plus" || planId === "team") && useCase === "coding") {
    return { type: "switch_tool", targetToolId: "cursor", targetPlanId: "pro", reason: `For coding, Cursor with its IDE integration outperforms ChatGPT's chat interface. Cursor Pro is the same price and purpose-built for your use case.`, monthlySavings: 0 };
  }
  return { type: "optimal", reason: "ChatGPT plan is reasonable for your use case.", monthlySavings: 0 };
}

function auditWindsurfPlan(entry: ToolEntry, useCase: UseCase): Recommendation {
  const { planId, seats } = entry;
  if (useCase !== "coding") {
    return { type: "switch_tool", targetToolId: "claude", targetPlanId: "pro", reason: `Windsurf is an AI code editor. For ${useCase} tasks, Claude Pro at $20/seat is better suited.`, monthlySavings: entry.monthlySpend };
  }
  if (planId === "team" && seats <= 2) {
    return { type: "downgrade_plan", targetToolId: "windsurf", targetPlanId: "pro", reason: `Windsurf Team adds management features for 3+ devs. For ${seats} users, Pro at $15/seat is identical in coding capability and saves $20/seat/month.`, monthlySavings: (35 - 15) * seats };
  }
  return { type: "optimal", reason: "Windsurf plan is well-matched to your coding team.", monthlySavings: 0 };
}

function auditGeminiPlan(entry: ToolEntry, useCase: UseCase, teamSize: number): Recommendation {
  const { planId, seats } = entry;
  if (planId === "ultra" && teamSize <= 5) {
    return { type: "switch_tool", targetToolId: "claude", targetPlanId: "max_5x", reason: `Gemini Ultra at $249/seat is among the priciest LLM plans. Claude Max 5x at $100/seat offers comparable frontier reasoning for most ${useCase} workflows.`, monthlySavings: (249 - 100) * seats };
  }
  return { type: "optimal", reason: "Gemini plan appears appropriate for your use case.", monthlySavings: 0 };
}

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  const results: ToolAuditResult[] = tools.map((entry) => {
    const tool = getToolById(entry.toolId);
    const plan = getPlanById(entry.toolId, entry.planId);
    if (!tool || !plan) {
      return { toolId: entry.toolId, toolName: entry.toolId, planName: entry.planId, currentMonthlySpend: entry.monthlySpend, recommendedMonthlySpend: entry.monthlySpend, monthlySavings: 0, recommendation: { type: "optimal", reason: "Unknown tool.", monthlySavings: 0 } };
    }

    let recommendation: Recommendation;
    switch (entry.toolId) {
      case "cursor": recommendation = auditCursorPlan(entry, useCase); break;
      case "github_copilot": recommendation = auditCopilotPlan(entry, useCase); break;
      case "claude": recommendation = auditClaudePlan(entry, useCase, teamSize); break;
      case "chatgpt": recommendation = auditChatGPTPlan(entry, useCase, teamSize); break;
      case "windsurf": recommendation = auditWindsurfPlan(entry, useCase); break;
      case "gemini": recommendation = auditGeminiPlan(entry, useCase, teamSize); break;
      default: recommendation = { type: "optimal", reason: "API direct billing is typically well-optimized. Set budget alerts at 80% of target.", monthlySavings: 0 };
    }

    const cappedSavings = Math.min(recommendation.monthlySavings, entry.monthlySpend);
    return {
      toolId: entry.toolId, toolName: tool.name, planName: plan.name,
      currentMonthlySpend: entry.monthlySpend,
      recommendedMonthlySpend: Math.max(0, entry.monthlySpend - cappedSavings),
      monthlySavings: cappedSavings,
      recommendation: { ...recommendation, monthlySavings: cappedSavings },
    };
  });

  const totalMonthlySpend = results.reduce((s, r) => s + r.currentMonthlySpend, 0);
  const totalRecommendedSpend = results.reduce((s, r) => s + r.recommendedMonthlySpend, 0);
  const totalMonthlySavings = results.reduce((s, r) => s + r.monthlySavings, 0);

  return {
    input, results, totalMonthlySpend, totalRecommendedSpend, totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    isAlreadyOptimal: totalMonthlySavings === 0,
    highSavingsOpportunity: totalMonthlySavings > 500,
  };
}