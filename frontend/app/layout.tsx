'use client';

import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { BackgroundController } from '@/components/ui/background-controller';
import { AppProvider } from '@/lib/context/AppContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';
import { ROUTES } from '@/lib/utils/constants';
import { AuthProvider } from '@/lib/context/auth-provider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePathname } from 'next/navigation';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const navItems = [
  { title: 'Home', href: ROUTES.HOME || '/' },
  { title: 'Chat', href: ROUTES.CHAT || '/chat' },
  { title: 'Voice', href: ROUTES.VOICE || '/voice' },
  { title: 'Analytics', href: ROUTES.ANALYTICS || '/analytics' },
  { title: 'About', href: ROUTES.ABOUT || '/about' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <title>DivyaVaani AI - AI Spiritual Companion from Universal Wisdom</title>
        <meta
          name="description"
          content="Professional AI-powered spiritual guidance system providing intelligent answers from all spiritual traditions and religious wisdom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`font-sans antialiased min-h-screen relative overflow-x-hidden text-foreground`}
      >
        <BackgroundController>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>

            <ErrorBoundary>
              <ToastProvider>
                <GoogleOAuthProvider
                  clientId={
                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
                    '8832500585-r2p759jqaka789gr0v2l3dnahs2rpc8c.apps.googleusercontent.com'
                  }
                >
                  <AuthProvider>
                    <AppProvider>
                      <Header items={navItems} />
                      <main className={isHome ? '' : 'premium-main'}>{children}</main>
                      {!isHome && (
                        <footer className="premium-footer">
                          <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-300">
                            <span>DivyaVaani AI • Universal Spiritual Guidance</span>
                            <span className="text-cyan-100/80">Calm UI. Fast responses. Respectful wisdom.</span>
                          </div>
                        </footer>
                      )}
                      <ToastContainer />
                    </AppProvider>
                  </AuthProvider>
                </GoogleOAuthProvider>
              </ToastProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </BackgroundController>
      </body>
    </html>
  );
}
