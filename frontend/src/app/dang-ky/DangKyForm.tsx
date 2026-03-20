"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { persistAuthFromResponse, registerAccount } from "@/lib/auth-api";

export default function DangKyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdRaw = searchParams.get("session_id");
  const sessionId = sessionIdRaw ? Number(sessionIdRaw) : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerAccount({
        email,
        password,
        full_name: fullName,
        phone: phone || null,
        funnel_session_id: sessionId && Number.isFinite(sessionId) ? sessionId : null,
      });
      persistAuthFromResponse(data);
      router.push("/tai-khoan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow max-w-lg mx-auto w-full px-6 pt-28 pb-16">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-2">Đăng ký MrThue</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Lưu các phiên chẩn đoán thuế, đăng nhập lại để xem báo cáo và (sau này) dùng gói trả phí.
          {sessionId ? (
            <span className="block mt-2 text-primary font-semibold">Phiên #{sessionId} sẽ được gắn vào tài khoản.</span>
          ) : null}
        </p>
        <p className="text-xs text-on-surface-variant mb-8">
          Nội dung hệ thống chỉ mang tính tham khảo và không phải tư vấn pháp lý/thuế chính thức. Xem{" "}
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
            minLength={8}
            type="password"
            className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
            placeholder="Mật khẩu (≥ 8 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            required
            className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
            placeholder="Số điện thoại (tuỳ chọn)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full hero-gradient text-on-primary py-3 rounded-md font-bold disabled:opacity-50"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-sm text-on-surface-variant">
          Đã có tài khoản?{" "}
          <Link href={sessionId ? `/dang-nhap?session_id=${sessionId}` : "/dang-nhap"} className="text-primary font-semibold">
            Đăng nhập
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
