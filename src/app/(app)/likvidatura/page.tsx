"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Pill, StatusPill } from "@/components/status-pill";
import invoices from "@/data/invoices.json";
import {
  type Invoice,
  type InvoiceStatus,
  WAITING_STATUSES,
  DONE_STATUSES,
} from "@/lib/invoice-helpers";
import { fmtEur, fmtDate } from "@/lib/format";
import {
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function todo(name: string) {
  toast(name, {
    description: "Funkcija je predviđena za sljedeću fazu. U produkciji vodi do zasebnog modula.",
  });
}

type Filter = "all" | "wait" | "approved" | "paid" | "rejected" | "returned";

const FILTERS: { key: Filter; label: string; match: (s: InvoiceStatus) => boolean }[] = [
  { key: "all", label: "Sve", match: () => true },
  { key: "wait", label: "Čekaju", match: (s) => WAITING_STATUSES.includes(s) },
  { key: "approved", label: "Odobreno", match: (s) => s === "Odobreno" },
  { key: "paid", label: "Plaćeno", match: (s) => s === "Plaćeno" },
  { key: "rejected", label: "Odbijeno", match: (s) => s === "Odbijeno" },
  { key: "returned", label: "Na ispravak", match: (s) => s === "Vraćeno na ispravak" },
];

export default function LikvidaturaQueuePage() {
  return (
    <Suspense fallback={null}>
      <LikvidaturaQueueInner />
    </Suspense>
  );
}

function LikvidaturaQueueInner() {
  const all = invoices as Invoice[];
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState(initialQ);

  // Keep state in sync if URL ?q= changes while page is mounted
  useEffect(() => {
    const v = searchParams.get("q");
    if (v !== null && v !== q) setQ(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const qLower = q.trim().toLowerCase();
    return all.filter((inv) => {
      if (!f.match(inv.status)) return false;
      if (qLower) {
        const hay = `${inv.id} ${inv.ulazni_broj} ${inv.supplier.naziv} ${inv.predmet}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      return true;
    });
  }, [all, filter, q]);

  return (
    <div className="flex flex-col gap-5 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.015em] text-[color:var(--fg)] m-0">
            Likvidatura
          </h1>
          <p className="text-sm text-[color:var(--fg-2)] mt-1.5">
            Pristigli računi · obrada, kontrola i odobravanje.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => todo("Uvoz e-Računa")}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[color:var(--surface)] text-[color:var(--fg)] border border-[color:var(--border-strong)] text-[13px] font-medium hover:bg-[color:var(--surface-sunken)] transition-colors"
          >
            <Upload className="size-3.5" /> Uvezi e-Račun
          </button>
          <button
            type="button"
            onClick={() => todo("Ručni unos računa")}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] text-[13px] font-medium hover:bg-[color:var(--brand-hover)] transition-colors"
          >
            <Plus className="size-3.5" /> Novi račun
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {FILTERS.map((f) => {
          const count = all.filter((inv) => f.match(inv.status)).length;
          const active = filter === f.key;
          return (
            <FilterPill
              key={f.key}
              label={f.label}
              count={count}
              active={active}
              accent={f.key === "wait"}
              onClick={() => setFilter(f.key)}
            />
          );
        })}
        <div className="flex-1 min-w-[120px]" />
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[color:var(--fg-3)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraži po dobavljaču, broju, opisu…"
            className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[13px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-3)] outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => todo("Napredni filtri")}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-[color:var(--surface)] text-[color:var(--fg-2)] border border-[color:var(--border-strong)] text-[13px] font-medium hover:bg-[color:var(--surface-sunken)] transition-colors"
        >
          <SlidersHorizontal className="size-3.5" />
          Filtri
        </button>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[color:var(--surface-sunken)] border-b border-[color:var(--border-subtle)]">
              <Th className="w-8 pl-5"><input type="checkbox" /></Th>
              <Th>Dobavljač / opis</Th>
              <Th>Broj računa</Th>
              <Th align="right">Iznos</Th>
              <Th>Zaprimljeno</Th>
              <Th>Dospijeće</Th>
              <Th>Status</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr
                key={inv.id}
                className={cn(
                  "hover:bg-[color:var(--surface-sunken)] transition-colors",
                  i === filtered.length - 1 ? "" : "border-b border-[color:var(--border-subtle)]"
                )}
              >
                <Td className="pl-5">
                  <input
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Td>
                <Td>
                  <Link href={`/likvidatura/${inv.id}`} className="block">
                    <div className="text-sm font-medium text-[color:var(--fg)]">
                      {inv.supplier.naziv}
                    </div>
                    <div className="text-xs text-[color:var(--fg-3)] mt-0.5">
                      {inv.predmet}
                    </div>
                  </Link>
                </Td>
                <Td mono>
                  <Link href={`/likvidatura/${inv.id}`} className="block">
                    {inv.id}
                  </Link>
                </Td>
                <Td align="right" mono strong>
                  {fmtEur(inv.iznos_bruto)}
                </Td>
                <Td mono muted>
                  {fmtDate(inv.datum_primitka)}
                </Td>
                <Td mono muted>
                  {fmtDate(inv.rok_placanja)}
                </Td>
                <Td>
                  <StatusPill status={inv.status} />
                </Td>
                <Td>
                  <Link
                    href={`/likvidatura/${inv.id}`}
                    className="inline-flex"
                    aria-label="Otvori"
                  >
                    <ChevronRight className="size-4 text-[color:var(--fg-3)]" />
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 px-6 text-center text-[color:var(--fg-2)]">
            Nema rezultata. Bravo.
          </div>
        )}
      </Card>

      {/* Footer count */}
      <div className="flex justify-between items-center text-xs text-[color:var(--fg-2)]">
        <span>
          Prikazano {filtered.length} od {all.length} računa.
        </span>
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="text-[color:var(--brand)] hover:underline"
          >
            Poništi pretragu
          </button>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  accent,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 h-8 px-3.5 rounded-full border text-[12px] font-medium transition-all",
        active
          ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
          : "border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--surface-sunken)]"
      )}
    >
      {label}
      <span
        className={cn(
          "font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums",
          active
            ? "bg-[color:var(--brand)] text-white"
            : "bg-[color:var(--surface-sunken)] text-[color:var(--fg-2)]"
        )}
      >
        {count}
      </span>
      {accent && !active && (
        <span className="size-1.5 rounded-full bg-[color:var(--accent-teal)]" />
      )}
    </button>
  );
}

function Th({
  children,
  align,
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "py-3.5 px-4 text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)]",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  mono,
  strong,
  muted,
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  strong?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "py-4 px-4 align-middle",
        mono ? "font-mono" : "font-sans",
        strong ? "font-medium" : "",
        muted ? "text-[color:var(--fg-2)]" : "text-[color:var(--fg)]",
        align === "right" ? "text-right" : "text-left",
        "text-sm tabular-nums",
        className
      )}
    >
      {children}
    </td>
  );
}
