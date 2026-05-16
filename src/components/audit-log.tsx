"use client";

import { useEffect, useState } from "react";
import { type AuditEvent, makeEvent, seedEvents } from "@/lib/audit-events";
import { History, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtTime } from "@/lib/format";

export function AuditLog() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    setEvents(seedEvents(8));
    function scheduleNext(): ReturnType<typeof setTimeout> {
      const wait = 7000 + Math.random() * 8000;
      return setTimeout(() => {
        setEvents((prev) => [makeEvent(), ...prev].slice(0, 60));
        timer = scheduleNext();
      }, wait);
    }
    let timer = scheduleNext();

    const openHandler = () => setOpen((v) => !v);
    const appendHandler = (e: Event) => {
      const ce = e as CustomEvent<{
        who: string;
        action: string;
        target?: string;
        meta?: string;
        kind: "ok" | "no" | "info" | "muted";
      }>;
      if (!ce.detail) return;
      const ev: AuditEvent = {
        id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ts: new Date(),
        who: ce.detail.who,
        action: ce.detail.action,
        target: ce.detail.target,
        meta: ce.detail.meta,
        kind: ce.detail.kind,
      };
      setEvents((prev) => [ev, ...prev].slice(0, 60));
      // Don't auto-open — the toast already signals success. Pulse the History
      // icon in TopBar via a separate event so the user knows the log updated.
      window.dispatchEvent(new CustomEvent("troombic:audit:pulse"));
    };
    window.addEventListener("troombic:audit:open", openHandler);
    window.addEventListener("troombic:audit:append", appendHandler as EventListener);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("troombic:audit:open", openHandler);
      window.removeEventListener("troombic:audit:append", appendHandler as EventListener);
    };
  }, []);

  return (
    <>
      {/* Scrim */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] bg-black/35 animate-in fade-in duration-[180ms]"
        />
      )}

      {/* Panel */}
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[420px] z-[90] bg-[color:var(--surface)] border-l border-[color:var(--border-subtle)] flex flex-col transition-transform duration-[240ms]",
          open ? "translate-x-0 shadow-[var(--shadow-modal)]" : "translate-x-full"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)" }}
      >
        <div className="h-14 px-5 flex items-center gap-3 border-b border-[color:var(--border-subtle)]">
          <History className="size-4 text-[color:var(--fg-2)]" />
          <div className="text-[14px] font-semibold text-[color:var(--fg)]">
            Dnevnik aktivnosti
          </div>
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[color:var(--info-soft)] text-[color:var(--info)] text-[10px] font-bold uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-[color:var(--info)] animate-pulse" />
            uživo
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setOpen(false)}
            type="button"
            className="size-8 rounded-md flex items-center justify-center text-[color:var(--fg-2)] hover:bg-[color:var(--surface-sunken)] transition-colors"
            aria-label="Zatvori"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {events.map((e) => (
            <Entry key={e.id} e={e} />
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[color:var(--border-subtle)] text-[12px] text-[color:var(--fg-3)] flex justify-between items-center">
          <span>Prikazano {events.length} unosa · danas</span>
          <button
            type="button"
            className="text-[color:var(--fg-2)] hover:text-[color:var(--fg)] transition-colors"
          >
            Cijeli dnevnik →
          </button>
        </div>
      </aside>
    </>
  );
}

function Entry({ e }: { e: AuditEvent }) {
  const dot =
    e.kind === "ok"
      ? "bg-[color:var(--success)]"
      : e.kind === "no"
      ? "bg-[color:var(--danger)]"
      : e.kind === "muted"
      ? "bg-[color:var(--fg-3)]"
      : "bg-[color:var(--info)]";
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 p-3 bg-[color:var(--surface-sunken)] rounded-[8px] border border-[color:var(--border-subtle)]">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <span className={cn("size-2 rounded-full", dot)} />
        <span className="font-mono text-[11px] text-[color:var(--fg-3)] tabular-nums">
          {fmtTime(e.ts).slice(0, 5)}
        </span>
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-[13px] leading-tight text-[color:var(--fg)]">
          <b className="font-semibold">{e.who}</b>{" "}
          <span className="text-[color:var(--fg-2)]">{e.action}</span>
          {e.target && (
            <>
              {" "}
              <span className="font-mono text-[color:var(--fg)]">
                {e.target}
              </span>
            </>
          )}
        </div>
        {e.meta && (
          <div className="font-mono text-[12px] text-[color:var(--fg-3)]">
            {e.meta}
          </div>
        )}
      </div>
    </div>
  );
}
