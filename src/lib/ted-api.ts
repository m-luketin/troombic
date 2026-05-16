// Fetches tenders for Grad Split from TED Search API v3 (api.ted.europa.eu).
// Verified query shape from research-eojn.md. Falls back to bundled canned data
// when the live API is unreachable (rate-limited / CORS in some contexts / hackathon-day flakiness).

import tedSample from "@/data/ted-sample.json";

export type Tender = {
  publication_number: string;
  title: string;
  category: string;
  cpv: string;
  cpv_label: string;
  value: number | null;
  publication_date: string;
  deadline: string | null;
  bids: number;
  status: "open" | "closing" | "evaluating" | "awarded";
  department: string;
  vendor: string | null;
  vendor_oib: string | null;
};

export type TedFetchResult = {
  tenders: Tender[];
  source: "live" | "canned";
  fetched_at: string;
  note?: string;
};

const TED_ENDPOINT = "https://api.ted.europa.eu/v3/notices/search";
// Build the verified query per the EOJN research:
//   POST https://api.ted.europa.eu/v3/notices/search
//   { "query": "buyer-name~\"Grad Split\" AND publication-date>=20240101", ... }

export async function fetchTedTenders(): Promise<TedFetchResult> {
  const sample = (tedSample as { tenders: Tender[] }).tenders;
  try {
    const body = {
      query: 'buyer-name~"Grad Split" AND publication-date>=20240101',
      fields: [
        "publication-number",
        "notice-title",
        "buyer-name",
        "publication-date",
        "classification-cpv",
        "deadline-receipt-tender-date",
        "total-value",
      ],
      limit: 40,
      paginationMode: "PAGE_NUMBER",
    };
    const res = await fetch(TED_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      // Cache for 5 min so the page is snappy + we don't hammer TED during demo
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return {
        tenders: sample,
        source: "canned",
        fetched_at: new Date().toISOString(),
        note: `TED API returned HTTP ${res.status} — using bundled fallback.`,
      };
    }
    const data = await res.json();
    const records: unknown[] = Array.isArray(data?.notices)
      ? data.notices
      : Array.isArray(data?.records)
      ? data.records
      : [];
    if (records.length === 0) {
      return {
        tenders: sample,
        source: "canned",
        fetched_at: new Date().toISOString(),
        note: "TED returned 0 records — using bundled fallback.",
      };
    }
    // Normalize to our Tender shape — TED's response shape varies by field.
    // Defensive parsing; fall back to canned on any structural surprise.
    const tenders: Tender[] = records
      .map((r): Tender | null => {
        const rec = r as Record<string, unknown>;
        const pub =
          (rec["publication-number"] as string) ??
          (rec["ND"] as string) ??
          null;
        if (!pub) return null;
        const title =
          (rec["notice-title"] as { hrv?: string; eng?: string })?.hrv ??
          (rec["notice-title"] as { hrv?: string; eng?: string })?.eng ??
          (rec["TI"] as string) ??
          "(bez naslova)";
        const cpvArr = rec["classification-cpv"] as string[] | string | undefined;
        const cpv = Array.isArray(cpvArr) ? cpvArr[0] : cpvArr ?? "00000000";
        return {
          publication_number: pub,
          title: typeof title === "string" ? title : "(bez naslova)",
          category: "—",
          cpv,
          cpv_label: "—",
          value: null,
          publication_date: (rec["publication-date"] as string) ?? "",
          deadline: (rec["deadline-receipt-tender-date"] as string) ?? null,
          bids: 0,
          status: "open",
          department: "Grad Split",
          vendor: null,
          vendor_oib: null,
        };
      })
      .filter((t): t is Tender => t !== null);

    if (tenders.length === 0) {
      return {
        tenders: sample,
        source: "canned",
        fetched_at: new Date().toISOString(),
        note: "TED records didn't match expected shape — using bundled fallback.",
      };
    }
    return {
      tenders,
      source: "live",
      fetched_at: new Date().toISOString(),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return {
      tenders: sample,
      source: "canned",
      fetched_at: new Date().toISOString(),
      note: `TED fetch failed (${msg}) — using bundled fallback.`,
    };
  }
}
