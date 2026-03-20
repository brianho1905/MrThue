"use server";

import { revalidatePath } from "next/cache";

function backendUrl() {
  return process.env.BACKEND_URL ?? "http://localhost:8000";
}

function adminKey() {
  return process.env.MRTHUE_ADMIN_KEY ?? "";
}

export type AdminFunnelSummary = {
  id: number;
  name: string;
  slug: string;
  is_published: boolean;
  start_node_key: string;
  updated_at: string | null;
};

export async function adminListFunnels(): Promise<AdminFunnelSummary[]> {
  const res = await fetch(`${backendUrl()}/api/admin/funnels`, {
    headers: { "X-Admin-Key": adminKey() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Admin list failed: ${res.status}`);
  }
  return res.json();
}

export async function adminGetGraph(funnelId: number): Promise<unknown> {
  const res = await fetch(`${backendUrl()}/api/admin/funnels/${funnelId}/graph`, {
    headers: { "X-Admin-Key": adminKey() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Admin graph failed: ${res.status}`);
  }
  return res.json();
}

export async function adminSaveGraph(funnelId: number, jsonText: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const payload = JSON.parse(jsonText);
    const res = await fetch(`${backendUrl()}/api/admin/funnels/${funnelId}/graph`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: t || `HTTP ${res.status}` };
    }
    revalidatePath("/admin");
    revalidatePath(`/admin/funnels/${funnelId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
