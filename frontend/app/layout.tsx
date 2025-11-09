import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bhagavad Gita AI Assistant - Enterprise Spiritual Intelligence Platform",
  description: "Professional AI-powered spiritual guidance system providing intelligent answers from the Bhagavad Gita with advanced analytics and real-time insights.",
  keywords: "Bhagavad Gita, AI Assistant, Spiritual Intelligence, Krishna, Arjuna, Hindu Philosophy, Sanskrit Wisdom",
  authors: [{ name: "DivyaVaani AI" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gradient-to-br from-orange-50 via-white to-blue-50 text-slate-900 min-h-screen relative overflow-x-hidden">
        {/* Spiritual background pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Sacred geometry overlay */}
        <div className="fixed inset-0 opacity-3 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="sacred-geometry" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#f97316" opacity="0.1"/>
                <circle cx="10" cy="10" r="8" fill="none" stroke="#f97316" strokeWidth="0.2" opacity="0.05"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sacred-geometry)" />
          </svg>
        </div>

        {children}
      </body>
    </html>
  );
}
