"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_FUNNEL_SLUG } from "@/lib/constants";
import {
  startFunnelSession,
  submitFunnelAnswer,
  submitFunnelLead,
  type AnswerResponse,
  type PublicNode,
} from "@/lib/api";

const TOTAL_STEPS_HINT = 5;

export default function DynamicFunnel() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [node, setNode] = useState<PublicNode | null>(null);
  const [score, setScore] = useState(0);
  const [insight, setInsight] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await startFunnelSession(DEFAULT_FUNNEL_SLUG);
        if (cancelled) return;
        setSessionId(res.session_id);
        setNode(res.node);
        setScore(res.score);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Không thể khởi tạo funnel");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progress = useMemo(() => {
    const pct = Math.round(((stepIndex + 1) / TOTAL_STEPS_HINT) * 100);
    return Math.min(100, pct);
  }, [stepIndex]);

  const handleAnswer = async (value: string) => {
    if (!sessionId) return;
    setError("");
    setLoading(true);
    try {
      const data: AnswerResponse = await submitFunnelAnswer(sessionId, value);
      setScore(data.score);
      setInsight(data.insight_after);
      setNode(data.node);
      setStepIndex((s) => s + 1);
      if (data.completed) {
        router.push(`/bao-cao/${data.session_id}`);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleLead = async () => {
    if (!sessionId) return;
    setError("");
    setLoading(true);
    try {
      const data = await submitFunnelLead(sessionId, { full_name: name, phone });
      setScore(data.score);
      setNode(data.node);
      if (data.completed) {
        router.push(`/bao-cao/${data.session_id}`);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !node) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-on-surface-variant">
        Đang khởi tạo phiên tư vấn...
      </div>
    );
  }

  if (error && !node) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        {error}
        <p className="text-sm mt-2">Hãy chắc backend đang chạy và CORS đúng origin.</p>
      </div>
    );
  }

  if (!node) return null;

  return (
    <section className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Phễu câu hỏi</span>
            <h2 className="font-headline text-xl font-extrabold text-on-surface mt-1">
              {node.kind === "question" ? "Giai đoạn: Thu thập thông tin" : "Tiếp theo"}
            </h2>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">Bước ~{stepIndex + 1}</span>
        </div>
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        {stepIndex >= 2 ? (
          <p className="text-xs text-on-surface-variant mt-3">
            Muốn <span className="font-semibold text-primary">lưu phiên</span> và xem lại sau?{" "}
            <Link className="text-primary font-semibold underline-offset-2 hover:underline" href="/dang-ky">
              Đăng ký
            </Link>{" "}
            hoặc{" "}
            <Link className="text-primary font-semibold underline-offset-2 hover:underline" href="/dang-nhap">
              đăng nhập
            </Link>{" "}
            — phiên vẫn tiếp tục trên trình duyệt này.
          </p>
        ) : null}
      </div>

      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 rounded-full bg-primary-fixed-dim border-2 border-white shadow-soft flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary">support_agent</span>
        </div>
        <div className="flex flex-col gap-4 max-w-2xl w-full">
          <div className="bg-surface-container-lowest p-6 rounded-2xl rounded-tl-none shadow-soft">
            <p className="text-on-surface leading-relaxed text-lg font-semibold">{node.title}</p>
            {node.body ? <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">{node.body}</p> : null}
          </div>

          {node.kind === "question" && (
            <div className="flex flex-col gap-2">
              {node.choices.map((choice) => (
                <button
                  key={choice.value}
                  disabled={loading}
                  onClick={() => handleAnswer(choice.value)}
                  className="w-full md:w-fit px-8 py-3 bg-secondary-container/40 text-on-secondary-container border border-secondary-container rounded-xl font-semibold text-left hover:bg-primary hover:text-on-primary transition-all duration-200 flex items-center justify-between group disabled:opacity-60"
                >
                  <span>{choice.label}</span>
                  <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          )}

          {node.kind === "lead" && (
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
                placeholder="Họ và tên"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
                placeholder="Số điện thoại"
              />
              <button
                disabled={!name || !phone || loading}
                onClick={handleLead}
                className="hero-gradient text-on-primary px-6 py-3 rounded-md font-bold disabled:opacity-50"
              >
                Nhận báo cáo tóm gọn
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <h3 className="font-headline font-bold text-on-surface">Nhận định sơ bộ</h3>
        </div>
        <div className="bg-surface-container-low/70 p-6 rounded-2xl">
          {insight ? (
            <p className="text-on-surface leading-relaxed">{insight}</p>
          ) : (
            <p className="text-on-surface-variant text-sm italic">
              Thông tin sẽ xuất hiện sau mỗi lựa chọn của bạn.
            </p>
          )}
        </div>
      </div>

      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-primary">Live compliance</span>
          <span className="text-sm font-bold text-on-surface">{score}%</span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
        </div>
        <p className="text-[11px] text-on-surface-variant mt-3">Điểm tuân thủ ước tính theo rule CMS (v1).</p>
        <p className="text-[11px] text-on-surface-variant mt-2">
          Kết quả này chỉ có giá trị tham khảo ban đầu, không phải tư vấn pháp lý/thuế chính thức.
        </p>
      </section>

      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
    </section>
  );
}
