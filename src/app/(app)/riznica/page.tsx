"use client";

import { Card } from "@/components/ui/card";
import { Pill } from "@/components/status-pill";
import { fmtEur, fmtDate } from "@/lib/format";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  FileSpreadsheet,
  Info,
  Landmark,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

type Tx = {
  time: string;
  date: string;
  desc: string;
  amount: number;
  kind: "in" | "out";
  ref?: string;
};

const RIZNICA = {
  balance: 8_430_183.22,
  delta_24h: 124_000,
  forecast_7d: -842_000,
  budget_q2_plan: 12_340_000,
  budget_q2_used: 8_430_000,
};

const TRANSACTIONS: Tx[] = [
  { time: "13:42", date: "2026-05-16", desc: "Isplata — Promet Split d.o.o.", ref: "RAC-2026-0996", amount: -18_700.0, kind: "out" },
  { time: "13:15", date: "2026-05-16", desc: "Priliv — Porez na dohodak (TZ-2026-05)", amount: 482_300.0, kind: "in" },
  { time: "11:08", date: "2026-05-16", desc: "Isplata — HEP Elektra Split", ref: "RAC-2026-0998", amount: -947.12, kind: "out" },
  { time: "10:42", date: "2026-05-16", desc: "Priliv — Boravišna pristojba", amount: 18_420.0, kind: "in" },
  { time: "09:31", date: "2026-05-16", desc: "Isplata — Vodovod i kanalizacija", ref: "RAC-2026-0994", amount: -11_420.0, kind: "out" },
  { time: "08:55", date: "2026-05-16", desc: "Priliv — Komunalna naknada (svibanj)", amount: 64_200.0, kind: "in" },
  { time: "08:14", date: "2026-05-16", desc: "Isplata — Libusoft Cicom d.o.o.", ref: "RAC-2026-0142", amount: -22_473.7, kind: "out" },
  { time: "16:48", date: "2026-05-15", desc: "Priliv — Porez na promet nekretnina", amount: 124_800.0, kind: "in" },
];

const YEAR_BREAKDOWN: Array<{ year: string; value: number }> = [
  { year: "2021", value: 129_656.69 },
  { year: "2022", value: 245_310.02 },
  { year: "2023", value: 103_595.96 },
  { year: "2024", value: 138_549.45 },
  { year: "2025", value: 386_724.6 },
  { year: "2026", value: 253_852.35 },
];

