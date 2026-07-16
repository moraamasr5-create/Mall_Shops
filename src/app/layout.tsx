import type { Metadata } from "next";
import "@/portal/styles/portal.css";

export const metadata: Metadata = {
  title: "مول شوبس — المالك",
  description: "بوابة مالك الصالون",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}
