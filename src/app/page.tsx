"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

function NiasMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 9.5h6M13.5 12h6M13.5 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function login() {
    setBusy(true);
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[color:var(--bg)]">
      {/* Left brand panel — visible on lg+ */}
      <div
        className="hidden lg:flex flex-col justify-between p-14 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1A1F4A 0%, #0B172A 100%)",
        }}
      >
        <div className="flex items-center gap-3 relative z-10">
          <Image
            src="/logo-troombic-light.svg"
            alt=""
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          <span className="text-[22px] font-semibold tracking-tight">
            troombic
          </span>
        </div>

        <div className="relative z-10 max-w-[480px]">
          <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[color:var(--accent-teal)] mb-4">
            Sustav · Grad Split
          </div>
          <h1 className="text-[44px] leading-[52px] font-semibold tracking-[-0.025em]">
            Tiha kompetencija,
            <br />
            jasan trag.
          </h1>
          <p className="mt-5 text-white/70 text-base leading-6">
            Likvidatura, natječaji, e-Račun i riznica na jednom mjestu. Svaka
            akcija u dnevniku — bez iznimke.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/45">
          v0.1 · Hackathon demo · SheepAI 2026
        </div>

        {/* Decorative shapes */}
        <div className="absolute -right-32 -bottom-32 size-[380px] rounded-full bg-[#2E308C]/25 blur-sm" />
        <div className="absolute right-10 top-20 size-[140px] rounded-full bg-[color:var(--accent-teal)]/20" />
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-[380px]">
          {/* Brand row on mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <Image
              src="/logo-troombic-light.svg"
              alt=""
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span className="text-xl font-semibold tracking-tight text-[color:var(--fg)]">
              troombic
            </span>
          </div>

          <h2 className="text-[26px] leading-[32px] font-semibold tracking-[-0.015em] text-[color:var(--fg)]">
            Prijava u sustav
          </h2>
          <p className="mt-2 mb-7 text-sm text-[color:var(--fg-2)] leading-5">
            Koristite e-Građanin za sigurnu prijavu, ili lozinku ako ste
            administrator.
          </p>

          <button
            type="button"
            onClick={login}
            disabled={busy}
            className="w-full h-[52px] rounded-full bg-[color:var(--brand)] text-[color:var(--brand-fg-on)] font-semibold text-[15px] inline-flex items-center justify-center gap-2.5 mb-3 hover:bg-[color:var(--brand-hover)] active:bg-[color:var(--brand-press)] disabled:opacity-60 transition-colors"
          >
            <NiasMark className="size-5" />
            {busy ? "Preusmjeravam…" : "Prijava putem e-Građanin"}
          </button>

          <button
            type="button"
            onClick={login}
            disabled={busy}
            className="w-full h-11 rounded-full bg-[color:var(--surface)] text-[color:var(--fg)] border border-[color:var(--border-strong)] font-medium text-[13px] inline-flex items-center justify-center gap-2 mb-2 hover:bg-[color:var(--surface-sunken)] disabled:opacity-60 transition-colors"
          >
            <CreditCard className="size-3.5" />
            Prijava osobnom karticom (čitač)
          </button>

          <div className="flex items-center gap-3 my-5 text-[11px] uppercase tracking-[0.06em] text-[color:var(--fg-3)]">
            <span className="flex-1 h-px bg-[color:var(--border-subtle)]" />
            ili
            <span className="flex-1 h-px bg-[color:var(--border-subtle)]" />
          </div>

          <button
            type="button"
            onClick={login}
            disabled={busy}
            className="w-full h-11 rounded-full bg-transparent text-[color:var(--fg-2)] border border-[color:var(--border-strong)] font-medium text-[13px] hover:bg-[color:var(--surface-sunken)] hover:text-[color:var(--fg)] disabled:opacity-60 transition-colors"
          >
            Prijavi se s e-poštom i lozinkom
          </button>

          <div className="mt-8 text-[11px] text-[color:var(--fg-3)] leading-relaxed">
            <Lock className="inline size-3 mr-1 -mt-0.5" />
            Demo: prijava je preskočena. Bilo koja opcija autentificira korisnika
            kao <strong className="text-[color:var(--fg-2)]">Matija Luketin — Voditelj likvidature</strong>.
          </div>
        </div>
      </div>
    </main>
  );
}
