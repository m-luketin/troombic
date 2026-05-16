"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/status-pill";
import invoices from "@/data/invoices.json";
import {
  type Invoice,
  WAITING_STATUSES,
} from "@/lib/invoice-helpers";
import { generateUbl } from "@/lib/ubl";
import { fmtEur } from "@/lib/format";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Inbox,
  ShieldCheck,
  Server,
  Upload,
} from "lucide-react";
import { useMemo } from "react";

export default function EracunPage() {
  const all = invoices as Invoice[];
  const waiting = all.filter((i) => WAITING_STATUSES.includes(i.status));
  const today = all.length; // mock — show all as "today's intake"
  const sampleInvoice = useMemo(() => all[0], [all]);
  const sampleXml = useMemo(() => generateUbl(sampleInvoice), [sampleInvoice]);

  return (
    <div className="flex flex-col gap-5 p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.015em] text-[color:var(--fg)] m-0">
            e-Račun
          </h1>
          <Pill kind="info" dot={false}>
            <Server className="size-3" /> FINA · UBL 2.1 + HR CIUS 2025
          </Pill>
        </div>
        <p className="text-sm text-[color:var(--fg-2)]">
          Zaprimanje, validacija i prosljeđivanje elektronskih računa u Likvidaturu.
          Standard: <code className="font-mono text-[11px] bg-[color:var(--surface-sunken)] px-1.5 py-0.5 rounded">EN 16931</code> uz Hrvatske specifikacije.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Zaprimljeno danas"
          value={String(today)}
          delta="+8 vs. prosjek"
          kind="ok"
          icon={Inbox}
        />
        <StatTile
          label="Čeka obradu u Likvidaturi"
          value={String(waiting.length)}
          delta={fmtEur(waiting.reduce((s, i) => s + i.iznos_bruto, 0))}
          kind="warn"
          icon={FileText}
        />
        <StatTile
          label="Stopa validacije (30d)"
          value="99,2 %"
          delta="↑ 0,4 pp"
          kind="ok"
          icon={CheckCircle2}
        />
        <StatTile
          label="Prosj. vrijeme zaprimanja"
          value="2,1 s"
          delta="FINA → sustav"
          kind="ok"
          icon={Upload}
        />
      </div>

      {/* Pipeline diagram */}
      <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="t-micro mb-4">Pipeline zaprimanja</div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
          <StageCard
            title="Dobavljač"
            sub="potpisuje UBL 2.1 + XAdES"
            icon={FileText}
          />
          <Arrow />
          <StageCard
            title="FINA"
            sub="Servis e-Račun"
            icon={Server}
            highlight
          />
          <Arrow />
          <StageCard
            title="Validator"
            sub="OIB · šifre · konto"
            icon={ShieldCheck}
          />
          <Arrow />
          <StageCard
            title="Likvidatura"
            sub={`${waiting.length} u redu čekanja`}
            icon={Inbox}
            link="/likvidatura"
          />
        </div>
      </Card>

      {/* Two cols: spec + XML preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Spec card */}
        <Card className="p-6 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)]">
          <div className="t-micro mb-4">Specifikacija prihvaćenog formata</div>
          <SpecRow label="Format" value="UBL 2.1" mono />
          <SpecRow label="Profil" value="HR CIUS 2025" mono />
          <SpecRow label="Osnova" value="EN 16931" mono />
          <SpecRow label="Potpis" value="XAdES-BES (FINA QSCD)" mono />
          <SpecRow label="Kanal" value="api.fina.hr (REST)" mono />
          <SpecRow label="PDV stope" value="5 · 13 · 25 %" />
          <SpecRow label="Valuta" value="EUR" mono />
          <SpecRow
            label="Šifre"
            value="KPD (klasifikacija proizvoda po djelatnosti)"
          />
          <SpecRow label="Trust list" value="EU TSL · provjera certifikata" isLast />
          <div className="mt-5 pt-5 border-t border-[color:var(--border-subtle)] text-[12px] text-[color:var(--fg-3)] leading-relaxed">
            U produkciji: potpisuje se FINA QSCD certifikatom prije prosljeđivanja. Demo prikaz generira XML
            lokalno bez potpisivanja, isti format koji bi prošao validaciju FINA-e.
          </div>
        </Card>

        {/* Sample XML card */}
        <Card className="p-0 border-[color:var(--border-subtle)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3 border-b border-[color:var(--border-subtle)]">
            <FileText className="size-4 text-[color:var(--fg-2)]" />
            <div className="text-base font-semibold text-[color:var(--fg)]">
              Primjer UBL 2.1 zapisa
            </div>
            <Pill kind="ok" dot>
              <CheckCircle2 className="size-3" /> XSD ✓
            </Pill>
            <div className="flex-1" />
            <Link
              href={`/likvidatura/${sampleInvoice.id}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)] text-[12px] font-medium hover:bg-[color:var(--brand-soft-hover)] transition-colors"
            >
              Otvori u Likvidaturi <ArrowRight className="size-3" />
            </Link>
          </div>
          <pre className="m-0 p-5 text-[11px] leading-[16px] font-mono text-[color:var(--fg)] bg-[color:var(--surface)] max-h-[480px] overflow-y-auto overflow-x-auto whitespace-pre">
            {sampleXml.slice(0, 2400)}
            {sampleXml.length > 2400 && (
              <>
                {"\n\n"}
                <span className="text-[color:var(--fg-3)]">
                  … (skraćeno · {sampleXml.length} znakova · puni XML dostupan u Likvidaturi)
                </span>
              </>
            )}
          </pre>
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  delta,
  kind,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  kind: "ok" | "warn";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const color =
    kind === "ok"
      ? "text-[color:var(--success)]"
      : "text-[color:var(--warning)]";
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
      <div className={"text-xs font-medium " + color}>{delta}</div>
    </Card>
  );
}

function StageCard({
  title,
  sub,
  icon: Icon,
  highlight,
  link,
}: {
  title: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  link?: string;
}) {
  const inner = (
    <div
      className={
        "flex flex-col items-center text-center gap-1.5 rounded-[8px] border p-4 h-full transition-colors " +
        (highlight
          ? "border-[color:var(--brand)]/40 bg-[color:var(--brand-soft)]"
          : "border-[color:var(--border-subtle)] bg-[color:var(--surface)]") +
        (link ? " hover:border-[color:var(--brand)] cursor-pointer" : "")
      }
    >
      <div
        className={
          "size-9 rounded-full inline-flex items-center justify-center " +
          (highlight
            ? "bg-[color:var(--brand)] text-white"
            : "bg-[color:var(--surface-sunken)] text-[color:var(--fg-2)]")
        }
      >
        <Icon className="size-4" />
      </div>
      <div
        className={
          "text-[13px] font-semibold mt-1 " +
          (highlight ? "text-[color:var(--brand)]" : "text-[color:var(--fg)]")
        }
      >
        {title}
      </div>
      <div className="text-[11px] text-[color:var(--fg-3)] leading-tight">
        {sub}
      </div>
    </div>
  );
  if (link)
    return (
      <Link href={link} className="block">
        {inner}
      </Link>
    );
  return inner;
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center justify-center text-[color:var(--fg-3)]">
      <ArrowRight className="size-4" />
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
        (!isLast ? "border-b border-dashed border-[color:var(--border-subtle)]" : "")
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
