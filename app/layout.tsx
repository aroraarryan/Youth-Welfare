import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import GovHeader from "@/components/GovHeader";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Youth Welfare | Department of Youth Welfare and PRD, Uttarakhand",
  description:
    "A Single Platform for Youth of Uttarakhand to get information related to Jobs, Skill development, Vocational Training, Employment, Sports, Health and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-roboto)]">
        <AuthProvider>
        <LanguageProvider>
        <GovHeader />
        <MainHeader />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Fixed social media sidebar */}
        <div className="fixed-social-media">
          {[
            { href: 'https://facebook.com', icon: 'fab fa-facebook-f', bg: '#1877f2', title: 'Facebook' },
            { href: 'https://twitter.com',  icon: 'fab fa-twitter',    bg: '#1da1f2', title: 'Twitter' },
            { href: 'https://instagram.com',icon: 'fab fa-instagram',  bg: '#c13584', title: 'Instagram' },
            { href: 'https://youtube.com',  icon: 'fab fa-youtube',    bg: '#ff0000', title: 'YouTube' },
            { href: 'https://linkedin.com', icon: 'fab fa-linkedin-in',bg: '#0077b5', title: 'LinkedIn' },
          ].map(s => (
            <a
              key={s.title}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.title}
              className="social-icon"
              style={{ background: s.bg }}
            >
              <i className={s.icon} />
            </a>
          ))}
        </div>

        {/* Floating assistant */}
        <div className="floating-assistant">
          <div className="assistant-avatar">
            <i className="fas fa-user-tie" />
          </div>
        </div>
        </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
