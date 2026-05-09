import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { runAudit, AuditInput } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/ai-summary";
import { getSupabaseAdmin } from "@/lib/supabase";

const requestCounts = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const limit = 10;
  const entry = requestCounts.get(ip);
  if (!entry || entry.reset < now) {
    requestCounts.set(ip, { count: 1, reset: now + window });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in an hour." }, { status: 429 });
  }

  let body: AuditInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
    return NextResponse.json({ error: "At least one tool is required" }, { status: 400 });
  }
  if (!body.teamSize || body.teamSize < 1) {
    return NextResponse.json({ error: "Team size must be at least 1" }, { status: 400 });
  }

  const result = runAudit(body);
  const aiSummary = await generateAuditSummary(result);
  const id = nanoid(10);
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("audits").insert({
    id,
    input: body,
    result,
    ai_summary: aiSummary,
  });

  if (error) console.error("Supabase insert error:", error);

  return NextResponse.json({ id, result, aiSummary });
}