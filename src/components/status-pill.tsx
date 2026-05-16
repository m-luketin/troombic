import { type PillKind, STATUS_VIEW, type InvoiceStatus } from "@/lib/invoice-helpers";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<PillKind, { bg: string; fg: string; dot: string }> = {
  wait: {
    bg: "bg-[color:var(--warning-soft)]",
    fg: "text-[color:var(--warning)]",
    dot: "bg-[color:var(--warning)]",
  },
  ok: {
    bg: "bg-[color:var(--success-soft)]",
    fg: "text-[color:var(--success)]",
    dot: "bg-[color:var(--success)]",
  },
  no: {
    bg: "bg-[color:var(--danger-soft)]",
    fg: "text-[color:var(--danger)]",
    dot: "bg-[color:var(--danger)]",
  },
  warn: {
    bg: "bg-[color:var(--warning-soft)]",
    fg: "text-[color:var(--warning)]",
    dot: "bg-[color:var(--warning)]",
  },
  info: {
    bg: "bg-[color:var(--info-soft)]",
    fg: "text-[color:var(--info)]",
    dot: "bg-[color:var(--info)]",
  },
  muted: {
    bg: "bg-[color:var(--surface-sunken)]",
    fg: "text-[color:var(--fg-2)]",
    dot: "bg-[color:var(--fg-3)]",
  },
};

export function Pill({
  kind = "info",
  children,
  dot = true,
  className,
}: {
  kind?: PillKind;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const s = KIND_STYLES[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.06em] whitespace-nowrap",
        s.bg,
        s.fg,
        className
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", s.dot)} />}
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: InvoiceStatus }) {
  const v = STATUS_VIEW[status];
  return <Pill kind={v.kind}>{v.label}</Pill>;
}
