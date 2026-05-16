"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BadgeCheck,
  ChevronsUpDown,
  FileText,
  Gavel,
  LayoutDashboard,
  Landmark,
  LogOut,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import invoices from "@/data/invoices.json";
import { WAITING_STATUSES, type Invoice } from "@/lib/invoice-helpers";

const waitingCount = (invoices as Invoice[]).filter((i) =>
  WAITING_STATUSES.includes(i.status)
).length;

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeAccent?: boolean;
  disabled?: boolean;
};

const primary: NavItem[] = [
  { title: "Nadzorna ploča", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Likvidatura",
    url: "/likvidatura",
    icon: Receipt,
    badge: waitingCount,
    badgeAccent: true,
  },
  { title: "Natječaji", url: "/natjecaji", icon: Gavel },
  { title: "e-Račun", url: "/eracun", icon: FileText },
  { title: "Riznica", url: "/riznica", icon: Landmark },
  { title: "JOPPD", url: "/joppd", icon: BadgeCheck, disabled: true },
];

const admin: NavItem[] = [
  { title: "Korisnici", url: "/users", icon: Users, disabled: true },
  { title: "Postavke", url: "/settings", icon: Settings, disabled: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar className="sidebar-navy-chrome">
      <SidebarHeader className="border-b border-[color:var(--border-subtle)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 py-2 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/logo-troombic.svg"
            alt=""
            width={28}
            height={28}
            priority
          />
          <span className="text-base font-semibold tracking-tight text-[color:var(--fg)]">
            troombic
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => {
                const active = pathname.startsWith(item.url) && !item.disabled;
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavRow item={item} active={active} />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.06em] uppercase font-semibold text-[color:var(--fg-2)]">
            Administracija
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {admin.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavRow item={item} active={false} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[color:var(--border-subtle)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 w-full h-12 px-2 rounded-md hover:bg-[color:var(--surface-sunken)] data-[popup-open]:bg-[color:var(--surface-sunken)] text-left transition-colors cursor-pointer"
                type="button"
              >
                <div className="size-8 rounded-full bg-white text-[#2E308C] flex items-center justify-center text-xs font-semibold shrink-0">
                  ML
                </div>
                <div className="flex flex-col leading-tight flex-1 min-w-0">
                  <span className="text-[13px] font-medium truncate text-white">
                    Matija Luketin
                  </span>
                  <span className="text-[11px] text-white/70 truncate">
                    Voditelj likvidature
                  </span>
                </div>
                <ChevronsUpDown className="size-4 ml-auto opacity-60 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="min-w-[220px]"
              >
                <DropdownMenuItem disabled>
                  <span className="text-xs text-[color:var(--fg-2)]">
                    NIAS sesija · ističe za 4h
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/" />}>
                  <LogOut /> Odjava
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const Inner = (
    <>
      <Icon className="size-4" />
      <span className="flex-1 text-left">{item.title}</span>
      {item.badge != null && (
        <span
          className={
            "ml-auto inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px] font-bold tabular-nums " +
            (item.badgeAccent
              ? "bg-[color:var(--accent-teal)] text-white"
              : "bg-[color:var(--brand-soft)] text-[color:var(--brand)]")
          }
        >
          {item.badge}
        </span>
      )}
      {item.disabled && (
        <span className="ml-auto text-[9px] uppercase tracking-[0.08em] font-bold text-white/70 bg-white/10 px-1.5 py-0.5 rounded-full">
          Uskoro
        </span>
      )}
    </>
  );

  if (item.disabled) {
    return (
      <SidebarMenuButton
        disabled
        tooltip={`${item.title} · uskoro`}
        className="cursor-not-allowed text-white/55 hover:bg-transparent hover:text-white/55 disabled:!opacity-100 aria-disabled:!opacity-100"
      >
        {Inner}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton
      isActive={active}
      tooltip={item.title}
      render={<Link href={item.url} />}
      className={
        active
          ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)] font-semibold hover:bg-[color:var(--brand-soft-hover)] hover:text-[color:var(--brand)] data-[active=true]:bg-[color:var(--brand-soft)] data-[active=true]:text-[color:var(--brand)]"
          : "text-[color:var(--fg-2)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface-sunken)]"
      }
    >
      {Inner}
    </SidebarMenuButton>
  );
}
