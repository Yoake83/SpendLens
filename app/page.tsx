"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TOOLS, UseCase } from "@/lib/pricing";
import { AuditInput } from "@/lib/audit-engine";

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding / Engineering" },
  { id: "writing", label: "Writing / Content" },
  { id: "data", label: "Data / Analytics" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed / General" },
];

const STORAGE_KEY = "spendlens_form_state";

interface FormTool {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number;
}

export default function Home() {
  const router = useRouter();
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [selectedTools, setSelectedTools] = useState<FormTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTeamSize(parsed.teamSize ?? 5);
        setUseCase(parsed.useCase ?? "coding");
        setSelectedTools(parsed.selectedTools ?? []);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamSize, useCase, selectedTools }));
  }, [teamSize, useCase, selectedTools]);

  function toggleTool(toolId: string) {
    const exists = selectedTools.find((t) => t.toolId === toolId);
    if (exists) {
      setSelectedTools(selectedTools.filter((t) => t.toolId !== toolId));
    } else {
      const tool = TOOLS.find((t) => t.id === toolId)!;
      const defaultPlan = tool.plans[1] ?? tool.plans[0];
      setSelectedTools([
        ...selectedTools,
        { toolId, planId: defaultPlan.id, seats: teamSize, monthlySpend: defaultPlan.pricePerSeat * teamSize },
      ]);
    }
  }

  function updateTool(toolId: string, updates: Partial<FormTool>) {
    setSelectedTools(selectedTools.map((t) => (t.toolId === toolId ? { ...t, ...updates } : t)));
  }

  async function handleSubmit() {
    if (selectedTools.length === 0) { setError("Add at least one tool to audit."); return; }
    setError(null);
    setIsLoading(true);
    const payload: AuditInput = { tools: selectedTools, teamSize, useCase };
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/audit/${data.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setIsLoading(false);
    }
  }

  const totalSpend = selectedTools.reduce((s, t) => s + t.monthlySpend, 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Free · No login required · 2 minutes
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
          Find out if you&apos;re overspending on AI tools
        </h1>
        <p className="text-slate-400 text-xl leading-relaxed">
          Enter what your team pays. Get an instant breakdown of where you&apos;re overspending and how much you can save.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24 space-y-8">
        {/* Team info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-slate-400">Your team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Team size</label>
              <input type="number" min={1} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Primary use case</label>
              <select value={useCase} onChange={(e) => setUseCase(e.target.value as UseCase)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {USE_CASES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tool selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-slate-400">AI tools you pay for</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TOOLS.map((tool) => {
              const active = selectedTools.find((t) => t.toolId === tool.id);
              return (
                <button key={tool.id} onClick={() => toggleTool(tool.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${active ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"}`}>
                  {tool.name}
                </button>
              );
            })}
          </div>

          {selectedTools.length > 0 && (
            <div className="space-y-3 pt-2">
              {selectedTools.map((entry) => {
                const tool = TOOLS.find((t) => t.id === entry.toolId)!;
                return (
                  <div key={entry.toolId} className="bg-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{tool.name}</span>
                      <button onClick={() => toggleTool(entry.toolId)} className="text-slate-500 hover:text-red-400 text-xs">Remove</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Plan</label>
                        <select value={entry.planId} onChange={(e) => updateTool(entry.toolId, { planId: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                          {tool.plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Seats</label>
                        <input type="number" min={1} value={entry.seats}
                          onChange={(e) => updateTool(entry.toolId, { seats: Number(e.target.value) })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Monthly ($)</label>
                        <input type="number" min={0} value={entry.monthlySpend}
                          onChange={(e) => updateTool(entry.toolId, { monthlySpend: Number(e.target.value) })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 text-sm text-slate-400">
                <span>Total monthly spend</span>
                <span className="text-white font-semibold text-base">${totalSpend.toLocaleString()}/mo</span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>}

        <button onClick={handleSubmit} disabled={isLoading || selectedTools.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-all">
          {isLoading ? "Running audit…" : "Run my free audit →"}
        </button>
        <p className="text-center text-slate-500 text-xs">No account required. Data used only to generate your audit.</p>
      </div>
    </main>
  );
}