'use client';

import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { BackgroundController } from '@/components/ui/background-controller';
import { AppProvider } from '@/lib/context/AppContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Footer } from '@/components/layout/Footer';
import { ROUTES } from '@/lib/utils/constants';
import { AuthProvider } from '@/lib/context/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
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
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';
  const isFullscreen = pathname === '/chat' || pathname === '/voice';
  const showFooter = !isAuthPage && !isFullscreen;

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
        className="font-sans antialiased min-h-screen relative overflow-x-hidden text-foreground"
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
                      {/* Render Header Globally */}
                      <Header items={navItems} />

                      {/* AppSidebar removed to prevent double sidebar issue */}

                      <main
                        className={cn(
                          "relative z-10 transition-all duration-300",
                          isFullscreen ? "h-screen overflow-hidden" : "",
                          !isHome && !isFullscreen && "pt-20 min-h-[calc(100vh-80px)]"
                        )}
                      >
                        {children}
                      </main>

                      {showFooter && (
                        <div className="relative z-10">
                          <Footer />
                        </div>
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
