const ENTRIES = [
  {
    date: "2026 — NOW",
    title: "Solo Founder · GTM + AI Engineer",
    org: "Operator OS",
    body: "Building AI-native GTM tooling for early-stage teams. Designing, shipping, and selling — every layer of the stack, alone.",
  },
  {
    date: "2024 — 2025",
    title: "CMO",
    org: "Real Money Gaming App",
    body: "Took a brand-new RMG product from cold start to $500K ARR. Owned acquisition, lifecycle, creative, and pricing. Survived a regulated, hyper-competitive market.",
  },
  {
    date: "2016 — 2024",
    title: "Senior Product Manager",
    org: "Multiple consumer + B2B companies",
    body: "8 years shipping products across fintech, gaming, and SaaS. Specialised in zero-to-one and 1-to-10 inflection points where product, growth, and pricing collide.",
  },
];

export function Timeline() {
  return (
    <section id="log" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">

        <header className="flex flex-col gap-4 border-b border-border py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-mono">03 // career_log</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-foreground md:text-5xl">
              The{" "}
              <span
                className="not-italic text-foreground"
                style={{ textDecoration: "underline", textDecorationColor: "#C6F54A", textDecorationThickness: "4px", textUnderlineOffset: "5px" }}
              >replay</span>.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-sans">
            A decade of compounding: PM craft → distribution leadership → AI-native solo building.
          </p>
        </header>

        <ol className="divide-y divide-border py-2">
          {ENTRIES.map((e, i) => (
            <li key={i} className="grid grid-cols-1 gap-6 py-10 md:grid-cols-12 md:gap-12 md:py-14">
              <div className="md:col-span-3">
                <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-mono">{e.date}</div>
                <div className="mt-2 font-mono text-xs text-highlight">— ENTRY {String(ENTRIES.length - i).padStart(2, "0")}</div>
              </div>
              <div className="md:col-span-9">
                <h3 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl">
                  {e.title}
                  <span className="text-muted-foreground"> — </span>
                  <span
                    className="not-italic text-foreground"
                    style={{ textDecoration: "underline", textDecorationColor: "#C6F54A", textDecorationThickness: "3px", textUnderlineOffset: "4px" }}
                  >{e.org}</span>
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg font-sans">
                  {e.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
