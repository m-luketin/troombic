import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { AuditLog } from "@/components/audit-log";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <div className="flex-1 px-4 md:px-6 py-6 pb-32">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </div>
        <AuditLog />
      </SidebarInset>
    </SidebarProvider>
  );
}
