"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Info,
  RotateCcw,
  Send,
  Upload,
  X,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import invoicesAll from "@/data/invoices.json";
import { Pill, StatusPill } from "@/components/status-pill";
import {
  type Invoice,
  type InvoiceStatus,
  LC_OIB,
  SIX_EYES_THRESHOLD_EUR,
  TWO_FACTOR_THRESHOLD_EUR,
} from "@/lib/invoice-helpers";
import { fmtEur, fmtDate, fmtTime } from "@/lib/format";
import { generateUbl } from "@/lib/ubl";
import lcPayments from "@/data/lc-payments.json";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type LcPayment = { datum: string; iznos: number; konto_naziv: string };

const APPROVERS = [
  { id: "ana", name: "Ana Šimić", role: "Referent likvidature", initials: "AŠ" },
  { id: "mario", name: "Mario Kovač", role: "Voditelj financija", initials: "MK" },
  { id: "marija", name: "Marija Bilić", role: "Načelnik (gradonačelnik)", initials: "MB" },
];

type Tab = "pregled" | "stavke" | "ubl" | "povijest";

export function InvoiceDetailView({ invoice }: { invoice: Invoice }) {
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
  const [tab, setTab] = useState<Tab>("pregled");
  const [modal, setModal] = useState<null | "approve" | "reject">(null);
  const [approvedBy, setApprovedBy] = useState<string | null>(null);
  const [supplierSheetOpen, setSupplierSheetOpen] = useState(false);

  const needsSixEyes = invoice.iznos_bruto > SIX_EYES_THRESHOLD_EUR;
  const needsTwoFactor = invoice.iznos_bruto > TWO_FACTOR_THRESHOLD_EUR;

  const ublXml = useMemo(() => generateUbl(invoice), [invoice]);

  const fireAudit = (event: {
    action: string;
    target: string;
    meta?: string;
    kind: "ok" | "no" | "info" | "muted";
  }) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("troombic:audit:append", {
          detail: { ...event, who: "Matija Luketin", ts: new Date().toISOString() },
        })
      );
    }
  };

  const handleApprove = (who: string) => {
    setApprovedBy(who);
    setStatus("Odobreno");
    setModal(null);
    toast.success(`Račun ${invoice.id} odobren`, {
      description: needsSixEyes
        ? `Poslano na drugo oko · ${who}. Iznos ${fmtEur(invoice.iznos_bruto)}.`
        : `Iznos ${fmtEur(invoice.iznos_bruto)} uvršten u sljedeći platni nalog.`,
    });
    fireAudit({
      action: "je odobrio račun",
      target: `#${invoice.id}`,
      meta: fmtEur(invoice.iznos_bruto),
      kind: "ok",
    });
  };

  const handleReject = (reason: string) => {
    setStatus("Odbijeno");
    setModal(null);
    toast.error(`Račun ${invoice.id} odbijen`, {
      description: reason
        ? `Razlog: ${reason}. Dobavljač će biti obaviješten.`
        : "Dobavljač će biti obaviješten putem e-Računa.",
    });
    fireAudit({
      action: "je odbio račun",
      target: `#${invoice.id}`,
      meta: fmtEur(invoice.iznos_bruto),
      kind: "no",
    });
  };

  const handleReturn = () => {
    setStatus("Vraćeno na ispravak");
    toast(`Račun ${invoice.id} vraćen na ispravak`, {
      description: "Dobavljač će zaprimiti zahtjev za ispravak putem e-Računa.",
    });
    fireAudit({
      action: "je vratio račun na ispravak",
      target: `#${invoice.id}`,
      meta: fmtEur(invoice.iznos_bruto),
      kind: "muted",
    });
  };

  const isLc = invoice.supplier.oib === LC_OIB;
  const isFinal =
    status === "Odobreno" ||
    status === "Plaćeno" ||
    status === "Odbijeno";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg)] flex items-center gap-4 flex-wrap">
        <Link
          href="/likvidatura"
          className="inline-flex items-center gap-1.5 h-8 px-2 rounded-md text-[color:var(--fg-2)] hover:bg-[color:var(--surface-sunken)] text-[13px] font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Natrag
        </Link>
        <div className="w-px h-6 bg-[color:var(--border-subtle)]" />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[18px] leading-6 font-semibold text-[color:var(--fg)] font-mono">
              {invoice.id}
            </span>
            <StatusPill status={status} />
            {approvedBy && needsSixEyes && (
              <Pill kind="info" dot={false}>6 očiju · {approvedBy}</Pill>
            )}
          </div>
          <div className="text-[13px] text-[color:var(--fg-2)]">
            {invoice.supplier.naziv} · {invoice.predmet}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex flex-col items-end gap-0.5 mr-2">
          <div className="t-micro">Iznos</div>
          <span className="text-[24px] leading-[30px] font-semibold text-[color:var(--fg)] font-mono tabular-nums tracking-[-0.01em]">
            {fmtEur(invoice.iznos_bruto)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReturn}
            disabled={isFinal}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[color:var(--surface)] text-[color:var(--fg)] border border-[color:var(--border-strong)] text-[13px] font-medium hover:bg-[color:var(--surface-sunken)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="size-3.5" /> Vrati na ispravak
          </button>
          <button
            type="button"
            onClick={() => setModal("reject")}
            disabled={isFinal}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[color:var(--surface)] text-[color:var(--danger)] border border-[color:var(--danger)]/30 text-[13px] font-medium hover:bg-[color:var(--danger-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="size-3.5" /> Odbij
          </button>
          <button
            type="button"
            onClick={() => setModal("approve")}
            disabled={status === "Odobreno" || status === "Plaćeno"}
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] text-[13px] font-semibold hover:bg-[color:var(--brand-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="size-3.5" />
            {status === "Odobreno" || status === "Plaćeno" ? "Odobreno" : "Odobri"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 lg:px-8 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg)] flex gap-1 sticky top-0 z-10">
        <TabBtn id="pregled" active={tab} onClick={setTab}>
          Pregled
        </TabBtn>
        <TabBtn id="stavke" active={tab} onClick={setTab}>
          Stavke <Badge>{invoice.linije?.length ?? 1}</Badge>
        </TabBtn>
        <TabBtn id="ubl" active={tab} onClick={setTab}>
          UBL XML
        </TabBtn>
        <TabBtn id="povijest" active={tab} onClick={setTab}>
          Povijest
        </TabBtn>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 p-6 lg:p-8">
        {/* LEFT — tab content */}
        <div className="flex flex-col gap-4 min-w-0">
          {tab === "pregled" && <PregledTab invoice={invoice} />}
          {tab === "stavke" && <StavkeTab invoice={invoice} />}
          {tab === "ubl" && <UblTab xml={ublXml} invoice={invoice} />}
          {tab === "povijest" && <PovijestTab invoice={invoice} status={status} approvedBy={approvedBy} />}
        </div>

        {/* RIGHT — sticky workflow rail */}
        <div className="flex flex-col gap-4">
          <SupplierCard
            invoice={invoice}
            isLc={isLc}
            onOpenHistory={() => setSupplierSheetOpen(true)}
          />
          <KontroleCard invoice={invoice} needsSixEyes={needsSixEyes} needsTwoFactor={needsTwoFactor} />
          <KnjizenjeCard invoice={invoice} />
        </div>
      </div>

      <Sheet open={supplierSheetOpen} onOpenChange={setSupplierSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[440px] p-0 bg-[color:var(--surface)] border-l border-[color:var(--border-subtle)]"
        >
          <SupplierSheetBody invoice={invoice} isLc={isLc} />
        </SheetContent>
      </Sheet>

      <ApproveDialog
        open={modal === "approve"}
        onOpenChange={(o) => setModal(o ? "approve" : null)}
        invoice={invoice}
        needsSixEyes={needsSixEyes}
        needsTwoFactor={needsTwoFactor}
        onConfirm={handleApprove}
      />
      <RejectDialog
        open={modal === "reject"}
        onOpenChange={(o) => setModal(o ? "reject" : null)}
        invoice={invoice}
        onConfirm={handleReject}
      />
    </div>
  );
}

/* ============================== Tabs ============================== */

function TabBtn({
  id,
  active,
  onClick,
  children,
}: {
  id: Tab;
  active: Tab;
  onClick: (id: Tab) => void;
  children: React.ReactNode;
}) {
  const isActive = active === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "h-11 px-3.5 inline-flex items-center gap-2 text-[13px] font-medium border-b-2 -mb-px transition-colors",
        isActive
          ? "text-[color:var(--fg)] border-[color:var(--brand)]"
          : "text-[color:var(--fg-2)] border-transparent hover:text-[color:var(--fg)]"
      )}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[color:var(--surface-sunken)] text-[color:var(--fg-2)] font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
      {children}
    </span>
  );
}

