// Pricing data verified as of 2025-05-08
// All prices in USD per user per month
// Sources documented in PRICING_DATA.md

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolPlan {
  id: string;
  name: string;
  pricePerSeat: number;
  minSeats?: number;
  features: string[];
  bestFor: UseCase[];
}

export interface Tool {
  id: string;
  name: string;
  category: "coding" | "llm" | "multimodal";
  plans: ToolPlan[];
}

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    plans: [
      { id: "hobby", name: "Hobby", pricePerSeat: 0, features: ["2000 completions/mo", "50 slow requests"], bestFor: ["coding"] },
      { id: "pro", name: "Pro", pricePerSeat: 20, features: ["Unlimited completions", "500 fast requests"], bestFor: ["coding"] },
      { id: "business", name: "Business", pricePerSeat: 40, features: ["Everything Pro", "SSO", "Centralized billing"], bestFor: ["coding"] },
      { id: "enterprise", name: "Enterprise", pricePerSeat: 100, features: ["Custom contracts", "On-prem option", "SLAs"], bestFor: ["coding"] },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "coding",
    plans: [
      { id: "individual", name: "Individual", pricePerSeat: 10, features: ["Code completion", "Chat in IDE"], bestFor: ["coding"] },
      { id: "business", name: "Business", pricePerSeat: 19, features: ["Everything Individual", "Policy management", "Audit logs"], bestFor: ["coding"] },
      { id: "enterprise", name: "Enterprise", pricePerSeat: 39, features: ["Everything Business", "Fine-tuned model"], bestFor: ["coding"] },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    category: "llm",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0, features: ["Limited messages/day"], bestFor: ["writing", "research", "mixed"] },
      { id: "pro", name: "Pro", pricePerSeat: 20, features: ["5x more usage", "Priority access", "Projects"], bestFor: ["writing", "research", "mixed"] },
      { id: "max_5x", name: "Max (5x)", pricePerSeat: 100, features: ["5x Pro usage", "Extended thinking"], bestFor: ["research", "data"] },
      { id: "max_20x", name: "Max (20x)", pricePerSeat: 200, features: ["20x Pro usage", "Extended thinking"], bestFor: ["research", "data"] },
      { id: "team", name: "Team", pricePerSeat: 30, minSeats: 5, features: ["Higher limits", "Admin console", "SSO"], bestFor: ["writing", "mixed"] },
      { id: "enterprise", name: "Enterprise", pricePerSeat: 60, features: ["Custom limits", "Audit logs", "SAML SSO"], bestFor: ["mixed", "data"] },
      { id: "api", name: "API Direct", pricePerSeat: 0, features: ["Pay per token"], bestFor: ["coding", "data"] },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "llm",
    plans: [
      { id: "plus", name: "Plus", pricePerSeat: 20, features: ["GPT-4o", "DALL·E", "Advanced analysis"], bestFor: ["writing", "mixed"] },
      { id: "team", name: "Team", pricePerSeat: 30, minSeats: 2, features: ["Higher rate limits", "Workspace admin"], bestFor: ["writing", "mixed"] },
      { id: "enterprise", name: "Enterprise", pricePerSeat: 60, features: ["Unlimited GPT-4", "SSO", "Data privacy"], bestFor: ["mixed", "data"] },
      { id: "api", name: "API Direct", pricePerSeat: 0, features: ["Pay per token"], bestFor: ["coding", "data"] },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "llm",
    plans: [
      { id: "api", name: "API Direct", pricePerSeat: 0, features: ["Pay per token", "All Claude models"], bestFor: ["coding", "data"] },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "llm",
    plans: [
      { id: "api", name: "API Direct", pricePerSeat: 0, features: ["Pay per token", "All GPT models"], bestFor: ["coding", "data"] },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "llm",
    plans: [
      { id: "pro", name: "Google One AI Premium", pricePerSeat: 19.99, features: ["Gemini Advanced", "2TB storage"], bestFor: ["writing", "mixed"] },
      { id: "ultra", name: "Gemini Ultra", pricePerSeat: 249, features: ["Highest capability", "Enterprise grade"], bestFor: ["data", "research"] },
      { id: "api", name: "API", pricePerSeat: 0, features: ["Pay per token"], bestFor: ["coding", "data"] },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0, features: ["Basic completions", "5 Flow credits/day"], bestFor: ["coding"] },
      { id: "pro", name: "Pro", pricePerSeat: 15, features: ["Unlimited completions", "Unlimited Flows"], bestFor: ["coding"] },
      { id: "team", name: "Team", pricePerSeat: 35, features: ["Everything Pro", "Team management"], bestFor: ["coding"] },
    ],
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getPlanById(toolId: string, planId: string): ToolPlan | undefined {
  return getToolById(toolId)?.plans.find((p) => p.id === planId);
}