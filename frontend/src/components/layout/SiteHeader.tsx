import Link from "next/link";
import AuthBar from "./AuthBar";

const nav = [
  { href: "/", label: "Trang chủ" },
  { href: "/tu-van", label: "Tư vấn" },
  { href: "/#dich-vu", label: "Dịch vụ" },
  { href: "/#lien-he", label: "Liên hệ" },
];

export default function SiteHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl shadow-soft">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8 h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
          <span className="text-xl font-extrabold tracking-tight text-primary font-headline">MrThue</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <AuthBar />
          </div>
          <Link
            href="/tu-van"
            className="hero-gradient text-on-primary px-5 py-2.5 rounded-md text-sm font-bold hover:opacity-95 transition-opacity whitespace-nowrap"
          >
            Chẩn đoán
          </Link>
        </div>
      </div>
    </header>
  );
}
