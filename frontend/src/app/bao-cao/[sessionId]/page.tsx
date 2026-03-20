import Link from "next/link";
import RegisterSaveSession from "@/components/auth/RegisterSaveSession";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import type { ReportResponse } from "@/lib/api";

async function loadReport(sessionId: string): Promise<ReportResponse> {
  const base = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  const res = await fetch(`${base}/api/public/funnels/sessions/${sessionId}/report`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("not_found");
  }
  return res.json();
}

export default async function ReportPage({ params }: { params: { sessionId: string } }) {
  let report: ReportResponse | null = null;
  let err = false;
  try {
    report = await loadReport(params.sessionId);
  } catch {
    err = true;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow max-w-7xl mx-auto px-6 pt-28 pb-16 w-full">
        {err || !report ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            Không tìm thấy báo cáo hoặc phiên chưa hoàn tất.
            <div className="mt-4">
              <Link href="/tu-van" className="text-primary font-semibold">
                Quay lại phễu tư vấn
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header className="mb-12">
              <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold tracking-widest uppercase mb-4 rounded-sm">
                Personalized Summary Report
              </span>
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-6 leading-[1.2]">
                Báo cáo tóm gọn <span className="text-primary italic">cá nhân hóa</span>
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed border-l-4 border-primary-fixed-dim pl-6 max-w-3xl">
                {report.preliminary_advice}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
              <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-soft">
                <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">insights</span>
                  {report.title}
                </h2>
                <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{report.body}</p>
              </div>
              <div className="md:col-span-4 bg-on-surface text-white p-8 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Chỉ số tuân thủ</h3>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, Math.max(0, report.compliance_score))}%` }}
                      />
                    </div>
                    <span className="font-headline font-bold text-3xl">{report.compliance_score}%</span>
                  </div>
                  <p className="text-xs text-white/70">Mức rủi ro: {report.risk_level}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-xs font-bold mb-1">Liên hệ</p>
                  <p className="text-sm">{report.contact.full_name}</p>
                  <p className="text-sm text-white/70">{report.contact.phone}</p>
                </div>
              </div>
            </div>

            <section className="bg-secondary-container/30 border border-secondary-container rounded-xl p-6">
              <h3 className="font-headline font-bold text-lg mb-2">Hành động đề xuất</h3>
              <p className="text-on-secondary-container leading-relaxed">{report.next_best_action}</p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link href="/tu-van" className="px-5 py-2 rounded-md bg-primary text-on-primary font-semibold text-sm">
                  Làm lại phễu
                </Link>
                <Link href="/" className="px-5 py-2 rounded-md bg-surface-container-highest text-on-surface font-semibold text-sm">
                  Về trang chủ
                </Link>
              </div>
              <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
                Báo cáo này chỉ mang tính tham khảo, không phải ý kiến tư vấn pháp lý/thuế chính thức. Xem thêm{" "}
                <Link href="/mien-tru-trach-nhiem" className="text-primary font-semibold">
                  miễn trừ trách nhiệm
                </Link>
                .
              </p>
            </section>

            <RegisterSaveSession
              sessionId={Number(params.sessionId)}
              defaultName={report.contact.full_name}
              defaultPhone={report.contact.phone}
            />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
