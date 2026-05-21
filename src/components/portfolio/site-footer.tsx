import { Github, Linkedin } from "lucide-react";
import { EnterpriseForm } from "./enterprise-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 py-12 md:grid-cols-12 md:px-6">

        {/* Col 1 — Branding */}
        <div className="md:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-mono">// end_of_transmission</p>
          <p className="mt-4 max-w-xs font-serif text-2xl tracking-tight text-foreground md:text-3xl" style={{ fontWeight: 300 }}>
            Built solo. Shipped in public.{" "}
            <span
              className="not-italic text-foreground"
              style={{ textDecoration: "underline", textDecorationColor: "#C6F54A", textDecorationThickness: "3px", textUnderlineOffset: "4px" }}
            >Always iterating.</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground font-sans">
            Supratik Kundu · Bengaluru, IN · UTC+5:30
          </p>

          {/* System status */}
          <div className="mt-6 rounded-xl border border-border bg-[#F9F8F5] px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 font-mono">/system</div>
            <ul className="space-y-2 text-sm font-sans text-muted-foreground">
              <li className="flex items-center justify-between">
                <span>uptime</span>
                <span className="text-highlight font-medium">99.98%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>last_deploy</span>
                <span className="text-foreground">just now</span>
              </li>
              <li className="flex items-center justify-between">
                <span>build</span>
                <span className="text-foreground">v1.0.0</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Col 2 — Channels (GitHub email + LinkedIn only) */}
        <div className="md:col-span-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4 font-mono">/channels</div>
          <ul className="space-y-4">
            <li>
              <a
                href="mailto:supratik.pm@gmail.com"
                className="group flex items-start gap-3 rounded-xl border border-border bg-[#F9F8F5] p-3 transition hover:border-foreground/30 hover:shadow-sm"
              >
                <Github className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div>
                  <div className="text-xs font-semibold text-foreground font-sans">GitHub</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">supratik.pm@gmail.com</div>
                </div>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/supratik-kundu"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-border bg-[#F9F8F5] p-3 transition hover:border-foreground/30 hover:shadow-sm"
              >
                <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
                <div>
                  <div className="text-xs font-semibold text-foreground font-sans">LinkedIn</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">/in/supratik-kundu</div>
                </div>
              </a>
            </li>
            <li>
              <a
                href="https://cal.com/supratik-kundu/awesomespace"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-border bg-[#F9F8F5] p-3 transition hover:border-foreground/30 hover:shadow-sm"
              >
                {/* Cal icon */}
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <div>
                  <div className="text-xs font-semibold text-foreground font-sans">Book a Call</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">cal.com/supratik-kundu</div>
                </div>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3 — Enterprise email capture */}
        <div className="md:col-span-5">
          <EnterpriseForm />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-2 px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-mono md:flex-row md:items-center md:px-6">
          <span>© {new Date().getFullYear()} Supratik Kundu</span>
          <div className="flex items-center gap-4">
            <span>shipped solo · bengaluru, in</span>
            <a href="https://wa.me/918910967001" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
              whatsapp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
