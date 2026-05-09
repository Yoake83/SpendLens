import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import AuditResultClient from "@/components/AuditResultClient";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("audits").select("result").eq("id", params.id).single();
  if (!data) return { title: "Audit not found — SpendLens" };

  const savings = data.result?.totalMonthlySavings ?? 0;
  const annual = savings * 12;
  return {
    title: `AI Spend Audit — $${savings}/mo savings found | SpendLens`,
    description: `This team could save $${annual}/year on AI tools. Run your free audit at SpendLens.`,
    openGraph: {
      title: `AI Spend Audit: $${savings}/mo savings identified`,
      description: `Free AI spend audit found $${annual}/year in potential savings.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/audit/${params.id}`,
      siteName: "SpendLens",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit: $${savings}/mo savings found`,
      description: `Run your free AI spend audit at SpendLens — takes 2 minutes.`,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const supabase = getSupabaseAdmin();
  // Note: email, company_name, role are NOT selected — stripped from public view
  const { data, error } = await supabase
    .from("audits")
    .select("id, input, result, ai_summary, created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  return <AuditResultClient audit={data} />;
}