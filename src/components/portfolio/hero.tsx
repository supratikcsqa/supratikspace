import { useEffect, useState } from "react";
import { ArrowUpRight, Terminal } from "lucide-react";

const ROLES = ["GTM_ENGINEER", "AI_ENGINEER", "SOLO_FOUNDER", "PRODUCT_OPERATOR"];

export function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="index" className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-bg opacity-100" aria-hidden />

      {/* Tight padding — CTAs must be visible above fold */}
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 pt-3 pb-6 md:grid-cols-12 md:px-6 md:pt-4 md:pb-8">

        {/* Left — identity */}
        <div className="md:col-span-7 flex flex-col justify-start">

          {/* H1 — Cormorant Garamond shines at Light weight (300) and large sizes */}
          <h1 className="font-serif text-balance leading-[0.92] tracking-tight text-foreground text-[46px] md:text-[62px] lg:text-[72px]" style={{ fontWeight: 300 }}>
            I ship{" "}
            {/* Accent style: thick lime underline, not italic, not colored — editorial not AI-fluff */}
            <span
              className="not-italic text-foreground"
              style={{
                textDecoration: "underline",
                textDecorationColor: "#C6F54A",
                textDecorationThickness: "5px",
                textUnderlineOffset: "6px",
              }}
            >unfair</span>
            <br />advantages
            <br />for AI-native
            <br />products.
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-muted-foreground font-mono text-xs">currently_running →</span>
            <span className="cursor-blink rounded-md border border-[#166534]/25 bg-[#166534]/6 px-2.5 py-1 font-mono text-sm text-highlight">
              {ROLES[roleIdx]}
            </span>
          </div>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground font-sans">
            PM turned $500K ARR CMO inside a Real Money Gaming app.
            Now solo-founding at the frontier of AI — GTM, distribution,
            and engineering in a single operator.
          </p>

          {/* CTAs — mt-6 so they're visible above fold */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#book"
              className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-foreground/90 hover:shadow-card-hover"
            >
              book_a_call
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#shipping"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm transition hover:border-highlight hover:text-highlight hover:shadow-soft"
            >
              view_shipping_log
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-7 grid grid-cols-3 gap-3 text-center max-w-xs">
            {[
              { l: "ARR_built", v: "$500K" },
              { l: "products",  v: "36+"   },
              { l: "yrs_pm",    v: "8"     },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-white px-2 py-3 shadow-sm">
                <div className="font-serif text-xl text-highlight">{s.v}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — photo + status card */}
        <aside className="md:col-span-5 flex flex-col gap-4">

          {/* Photo */}
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
            <div className="relative w-full" style={{ paddingBottom: "90%" }}>
              <img
                src="/supratik.jpg"
                alt="Supratik Kundu — Solo Founder & AI GTM Engineer"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center 18%", transform: "scaleX(-1)" }}
              />
            </div>
          </div>

          {/* Status readout */}
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-muted font-mono">
              <span>~/operator/status</span>
              <span className="flex items-center gap-1.5 text-highlight">
                <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
                LIVE
              </span>
            </div>
            <dl className="divide-y divide-border text-sm">
              <Row k="name"      v="Supratik Kundu" />
              <Row k="role"      v="solo_founder" />
              <Row k="prev"      v="cmo · $500K ARR (RMG)" />
              <Row k="building"  v="ai-native gtm tooling" />
              <Row k="bandwidth" v="2 client slots / qtr" highlight />
              <Row k="timezone"  v="IST · UTC+5:30" />
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">{k}</dt>
      <dd className={`text-sm font-sans ${highlight ? "text-highlight font-semibold" : "text-foreground"}`}>{v}</dd>
    </div>
  );
}
