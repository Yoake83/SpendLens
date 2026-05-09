"use client";

import { useState } from "react";
import { AuditResult, ToolAuditResult } from "@/lib/audit-engine";

interface Props {
  audit: { id: string; input: any; result: AuditResult; ai_summary: string; created_at: string };
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  downgrade_plan: { label: "Downgrade plan", color: "bg-amber-900 text-amber-200" },
  upgrade_plan:   { label: "Consider upgrade", color: "bg-blue-900 text-blue-200" },
  switch_tool:    { label: "Switch tool", color: "bg-red-900 text-red-200" },
  use_credits:    { label: "Buy via credits", color: "bg-purple-900 text-purple-200" },
  reduce_seats:   { label: "Reduce seats", color: "bg-orange-900 text-orange-200" },
  optimal:        { label: "Looks good", color: "bg-emerald-900 text-emerald-200" },
};

export default function AuditResultClient({ audit }: Props) {
  const { result, ai_summary } = audit;
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  async function handleLeadSubmit() {
    if (!email) return;
    setSubmitting(true);
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId: audit.id, email, companyName: company, role, honeypot }),
    });
    setSubmitted(true);
    setSubmitting(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24 space-y-8">

        {/* Hero savings */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-center">
          <p className="text-blue-200 text-sm uppercase tracking-widest mb-2">Potential savings identified</p>
          {result.isAlreadyOptimal ? (
            <>
              <p className="text-4xl font-bold mb-1">You&apos;re spending well</p>
              <p className="text-blue-200 text-lg">No significant optimizations found — nice work.</p>
            </>
          ) : (
            <>
              <p className="text-6xl font-bold mb-1">
                ${result.totalMonthlySavings.toLocaleString()}
                <span className="text-3xl font-normal text-blue-200">/mo</span>
              </p>
              <p className="text-blue-200 text-xl">${result.totalAnnualSavings.toLocaleString()} per year</p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-blue-200">
                <span>Current: ${result.totalMonthlySpend.toLocaleString()}/mo</span>
                <span>→</span>
                <span>Optimized: ${result.totalRecommendedSpend.toLocaleString()}/mo</span>
              </div>
            </>
          )}
        </div>

        {/* AI Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">AI-generated summary</p>
          <p className="text-slate-200 leading-relaxed">{ai_summary}</p>
        </div>

        {/* Per-tool breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tool-by-tool breakdown</h2>
          {result.results.map((r) => <ToolRow key={r.toolId} result={r} />)}
        </div>

        {/* Credex CTA */}
        {result.highSavingsOpportunity && (
          <div className="bg-slate-900 border border-blue-700 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Save even more with Credex</p>
            <p className="font-semibold text-lg mb-2">You qualify for a Credex consultation</p>
            <p className="text-slate-400 text-sm mb-4">
              Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise — sourced from companies that overforecast. At your savings level, the discount is substantial.
            </p>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
              Book a free consultation →
            </a>
          </div>
        )}

        {/* Share */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="font-semibold mb-1">Share this audit</p>
          <p className="text-slate-400 text-sm mb-3">Email and company name are not included in the public link.</p>
          <div className="flex gap-2">
            <input readOnly value={shareUrl}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none" />
            <button onClick={handleCopy}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-all">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Lead capture */}
        {!submitted ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <p className="font-semibold">
              {result.isAlreadyOptimal ? "Get notified when new optimizations apply to your stack" : "Email me this report"}
            </p>
            {/* Honeypot — hidden from humans, visible to bots */}
            <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none" />
              <input placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none" />
            </div>
            <button onClick={handleLeadSubmit} disabled={!email || submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all">
              {submitting ? "Sending…" : "Send me the report"}
            </button>
            <p className="text-slate-500 text-xs">We won&apos;t spam you. Credex may reach out for high-savings cases.</p>
          </div>
        ) : (
          <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-6 text-center">
            <p className="text-emerald-300 font-medium">Report sent! Check your inbox.</p>
          </div>
        )}

        <a href="/" className="block text-center text-slate-500 text-sm hover:text-slate-300 transition-colors">← Run a new audit</a>
      </div>
    </main>
  );
}

function ToolRow({ result }: { result: ToolAuditResult }) {
  const badge = TYPE_LABELS[result.recommendation.type] ?? TYPE_LABELS.optimal;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-semibold">{result.toolName}</p>
          <p className="text-slate-400 text-sm">{result.planName}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${badge.color}`}>{badge.label}</span>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-3">{result.recommendation.reason}</p>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400">Current: <span className="text-white">${result.currentMonthlySpend}/mo</span></span>
        {result.monthlySavings > 0 && (
          <span className="text-emerald-400 font-medium">Save ${result.monthlySavings}/mo</span>
        )}
      </div>
    </div>
  );
}