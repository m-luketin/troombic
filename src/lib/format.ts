// Croatian locale formatters.
// Money: €1.260.483,22 (period thousands, comma decimal). Always in JetBrains Mono with tabular-nums in the UI.
// Dates: 14. 5. 2026. (day-month-year with periods).
// Time: HH:MM (24-hour).

export function fmtEur(n: number, opts: { signed?: boolean } = {}): string {
  const abs = Math.abs(n);
  const [int, dec] = abs.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = n < 0 ? "−" : opts.signed && n > 0 ? "+" : "";
  return `${sign}€${grouped},${dec}`;
}

export function fmtEurShort(n: number): string {
  // For large numbers in hero tiles: €1,26M / €387k
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? "−" : ""}€${(abs / 1_000_000).toLocaleString("hr-HR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
  if (abs >= 1_000) return `${n < 0 ? "−" : ""}€${(abs / 1_000).toFixed(0)}k`;
  return fmtEur(n);
}

export function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}.`;
}

export function fmtTime(d: Date = new Date()): string {
  return d.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function fmtTimeShort(d: Date = new Date()): string {
  return d.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" });
}

export function daysAgo(d: Date | string): number {
  const date = typeof d === "string" ? new Date(d) : d;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}
