"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { claimSession, fetchMe, loginAccount, persistAuthFromResponse, registerAccount } from "@/lib/auth-api";
import { getStoredToken } from "@/lib/auth-storage";

type Props = {
  sessionId: number;
  defaultName?: string | null;
  defaultPhone?: string | null;
};

export default function RegisterSaveSession({ sessionId, defaultName, defaultPhone }: Props) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"register" | "login">("register");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setHasToken(false);
      return;
    }
    setHasToken(true);
    void (async () => {
      try {
        const me = await fetchMe();
        setUserEmail(me.email);
      } catch {
        setHasToken(false);
      }
    })();
  }, []);

  const handleClaim = async () => {
    setMessage("");
    setLoading(true);
    try {
      await claimSession(sessionId);
      setMessage("Đã lưu phiên vào tài khoản. Bạn có thể xem lại trong mục Tài khoản.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không lưu được phiên");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setMessage("");
    setLoading(true);
    try {
      const data = await registerAccount({
        email,
        password,
        full_name: fullName,
        phone: phone || null,
        funnel_session_id: sessionId,
      });
      persistAuthFromResponse(data);
      setHasToken(true);
      setUserEmail(data.user.email);
      setMessage("Đăng ký thành công — phiên tư vấn đã được gắn với tài khoản.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setMessage("");
    setLoading(true);
    try {
      const data = await loginAccount({ email, password });
      persistAuthFromResponse(data);
      await claimSession(sessionId);
      setHasToken(true);
      setUserEmail(data.user.email);
      setMessage("Đăng nhập thành công — đã gắn phiên này vào tài khoản.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-soft">
      <h3 className="font-headline text-xl font-extrabold text-on-surface mb-2">Lưu phiên tư vấn & dùng lại sau</h3>
      <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
        Tạo tài khoản để xem lại các lần chẩn đoán, tiếp tục tư vấn sâu và (sau này) mở các gói trả phí. Dữ liệu funnel đã có
        vẫn được giữ khi bạn đăng ký.
      </p>
      <p className="text-xs text-on-surface-variant mb-6">
        Việc tạo tài khoản không đồng nghĩa với cam kết tư vấn pháp lý/thuế chính thức. Xem{" "}
        <Link href="/mien-tru-trach-nhiem" className="text-primary font-semibold">
          miễn trừ trách nhiệm
        </Link>
        .
      </p>

      {hasToken ? (
        <div className="space-y-3">
          <p className="text-sm text-on-surface">
            Bạn đang đăng nhập: <span className="font-semibold">{userEmail}</span>
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={handleClaim}
            className="hero-gradient text-on-primary px-6 py-3 rounded-md font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Gắn báo cáo này vào tài khoản"}
          </button>
          <div>
            <Link href="/tai-khoan" className="text-primary font-semibold text-sm">
              Xem các phiên đã lưu →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                mode === "register" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"
              }`}
            >
              Đăng ký mới
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                mode === "login" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"
              }`}
            >
              Đã có tài khoản
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg bg-surface-container-highest px-4 py-3 border-b-2 border-outline-variant focus:border-primary outline-none"
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "register" ? (
              <>
                <input
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
              </>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <button
              type="button"
              disabled={loading || !email || !password || (mode === "register" && !fullName)}
              onClick={mode === "register" ? handleRegister : handleLogin}
              className="hero-gradient text-on-primary px-6 py-3 rounded-md font-bold text-sm disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : mode === "register" ? "Đăng ký & lưu phiên" : "Đăng nhập & lưu phiên"}
            </button>
            <Link href={`/dang-ky?session_id=${sessionId}`} className="text-sm text-primary font-semibold">
              Mở trang đăng ký đầy đủ
            </Link>
          </div>
        </>
      )}

      {message ? <p className="mt-4 text-sm text-on-surface-variant">{message}</p> : null}
    </section>
  );
}
