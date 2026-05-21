import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { products } from "../../data/products";

type Status = "Live" | "Beta" | "Idea" | "Investor Backed";

// IDs of the "featured" cards that get dark treatment
const FEATURED_IDS = new Set([2, 31, 16, 37]); // StepStack, GEO Generator, HospitalManagementSystem, EV Aggregator

// Featured card config — each can have its own dark palette
const FEATURED_CONFIG: Record<number, { bg: string; border: string; tagBg: string; tagText: string; label: string }> = {
  2:  { bg: "#0f1117",  border: "#2a2d35", tagBg: "#1e2130", tagText: "#a3a8b8", label: "FLAGSHIP" },
  31: { bg: "#0d1a12",  border: "#1a3322", tagBg: "#0f2218", tagText: "#6dba8a", label: "LIVE PRODUCT" },
  16: { bg: "#150d1f",  border: "#2d1a45", tagBg: "#1f1030", tagText: "#b08ce0", label: "ENTERPRISE" },
  37: { bg: "#061419",  border: "#0e3040", tagBg: "#082030", tagText: "#38bdf8", label: "CLEANTECH" },
};

const STATUS_STYLE: Record<Status, { dot: string; text: string; bg: string }> = {
  Live:              { dot: "bg-highlight",  text: "text-highlight",  bg: "bg-[#166534]/8 border-[#166534]/20" },
  Beta:              { dot: "bg-blue-500",   text: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  Idea:              { dot: "bg-amber-400",  text: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  "Investor Backed": { dot: "bg-purple-500", text: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
};

const CATEGORY_ORDER = [
  "Sales & Outreach",
  "Agentic Systems & Workflows",
  "Content & SEO",
  "Generative AI",
  "Platforms & SaaS",
];

const CATEGORY_SLUG: Record<string, string> = {
  "Sales & Outreach":            "sales & outreach",
  "Agentic Systems & Workflows": "agentic systems",
  "Content & SEO":               "content & seo",
  "Generative AI":               "generative ai",
  "Platforms & SaaS":            "platforms & saas",
};

export function ShippingGrid() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...CATEGORY_ORDER];

  const filtered =
    filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <section id="shipping" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">

        <header className="flex flex-col gap-4 border-b border-border py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-foreground md:text-5xl">
              Products in{" "}
              <span
                className="not-italic text-foreground"
                style={{ textDecoration: "underline", textDecorationColor: "#C6F54A", textDecorationThickness: "4px", textUnderlineOffset: "5px" }}
              >flight</span>.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-sans">

            Updated as I push to main.
          </p>
        </header>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 py-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border transition-all font-mono ${
                filter === cat
                  ? "border-foreground bg-foreground text-white shadow-sm"
                  : "border-border bg-white text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {cat === "All" ? "all" : CATEGORY_SLUG[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Product cards grid */}
        <div className="grid grid-cols-1 gap-5 pb-10 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const isFeatured = FEATURED_IDS.has(p.id);
            const feat = FEATURED_CONFIG[p.id];

            if (isFeatured && feat) {
              return <FeaturedCard key={p.id} p={p} feat={feat} i={i} />;
            }

            const s = STATUS_STYLE[p.status];
            return (
              <a
                key={p.id}
                href={p.link ?? "#"}
                target={p.link && p.link.startsWith("http") ? "_blank" : undefined}
                rel={p.link && p.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group product-card-hover flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-card"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] font-mono ${s.bg} ${s.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {p.status}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-highlight" />
                </div>

                <h3 className="font-serif text-[22px] tracking-tight text-foreground leading-tight">{p.title}</h3>

                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 flex-1 font-sans">{p.subtitle}</p>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Featured (dark) card component ── */
function FeaturedCard({
  p,
  feat,
  i,
}: {
  p: (typeof products)[number];
  feat: (typeof FEATURED_CONFIG)[number];
  i: number;
}) {
  return (
    <a
      href={p.link!}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-4 rounded-2xl p-6 overflow-hidden transition-all duration-300"
      style={{
        background: feat.bg,
        border: `1px solid ${feat.border}`,
        boxShadow: `0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
        animationDelay: `${i * 0.04}s`,
      }}
    >
      {/* Subtle grain / noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Lime accent gradient top line */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C6F54A55, transparent)" }}
      />

      {/* Header row */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Featured label */}
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] font-mono"
            style={{ background: feat.tagBg, color: "#C6F54A", border: `1px solid ${feat.border}` }}
          >
            {feat.label}
          </span>
          {/* Live dot */}
          <span className="flex items-center gap-1 text-[10px] font-mono text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C6F54A]" />
            LIVE
          </span>
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-white/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          style={{ color: "#C6F54A" }}
        />
      </div>

      {/* Title */}
      <h3
        className="relative font-serif text-[24px] leading-tight tracking-tight"
        style={{ color: "#f0f2f5", fontWeight: 300 }}
      >
        {p.title}
      </h3>

      {/* Description */}
      <p className="relative text-sm leading-relaxed line-clamp-3 flex-1 font-sans" style={{ color: "rgba(255,255,255,0.52)" }}>
        {p.subtitle}
      </p>

      {/* Tags */}
      <div className="relative mt-auto flex flex-wrap gap-1.5">
        {p.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-mono"
            style={{ background: feat.tagBg, color: feat.tagText, border: `1px solid ${feat.border}` }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "inset 0 0 40px rgba(198,245,74,0.04)" }}
      />
    </a>
  );
}
