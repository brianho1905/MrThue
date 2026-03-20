"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { claimSession, loginAccount, persistAuthFromResponse } from "@/lib/auth-api";

export default function DangNhapForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdRaw = searchParams.get("session_id");
  const sessionId = sessionIdRaw ? Number(sessionIdRaw) : null;
  const nextPath = searchParams.get("next") || "/tai-khoan";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginAccount({ email, password });
      persistAuthFromResponse(data);
      if (sessionId && Number.isFinite(sessionId)) {
        try {
          await claimSession(sessionId);
        } catch {
          // Phiên không tồn tại hoặc đã thuộc user khác — vẫn cho đăng nhập
        }
      }
      router.push(nextPath.startsWith("/") ? nextPath : "/tai-khoan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow max-w-lg mx-auto w-full px-6 pt-28 pb-16">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-2">Đăng nhập</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Truy cập lại các phiên tư vấn đã lưu.
          {sessionId ? (
            <span className="block mt-2 text-primary font-semibold">Sau khi đăng nhập, phiên #{sessionId} sẽ được gắn nếu còn trống.</span>
          ) : null}
        </p>
        <p className="text-xs text-on-surface-variant mb-8">
          Việc đăng nhập chỉ phục vụ quản lý dữ liệu phiên, không tạo nghĩa vụ tư vấn pháp lý/thuế chính thức. Xem{" "}
          <Link href="/mien-tru-trach-nhiem" className="text-primary font-semibold">
            miễn trừ trách nhiệm
          </Link>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            type="password"
            className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full hero-gradient text-on-primary py-3 rounded-md font-bold disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-sm text-on-surface-variant">
          Chưa có tài khoản?{" "}
          <Link href={sessionId ? `/dang-ky?session_id=${sessionId}` : "/dang-ky"} className="text-primary font-semibold">
            Đăng ký
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
