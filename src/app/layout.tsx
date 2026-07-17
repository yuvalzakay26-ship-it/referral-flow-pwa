import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_SUBTITLE, APP_URL } from "@/config/app";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} · ${APP_SUBTITLE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "ReferralFlow — מערכת ניהול פרטית (CRM) להפניות עובדים, לשימוש המנהל בלבד.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/icons/apple-icon.png",
  },
};

// `themeColor` is intentionally absent: the appearance is a client preference,
// so THEME_INIT_SCRIPT owns the theme-color meta tag and keeps it in sync with
// the selected mode. Declaring it here too would emit a second, stale tag.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={heebo.variable}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored appearance during parsing, before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