export default function RiznicaPage() {
  const budgetPct = (RIZNICA.budget_q2_used / RIZNICA.budget_q2_plan) * 100;
  const inflow = useMemo(
    () => TRANSACTIONS.filter((t) => t.kind === "in").reduce((s, t) => s + t.amount, 0),
    []
  );
  const outflow = useMemo(
    () => TRANSACTIONS.filter((t) => t.kind === "out").reduce((s, t) => s + Math.abs(t.amount), 0),
    []
  );

  function downloadQ1Report() {
    const wb = XLSX.utils.book_new();

    // Sheet 1 — Referentna stranica (cover)
    const referent = [
      ["GRAD SPLIT — REFERENTNA STRANICA"],
      [],
      ["RKPFI · Kvartalni izvještaj"],
      ["Razdoblje", "Q2 2026 (1.4. — 30.6.2026.)"],
      ["RKPFI obveznik", "Grad Split"],
      ["OIB", "78755598868"],
      ["Šifra obveznika", "21000"],
      ["Razina", "JLP(R)S"],
      [],
      ["Stanje proračuna na kraju razdoblja", RIZNICA.balance],
      ["Iskorišteno (Q2 plan)", RIZNICA.budget_q2_used],
      ["Plan Q2 2026", RIZNICA.budget_q2_plan],
      [],
      ["Generirano (sustav Troombic)", new Date().toISOString()],
      ["Potpisuje (u produkciji)", "Pročelnik UO za financije i nabavu"],
    ];

    // Sheet 2 — PR-RAS (prihodi i rashodi sažetak)
    const prRas = [
      ["Konto", "Naziv", "Plan 2026", "Ostvareno YTD", "Indeks"],
      ["6111", "Porez na dohodak", 2_400_000, 1_482_400, 61.8],
      ["6131", "Komunalna naknada", 850_000, 386_200, 45.4],
      ["6132", "Komunalni doprinos", 420_000, 142_800, 34.0],
      ["6411", "Boravišna pristojba", 1_240_000, 318_420, 25.7],
      ["3211", "Plaće zaposlenika", 4_800_000, 1_840_000, 38.3],
      ["3223", "Energija i komunalije", 320_000, 124_000, 38.8],
      ["3231", "Usluge telefona i pošte", 28_000, 11_200, 40.0],
      ["3238", "Računalne usluge", 350_000, 253_852.35, 72.5],
      ["3239", "Licence", 80_000, 18_500, 23.1],
      ["4214", "Ulaganja u građevinske objekte", 2_800_000, 1_124_000, 40.1],
    ];

    // Sheet 3 — Obveze
    const obveze = [
      ["Datum dospijeća", "Dobavljač", "OIB", "Iznos (€)", "Status"],
      ["2026-06-13", "LIBUSOFT CICOM D.O.O.", "14506572540", 22_473.7, "U pregledu"],
      ["2026-06-09", "LIBUSOFT CICOM D.O.O.", "14506572540", 18_500.0, "Novi"],
      ["2026-05-29", "LIBUSOFT CICOM D.O.O.", "14506572540", 4_200.0, "Odobreno"],
      ["2026-06-01", "ČISTOĆA D.O.O. SPLIT", "98144078787", 1_850.0, "U pregledu"],
      ["2026-06-11", "KONSTRUKTOR INŽENJERING D.D.", "37011611388", 127_500.0, "Novi"],
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(referent), "Referentna");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prRas), "PR-RAS");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(obveze), "Obveze");

    XLSX.writeFile(wb, `Grad-Split_Q2-2026_RKPFI.xlsx`);
    toast.success("Izvještaj generiran", {
      description:
        "Datoteka je preuzeta. U produkciji se prilaže Referentna stranica i učitava na rkpfi.drzavna-riznica.hr.",
    });
  }

  return (
    <div className="flex flex-col gap-5 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.015em] text-[color:var(--fg)] m-0">
              Riznica
            </h1>
            <Pill kind="info" dot={false}>
              <Landmark className="size-3" /> MFIN · RKPFI
            </Pill>
          </div>
          <p className="text-sm text-[color:var(--fg-2)]">
            Stanje proračuna, dnevni promet, kvartalno izvještavanje za Državnu riznicu.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadQ1Report}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] text-[13px] font-semibold hover:bg-[color:var(--brand-hover)] transition-colors"
        >
          <FileSpreadsheet className="size-4" />
          Generiraj Q2 2026 izvještaj
          <Download className="size-3.5 -mr-1" />
        </button>
      </div>

      {/* Balance hero */}
      <Card className="p-7 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <div className="t-micro mb-2">Stanje proračunskog računa</div>
            <div className="text-[52px] leading-[60px] font-semibold tracking-[-0.025em] text-[color:var(--fg)] font-mono tabular-nums">
              {fmtEur(RIZNICA.balance)}
            </div>
            <div className="flex items-center gap-5 mt-3 text-[13px]">
              <div className="inline-flex items-center gap-1.5 text-[color:var(--success)] font-medium">
                <TrendingUp className="size-3.5" />
                +{fmtEur(RIZNICA.delta_24h)}{" "}
                <span className="text-[color:var(--fg-3)] font-normal">u 24 h</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[color:var(--warning)] font-medium">
                <Calendar className="size-3.5" />
                7-dnevna projekcija {fmtEur(RIZNICA.forecast_7d)}
              </div>
            </div>
          </div>

          <div className="lg:border-l lg:border-[color:var(--border-subtle)] lg:pl-8 flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <div className="t-micro">Iskorišteno Q2</div>
              <span className="text-[14px] font-mono tabular-nums text-[color:var(--fg-2)]">
                {budgetPct.toFixed(1).replace(".", ",")} %
              </span>
            </div>
            <div className="h-2 bg-[color:var(--surface-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[color:var(--brand)] transition-[width] duration-500"
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[12px] text-[color:var(--fg-2)] mt-1">
              <span className="font-mono">{fmtEur(RIZNICA.budget_q2_used)}</span>
              <span className="text-[color:var(--fg-3)]">
                od <span className="font-mono">{fmtEur(RIZNICA.budget_q2_plan)}</span>
              </span>
            </div>

            <div className="border-t border-[color:var(--border-subtle)] pt-3 mt-3 grid grid-cols-2 gap-3">
              <Metric label="Prilivi (24h)" value={fmtEur(inflow)} kind="ok" />
              <Metric label="Odlivi (24h)" value={fmtEur(outflow)} kind="warn" />
            </div>
          </div>
        </div>
      </Card>

      {/* Two columns: transactions list + LC year-over-year */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Live transactions */}
        <Card className="p-0 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3 border-b border-[color:var(--border-subtle)]">
            <div className="text-base font-semibold text-[color:var(--fg)]">
              Dnevni promet
            </div>
            <Pill kind="ok" dot>
              uživo
            </Pill>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <tr
                  key={i}
                  className={
                    "hover:bg-[color:var(--surface-sunken)] transition-colors " +
                    (i === TRANSACTIONS.length - 1
                      ? ""
                      : "border-b border-[color:var(--border-subtle)]")
                  }
                >
                  <td className="py-3.5 pl-5 pr-3 w-12">
                    <span
                      className={
                        "size-7 rounded-md inline-flex items-center justify-center " +
                        (t.kind === "in"
                          ? "bg-[color:var(--success-soft)] text-[color:var(--success)]"
                          : "bg-[color:var(--surface-sunken)] text-[color:var(--fg-2)]")
                      }
                    >
                      {t.kind === "in" ? (
                        <ArrowDownRight className="size-3.5" />
                      ) : (
                        <ArrowUpRight className="size-3.5" />
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-[13px] font-medium text-[color:var(--fg)]">
                      {t.desc}
                    </div>
                    {t.ref && (
                      <div className="text-[11px] font-mono text-[color:var(--fg-3)] mt-0.5">
                        {t.ref}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[12px] text-[color:var(--fg-3)] tabular-nums w-24">
                    {fmtDate(t.date)} · {t.time}
                  </td>
                  <td
                    className={
                      "py-3.5 pl-3 pr-5 text-right font-mono text-[14px] font-semibold tabular-nums w-32 " +
                      (t.kind === "in"
                        ? "text-[color:var(--success)]"
                        : "text-[color:var(--fg)]")
                    }
                  >
                    {fmtEur(t.amount, { signed: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* LC year-by-year mini chart */}
        <Card className="p-5 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
          <div className="t-micro mb-1">Libusoft Cicom · godišnja isplata</div>
          <div className="text-[12px] text-[color:var(--fg-3)] mb-4">
            iTransparentnost · OIB 14506572540
          </div>
          <div className="flex flex-col gap-2.5">
            {YEAR_BREAKDOWN.map((y) => {
              const max = Math.max(...YEAR_BREAKDOWN.map((x) => x.value));
              const pct = (y.value / max) * 100;
              const isPeak = y.year === "2025";
              return (
                <div key={y.year} className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-[color:var(--fg-2)] w-12 tabular-nums">
                    {y.year}
                  </span>
                  <div className="flex-1 h-5 bg-[color:var(--surface-sunken)] rounded-full overflow-hidden">
                    <div
                      className={
                        "h-full " +
                        (isPeak
                          ? "bg-[color:var(--warning)]"
                          : "bg-[color:var(--brand)]")
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[12px] font-medium text-[color:var(--fg)] w-20 text-right tabular-nums">
                    {fmtEur(y.value)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[color:var(--border-subtle)] flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-2)]">
              Kumulativno 2021–2026
            </span>
            <span className="font-mono text-[14px] font-semibold text-[color:var(--fg)] tabular-nums">
              {fmtEur(YEAR_BREAKDOWN.reduce((s, y) => s + y.value, 0))}
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-4 border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)]">
        <div className="flex items-start gap-2.5">
          <Info className="size-4 text-[color:var(--fg-3)] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[color:var(--fg-2)] leading-relaxed">
            Generirani XLSX prati MFIN-ov format kvartalnog izvještaja za sustav{" "}
            <code className="font-mono text-[11px] bg-[color:var(--surface)] px-1.5 py-0.5 rounded">
              rkpfi.drzavna-riznica.hr
            </code>
            . U produkciji se prilaže skenirana Referentna stranica i učitava preko
            e-Ovlaštenja gradonačelnika. Autentifikacija i predaja u demo prikazu su
            izostavljene.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  kind,
}: {
  label: string;
  value: string;
  kind: "ok" | "warn";
}) {
  const color =
    kind === "ok"
      ? "text-[color:var(--success)]"
      : "text-[color:var(--warning)]";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[color:var(--fg-3)]">
        {label}
      </div>
      <div className={"font-mono text-[14px] font-semibold tabular-nums mt-1 " + color}>
        {value}
      </div>
    </div>
  );
}
