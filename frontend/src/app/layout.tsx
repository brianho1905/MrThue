import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-body" });
const manrope = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-headline" });

export const metadata: Metadata = {
  title: "MrThue | Tư vấn thuế hộ kinh doanh",
  description: "Nền tảng tư vấn thuế cá nhân hóa cho hộ kinh doanh cá thể — phễu thông minh & CMS funnel.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        {/* Material Symbols — icons theo layout Stitch */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased bg-background text-on-surface`}>
        {children}
      </body>
    </html>
  );
}
