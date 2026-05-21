import { useEffect, useState } from "react";
import { getCalApi } from "@calcom/embed-react";

export function BookingPanel() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "awesomespace" });
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      } as Parameters<typeof cal>[1]);
      setReady(true);
    })();
  }, []);

  return (
    <section id="book" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">

        <header className="flex flex-col gap-4 border-b border-border py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-mono">04 // direct_line</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-foreground md:text-5xl">
              Book a{" "}
              <span
                className="not-italic text-foreground"
                style={{ textDecoration: "underline", textDecorationColor: "#C6F54A", textDecorationThickness: "4px", textUnderlineOffset: "5px" }}
              >slot</span>.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-sans">
            Founders, operators, builders. 30 minutes. No deck required.
            Bring the hardest problem you have right now.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 py-10 md:grid-cols-12">

          {/* Left — meta panel */}
          <aside className="md:col-span-4 flex flex-col gap-5">

            {/* Live badge */}
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-highlight font-mono font-medium">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-highlight pulse-dot" />
              </span>
              accepting bookings
            </div>

            {/* Photo — same framing technique as hero */}
            <div className="overflow-hidden rounded-2xl border border-border shadow-card">
              <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                <img
                  src="/supratik.jpg"
                  alt="Supratik Kundu"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "center 18%", transform: "scaleX(-1)" }}
                />
              </div>
            </div>

            {/* Meta table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
              <dl className="divide-y divide-border">
                {[
                  { k: "duration",  v: "30 minutes" },
                  { k: "format",    v: "Cal.com · Google Meet" },
                  { k: "cost",      v: "free" },
                  { k: "best_for",  v: "GTM, AI product, pricing" },
                  { k: "response",  v: "< 24 hours" },
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">{k}</dt>
                    <dd className="text-sm text-foreground font-sans">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Bullets */}
            <ul className="space-y-3 text-sm text-muted-foreground font-sans">
              {[
                "Honest second opinion on your AI product roadmap.",
                "GTM teardown from a CMO who took $0 → $500K ARR.",
                "Solo-founder leverage: tools, agents, workflows.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-px w-4 shrink-0 bg-highlight" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA button — Cal.com data-attribute approach */}
            <button
              data-cal-namespace="awesomespace"
              data-cal-link="supratik-kundu/awesomespace"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
              className="w-full rounded-xl bg-foreground px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-foreground/90 hover:shadow-card-hover"
            >
              {ready ? "open_calendar →" : "loading_calendar…"}
            </button>
          </aside>

          {/* Right — context panel */}
          <div className="md:col-span-8">
            <div className="flex h-full flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-white p-8 shadow-card text-center min-h-[420px]">
              <div className="w-full max-w-md">
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8 font-mono">
                  // session_context
                </p>

                <div className="space-y-0 divide-y divide-border rounded-xl border border-border overflow-hidden text-left">
                  {[
                    ["operator",  "Supratik Kundu"],
                    ["timezone",  "IST · UTC+5:30"],
                    ["slots",     "2 per quarter"],
                    ["format",    "30 min · Google Meet"],
                    ["link",      "cal.com/supratik-kundu"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-4 py-3 bg-white">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</span>
                      <span className="text-sm text-foreground font-sans">{v}</span>
                    </div>
                  ))}
                </div>

                <button
                  data-cal-namespace="awesomespace"
                  data-cal-link="supratik-kundu/awesomespace"
                  data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                  className="mt-8 w-full rounded-xl bg-foreground px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-foreground/90 hover:shadow-card-hover"
                >
                  pick_a_slot →
                </button>

                <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-mono">
                  powered by cal.com · no deck required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
