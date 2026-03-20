import Link from "next/link";
import { adminListFunnels } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  let rows: Awaited<ReturnType<typeof adminListFunnels>> = [];
  let error = "";
  try {
    rows = await adminListFunnels();
  } catch {
    error = "Không gọi được Admin API. Kiểm tra BACKEND_URL, MRTHUE_ADMIN_KEY và backend đang chạy.";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">MrThue CMS — Funnel</h1>
          <p className="text-slate-600 mt-2">
            Quản lý cấu hình funnel (cây câu hỏi, điểm, insight, lead, kết quả). Key gửi qua header{" "}
            <code className="bg-white px-1 rounded border">X-Admin-Key</code> từ biến môi trường server{" "}
            <code className="bg-white px-1 rounded border">MRTHUE_ADMIN_KEY</code>.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
        ) : null}

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold">Danh sách funnel</div>
          <ul className="divide-y">
            {rows.map((f) => (
              <li key={f.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{f.name}</p>
                  <p className="text-sm text-slate-600">
                    slug: <span className="font-mono">{f.slug}</span> · start:{" "}
                    <span className="font-mono">{f.start_node_key}</span> ·{" "}
                    {f.is_published ? (
                      <span className="text-emerald-700 font-semibold">published</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">draft</span>
                    )}
                  </p>
                </div>
                <Link className="text-blue-700 font-semibold" href={`/admin/funnels/${f.id}`}>
                  Sửa graph
                </Link>
              </li>
            ))}
            {!rows.length && !error ? <li className="px-4 py-6 text-slate-600">Chưa có funnel nào.</li> : null}
          </ul>
        </div>

        <Link href="/" className="text-sm text-slate-600 underline">
          ← Về website
        </Link>
      </div>
    </main>
  );
}
