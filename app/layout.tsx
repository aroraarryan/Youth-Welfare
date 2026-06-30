'use client';

import { Roboto } from "next/font/google";
import "./globals.css";
import GovHeader from "@/components/GovHeader";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ReactQueryProvider } from "@/lib/react-query";
import FloatingElements from "@/components/FloatingElements";

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <title>Youth Welfare &amp; PRD</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-roboto)]">
        <ReactQueryProvider>
        <AuthProvider>
        <LanguageProvider>
        <AccessibilityProvider>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <GovHeader />
        <MainHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />

        <FloatingElements />
        </AccessibilityProvider>
        </LanguageProvider>
        </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
