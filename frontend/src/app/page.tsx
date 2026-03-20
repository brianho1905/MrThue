import Link from "next/link";
import LegalDisclaimerInline from "@/components/legal/LegalDisclaimerInline";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary-container selection:text-on-primary-container">
      <SiteHeader />
      <main className="flex-grow pt-20">
        <section className="relative pt-16 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-8">
                <span className="text-on-surface-variant font-semibold tracking-[0.2em] uppercase text-xs mb-6 block">
                  Premium Tax Advisory
                </span>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1] font-headline">
                  Phiên tư vấn <br />
                  <span className="text-primary italic">chuyên sâu</span>
                </h1>
                <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                  Lộ trình thuế minh bạch cho hộ kinh doanh cá thể — phễu hỏi đáp nhiều bước, nhận định sơ bộ và báo
                  cáo tóm gọn theo nhu cầu.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/tu-van"
                    className="hero-gradient text-on-primary px-10 py-5 rounded-md text-lg font-bold flex items-center justify-center gap-3 hover:opacity-95 transition-opacity"
                  >
                    Bắt đầu chẩn đoán thuế
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <a
                    href="#quy-trinh"
                    className="bg-surface-container-highest text-on-surface px-10 py-5 rounded-md text-lg font-semibold hover:bg-surface-container-high transition-colors text-center"
                  >
                    Tìm hiểu quy trình
                  </a>
                </div>
              </div>
              <div className="md:col-span-4 hidden md:block">
                <div className="relative">
                  <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-fixed-dim rounded-full blur-3xl opacity-30" />
                  <div className="bg-surface-container-lowest p-8 rounded-xl shadow-soft relative z-20">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg">
                        <span className="material-symbols-outlined text-primary">verified</span>
                        <div>
                          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                            Trạng thái
                          </p>
                          <p className="font-bold text-on-surface">Sẵn sàng tư vấn</p>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant italic leading-relaxed">
                        “Minh bạch thuế là nền tảng để kinh doanh bền vững.”
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="quy-trinh" className="bg-primary-container/30 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4 font-headline">
                Quy trình 3 bước
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Thu thập thông tin → Nhận định sơ bộ → Báo cáo tóm gọn & hành động ưu tiên.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { n: "1", t: "Sàng lọc cơ bản", d: "Thu thập tình trạng đăng ký thuế, ngành nghề, quy mô doanh thu." },
                { n: "2", t: "Nhận định sơ bộ", d: "Rule engine từ CMS đánh giá rủi ro và gợi ý theo từng lựa chọn." },
                { n: "3", t: "Báo cáo & chuyển đổi", d: "Tóm gọn nhu cầu, hướng tới tư vấn chuyên gia hoặc checklist." },
              ].map((s) => (
                <div key={s.n} className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-bold mx-auto">
                    {s.n}
                  </div>
                  <h3 className="text-xl font-bold text-on-surface font-headline">{s.t}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link
                href="/tu-van"
                className="inline-flex items-center justify-center bg-primary text-on-primary px-12 py-4 rounded-md font-bold text-lg hover:bg-primary-dim transition-colors"
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </section>

        <section id="dich-vu" className="bg-surface-container-low py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-3 font-headline">
                Giá trị cốt lõi
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "gavel", t: "Luật & thực tiễn", d: "Nội dung funnel do bạn cấu hình trong CMS — phù hợp vận hành thật." },
                { icon: "person_search", t: "Cá nhân hóa", d: "Cây nhánh, insight sau mỗi bước, báo cáo cuối theo rule bạn chỉnh." },
                { icon: "encrypted", t: "Dữ liệu có kiểm soát", d: "Lead lưu MySQL, có thể mở rộng phân quyền & audit log sau." },
              ].map((f) => (
                <div key={f.t} className="bg-surface-container-lowest p-10 rounded-xl hover:bg-white/70 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed-dim flex items-center justify-center mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-on-surface font-headline">{f.t}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="lien-he" className="py-20 px-6">
          <div className="max-w-7xl mx-auto bg-on-surface rounded-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-background mb-4 font-headline leading-tight">
                Sẵn sàng chuẩn hóa thuế hộ kinh doanh?
              </h2>
              <p className="text-outline-variant text-lg mb-8">
                Bắt đầu phễu tư vấn hoặc chỉnh sửa funnel trong CMS nội bộ để phù hợp chiến lược của bạn.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tu-van"
                  className="bg-primary text-on-primary px-8 py-3 rounded-md font-bold inline-flex items-center gap-2"
                >
                  Vào phễu tư vấn
                </Link>
                <Link
                  href="/admin"
                  className="bg-surface-container-highest text-on-surface px-8 py-3 rounded-md font-semibold inline-flex items-center gap-2"
                >
                  Mở CMS
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-primary/30 to-primary-dim/40 min-h-[220px]" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-20">
          <LegalDisclaimerInline />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
