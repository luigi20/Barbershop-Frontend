import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CurrentUserProvider } from "@/hooks/use-current-user";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <CurrentUserProvider>
      <DashboardShell>{children}</DashboardShell>
    </CurrentUserProvider>
  );
}
