import DynamicFunnel from "@/components/funnel/DynamicFunnel";
import LegalDisclaimerInline from "@/components/legal/LegalDisclaimerInline";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function ConsultationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 md:px-6 py-28 gap-8 flex flex-col">
        <DynamicFunnel />
        <LegalDisclaimerInline />
      </main>
      <SiteFooter />
    </div>
  );
}
