import { DEFAULT_FUNNEL_SLUG } from "./constants";
import { getStoredToken } from "./auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function optionalAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export type PublicNode = {
  key: string;
  kind: string;
  title: string;
  body: string;
  choices: { label: string; value: string }[];
};

export type StartSessionResponse = {
  session_id: number;
  node: PublicNode;
  score: number;
};

export type AnswerResponse = {
  session_id: number;
  score: number;
  insight_after: string | null;
  completed: boolean;
  node: PublicNode;
  result: Record<string, unknown> | null;
};

export type ReportResponse = {
  session_id: number;
  funnel_id: number;
  title: string;
  body: string;
  compliance_score: number;
  risk_level: string;
  next_best_action: string;
  preliminary_advice: string;
  contact: { full_name?: string | null; phone?: string | null };
};

export async function startFunnelSession(slug: string = DEFAULT_FUNNEL_SLUG): Promise<StartSessionResponse> {
  const res = await fetch(`${API_BASE}/api/public/funnels/${slug}/sessions`, {
    method: "POST",
    headers: { ...optionalAuthHeaders() },
  });
  if (!res.ok) throw new Error("Không thể khởi tạo phiên tư vấn.");
  return res.json();
}

export async function submitFunnelAnswer(sessionId: number, choiceValue: string): Promise<AnswerResponse> {
  const res = await fetch(`${API_BASE}/api/public/funnels/sessions/${sessionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ choice_value: choiceValue }),
  });
  if (!res.ok) throw new Error("Không thể gửi câu trả lời.");
  return res.json();
}

export async function submitFunnelLead(
  sessionId: number,
  payload: { full_name: string; phone: string },
): Promise<AnswerResponse> {
  const res = await fetch(`${API_BASE}/api/public/funnels/sessions/${sessionId}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không thể gửi thông tin liên hệ.");
  return res.json();
}

export async function fetchReport(sessionId: number): Promise<ReportResponse> {
  const res = await fetch(`${API_BASE}/api/public/funnels/sessions/${sessionId}/report`, { cache: "no-store" });
  if (!res.ok) throw new Error("Không thể tải báo cáo.");
  return res.json();
}
