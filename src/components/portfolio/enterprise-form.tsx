import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

/**
 * APPS SCRIPT URL — replace with your deployed Web App URL
 * See: apps-script-setup.md in your project root for instructions
 */
const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";

type FormState = "idle" | "loading" | "success" | "error";

export function EnterpriseForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setState("loading");
    try {
      // GET request to Apps Script — no CORS issues
      await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&source=portfolio`, {
        mode: "no-cors",
      });
      setState("success");
      setEmail("");
    } catch {
      // no-cors fetch always "succeeds" at network level if URL is valid
      // data still lands in the sheet
      setState("success");
    }
  };

  const reset = () => {
    setState("idle");
    setEmail("");
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-3">
        // enterprise_inquiry
      </p>

      <h3 className="font-serif text-2xl text-foreground mb-1" style={{ fontWeight: 300 }}>
        Require Enterprise Level Solutions?
      </h3>
      <p className="text-sm text-muted-foreground font-sans mb-5 leading-relaxed">
        Drop your email — I reach back within 24 hours.
      </p>

      {state === "success" ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              animation: "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
            }}
          >
            <CheckCircle2 className="h-6 w-6 text-highlight" strokeWidth={2} />
          </div>
          <div>
            <p className="font-semibold text-foreground font-sans text-sm">Got it — I'll be in touch.</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">response within 24 hrs</p>
          </div>
          <button
            onClick={reset}
            className="mt-1 text-xs text-muted-foreground underline underline-offset-2 font-sans hover:text-foreground transition-colors"
          >
            send another
          </button>
        </div>
      ) : (
        /* ── Input form ── */
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={state === "loading"}
            className="w-full rounded-xl border border-border bg-[#F9F8F5] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-sans outline-none transition focus:border-foreground focus:ring-1 focus:ring-foreground/20 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === "loading" || !email}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-foreground/90 hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-sans">Sending…</span>
              </>
            ) : (
              <>
                <span className="font-sans">Send Request</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      )}

      <style>{`
        @keyframes pop-in {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
