"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminGetGraph, adminSaveGraph } from "../../actions";

export default function FunnelEditor({ funnelId }: { funnelId: number }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminGetGraph(funnelId);
        if (cancelled) return;
        setText(JSON.stringify(data, null, 2));
      } catch {
        if (cancelled) return;
        setMessage("Không tải được graph (kiểm tra env + quyền admin).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [funnelId]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold">Sửa funnel #{funnelId}</h1>
            <p className="text-sm text-slate-600 mt-1">
              JSON graph gồm <code className="bg-white px-1 rounded border">config</code> (base_score, bands...) và{" "}
              <code className="bg-white px-1 rounded border">nodes</code> (question/lead/result).
            </p>
          </div>
          <Link href="/admin" className="text-blue-700 font-semibold">
            ← Danh sách
          </Link>
        </div>

        {message ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">{message}</div> : null}

        {loading ? (
          <div className="text-slate-600">Đang tải...</div>
        ) : (
          <>
            <textarea
              className="w-full min-h-[520px] font-mono text-sm p-4 rounded-xl border bg-white shadow-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-3 flex-wrap">
              <button
                className="px-5 py-2 rounded-lg bg-blue-700 text-white font-semibold disabled:opacity-50"
                disabled={pending}
                onClick={() => {
                  setMessage("");
                  setPending(true);
                  void (async () => {
                    const res = await adminSaveGraph(funnelId, text);
                    if (res.ok) setMessage("Đã lưu.");
                    else setMessage(`Lỗi lưu: ${res.error}`);
                    setPending(false);
                  })();
                }}
              >
                {pending ? "Đang lưu..." : "Lưu graph"}
              </button>
              <span className="text-xs text-slate-500 self-center">
                Lưu ý: phải giữ đúng schema (name, slug, is_published, start_node_key, config, nodes[]...).
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
