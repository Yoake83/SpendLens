import { describe, it, expect } from "vitest";
import { runAudit, AuditInput } from "../lib/audit-engine";

function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return { tools: [], teamSize: 5, useCase: "coding", ...overrides };
}

describe("Audit Engine", () => {
  it("returns zero savings when no tools are provided", () => {
    const result = runAudit(makeInput({ tools: [] }));
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.isAlreadyOptimal).toBe(true);
  });

  it("flags Cursor Business for a 2-person team — should downgrade to Pro", () => {
    const input = makeInput({ teamSize: 2, tools: [{ toolId: "cursor", planId: "business", seats: 2, monthlySpend: 80 }] });
    const result = runAudit(input);
    const r = result.results.find((r) => r.toolId === "cursor")!;
    expect(r.recommendation.type).toBe("downgrade_plan");
    expect(r.monthlySavings).toBe(40);
  });

  it("flags GitHub Copilot Business for a 3-person team — downgrade to Individual", () => {
    const input = makeInput({ teamSize: 3, tools: [{ toolId: "github_copilot", planId: "business", seats: 3, monthlySpend: 57 }] });
    const result = runAudit(input);
    const r = result.results.find((r) => r.toolId === "github_copilot")!;
    expect(r.recommendation.type).toBe("downgrade_plan");
    expect(r.monthlySavings).toBe(27);
  });

  it("flags Claude Team for fewer than 5 seats — should use Pro", () => {
    const input = makeInput({ teamSize: 3, tools: [{ toolId: "claude", planId: "team", seats: 3, monthlySpend: 90 }] });
    const result = runAudit(input);
    const r = result.results.find((r) => r.toolId === "claude")!;
    expect(r.recommendation.type).toBe("downgrade_plan");
    expect(r.monthlySavings).toBe(30);
  });

  it("marks Cursor Pro for a coding team as use_credits (not downgrade)", () => {
    const input = makeInput({ teamSize: 10, useCase: "coding", tools: [{ toolId: "cursor", planId: "pro", seats: 10, monthlySpend: 200 }] });
    const result = runAudit(input);
    const r = result.results.find((r) => r.toolId === "cursor")!;
    expect(r.recommendation.type).toBe("use_credits");
  });

  it("sets highSavingsOpportunity true when savings exceed $500/mo", () => {
    const input = makeInput({
      teamSize: 50,
      tools: [
        { toolId: "cursor", planId: "enterprise", seats: 50, monthlySpend: 5000 },
        { toolId: "github_copilot", planId: "enterprise", seats: 50, monthlySpend: 1950 },
      ],
    });
    const result = runAudit(input);
    expect(result.highSavingsOpportunity).toBe(true);
  });

  it("caps savings at current monthly spend", () => {
    const input = makeInput({ teamSize: 2, tools: [{ toolId: "cursor", planId: "business", seats: 2, monthlySpend: 30 }] });
    const result = runAudit(input);
    const r = result.results.find((r) => r.toolId === "cursor")!;
    expect(r.monthlySavings).toBeLessThanOrEqual(30);
  });

  it("flags GitHub Copilot for non-coding use case", () => {
    const input = makeInput({ useCase: "writing", tools: [{ toolId: "github_copilot", planId: "individual", seats: 3, monthlySpend: 30 }] });
    const result = runAudit(input);
    const r = result.results.find((r) => r.toolId === "github_copilot")!;
    expect(r.recommendation.type).toBe("switch_tool");
  });

  it("calculates annual savings as 12x monthly", () => {
    const input = makeInput({ tools: [{ toolId: "claude", planId: "team", seats: 3, monthlySpend: 90 }] });
    const result = runAudit(input);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});