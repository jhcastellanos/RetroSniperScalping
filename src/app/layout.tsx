import type { Metadata, Viewport } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import { APP_NAME, APP_SHORT_NAME, LOGO_IMAGE } from "@/lib/constants";
import { PwaRegister } from "@/components/layout/pwa-register";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_SHORT_NAME}`,
  },
  description: "Reto comunitario de crecimiento de cuentas mediante scalping.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_SHORT_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: LOGO_IMAGE,
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0E1A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeBootScript = `try{if(localStorage.getItem('snipers-theme')==='light')document.documentElement.classList.add('theme-light')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          {children}
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
