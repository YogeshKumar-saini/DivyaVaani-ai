'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AppProvider } from "@/lib/context/AppContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { orange, red, blue, green } from '@mui/material/colors';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Create Material UI theme with spiritual colors
const theme = createTheme({
  palette: {
    primary: {
      main: orange[600],
      light: orange[400],
      dark: orange[800],
    },
    secondary: {
      main: blue[600],
      light: blue[400],
      dark: blue[800],
    },
    success: {
      main: green[600],
    },
    error: {
      main: red[600],
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    const checkOnline = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/health`);
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkOnline();
    const interval = setInterval(checkOnline, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>Bhagavad Gita AI - DivyaVaani</title>
        <meta name="description" content="Professional AI-powered spiritual guidance system providing intelligent answers from the Bhagavad Gita" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans antialiased min-h-screen relative overflow-x-hidden">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <AppProvider>
              <Header isOnline={isOnline} />
              {children}
            </AppProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
