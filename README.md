<div align="center">

# troombic

**A modern back-office for the City of Split.**

Built in a day on the same regulatory surface the City already trusts.

[Live demo](https://warcraft-vehicle-reprint-phentermine.trycloudflare.com) · Submitted to [SheepAI 2026](https://sheepai.eu)

</div>

---

## What this is

A working modernization slice of City Hall's back-office software, prepared for the SheepAI 2026 Croatian civic-tech hackathon.

The centerpiece is a real **likvidatura** (invoice-approval) workflow — a regulation-bound piece of municipal accounting work — rebuilt in a single day with modern web fundamentals: mobile, real-time, browser-first, API-driven.

The name is the phonetic spelling of **Trumbić**. Ante Trumbić was mayor of Split 1905-1908 and architect of the 1917 Corfu Declaration. Split's City Hall today sits on _Trumbićeva obala_. The address writes the joke.

> "This is your Monday morning, in 2026. Built in a day, on the regulatory surface you already trust. Imagine 5 of us on it for a month."

## What's inside

| Route | Purpose |
|---|---|
| `/` | NIAS login — split-panel, three credential paths |
| `/dashboard` | Greeting · KPI cards · pending invoices |
| `/likvidatura` | Invoice queue · 6 filters · search · sortable |
| `/likvidatura/[id]` | Invoice detail · 4 tabs (Pregled · Stavke · UBL XML · Povijest) · 6-eyes approval (€5k threshold) · 2FA (€25k threshold) |
| `/natjecaji` | Live TED API tenders · vendor history sheet |
| `/eracun` | UBL 2.1 + HR CIUS 2025 pipeline spec |
| `/riznica` | Treasury balance · transactions · real client-side XLSX export |
| `/joppd` | Wage-tax form (u pripremi) |

Plus a floating audit-log panel with live events and a sidebar that mirrors split.hr's chrome.

## Stack

- **Next.js 16.2** (App Router, async params, Turbopack)
- **React 19.2**
- **TypeScript** strict
- **Bun 1.3** as runtime + package manager
- **Tailwind CSS v4**
- **shadcn/ui** on `base-ui` (not Radix) — `base-nova` preset
- **Inter Variable** + **JetBrains Mono** for money/IDs
- **lucide-react** at 1.5px stroke
- Real **UBL 2.1 + HR CIUS 2025** XML generator
- Real **TED API v3** integration with canned fallback
- Real client-side **SheetJS** XLSX export for treasury reports

## Design rules

- **Light mode** default · sidebar chrome is **split.hr navy `#2E308C`**
- **Croatian** in chrome · **sentence case** · no emoji · no exclamation marks
- Money: `€1.260.483,22` (period thousands, comma decimal) in tabular-nums mono
- Dates: `14. 5. 2026.` · time 24-hour `14:30`
- 8px radius everywhere except pill buttons

## Running locally

```bash
bun install
bun run dev
```

Then open http://localhost:3000.

## Context

Grad Split has paid the incumbent municipal-ERP vendor (Libusoft Cicom) **~€2.3M cumulative** since 2019 for the SPI sustav back-office. The locked stack is a C# Windows fat-client + Java/Spring middleware + MS SQL Server. The world moved to the browser; the City didn't.

Troombic is the wedge: sit next to LC, modernize one workflow, prove the pattern.

## Credits

Built by [Matija Luketin](https://github.com/m-luketin) ([Solbound](https://solbound.dev)) for SheepAI 2026.
