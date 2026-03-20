import { AUTH_TOKEN_KEY, clearStoredToken, getStoredToken, setStoredToken } from "./auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type UserPublic = {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  plan_tier: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserPublic;
};

export type ConsultationSummary = {
  session_id: number;
  funnel_id: number;
  status: string;
  score: number;
  report_title: string | null;
  compliance_score: number | null;
  created_at: string | null;
};

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  return headers;
}

export function persistAuthFromResponse(data: TokenResponse) {
  setStoredToken(data.access_token);
}

export function logoutClient() {
  clearStoredToken();
}

export async function registerAccount(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
  funnel_session_id?: number | null;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      phone: payload.phone || null,
      funnel_session_id: payload.funnel_session_id ?? null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Đăng ký thất bại");
  }
  return res.json();
}

export async function loginAccount(payload: { email: string; password: string }): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Email hoặc mật khẩu không đúng");
  return res.json();
}

export async function claimSession(sessionId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/sessions/${sessionId}/claim`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không gắn được phiên");
  }
}

export async function fetchMyConsultations(): Promise<ConsultationSummary[]> {
  const res = await fetch(`${API_BASE}/api/auth/consultations`, { headers: authHeaders(), cache: "no-store" });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Không tải được danh sách");
  return res.json();
}

export async function fetchMe(): Promise<UserPublic> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("UNAUTHORIZED");
  return res.json();
}

export { AUTH_TOKEN_KEY };
