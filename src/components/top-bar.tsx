"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  History,
  LogOut,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmtTime } from "@/lib/format";

const titles: Record<string, string> = {
  "/dashboard": "Nadzorna ploča",
  "/likvidatura": "Likvidatura",
  "/natjecaji": "Natječaji",
  "/eracun": "e-Račun",
  "/riznica": "Riznica",
  "/joppd": "JOPPD",
};

function openAuditPanel() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("troombic:audit:open"));
  }
}

function toggleTheme(current: "dark" | "light", set: (v: "dark" | "light") => void) {
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", next === "dark");
  document.documentElement.dataset.theme = next;
  localStorage.setItem("troombic:theme", next);
  set(next);
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [now, setNow] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [auditPulse, setAuditPulse] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setNow(fmtTime(new Date()));
    const t = setInterval(() => setNow(fmtTime(new Date())), 1000);
    const stored = localStorage.getItem("troombic:theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
    const pulseHandler = () => {
      setAuditPulse(true);
      setTimeout(() => setAuditPulse(false), 2400);
    };
    window.addEventListener("troombic:audit:pulse", pulseHandler);
    return () => {
      clearInterval(t);
      window.removeEventListener("troombic:audit:pulse", pulseHandler);
    };
  }, []);

  const title =
    titles[pathname] ??
    titles[Object.keys(titles).find((k) => pathname.startsWith(k)) ?? ""] ??
    "Troombic";

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg)]/90 backdrop-blur px-4 flex items-center gap-3">
      <SidebarTrigger className="-ml-1" />
      <div className="text-sm font-semibold text-[color:var(--fg)] hidden sm:block">
        {title}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = search.trim();
          if (q.length === 0) return;
          router.push(`/likvidatura?q=${encodeURIComponent(q)}`);
        }}
        className="flex-1 max-w-[480px] ml-4 relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[color:var(--fg-3)] pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži račune, dobavljače, natječaje…"
          className="w-full h-9 pl-9 pr-12 rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-[13px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-3)] outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 transition-all"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[color:var(--fg-3)] border border-[color:var(--border-subtle)] rounded px-1.5 py-0.5 hidden md:inline">
          ⌘ K
        </span>
      </form>

      <div className="flex-1" />

      <div className="hidden md:flex font-mono text-[12px] tabular-nums text-[color:var(--fg-2)] min-w-[80px] text-right pr-2">
        {now || "—"}
      </div>

      <NotificationsBell />
      <IconBtn
        icon={History}
        onClick={openAuditPanel}
        title="Dnevnik aktivnosti"
        pulse={auditPulse}
      />
      <IconBtn
        icon={theme === "dark" ? Sun : Moon}
        onClick={() => toggleTheme(theme, setTheme)}
        title="Tema"
      />

      <div className="w-px h-6 bg-[color:var(--border-subtle)] mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger className="hidden sm:flex items-center gap-2.5 h-10 px-2 rounded-md hover:bg-[color:var(--surface-sunken)] transition-colors data-[popup-open]:bg-[color:var(--surface-sunken)] cursor-pointer">
          <div className="size-8 rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] flex items-center justify-center text-xs font-semibold">
            ML
          </div>
          <div className="flex flex-col leading-tight text-left">
            <span className="text-[12px] font-medium text-[color:var(--fg)]">
              Matija Luketin
            </span>
            <span className="text-[10px] text-[color:var(--fg-3)] mt-0.5">
              Voditelj likvidature
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[260px]">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)]">
            Sesija
          </DropdownMenuLabel>
          <DropdownMenuItem disabled className="opacity-100">
            <Clock className="size-4 text-[color:var(--fg-3)]" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-[color:var(--fg)]">
                NIAS sesija aktivna
              </span>
              <span className="text-[11px] text-[color:var(--fg-3)]">
                ističe za 4h · auto-obnavljanje
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="opacity-100">
            <CheckCircle2 className="size-4 text-[color:var(--success)]" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-[color:var(--fg)]">
                e-Građanin · razina 4
              </span>
              <span className="text-[11px] text-[color:var(--fg-3)]">
                pristup financijskim modulima
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/" />}>
            <LogOut /> Odjava
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function NotificationsBell() {
  const items = [
    {
      kind: "warn" as const,
      icon: AlertTriangle,
      title: "INV-2026-0143 čeka 6 očiju",
      sub: "Konstruktor · €127.500,00 · iznos > €5.000",
    },
    {
      kind: "info" as const,
      icon: Clock,
      title: "Riznica · Q2 izvještaj",
      sub: "Rok 30. 6. 2026. · još 45 dana",
    },
    {
      kind: "ok" as const,
      icon: CheckCircle2,
      title: "JOPPD · sljedeća predaja",
      sub: "20. 5. 2026. · obrazac u pripremi",
    },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Obavijesti"
        className="relative size-9 rounded-[8px] flex items-center justify-center text-[color:var(--fg-2)] hover:bg-[color:var(--surface-sunken)] hover:text-[color:var(--fg)] data-[popup-open]:bg-[color:var(--surface-sunken)] transition-colors cursor-pointer"
      >
        <Bell className="size-4" />
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[color:var(--accent-teal)] ring-2 ring-[color:var(--bg)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[320px] max-w-[360px]">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)] flex items-center justify-between">
          <span>Obavijesti</span>
          <span className="font-mono normal-case tracking-normal text-[color:var(--fg-3)]">
            3 nove
          </span>
        </DropdownMenuLabel>
        {items.map((n, i) => {
          const Icon = n.icon;
          const color =
            n.kind === "warn"
              ? "text-[color:var(--warning)]"
              : n.kind === "ok"
              ? "text-[color:var(--success)]"
              : "text-[color:var(--info)]";
          return (
            <DropdownMenuItem key={i} className="items-start gap-2.5 py-2.5">
              <Icon className={"size-4 mt-0.5 shrink-0 " + color} />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[12px] font-medium text-[color:var(--fg)] truncate">
                  {n.title}
                </span>
                <span className="text-[11px] text-[color:var(--fg-3)] truncate">
                  {n.sub}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[12px] text-[color:var(--fg-2)] justify-center">
          Sve obavijesti →
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IconBtn({
  icon: Icon,
  badge,
  onClick,
  title,
  pulse,
}: {
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
  onClick?: () => void;
  title?: string;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      type="button"
      className={
        "relative size-9 rounded-[8px] flex items-center justify-center text-[color:var(--fg-2)] hover:bg-[color:var(--surface-sunken)] hover:text-[color:var(--fg)] transition-colors " +
        (pulse ? "ring-2 ring-[color:var(--accent-teal)] ring-offset-2 ring-offset-[color:var(--bg)] animate-pulse" : "")
      }
    >
      <Icon className="size-4" />
      {badge && (
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[color:var(--accent-teal)] ring-2 ring-[color:var(--bg)]" />
      )}
      {pulse && (
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[color:var(--accent-teal)] ring-2 ring-[color:var(--bg)]" />
      )}
    </button>
  );
}
