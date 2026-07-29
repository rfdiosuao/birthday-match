import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "今年我想好好过生日",
    template: "%s｜今年我想好好过生日",
  },
  description: "找到同一座城市、同一天生日，也想认真庆祝的人。双方同意后，再交换联系方式。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "今年我想好好过生日",
    description: "把一个人的生日，过成一群人的 Happy Day。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
