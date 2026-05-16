// Live audit-log feed. Croatian copy, formal-respectful, third-person institutional.

export type AuditKind = "ok" | "no" | "info" | "muted";

export type AuditEvent = {
  id: string;
  ts: Date;
  who: string;       // actor (Sustav · Matija Luketin · Ana Marić · etc.)
  action: string;    // verb phrase ("je odobrio račun", "je zaprimio")
  target?: string;   // object ("#INV-2026-0142", "iz HEP Elektra")
  meta?: string;     // tail metadata ("€4.820,00", "batch", "→ M. Luketin")
  kind: AuditKind;
};

// Sample event templates — pulled randomly to simulate live activity
const samples: Omit<AuditEvent, "id" | "ts">[] = [
  { who: "Matija Luketin", action: "je odobrio račun", target: "#INV-2026-0138", meta: "€4.200,00", kind: "ok" },
  { who: "Ana Šimić", action: "je poslala račun na drugo oko", target: "#INV-2026-0143", meta: "→ M. Luketin", kind: "info" },
  { who: "Matija Luketin", action: "je odbio račun", target: "#INV-2026-0135", meta: "€2.400,00", kind: "no" },
  { who: "Marina Bilić", action: "je odobrila račun", target: "#INV-2026-0140", meta: "€15.800,00", kind: "ok" },
  { who: "Sustav", action: "je zaprimio 12 e-računa", target: "iz HEP Elektra", meta: "batch", kind: "info" },
  { who: "Petra Vukušić", action: "je dodijelila račun pročelniku", target: "#INV-2026-0137", meta: "Čistoća · €1.850,00", kind: "info" },
  { who: "Sustav", action: "je validirao OIB", target: "14506572540", meta: "Libusoft Cicom · OK", kind: "ok" },
  { who: "Sustav", action: "je provjerio duplikate", target: "#INV-2026-0141", meta: "nema podudaranja", kind: "ok" },
  { who: "Sustav", action: "je obnovio NIAS sesiju", meta: "ističe za 4h", kind: "info" },
  { who: "Sustav", action: "je sinkronizirao TED", target: "Grad Split", meta: "3 nova natječaja", kind: "info" },
  { who: "Toma Vrdoljak", action: "je dodijelio račun gradonačelniku", target: "#INV-2026-0143", meta: "iznos > €5.000", kind: "info" },
  { who: "Sustav", action: "je generirao platni nalog", target: "ZSEPA-2026-0521", meta: "8 računa · €87.420,00", kind: "ok" },
];

let idCounter = 0;

export function makeEvent(): AuditEvent {
  const s = samples[Math.floor(Math.random() * samples.length)];
  idCounter++;
  return { ...s, id: `e${idCounter}`, ts: new Date() };
}

export function seedEvents(n = 8): AuditEvent[] {
  const out: AuditEvent[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ ...makeEvent(), ts: new Date(Date.now() - (n - i) * 90_000) });
  }
  return out.reverse();
}
