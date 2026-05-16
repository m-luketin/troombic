// Invoice status enum + visual mapping for pills.
// Statuses come from src/data/invoices.json — Croatian back-office vocabulary.

export type InvoiceStatus =
  | "Novi"
  | "U pregledu"
  | "Odobreno"
  | "Plaćeno"
  | "Odbijeno"
  | "Vraćeno na ispravak";

export type PillKind = "wait" | "ok" | "no" | "warn" | "info" | "muted";

export const STATUS_VIEW: Record<InvoiceStatus, { label: string; kind: PillKind }> = {
  "Novi": { label: "Novi", kind: "wait" },
  "U pregledu": { label: "U pregledu", kind: "wait" },
  "Odobreno": { label: "Odobreno", kind: "ok" },
  "Plaćeno": { label: "Plaćeno", kind: "ok" },
  "Odbijeno": { label: "Odbijeno", kind: "no" },
  "Vraćeno na ispravak": { label: "Na ispravak", kind: "warn" },
};

export const WAITING_STATUSES: InvoiceStatus[] = ["Novi", "U pregledu"];
export const DONE_STATUSES: InvoiceStatus[] = ["Odobreno", "Plaćeno"];

export const SIX_EYES_THRESHOLD_EUR = 5000;
export const TWO_FACTOR_THRESHOLD_EUR = 25000;

export type Invoice = {
  id: string;
  ulazni_broj: string;
  supplier: { naziv: string; oib: string; mjesto: string; iban: string };
  predmet: string;
  iznos_neto: number;
  pdv_stopa: number;
  pdv_iznos: number;
  iznos_bruto: number;
  valuta: string;
  datum_izdavanja: string;
  datum_primitka: string;
  rok_placanja: string;
  konto_sifra: string;
  konto_naziv: string;
  status: InvoiceStatus;
  ceka_dana: number;
  referent: string;
  department: string;
  po_match: {
    matched: boolean;
    ugovor_id: string | null;
    ugovor_napomena?: string;
  };
  budget_check: {
    konto: string;
    alocirano_god: number;
    potroseno_ytd: number;
    preostalo: number;
    ok: boolean;
  };
  potrebni_potpisi: ("referent" | "procelnik" | "nacelnik")[];
  potpisi_dani: { uloga: string; ime: string; vrijeme: string; kanal: string }[];
  linije?: { opis: string; kolicina: number; jedinica: string; cijena_jedinice: number }[];
  notes?: string;
  razlog_odbijanja?: string;
  razlog_vracanja?: string;
  datum_placanja?: string;
};

/** Sigil to call out an invoice with a Libusoft OIB so the supplier-history demo pops. */
export const LC_OIB = "14506572540";
