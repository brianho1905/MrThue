import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function LegalDisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow max-w-3xl mx-auto w-full px-6 pt-28 pb-16">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-6">Miễn Trừ Trách Nhiệm Tư Vấn</h1>
        <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <p>
            Nền tảng MrThue cung cấp công cụ sàng lọc thông tin và báo cáo tóm gọn tự động dựa trên dữ liệu người dùng
            nhập vào và rule cấu hình hệ thống.
          </p>
          <p>
            Mọi nội dung, điểm số tuân thủ, nhận định sơ bộ và hành động đề xuất chỉ mang tính tham khảo, không phải là
            kết luận pháp lý/thuế chính thức, không tạo lập quan hệ dịch vụ tư vấn nghề nghiệp, và không thay thế ý kiến
            của luật sư/chuyên gia thuế đủ điều kiện hành nghề.
          </p>
          <p>
            Người dùng tự chịu trách nhiệm với quyết định kinh doanh, kê khai, nộp thuế hoặc tuân thủ pháp lý dựa trên
            thông tin nhận được từ hệ thống.
          </p>
          <p>
            MrThue không chịu trách nhiệm cho thiệt hại trực tiếp hoặc gián tiếp phát sinh từ việc sử dụng, diễn giải
            hoặc phụ thuộc vào nội dung trên nền tảng.
          </p>
          <p>
            Để có quyết định pháp lý/thuế chính thức, vui lòng làm việc trực tiếp với chuyên gia tư vấn phù hợp.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
