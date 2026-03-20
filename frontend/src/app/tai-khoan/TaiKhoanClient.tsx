"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import type { ConsultationSummary } from "@/lib/auth-api";
import { fetchMe, fetchMyConsultations } from "@/lib/auth-api";
import { clearStoredToken } from "@/lib/auth-storage";

export default function TaiKhoanClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState("free");
  const [rows, setRows] = useState<ConsultationSummary[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const me = await fetchMe();
        setEmail(me.email);
        setPlanTier(me.plan_tier || "free");
        const list = await fetchMyConsultations();
        setRows(list);
      } catch {
        router.replace("/dang-nhap?next=/tai-khoan");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow max-w-3xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface">Tài khoản</h1>
            <p className="text-on-surface-variant text-sm mt-1">{email}</p>
            <p className="text-xs text-on-surface-variant mt-2">
              Gói hiện tại: <span className="font-semibold text-primary">{planTier}</span> — sẵn sàng mở rộng thu phí (xem{" "}
              <code className="bg-surface-container-high px-1 rounded">docs/ACCOUNTS_AND_BILLING.md</code>).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearStoredToken();
              router.push("/");
              router.refresh();
            }}
            className="text-sm font-semibold text-on-surface-variant hover:text-primary"
          >
            Đăng xuất
          </button>
        </div>

        <h2 className="font-headline font-bold text-lg mb-4">Phiên tư vấn đã lưu</h2>
        {rows.length === 0 ? (
          <p className="text-on-surface-variant text-sm">
            Chưa có phiên nào.{" "}
            <Link href="/tu-van" className="text-primary font-semibold">
              Bắt đầu chẩn đoán
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.session_id} className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">
                    {r.report_title ?? `Phiên #${r.session_id}`}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Trạng thái: {r.status} · Điểm: {r.compliance_score ?? r.score}
                    {r.created_at ? ` · ${new Date(r.created_at).toLocaleString("vi-VN")}` : ""}
                  </p>
                </div>
                {r.status === "completed" ? (
                  <Link
                    href={`/bao-cao/${r.session_id}`}
                    className="text-sm font-semibold text-primary whitespace-nowrap"
                  >
                    Xem báo cáo
                  </Link>
                ) : (
                  <Link href="/tu-van" className="text-sm font-semibold text-primary whitespace-nowrap">
                    Tiếp tục
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
