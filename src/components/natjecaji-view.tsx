"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/status-pill";
import { type Tender, type TedFetchResult } from "@/lib/ted-api";
import { fmtEur, fmtDate } from "@/lib/format";
import { LC_OIB } from "@/lib/invoice-helpers";
import lcPayments from "@/data/lc-payments.json";
import {
  Building2,
  ChevronRight,
  Gavel,
  Globe2,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type LcPayment = { datum: string; iznos: number; konto_naziv: string };

type StatusFilter = "all" | "open" | "closing" | "evaluating" | "awarded";

const STATUS_VIEW: Record<
  Tender["status"],
  { label: string; kind: "wait" | "ok" | "no" | "info" | "warn" }
> = {
  open: { label: "Otvoren", kind: "info" },
  closing: { label: "Uskoro istječe", kind: "warn" },
  evaluating: { label: "Ocjenjivanje", kind: "wait" },
  awarded: { label: "Dodijeljen", kind: "ok" },
};

const IT_CPV_PREFIXES = ["48", "72", "30"];
const isItCpv = (cpv: string) => IT_CPV_PREFIXES.some((p) => cpv.startsWith(p));

export function NatjecajiView({ result }: { result: TedFetchResult }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [itOnly, setItOnly] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Tender | null>(null);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return result.tenders.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (itOnly && !isItCpv(t.cpv)) return false;
      if (qLower) {
        const hay = `${t.title} ${t.publication_number} ${t.category} ${t.vendor ?? ""}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      return true;
    });
  }, [result.tenders, filter, itOnly, q]);

  return (
    <div className="flex flex-col gap-5 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.015em] text-[color:var(--fg)] m-0">
              Natječaji
            </h1>
            {result.source === "live" ? (
              <Pill kind="ok" dot>
                <Globe2 className="size-3" /> Uživo · TED API
              </Pill>
            ) : (
              <Pill kind="info" dot>
                <RefreshCw className="size-3" /> Lokalni snapshot
              </Pill>
            )}
          </div>
          <p className="text-sm text-[color:var(--fg-2)]">
            Javna nabava Grada Splita · izvor: <code className="font-mono text-[11px] bg-[color:var(--surface-sunken)] px-1.5 py-0.5 rounded">api.ted.europa.eu</code>{" "}
            (verificirano · zadnja sinkronizacija {fmtDate(result.fetched_at)})
          </p>
          {result.note && (
            <p className="text-[11px] text-[color:var(--fg-3)] mt-1">
              {result.note}
            </p>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {(Object.keys(STATUS_VIEW) as Tender["status"][])
          .map((s) => ({ key: s, ...STATUS_VIEW[s] }))
          .map((s) => {
            const count = result.tenders.filter((t) => t.status === s.key).length;
            const active = filter === s.key;
            return (
              <FilterPill
                key={s.key}
                label={s.label}
                count={count}
                active={active}
                onClick={() => setFilter(active ? "all" : s.key)}
              />
            );
          })}
        <div className="w-px h-6 bg-[color:var(--border-subtle)]" />
        <button
          type="button"
          onClick={() => setItOnly((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 h-8 px-3.5 rounded-full border text-[12px] font-medium transition-colors",
            itOnly
              ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
              : "border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--surface-sunken)]"
          )}
        >
          <Sparkles className="size-3.5" /> Samo IT
        </button>
        <div className="flex-1 min-w-[80px]" />
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[color:var(--fg-3)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraži naslov, broj, dobavljača…"
            className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[13px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-3)] outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 transition-all"
          />
        </div>
      </div>

      {/* Tenders table */}
      <Card className="p-0 overflow-hidden border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[color:var(--surface-sunken)] border-b border-[color:var(--border-subtle)]">
              <Th>Naslov</Th>
              <Th>CPV</Th>
              <Th align="right">Vrijednost</Th>
              <Th>Objavljen</Th>
              <Th>Rok</Th>
              <Th>Status</Th>
              <Th>Dobavljač</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const v = STATUS_VIEW[t.status];
              const isLcVendor = t.vendor_oib === LC_OIB;
              return (
                <tr
                  key={t.publication_number}
                  className={cn(
                    "hover:bg-[color:var(--surface-sunken)] transition-colors cursor-pointer",
                    i === filtered.length - 1
                      ? ""
                      : "border-b border-[color:var(--border-subtle)]"
                  )}
                  onClick={() => setSelected(t)}
                >
                  <Td>
                    <div className="text-sm font-medium text-[color:var(--fg)] line-clamp-2 max-w-[400px]">
                      {t.title}
                    </div>
                    <div className="text-xs text-[color:var(--fg-3)] mt-0.5">
                      {t.publication_number} · {t.department}
                    </div>
                  </Td>
                  <Td mono muted>
                    {t.cpv}
                    <div className="text-[11px] text-[color:var(--fg-3)] mt-0.5 truncate max-w-[160px]">
                      {t.cpv_label}
                    </div>
                  </Td>
                  <Td align="right" mono strong>
                    {t.value ? fmtEur(t.value) : <span className="text-[color:var(--fg-3)]">—</span>}
                  </Td>
                  <Td mono muted>
                    {t.publication_date ? fmtDate(t.publication_date) : "—"}
                  </Td>
                  <Td mono muted>
                    {t.deadline ? fmtDate(t.deadline) : "—"}
                  </Td>
                  <Td>
                    <Pill kind={v.kind}>{v.label}</Pill>
                  </Td>
                  <Td>
                    {t.vendor ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(t);
                        }}
                        className="inline-flex items-center gap-1.5 min-w-0"
                      >
                        <Building2
                          className={cn(
                            "size-3.5 shrink-0",
                            isLcVendor
                              ? "text-[color:var(--warning)]"
                              : "text-[color:var(--fg-3)]"
                          )}
                        />
                        <span
                          className={cn(
                            "text-[13px] truncate",
                            isLcVendor
                              ? "text-[color:var(--warning)] font-medium"
                              : "text-[color:var(--fg)]"
                          )}
                        >
                          {t.vendor}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[color:var(--fg-3)] text-[13px]">
                        nije dodijeljeno
                      </span>
                    )}
                  </Td>
                  <Td>
                    <ChevronRight className="size-4 text-[color:var(--fg-3)]" />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 px-6 text-center text-[color:var(--fg-2)]">
            Nema rezultata za zadane filtere.
          </div>
        )}
      </Card>

      <div className="flex justify-between items-center text-xs text-[color:var(--fg-2)]">
        <span>
          Prikazano {filtered.length} od {result.tenders.length} natječaja.
        </span>
        <span className="text-[11px] text-[color:var(--fg-3)]">
          <Gavel className="inline size-3 mr-1 -mt-0.5" />
          Klik na red otvara povijest dobavljača.
        </span>
      </div>

      {/* Vendor history sheet */}
      <Sheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-[440px] p-0 bg-[color:var(--surface)] border-l border-[color:var(--border-subtle)]"
        >
          {selected && <VendorSheet tender={selected} onClose={() => setSelected(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VendorSheet({ tender, onClose }: { tender: Tender; onClose: () => void }) {
  const payments = lcPayments as LcPayment[];
  const isLc = tender.vendor_oib === LC_OIB;
  const lcTotal = isLc ? payments.reduce((s, p) => s + p.iznos, 0) : 0;
  const lcCount = isLc ? payments.length : 0;
  const recentLcPayments = isLc ? [...payments].sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 5) : [];

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-5 border-b border-[color:var(--border-subtle)] gap-0 space-y-0">
        <div className="flex items-center justify-between">
          <Pill kind="info" dot={false}>Natječaj</Pill>
          <SheetClose className="size-8 rounded-md flex items-center justify-center text-[color:var(--fg-2)] hover:bg-[color:var(--surface-sunken)] transition-colors">
            <X className="size-4" />
            <span className="sr-only">Zatvori</span>
          </SheetClose>
        </div>
        <SheetTitle className="text-[18px] leading-6 font-semibold text-[color:var(--fg)] mt-3">
          {tender.title}
        </SheetTitle>
        <SheetDescription className="text-[13px] text-[color:var(--fg-2)] mt-1">
          {tender.publication_number} · {tender.department}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Vrijednost"
            value={tender.value ? fmtEur(tender.value) : "—"}
            mono
          />
          <Stat label="Ponuda" value={String(tender.bids)} />
          <Stat label="Objavljen" value={fmtDate(tender.publication_date)} />
          <Stat
            label="Rok"
            value={tender.deadline ? fmtDate(tender.deadline) : "—"}
          />
        </div>

        <div className="rounded-[8px] border border-[color:var(--border-subtle)] p-4">
          <div className="t-micro mb-2">CPV kod</div>
          <div className="font-mono text-[14px] text-[color:var(--fg)]">{tender.cpv}</div>
          <div className="text-[12px] text-[color:var(--fg-2)] mt-1">{tender.cpv_label}</div>
        </div>

        {tender.vendor ? (
          <>
            <div className="border-t border-[color:var(--border-subtle)] pt-4">
              <div className="t-micro mb-2.5">Dodijeljeno dobavljaču</div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-[color:var(--brand-soft)] text-[color:var(--brand)] flex items-center justify-center shrink-0">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[color:var(--fg)]">
                    {tender.vendor}
                  </div>
                  <div className="text-[12px] text-[color:var(--fg-3)]">
                    OIB <span className="font-mono">{tender.vendor_oib}</span>
                  </div>
                </div>
              </div>
            </div>

            {isLc ? (
              <div className="rounded-md bg-[color:var(--warning-soft)] border border-[color:var(--warning)]/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-1.5 rounded-full bg-[color:var(--warning)]" />
                  <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--warning)]">
                    Postojeća potrošnja
                  </span>
                </div>
                <div className="text-[15px] leading-tight text-[color:var(--fg)]">
                  Plaćeno ovom dobavljaču:{" "}
                  <span className="font-mono font-semibold">{fmtEur(lcTotal)}</span>
                </div>
                <div className="text-[12px] text-[color:var(--fg-2)] mt-1.5">
                  {lcCount} isplata · 2021–2026 · iTransparentnost · OIB {LC_OIB}
                </div>

                <div className="mt-4 pt-4 border-t border-[color:var(--warning)]/15">
                  <div className="t-micro mb-2">Zadnje isplate</div>
                  <div className="flex flex-col gap-1.5">
                    {recentLcPayments.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[12px]"
                      >
                        <span className="font-mono text-[color:var(--fg-2)]">
                          {p.datum}
                        </span>
                        <span className="truncate text-[color:var(--fg-2)] mx-2 flex-1">
                          {p.konto_naziv}
                        </span>
                        <span className="font-mono font-medium text-[color:var(--fg)] tabular-nums">
                          {fmtEur(p.iznos)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-[color:var(--surface-sunken)] border border-[color:var(--border-subtle)] p-4">
                <div className="text-[13px] text-[color:var(--fg-2)] leading-relaxed">
                  Nema povijesti isplata u našem sustavu za ovog dobavljača.
                  Prvi ugovor s Gradom Splitom — pratimo od dodjele.
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-md bg-[color:var(--info-soft)] border border-[color:var(--info)]/20 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Gavel className="size-3.5 text-[color:var(--info)]" />
              <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--info)]">
                Natječaj otvoren
              </span>
            </div>
            <div className="text-[13px] text-[color:var(--fg)] leading-relaxed">
              Dobavljač još nije izabran. Kad račun stigne, automatski ćemo povezati
              s ovim natječajem i prikazati povijest u Likvidaturi.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-[8px] border border-[color:var(--border-subtle)] p-3 bg-[color:var(--surface-sunken)]">
      <div className="t-micro mb-1">{label}</div>
      <div
        className={cn(
          "text-[14px] font-medium text-[color:var(--fg)] tabular-nums",
          mono ? "font-mono" : ""
        )}
      >
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
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
        "py-3.5 px-4 align-middle",
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

