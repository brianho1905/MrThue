import { Suspense } from "react";
import DangKyForm from "./DangKyForm";

export default function DangKyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">
          Đang tải...
        </div>
      }
    >
      <DangKyForm />
    </Suspense>
  );
}
