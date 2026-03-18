import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/providers";
import type { LocaleCode } from "@/lib/locale";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NidaAly | Official eStore",
  description: "Luxury Pakistani fashion by NidaAly. Shop the latest collections of bridal, formal, pret, and luxury wear.",
  icons: {
    icon: "/logo.webp",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as LocaleCode) ?? "pk";

  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased font-sans`}>
        <Providers locale={locale}>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