/* ============================== Tab: Pregled ============================== */

function PregledTab({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="t-micro mb-4">Osnovni podaci</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Broj računa (dobavljač)" value={invoice.id} mono />
          <Field label="Ulazni broj" value={invoice.ulazni_broj} mono />
          <Field label="Datum izdavanja" value={fmtDate(invoice.datum_izdavanja)} mono />
          <Field label="Datum zaprimanja" value={fmtDate(invoice.datum_primitka)} mono />
          <Field label="Rok plaćanja" value={fmtDate(invoice.rok_placanja)} mono />
          <Field
            label="OIB dobavljača"
            value={invoice.supplier.oib}
            mono
          />
          <Field
            label="IBAN dobavljača"
            value={invoice.supplier.iban || "—"}
            mono
          />
          <Field
            label="Šifra ugovora"
            value={invoice.po_match.ugovor_id ?? "Nema ugovora"}
            mono
          />
        </div>
      </Card>

      <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="t-micro mb-4">Sažetak iznosa</div>
        <table className="w-full border-collapse">
          <tbody>
            <SumRow label="Osnovica" val={invoice.iznos_neto} />
            <SumRow label={`PDV (${invoice.pdv_stopa} %)`} val={invoice.pdv_iznos} muted />
            <SumRow label="Ukupno za platiti" val={invoice.iznos_bruto} strong />
          </tbody>
        </table>
      </Card>

      {invoice.notes && (
        <Card className="p-4 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] bg-[color:var(--surface-sunken)]">
          <div className="flex items-start gap-2.5">
            <Info className="size-4 text-[color:var(--fg-3)] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[color:var(--fg-2)] leading-relaxed">
              {invoice.notes}
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)]">
        {label}
      </span>
      <div className="h-9 px-3 rounded-[8px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] flex items-center">
        <span
          className={cn(
            "text-[14px] text-[color:var(--fg)] tabular-nums truncate",
            mono ? "font-mono" : ""
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function SumRow({
  label,
  val,
  strong,
  muted,
}: {
  label: string;
  val: number;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <tr className="border-b border-[color:var(--border-subtle)] last:border-b-0">
      <td
        className={cn(
          "py-3 text-sm",
          strong ? "font-semibold text-[color:var(--fg)]" : "",
          muted ? "text-[color:var(--fg-2)]" : "text-[color:var(--fg)]"
        )}
      >
        {label}
      </td>
      <td
        className={cn(
          "py-3 text-sm text-right font-mono tabular-nums",
          strong ? "font-semibold text-[color:var(--fg)] text-[16px]" : "",
          muted ? "text-[color:var(--fg-2)]" : "text-[color:var(--fg)]"
        )}
      >
        {fmtEur(val)}
      </td>
    </tr>
  );
}

/* ============================== Tab: Stavke ============================== */

function StavkeTab({ invoice }: { invoice: Invoice }) {
  const lines = invoice.linije ?? [
    { opis: invoice.predmet, kolicina: 1, jedinica: "kom", cijena_jedinice: invoice.iznos_neto },
  ];
  return (
    <Card className="p-0 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-[color:var(--border-subtle)]">
        <div className="text-base font-semibold text-[color:var(--fg)]">Stavke računa</div>
        <Pill kind="info" dot={false}>
          {lines.length} pozicij{lines.length === 1 ? "a" : "a"}
        </Pill>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[color:var(--surface-sunken)]">
            <th className="text-left text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)] py-3 pl-5 pr-3">Opis</th>
            <th className="text-right text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)] py-3 px-3 w-20">Kol.</th>
            <th className="text-left text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)] py-3 px-3 w-20">JM</th>
            <th className="text-right text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)] py-3 px-3 w-32">Cijena</th>
            <th className="text-right text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)] py-3 pl-3 pr-5 w-32">Ukupno</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => {
            const total = l.kolicina * l.cijena_jedinice;
            return (
              <tr key={i} className="border-t border-[color:var(--border-subtle)]">
                <td className="py-3.5 pl-5 pr-3 text-sm text-[color:var(--fg)]">{l.opis}</td>
                <td className="py-3.5 px-3 text-right text-sm font-mono tabular-nums">
                  {l.kolicina}
                </td>
                <td className="py-3.5 px-3 text-sm font-mono text-[color:var(--fg-2)]">
                  {l.jedinica}
                </td>
                <td className="py-3.5 px-3 text-right text-sm font-mono tabular-nums">
                  {fmtEur(l.cijena_jedinice)}
                </td>
                <td className="py-3.5 pl-3 pr-5 text-right text-sm font-mono font-medium tabular-nums">
                  {fmtEur(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-[color:var(--surface-sunken)] border-t border-[color:var(--border-subtle)]">
            <td colSpan={4} className="py-3 pl-5 text-sm font-medium text-[color:var(--fg)]">
              Osnovica
            </td>
            <td className="py-3 pl-3 pr-5 text-right font-mono font-medium tabular-nums text-sm">
              {fmtEur(invoice.iznos_neto)}
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="py-2 pl-5 text-sm text-[color:var(--fg-2)]">
              PDV ({invoice.pdv_stopa} %)
            </td>
            <td className="py-2 pl-3 pr-5 text-right font-mono text-sm text-[color:var(--fg-2)] tabular-nums">
              {fmtEur(invoice.pdv_iznos)}
            </td>
          </tr>
          <tr className="border-t border-[color:var(--border-subtle)]">
            <td colSpan={4} className="py-3 pl-5 text-sm font-semibold text-[color:var(--fg)]">
              Ukupno
            </td>
            <td className="py-3 pl-3 pr-5 text-right font-mono font-semibold tabular-nums text-base">
              {fmtEur(invoice.iznos_bruto)}
            </td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

/* ============================== Tab: UBL ============================== */

function UblTab({ xml, invoice }: { xml: string; invoice: Invoice }) {
  return (
    <Card className="p-0 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-[color:var(--border-subtle)]">
        <FileText className="size-4 text-[color:var(--fg-2)]" />
        <div className="text-base font-semibold text-[color:var(--fg)]">
          UBL 2.1 e-Račun
        </div>
        <Pill kind="ok" dot>
          <CheckCircle2 className="size-3" /> XSD ✓ HR CIUS 2025
        </Pill>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([xml], { type: "application/xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${invoice.id}.xml`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[color:var(--surface-sunken)] text-[color:var(--fg)] text-[12px] font-medium hover:bg-[color:var(--border-subtle)] transition-colors"
        >
          <Download className="size-3.5" /> Preuzmi .xml
        </button>
      </div>
      <pre className="m-0 p-5 text-[12px] leading-[18px] font-mono text-[color:var(--fg)] bg-[color:var(--surface)] overflow-x-auto whitespace-pre">
        {xml}
      </pre>
      <div className="px-5 py-3 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] flex items-start gap-2.5">
        <Info className="size-3.5 text-[color:var(--fg-3)] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[color:var(--fg-2)] leading-relaxed">
          U produkciji se XML potpisuje FINA QSCD certifikatom (XAdES-BES) i
          podnosi na <code className="font-mono text-[11px] bg-[color:var(--surface)] px-1.5 py-0.5 rounded">api.fina.hr</code>.
          Potpis i predaja u demo prikazu su izostavljeni.
        </p>
      </div>
    </Card>
  );
}

/* ============================== Tab: Povijest ============================== */

function PovijestTab({
  invoice,
  status,
  approvedBy,
}: {
  invoice: Invoice;
  status: InvoiceStatus;
  approvedBy: string | null;
}) {
  const events: { time: string; who: string; what: string; kind: "ok" | "info" | "no" }[] = [
    { time: "09:14", who: "Sustav", what: "Račun zaprimljen putem FINA e-Račun servisa", kind: "info" },
    { time: "09:14", who: "Sustav", what: "Automatska validacija OIB-a — prošla", kind: "ok" },
    { time: "09:15", who: "Sustav", what: "Provjera duplikata u zadnjih 24 mj. — nema podudaranja", kind: "ok" },
    { time: "09:18", who: invoice.referent, what: `Dodijeljeno odobravanju · ${invoice.department}`, kind: "info" },
    ...invoice.potpisi_dani.map((p) => ({
      time: new Date(p.vrijeme).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" }),
      who: p.ime,
      what: `Potpisao kao ${p.uloga} · ${p.kanal}`,
      kind: "ok" as const,
    })),
    ...(status === "Odobreno" && approvedBy
      ? [
          {
            time: fmtTime().slice(0, 5),
            who: "Matija Luketin",
            what: `Odobrio · poslano na drugo oko (${approvedBy})`,
            kind: "ok" as const,
          },
        ]
      : []),
    ...(status === "Odbijeno"
      ? [
          {
            time: fmtTime().slice(0, 5),
            who: "Matija Luketin",
            what: "Račun odbijen · vraćen dobavljaču",
            kind: "no" as const,
          },
        ]
      : []),
  ];

  return (
    <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
      <div className="t-micro mb-4">Povijest ovog računa</div>
      <div className="flex flex-col gap-3.5">
        {events.map((h, i) => (
          <div key={i} className="grid grid-cols-[60px_1fr_auto] gap-3.5 items-start">
            <div className="font-mono text-[13px] leading-5 text-[color:var(--fg-2)] tabular-nums">
              {h.time}
            </div>
            <div>
              <div className="text-[13px] leading-[18px] font-medium text-[color:var(--fg)]">
                {h.who}
              </div>
              <div className="text-[13px] leading-[18px] text-[color:var(--fg-2)]">
                {h.what}
              </div>
            </div>
            <div>
              {h.kind === "ok" && (
                <CheckCircle2 className="size-4 text-[color:var(--success)]" />
              )}
              {h.kind === "info" && (
                <Info className="size-4 text-[color:var(--fg-3)]" />
              )}
              {h.kind === "no" && (
                <XCircle className="size-4 text-[color:var(--danger)]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== Right rail cards ============================== */

function SupplierCard({
  invoice,
  isLc,
  onOpenHistory,
}: {
  invoice: Invoice;
  isLc: boolean;
  onOpenHistory: () => void;
}) {
  const payments = lcPayments as LcPayment[];
  const lcTotal = isLc ? payments.reduce((s, p) => s + p.iznos, 0) : 0;
  const lcCount = isLc ? payments.length : 0;
  const lc2026 = isLc
    ? payments.filter((p) => p.datum.startsWith("2026")).reduce((s, p) => s + p.iznos, 0)
    : 0;

  return (
    <Card className="p-5 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
      <div className="t-micro mb-3">Dobavljač</div>
      <div className="flex items-start gap-2.5 mb-3">
        <div className="size-9 rounded-md bg-[color:var(--brand-soft)] text-[color:var(--brand)] flex items-center justify-center shrink-0">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-[color:var(--fg)] truncate">
            {invoice.supplier.naziv}
          </div>
          <div className="text-xs text-[color:var(--fg-3)] truncate">
            {invoice.supplier.mjesto} · OIB{" "}
            <span className="font-mono">{invoice.supplier.oib}</span>
          </div>
        </div>
      </div>

      {isLc && (
        <div className="rounded-md bg-[color:var(--warning-soft)] border border-[color:var(--warning)]/20 p-3 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="size-3.5 text-[color:var(--warning)]" />
            <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--warning)]">
              Historijska potrošnja
            </span>
          </div>
          <div className="text-[13px] leading-tight text-[color:var(--fg)]">
            Plaćeno ovom dobavljaču: <span className="font-mono font-semibold">{fmtEur(lcTotal)}</span>
          </div>
          <div className="text-[11px] text-[color:var(--fg-2)] mt-1">
            {lcCount} isplata · 2021–2026 · YTD: <span className="font-mono">{fmtEur(lc2026)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenHistory}
        className="inline-flex items-center gap-1.5 -ml-2 px-2 h-8 rounded-md text-[12px] font-medium text-[color:var(--brand)] hover:bg-[color:var(--brand-soft)] transition-colors"
      >
        <Eye className="size-3.5" /> Otvori povijest dobavljača
        <ChevronRight className="size-3.5" />
      </button>
    </Card>
  );
}

function SupplierSheetBody({
  invoice,
  isLc,
}: {
  invoice: Invoice;
  isLc: boolean;
}) {
  const lcPaymentsTyped = lcPayments as LcPayment[];
  const lcTotal = isLc
    ? lcPaymentsTyped.reduce((s, p) => s + p.iznos, 0)
    : 0;
  const lcCount = isLc ? lcPaymentsTyped.length : 0;
  const lc2026 = isLc
    ? lcPaymentsTyped
        .filter((p) => p.datum.startsWith("2026"))
        .reduce((s, p) => s + p.iznos, 0)
    : 0;
  const recentPayments = isLc
    ? [...lcPaymentsTyped]
        .sort((a, b) => b.datum.localeCompare(a.datum))
        .slice(0, 6)
    : [];

  const allInvoices = invoicesAll as Invoice[];
  const sameSupplier = allInvoices.filter(
    (i) => i.supplier.oib === invoice.supplier.oib
  );

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-5 border-b border-[color:var(--border-subtle)] gap-0 space-y-0">
        <div className="flex items-center justify-between">
          <Pill kind="info" dot={false}>
            Dobavljač
          </Pill>
          <SheetClose className="size-8 rounded-md flex items-center justify-center text-[color:var(--fg-2)] hover:bg-[color:var(--surface-sunken)] transition-colors">
            <X className="size-4" />
            <span className="sr-only">Zatvori</span>
          </SheetClose>
        </div>
        <SheetTitle className="text-[18px] leading-6 font-semibold text-[color:var(--fg)] mt-3">
          {invoice.supplier.naziv}
        </SheetTitle>
        <SheetDescription className="text-[13px] text-[color:var(--fg-2)] mt-1">
          {invoice.supplier.mjesto} · OIB{" "}
          <span className="font-mono">{invoice.supplier.oib}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {isLc && (
          <div className="rounded-md bg-[color:var(--warning-soft)] border border-[color:var(--warning)]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-3.5 text-[color:var(--warning)]" />
              <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--warning)]">
                Postojeća potrošnja · iTransparentnost
              </span>
            </div>
            <div className="text-[20px] leading-tight font-semibold font-mono text-[color:var(--fg)] tabular-nums">
              {fmtEur(lcTotal)}
            </div>
            <div className="text-[12px] text-[color:var(--fg-2)] mt-1.5">
              {lcCount} isplata · 2021–2026 · YTD{" "}
              <span className="font-mono font-medium">{fmtEur(lc2026)}</span>
            </div>
          </div>
        )}

        <div className="rounded-[8px] border border-[color:var(--border-subtle)] p-4">
          <div className="t-micro mb-2.5">Kontakt</div>
          <div className="flex flex-col gap-1">
            <div className="text-[13px] text-[color:var(--fg)]">
              {invoice.supplier.naziv}
            </div>
            <div className="text-[12px] text-[color:var(--fg-2)]">
              {invoice.supplier.mjesto}
            </div>
            <div className="text-[12px] font-mono text-[color:var(--fg-2)]">
              IBAN · {invoice.supplier.iban || "nedostupan"}
            </div>
          </div>
        </div>

        {isLc && recentPayments.length > 0 && (
          <div className="border-t border-[color:var(--border-subtle)] pt-4">
            <div className="t-micro mb-3">Zadnje isplate</div>
            <div className="flex flex-col gap-1.5">
              {recentPayments.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[12px] py-1.5 border-b border-dashed border-[color:var(--border-subtle)] last:border-b-0"
                >
                  <span className="font-mono text-[color:var(--fg-2)] w-20">
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
        )}

        <div className="border-t border-[color:var(--border-subtle)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="t-micro">Računi u Likvidaturi</div>
            <span className="text-[11px] font-mono text-[color:var(--fg-3)]">
              {sameSupplier.length} ukupno
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {sameSupplier.map((inv) => (
              <div
                key={inv.id}
                className={cn(
                  "flex items-center gap-2 text-[12px] py-2 px-2 rounded-md",
                  inv.id === invoice.id
                    ? "bg-[color:var(--brand-soft)]"
                    : "hover:bg-[color:var(--surface-sunken)]"
                )}
              >
                <span className="font-mono text-[color:var(--fg-2)] tabular-nums w-32 truncate">
                  {inv.id}
                </span>
                <span className="flex-1 truncate text-[color:var(--fg-2)]">
                  {inv.predmet}
                </span>
                <span className="font-mono font-medium text-[color:var(--fg)] tabular-nums">
                  {fmtEur(inv.iznos_bruto)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {!isLc && (
          <div className="rounded-md bg-[color:var(--surface-sunken)] border border-[color:var(--border-subtle)] p-4">
            <div className="text-[13px] text-[color:var(--fg-2)] leading-relaxed">
              Nema povijesti isplata u iTransparentnost ledgeru za ovog dobavljača.
              Tijek plaćanja vidljiv je samo u Likvidaturi.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KontroleCard({
  invoice,
  needsSixEyes,
  needsTwoFactor,
}: {
  invoice: Invoice;
  needsSixEyes: boolean;
  needsTwoFactor: boolean;
}) {
  return (
    <Card className="p-5 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
      <div className="t-micro mb-3">Kontrole</div>
      <ControlRow
        label="OIB validan"
        status="ok"
        detail="11 znamenki · provjera kontrolne sume"
      />
      <ControlRow
        label="Duplikat"
        status="ok"
        detail="Nema podudaranja u 24 mjeseca"
      />
      <ControlRow
        label="Proračunska linija"
        status={invoice.budget_check.ok ? "ok" : "no"}
        detail={`Konto ${invoice.budget_check.konto} · raspoloživo ${fmtEur(invoice.budget_check.preostalo)}`}
      />
      <ControlRow
        label="Limit potpisa"
        status={needsSixEyes ? "warn" : "ok"}
        detail={
          needsSixEyes
            ? `Iznos > €${SIX_EYES_THRESHOLD_EUR.toLocaleString("hr-HR")} — traži 6 očiju${needsTwoFactor ? " + 2FA" : ""}`
            : "Unutar limita pročelnika (4 oka)"
        }
      />
      <ControlRow
        label="Ugovor"
        status={invoice.po_match.matched ? "ok" : "warn"}
        detail={
          invoice.po_match.matched
            ? `Ref. ${invoice.po_match.ugovor_id}${invoice.po_match.ugovor_napomena ? ` · ${invoice.po_match.ugovor_napomena}` : ""}`
            : invoice.po_match.ugovor_napomena || "Nema povezanog ugovora"
        }
        isLast
      />
    </Card>
  );
}

function ControlRow({
  label,
  status,
  detail,
  isLast,
}: {
  label: string;
  status: "ok" | "warn" | "no";
  detail: string;
  isLast?: boolean;
}) {
  const Icon =
    status === "ok" ? CheckCircle2 : status === "warn" ? AlertTriangle : XCircle;
  const color =
    status === "ok"
      ? "text-[color:var(--success)]"
      : status === "warn"
      ? "text-[color:var(--warning)]"
      : "text-[color:var(--danger)]";
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 py-2",
        !isLast && "border-b border-dashed border-[color:var(--border-subtle)]"
      )}
    >
      <Icon className={cn("size-4 mt-0.5 shrink-0", color)} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-[18px] font-medium text-[color:var(--fg)]">
          {label}
        </div>
        <div className="text-[12px] leading-tight text-[color:var(--fg-3)] mt-0.5">
          {detail}
        </div>
      </div>
    </div>
  );
}

function KnjizenjeCard({ invoice }: { invoice: Invoice }) {
  return (
    <Card className="p-5 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
      <div className="t-micro mb-3">Knjiženje</div>
      <KV label="Konto" value={`${invoice.konto_sifra} — ${invoice.konto_naziv}`} mono />
      <KV label="Odjel" value={invoice.department} />
      <KV label="Referent" value={invoice.referent} />
      <KV label="PDV" value={`${invoice.pdv_stopa} %`} mono />
      <KV label="Valuta" value={invoice.valuta} mono isLast />
    </Card>
  );
}

function KV({
  label,
  value,
  mono,
  isLast,
}: {
  label: string;
  value: string;
  mono?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3 py-1.5",
        !isLast && "border-b border-dashed border-[color:var(--border-subtle)]"
      )}
    >
      <span className="text-[13px] leading-[18px] text-[color:var(--fg-2)]">
        {label}
      </span>
      <span
        className={cn(
          "text-[13px] leading-[18px] font-medium text-[color:var(--fg)] text-right tabular-nums",
          mono ? "font-mono" : ""
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ============================== Modals ============================== */

function ApproveDialog({
  open,
  onOpenChange,
  invoice,
  needsSixEyes,
  needsTwoFactor,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice: Invoice;
  needsSixEyes: boolean;
  needsTwoFactor: boolean;
  onConfirm: (who: string) => void;
}) {
  const [selected, setSelected] = useState<string>("mario");
  const [note, setNote] = useState("");
  const [otp, setOtp] = useState("");
  const approver = APPROVERS.find((a) => a.id === selected)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] sm:max-w-[520px] p-0 gap-0 border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]">
        <DialogHeader className="p-6 pb-4 border-b border-[color:var(--border-subtle)] gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-md bg-[color:var(--brand-soft)] text-[color:var(--brand)] flex items-center justify-center">
              <Eye className="size-4" />
            </div>
            <Pill kind="info" dot={false}>
              {needsSixEyes ? "6 očiju · drugo odobrenje" : "4 oka · prvo odobrenje"}
            </Pill>
          </div>
          <DialogTitle className="text-[20px] leading-7 font-semibold tracking-[-0.01em] text-[color:var(--fg)]">
            {needsSixEyes
              ? "Pošalji račun na drugo oko"
              : "Odobri račun"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[color:var(--fg-2)] leading-5">
            {needsSixEyes ? (
              <>
                Iznos <span className="font-mono font-medium text-[color:var(--fg)]">{fmtEur(invoice.iznos_bruto)}</span> premašuje
                limit pročelnika (€{SIX_EYES_THRESHOLD_EUR.toLocaleString("hr-HR")}). Drugi kontrolor mora potvrditi odobrenje.
              </>
            ) : (
              <>
                Iznos <span className="font-mono font-medium text-[color:var(--fg)]">{fmtEur(invoice.iznos_bruto)}</span>{" "}
                spada pod limit pročelnika. Vaš potpis je dovoljan za uvrštavanje u sljedeći platni nalog.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-3.5">
          {needsSixEyes && (
            <>
              <span className="t-micro">Odaberi drugog kontrolora</span>
              <div className="flex flex-col gap-2">
                {APPROVERS.map((a) => (
                  <ApproverOption
                    key={a.id}
                    approver={a}
                    selected={selected === a.id}
                    onClick={() => setSelected(a.id)}
                  />
                ))}
              </div>
            </>
          )}

          {needsTwoFactor && (
            <label className="flex flex-col gap-1.5 mt-1">
              <span className="text-[12px] font-medium text-[color:var(--fg-2)]">
                2FA kod (SMS) · iznos &gt; €{TWO_FACTOR_THRESHOLD_EUR.toLocaleString("hr-HR")}
              </span>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="6 znamenki"
                inputMode="numeric"
                className="h-10 px-3 rounded-[8px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[14px] font-mono tabular-nums tracking-[0.3em] text-[color:var(--fg)] outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30"
                maxLength={6}
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5 mt-1">
            <span className="text-[12px] font-medium text-[color:var(--fg-2)]">
              Napomena (opcionalno)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Npr. 'molim provjeru ponude — okvirni sporazum istječe'"
              rows={3}
              className="p-3 rounded-[8px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[13px] leading-[18px] text-[color:var(--fg)] outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 resize-y min-h-[68px]"
            />
          </label>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] rounded-b-[12px] flex-row sm:justify-between gap-2">
          <span className="text-[12px] text-[color:var(--fg-3)] hidden sm:inline">
            Audit log ažuriran u sustavu.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center h-9 px-4 rounded-full text-[color:var(--fg-2)] hover:bg-[color:var(--surface)] text-[13px] font-medium transition-colors"
            >
              Odustani
            </button>
            <button
              type="button"
              onClick={() =>
                onConfirm(needsSixEyes ? approver.name : "Matija Luketin")
              }
              disabled={needsTwoFactor && otp.length < 6}
              className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] text-[13px] font-semibold hover:bg-[color:var(--brand-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {needsSixEyes ? (
                <>
                  <Send className="size-3.5" /> Pošalji na {approver.initials}
                </>
              ) : (
                <>
                  <Check className="size-3.5" /> Potvrdi odobrenje
                </>
              )}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApproverOption({
  approver,
  selected,
  onClick,
}: {
  approver: { id: string; name: string; role: string; initials: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-[8px] border text-left transition-colors",
        selected
          ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]"
          : "border-[color:var(--border-subtle)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-sunken)]"
      )}
    >
      <div className="size-8 rounded-full bg-[color:var(--brand)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
        {approver.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[color:var(--fg)] truncate">
          {approver.name}
        </div>
        <div className="text-xs text-[color:var(--fg-3)] truncate">
          {approver.role}
        </div>
      </div>
      <div
        className={cn(
          "size-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
          selected
            ? "border-[color:var(--brand)] bg-[color:var(--brand)]"
            : "border-[color:var(--border-strong)] bg-transparent"
        )}
      >
        {selected && <span className="size-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function RejectDialog({
  open,
  onOpenChange,
  invoice,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice: Invoice;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] sm:max-w-[460px] p-0 gap-0 border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]">
        <DialogHeader className="p-6 pb-2 gap-2">
          <div className="size-10 rounded-full bg-[color:var(--danger-soft)] text-[color:var(--danger)] flex items-center justify-center mb-2">
            <X className="size-4" />
          </div>
          <DialogTitle className="text-[20px] leading-7 font-semibold text-[color:var(--fg)]">
            Odbij račun
          </DialogTitle>
          <DialogDescription className="text-sm text-[color:var(--fg-2)] leading-5">
            Račun <b className="font-mono text-[color:var(--fg)]">{invoice.id}</b> bit će vraćen
            dobavljaču s obrazloženjem. Akcija je nepovratna.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[color:var(--fg-2)]">
              Razlog odbijanja
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Npr. 'dvostruka prijava — vidi RAC-2026-0997'"
              className="p-3 rounded-[8px] border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[13px] leading-[18px] text-[color:var(--fg)] outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 resize-y min-h-[80px]"
            />
          </label>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] rounded-b-[12px] flex-row justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center h-9 px-4 rounded-full text-[color:var(--fg-2)] hover:bg-[color:var(--surface)] text-[13px] font-medium transition-colors"
          >
            Odustani
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-[color:var(--danger)] text-white text-[13px] font-semibold hover:bg-[color:var(--danger)]/90 transition-colors"
          >
            <X className="size-3.5" /> Odbij račun
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
