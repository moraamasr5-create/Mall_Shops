import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mall Shops",
  description: "Multi-tenant multi-module Business Operating Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
