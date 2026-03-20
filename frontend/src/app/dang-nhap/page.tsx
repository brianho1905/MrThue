import { Suspense } from "react";
import DangNhapForm from "./DangNhapForm";

export default function DangNhapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">
          Đang tải...
        </div>
      }
    >
      <DangNhapForm />
    </Suspense>
  );
}
