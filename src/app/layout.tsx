import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Promo Oeiras", template: "%s | Promo Oeiras" }, description: "Oportunidades para profissionais e talentos para empresas." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
