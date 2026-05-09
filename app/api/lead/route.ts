import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let body: { auditId: string; email: string; companyName?: string; role?: string; honeypot?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Honeypot: bots fill this, humans don't
  if (body.honeypot) return NextResponse.json({ success: true });

  if (!body.email || !body.auditId) {
    return NextResponse.json({ error: "Email and auditId required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: audit } = await supabase
    .from("audits")
    .select("result, ai_summary")
    .eq("id", body.auditId)
    .single();

  await supabase.from("audits").update({
    email: body.email,
    company_name: body.companyName ?? null,
    role: body.role ?? null,
  }).eq("id", body.auditId);

  const monthlySavings = audit?.result?.totalMonthlySavings ?? 0;
  const isHighSavings = monthlySavings > 500;

  try {
    await resend.emails.send({
      from: "SpendLens <hello@spendlens.co>",
      to: body.email,
      subject: `Your AI Spend Audit — $${monthlySavings}/mo in potential savings`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:24px;margin-bottom:8px;">Your AI Spend Audit is ready</h1>
          <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="margin:0;font-size:18px;font-weight:600;">Potential savings: $${monthlySavings}/month ($${monthlySavings * 12}/year)</p>
          </div>
          <p>${audit?.ai_summary ?? ""}</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/audit/${body.auditId}"
             style="display:inline-block;background:#0f172a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
            View Full Report
          </a>
          ${isHighSavings ? `<div style="border-left:3px solid #0f172a;padding-left:16px;margin-top:24px;">
            <p style="margin:0;font-weight:600;">You qualify for a Credex consultation</p>
            <p style="margin:4px 0 0;color:#666;font-size:14px;">At $${monthlySavings}/month in savings, Credex can help you capture more through discounted AI credits. Someone from the team will reach out shortly.</p>
          </div>` : ""}
          <p style="color:#999;font-size:12px;margin-top:32px;">SpendLens is a free tool by <a href="https://credex.rocks">Credex</a>.</p>
        </div>`,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }

  return NextResponse.json({ success: true, isHighSavings });
}