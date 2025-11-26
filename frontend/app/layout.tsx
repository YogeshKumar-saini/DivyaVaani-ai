'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AppProvider } from "@/lib/context/AppContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
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
    warning: {
      main: '#fbbf24', // amber-400
      light: '#fcd34d',
      dark: '#f59e0b',
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

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>DivyaVaani AI - AI Spiritual Companion from Universal Wisdom</title>
        <meta name="description" content="Professional AI-powered spiritual guidance system providing intelligent answers from all spiritual traditions and religious wisdom" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans antialiased min-h-screen relative overflow-x-hidden">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <ToastProvider>
              <AppProvider>
                <Header />
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
