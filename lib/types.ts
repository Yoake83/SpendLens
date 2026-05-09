import { AuditInput, AuditResult } from "./audit-engine";

export interface StoredAudit {
  id: string;
  input: AuditInput;
  result: AuditResult;
  aiSummary: string;
  createdAt: string;
  email?: string;
  companyName?: string;
  role?: string;
}

export interface LeadCapturePayload {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}