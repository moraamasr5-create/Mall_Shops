import type { Metadata, Viewport } from "next";
import "@/portal/styles/portal.css";

export const metadata: Metadata = {
  title: "مول شوبس — المالك",
  description: "بوابة مالك الصالون",
};

/** A7: mobile-usable §4 screens — device-width viewport (presentation constraint). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}
