import { Card } from "@/components/ui/card";
import { Pill } from "@/components/status-pill";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Info,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function JoppdPage() {
  return (
    <div className="flex flex-col gap-5 p-3 sm:p-6 lg:p-8 min-w-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.015em] text-[color:var(--fg)] m-0">
            JOPPD
          </h1>
          <Pill kind="info" dot={false}>
            <BadgeCheck className="size-3" /> Porezna · ePorezna G2B
          </Pill>
          <Pill kind="warn" dot>
            U pripremi
          </Pill>
        </div>
        <p className="text-sm text-[color:var(--fg-2)]">
          Obrazac JOPPD · plaće, porezi i doprinosi. Modul je u izgradnji — donji prikaz
          opisuje obuhvat i tehnički protokol koji ćemo isporučiti.
        </p>
      </div>

      {/* Status banner */}
      <Card className="p-5 border-[color:var(--warning)]/20 bg-[color:var(--warning-soft)]">
        <div className="flex items-start gap-3">
          <Calendar className="size-5 text-[color:var(--warning)] shrink-0 mt-0.5" />
          <div>
            <div className="text-[14px] font-semibold text-[color:var(--fg)]">
              Sljedeća predaja: 20. 5. 2026.
            </div>
            <div className="text-[13px] text-[color:var(--fg-2)] leading-relaxed mt-1">
              JOPPD se podnosi mjesečno, najkasnije na dan isplate plaće.
              Trenutno se obrazac generira u postojećem sustavu; integracija u Troombic
              je predviđena u sljedećoj fazi (Q3 2026).
            </div>
          </div>
        </div>
      </Card>

      {/* Two columns: spec + scope */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        {/* Spec */}
        <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
          <div className="t-micro mb-4">Tehnička specifikacija</div>
          <SpecRow label="Obrazac" value="JOPPD" mono />
          <SpecRow label="Schema" value="ObrazacJOPPDtipovi v1.1 (Pakom)" mono />
          <SpecRow label="Kanal" value="ePorezna G2B SOAP" mono />
          <SpecRow label="Potpis" value="XAdES-BES (FINA QSCD)" mono />
          <SpecRow
            label="Trojezičnost"
            value="HR · obrazac jezika 1"
          />
          <SpecRow label="Učestalost" value="Mjesečno, na dan isplate" />
          <SpecRow label="Kazne (kasna predaja)" value="€130 – €66.360" mono />
          <SpecRow
            label="Reference"
            value="pakom.hr/fajlovi/JOPPD/"
            mono
            isLast
          />
          <div className="mt-5 pt-5 border-t border-[color:var(--border-subtle)] text-[12px] text-[color:var(--fg-3)] leading-relaxed">
            U produkciji se XML potpisuje XAdES-BES potpisom (FINA QSCD certifikat
            vezan za OIB Grada Splita) i predaje preko ePorezna G2B web servisa.
          </div>
        </Card>

        {/* Coverage */}
        <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
          <div className="t-micro mb-4">Obuhvat</div>
          <CoverageRow
            icon={Users}
            title="Plaće zaposlenika"
            sub="Mjesečno · sve pozicije Grada Splita · doprinosi I + II stupa"
            status="ok"
          />
          <CoverageRow
            icon={FileCheck2}
            title="Drugi dohodak"
            sub="Honorari · autorski ugovori · stručno usavršavanje"
            status="ok"
          />
          <CoverageRow
            icon={ShieldCheck}
            title="Doprinosi (REGOS)"
            sub="HZMO se automatski povlači iz JOPPD-a · ne predaje se zasebno (od srpnja 2014.)"
            status="ok"
          />
          <CoverageRow
            icon={Info}
            title="HZZO direktna predaja"
            sub="Samo za članove obitelji i bolovanja koje HZMO ne pokriva"
            status="muted"
            isLast
          />
        </Card>
      </div>

      <Card className="p-4 border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)]">
        <div className="flex items-start gap-2.5">
          <Info className="size-4 text-[color:var(--fg-3)] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[color:var(--fg-2)] leading-relaxed">
            <strong className="text-[color:var(--fg)]">Zašto JOPPD nije u demo prikazu:</strong> JOPPD je
            mjesečna predaja vezana za isplatu plaće. Demo se fokusira na svakodnevni
            tijek — likvidatura, natječaji, e-Račun. JOPPD će biti uključen u Q3 2026
            nakon proširenja modula za upravljanje ljudskim resursima (LIC150 paritet).
          </p>
        </div>
      </Card>
    </div>
  );
}

function SpecRow({
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
      className={
        "flex justify-between items-baseline py-2 gap-3 " +
        (!isLast
          ? "border-b border-dashed border-[color:var(--border-subtle)]"
          : "")
      }
    >
      <span className="text-[13px] text-[color:var(--fg-2)]">{label}</span>
      <span
        className={
          "text-[13px] font-medium text-[color:var(--fg)] text-right tabular-nums " +
          (mono ? "font-mono" : "")
        }
      >
        {value}
      </span>
    </div>
  );
}

function CoverageRow({
  icon: Icon,
  title,
  sub,
  status,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  status: "ok" | "muted";
  isLast?: boolean;
}) {
  return (
    <div
      className={
        "flex items-start gap-3 py-3 " +
        (!isLast
          ? "border-b border-dashed border-[color:var(--border-subtle)]"
          : "")
      }
    >
      <div className="size-8 rounded-md bg-[color:var(--brand-soft)] text-[color:var(--brand)] flex items-center justify-center shrink-0">
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[color:var(--fg)]">
            {title}
          </span>
          {status === "ok" && (
            <CheckCircle2 className="size-3.5 text-[color:var(--success)]" />
          )}
        </div>
        <div className="text-[12px] leading-tight text-[color:var(--fg-3)] mt-0.5">
          {sub}
        </div>
      </div>
    </div>
  );
}
