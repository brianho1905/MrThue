import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-high mt-auto py-12 px-6 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            <span className="text-lg font-extrabold font-headline">MrThue</span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
            Giải pháp tư vấn thuế cho hộ kinh doanh cá thể — phễu thông minh, báo cáo tóm gọn, dữ liệu phục vụ
            chuyên gia.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Nội dung trên nền tảng chỉ mang tính tham khảo và không phải tư vấn pháp lý/thuế chính thức.
          </p>
          <p className="text-xs text-on-surface-variant/80">© {new Date().getFullYear()} MrThue.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary" href="/tu-van">
                  Phễu tư vấn
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/tai-khoan">
                  Tài khoản / phiên đã lưu
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/admin">
                  CMS Funnel (nội bộ)
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface">Pháp lý</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary" href="/mien-tru-trach-nhiem">
                  Miễn trừ trách nhiệm
                </Link>
              </li>
              <li>
                <span className="opacity-70">Privacy / Terms — sắp có</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
