'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { AppProvider } from "@/lib/context/AppContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ThemeProvider } from "@/components/theme-provider";
import { ROUTES } from "@/lib/utils/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const navItems = [
  { title: "Home", href: ROUTES.HOME || "/" },
  { title: "Chat", href: ROUTES.CHAT || "/chat" },
  { title: "Voice", href: ROUTES.VOICE || "/voice" },
  { title: "Analytics", href: ROUTES.ANALYTICS || "/analytics" },
  { title: "About", href: ROUTES.ABOUT || "/about" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <title>DivyaVaani AI - AI Spiritual Companion from Universal Wisdom</title>
        <meta name="description" content="Professional AI-powered spiritual guidance system providing intelligent answers from all spiritual traditions and religious wisdom" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans antialiased min-h-screen relative overflow-x-hidden bg-gradient-to-br from-indigo-100 via-white to-purple-100 text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ToastProvider>
              <AppProvider>
                <Header items={navItems} />
                {children}
                <ToastContainer />
              </AppProvider>
            </ToastProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
