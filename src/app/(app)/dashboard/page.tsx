import Link from "next/link";
import { Card } from "@/components/ui/card";
import invoices from "@/data/invoices.json";
import { fmtEur, fmtDate } from "@/lib/format";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Gavel,
  Inbox,
  Timer,
} from "lucide-react";

type Invoice = {
  id: string;
  ulazni_broj: string;
  supplier: { naziv: string; oib: string };
  predmet: string;
  iznos_bruto: number;
  rok_placanja: string;
  status: string;
  ceka_dana: number;
};

const WAITING_STATUSES = ["Novi", "U pregledu"];

// YTD throughput — believable monthly invoice processing pattern.
// Approx. matches Riznica's used-budget figure (~€8.4M Q2).
const MONTHLY_PROCESSED = [
  { month: "01", value: 1_120_000 },
  { month: "02", value: 980_000 },
  { month: "03", value: 1_410_000 },
  { month: "04", value: 1_540_000 },
  { month: "05", value: 1_260_483 },
];

export default function DashboardPage() {
  const all = invoices as Invoice[];
  const pending = all.filter((i) => WAITING_STATUSES.includes(i.status));
  const pendingSum = pending.reduce((s, i) => s + i.iznos_bruto, 0);
  const oldestWait = pending.reduce((m, i) => Math.max(m, i.ceka_dana), 0);
  const urgent = pending.filter((i) => i.ceka_dana >= 7).length;

  // YTD processed
  const processedYtd = MONTHLY_PROCESSED.reduce((s, m) => s + m.value, 0);
  const processedMay = MONTHLY_PROCESSED[MONTHLY_PROCESSED.length - 1].value;
  const processedApr = MONTHLY_PROCESSED[MONTHLY_PROCESSED.length - 2].value;
  const monthOverMonth = ((processedMay - processedApr) / processedApr) * 100;
  const invoiceCountYtd = 312;

  // budget mock
  const budgetPlanQ2 = 12_340_000;
  const budgetUsedYTD = 8_430_000;
  const budgetPct = (budgetUsedYTD / budgetPlanQ2) * 100;

  return (
    <div className="flex flex-col gap-5 p-3 sm:p-6 lg:p-8 min-w-0">
      {/* Greeting */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.015em] text-[color:var(--fg)] m-0">
          Dobro jutro, Matija.
        </h1>
        <span className="text-sm text-[color:var(--fg-2)]">
          {fmtDate(new Date())}
        </span>
      </div>

      {/* Hero row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending tile (spans 1.4fr in design, we approximate) */}
        <Card className="md:col-span-1 p-5 sm:p-7 relative overflow-hidden flex flex-col gap-3.5 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] min-w-0">
          <div className="t-micro">U redu čekanja</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[44px] leading-[44px] sm:text-[56px] sm:leading-[56px] font-semibold tracking-[-0.03em] text-[color:var(--fg)] tabular-nums">
              {pending.length}
            </span>
            <span className="text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-medium text-[color:var(--fg-2)]">
              računa čeka vašu provjeru
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 mt-1">
            <Metric label="Ukupna vrijednost" value={fmtEur(pendingSum)} mono />
            <Metric label="Najstariji" value={`${oldestWait} dana`} />
            <Metric label="Hitno" value={String(urgent)} highlight />
          </div>
          <div className="flex gap-2 mt-2">
            <Link
              href="/likvidatura"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] text-[13px] font-medium hover:bg-[color:var(--brand-hover)] transition-colors"
            >
              Pregledaj queue <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Card>

        {/* Processed-throughput tile */}
        <Card className="p-6 flex flex-col gap-2.5 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] min-w-0 overflow-hidden">
          <div className="t-micro">Obrađeno · YTD 2026</div>
          <div className="text-[30px] leading-[38px] font-semibold tracking-[-0.02em] text-[color:var(--fg)] tabular-nums truncate">
            {fmtEur(processedYtd)}
          </div>
          <div className="flex items-center justify-between text-[12px] leading-4">
            <span className="text-[color:var(--fg-2)]">
              {invoiceCountYtd}&nbsp;računa
            </span>
            <span
              className={
                "font-medium tabular-nums " +
                (monthOverMonth >= 0
                  ? "text-[color:var(--success)]"
                  : "text-[color:var(--danger)]")
              }
            >
              {monthOverMonth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(monthOverMonth).toFixed(1).replace(".", ",")}&nbsp;% vs.
              travanj
            </span>
          </div>
          <Sparkline
            values={MONTHLY_PROCESSED.map((m) => m.value / 1000)}
          />
        </Card>

        {/* Budget tile */}
        <Card className="p-6 flex flex-col gap-3 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
          <div className="t-micro">Stanje proračuna · Q2</div>
          <div className="text-[32px] leading-[40px] font-semibold tracking-[-0.02em] text-[color:var(--fg)] tabular-nums">
            {budgetPct.toFixed(1).replace(".", ",")}{" "}
            <span className="text-[18px] leading-[24px] font-medium text-[color:var(--fg-2)]">
              %
            </span>
          </div>
          <div className="h-2 bg-[color:var(--surface-sunken)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[color:var(--brand)]"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-[color:var(--fg-2)]">
            <span>Iskorišteno: {fmtEur(budgetUsedYTD)}</span>
            <span>Plan: {fmtEur(budgetPlanQ2)}</span>
          </div>
        </Card>
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="e-Račun zaprimljeno (danas)"
          value="42"
          delta="+8"
          kind="ok"
          icon={Inbox}
        />
        <MiniStat
          label="Otvoreni natječaji"
          value="7"
          delta="2 zatvaraju se"
          kind="warn"
          icon={Gavel}
        />
        <MiniStat
          label="Dobavljači u sustavu"
          value="1.184"
          delta="+12 ovaj mjesec"
          kind="ok"
          icon={Building2}
        />
        <MiniStat
          label="Prosj. vrijeme obrade"
          value="2,4 dana"
          delta="↓ 0,6 d"
          kind="ok"
          icon={Timer}
        />
      </div>

      {/* Pending preview list */}
      <Card className="p-0 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-[color:var(--border-subtle)]">
          <div className="text-base font-semibold text-[color:var(--fg)]">
            Računi koji čekaju
          </div>
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[color:var(--warning-soft)] text-[color:var(--warning)] text-[10px] font-bold uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-[color:var(--warning)]" />
            {pending.length} otvoreno
          </span>
          <div className="flex-1" />
          <Link
            href="/likvidatura"
            className="text-[13px] font-medium text-[color:var(--fg-2)] hover:text-[color:var(--brand)] inline-flex items-center gap-1.5 transition-colors"
          >
            Otvori sve <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <tbody>
            {pending.map((inv, i) => (
              <tr
                key={inv.id}
                className={
                  "hover:bg-[color:var(--surface-sunken)] transition-colors " +
                  (i === pending.length - 1
                    ? ""
                    : "border-b border-[color:var(--border-subtle)]")
                }
              >
                <td className="px-5 py-3.5 w-[35%]">
                  <Link
                    href={`/likvidatura/${inv.id}`}
                    className="block"
                  >
                    <div className="text-sm font-medium text-[color:var(--fg)] truncate">
                      {inv.supplier.naziv}
                    </div>
                    <div className="text-xs text-[color:var(--fg-3)] truncate mt-0.5">
                      {inv.predmet}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3.5 font-mono text-[13px] text-[color:var(--fg-2)] tabular-nums">
                  {inv.id}
                </td>
                <td className="px-5 py-3.5 font-mono text-sm font-medium text-[color:var(--fg)] tabular-nums text-right">
                  {fmtEur(inv.iznos_bruto)}
                </td>
                <td className="px-5 py-3.5 font-mono text-[13px] text-[color:var(--fg-2)] tabular-nums">
                  {fmtDate(inv.rok_placanja)}
                </td>
                <td className="px-5 py-3.5 text-right w-px">
                  <Link href={`/likvidatura/${inv.id}`}>
                    <ChevronRight className="size-4 text-[color:var(--fg-3)]" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[12px] leading-4 text-[color:var(--fg-3)]">
        {label}
      </span>
      <span
        className={
          "text-[16px] leading-5 font-semibold tabular-nums " +
          (mono ? "font-mono " : "") +
          (highlight
            ? "text-[color:var(--accent-teal)]"
            : "text-[color:var(--fg)]")
        }
      >
        {value}
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
  delta,
  kind,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  kind: "ok" | "warn" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const deltaColor =
    kind === "ok"
      ? "text-[color:var(--success)]"
      : kind === "warn"
      ? "text-[color:var(--warning)]"
      : "text-[color:var(--fg-2)]";
  return (
    <Card className="p-4 flex flex-col gap-2 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <span className="size-7 rounded-md bg-[color:var(--brand-soft)] text-[color:var(--brand)] inline-flex items-center justify-center">
          <Icon className="size-3.5" />
        </span>
        <span className="text-xs text-[color:var(--fg-2)]">{label}</span>
      </div>
      <div className="text-2xl leading-7 font-semibold text-[color:var(--fg)] tabular-nums tracking-[-0.01em]">
        {value}
      </div>
      <div className={"text-xs font-medium " + deltaColor}>{delta}</div>
    </Card>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 240;
  const h = 36;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      className="block mt-1"
      aria-hidden
    >
      <path d={area} fill="var(--brand-soft)" />
      <path d={d} fill="none" stroke="var(--brand)" strokeWidth="1.5" />
    </svg>
  );
}
