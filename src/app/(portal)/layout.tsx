"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/portal/components/AppShell";
import { PortalProvider } from "@/portal/session/PortalProvider";
import "@/portal/styles/portal.css";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalProvider>
      <AppShell>{children}</AppShell>
    </PortalProvider>
  );
}
