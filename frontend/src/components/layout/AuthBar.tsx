"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/auth-api";
import { clearStoredToken, getStoredToken } from "@/lib/auth-storage";

export default function AuthBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setEmail(null);
      return;
    }
    void (async () => {
      try {
        const me = await fetchMe();
        setEmail(me.email);
      } catch {
        setEmail(null);
      }
    })();
  }, [pathname]);

  if (email) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/tai-khoan" className="font-semibold text-on-surface-variant hover:text-primary max-w-[140px] truncate">
          {email}
        </Link>
        <button
          type="button"
          className="text-on-surface-variant hover:text-primary font-semibold"
          onClick={() => {
            clearStoredToken();
            setEmail(null);
            router.refresh();
          }}
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/dang-nhap" className="font-semibold text-on-surface-variant hover:text-primary">
        Đăng nhập
      </Link>
      <Link href="/dang-ky" className="font-semibold text-primary hover:opacity-90">
        Đăng ký
      </Link>
    </div>
  );
}
