import Link from "next/link";

export default function LegalDisclaimerInline() {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <p className="text-sm leading-relaxed">
        Thông tin và nhận định trên nền tảng chỉ mang tính tham khảo, không phải ý kiến tư vấn pháp lý/thuế chính thức
        và không thay thế dịch vụ tư vấn nghề nghiệp từ chuyên gia đủ điều kiện hành nghề.
      </p>
      <p className="text-xs mt-2">
        Bằng việc tiếp tục sử dụng, bạn xác nhận đã đọc{" "}
        <Link href="/mien-tru-trach-nhiem" className="font-semibold underline">
          Điều khoản miễn trừ trách nhiệm
        </Link>
        .
      </p>
    </section>
  );
}
