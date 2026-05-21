import { useState } from "react";
import {
  /* category icons */
  Search, Radio, Activity, Zap,
  Bot, Database, Server, Layers, GitBranch,
  Target, Sparkles, Send, DollarSign, Calendar, UserCheck, Share2,
  BarChart2, MousePointer, RefreshCw, Microscope, Megaphone, Eye, Repeat,
  Globe, Network, Box, AlertTriangle, ShieldCheck,
  /* per-tool icons */
  Bug, Play, Monitor, Users, Flame, MessageSquare, TrendingUp,
  Brain, Hexagon, Gem, GitFork, Cloud, Package, Map,
  LayoutDashboard, Rocket, Award, Wind, Wrench, Building,
  Mic, Droplet, Code, PieChart, Video, Film, Mail,
  Bell, Flag, Sliders, Clock, Share, GitMerge, Key, Lock,
  Shuffle, Plane, Scan, Star, Pointer, Cpu,
  type LucideIcon,
} from "lucide-react";

/* ── TOOL ICON MAP ───────────────────────────────────────── */
const T: Record<string, LucideIcon> = {
  // Research & Discovery
  "Crawl4AI":                 Bug,
  "Puppeteer":                Globe,
  "Playwright":               Monitor,
  // Market Intelligence
  "Common Room":              Users,
  "SparkToro":                Star,
  "GummySearch":              MessageSquare,
  // Product Intelligence
  "PostHog":                  Activity,
  "Amplitude":                TrendingUp,
  "Clarity":                  Eye,
  // Inference
  "OpenAI":                   Brain,
  "Anthropic":                Hexagon,
  "Gemini":                   Gem,
  // Agent Systems
  "LangGraph":                GitFork,
  "PydanticAI":               ShieldCheck,
  // Retrieval Systems
  "Qdrant":                   Target,
  "pgvector":                 Database,
  "Firecrawl":                Scan,
  // Runtime Infrastructure
  "Cloudflare":               Cloud,
  "Docker":                   Package,
  // Data Layer
  "Postgres":                 Layers,
  // Deployment & CI/CD
  "GitHub Actions":           GitBranch,
  "Terraform":                Map,
  // Lead Generation
  "Clay":                     LayoutDashboard,
  "Apollo":                   Rocket,
  // Lead Enrichment
  "Clearbit":                 Award,
  "Ocean.io":                 Wind,
  "VibeProspecting":          Radio,
  // Outbound Automation
  "Instantly":                Zap,
  "CustomBuilt":              Wrench,
  // Sales Systems
  "HubSpot":                  Building,
  // Meeting & Call
  "Fireflies":                Mic,
  "Cal.com":                  Calendar,
  // LinkedIn Automation
  "HeyReach":                 Pointer,
  "Dripify":                  Droplet,
  "Expandi":                  Share2,
  "SelfBuilt":                Code,
  // Social Scraping
  "Crawl4AI + Claude Code":   Bot,
  // Analytics
  "Mixpanel":                 PieChart,
  // Conversion Intelligence
  "Hotjar":                   Flame,
  "FullStory":                Film,
  "LogRocket":                Video,
  // Lifecycle Automation
  "Braze":                    Mail,
  "Customer.io":              Send,
  "OneSignal":                Bell,
  // Experimentation
  "Statsig":                  Microscope,
  "LaunchDarkly":             Flag,
  "Optimizely":               Sliders,
  // Social Media Automation
  "Buffer":                   Clock,
  "Metricool":                BarChart2,
  "Publer":                   Share,
  // Workflow Automation
  "n8n":                      GitMerge,
  "Trigger.dev":              Play,
  // AI Observability
  "LangSmith":                Eye,
  // Cloud & Edge
  "AWS":                      Server,
  // Networking
  "NGINX":                    Network,
  "HAProxy":                  Shuffle,
  "Envoy":                    Globe,
  // Containerization
  "Fly.io":                   Plane,
  // Monitoring
  "Sentry":                   AlertTriangle,
  // Security & Auth
  "Clerk":                    Key,
  "Auth0":                    Lock,
  "Cloudflare Zero Trust":    ShieldCheck,
};

/* ── PHASE DATA ───────────────────────────────────────────── */
type Tool = string;
type Category = { icon: LucideIcon; name: string; tools: Tool[] };
type Phase = {
  id: string;
  num: string;
  slug: string;
  headline: string;
  accentWord: string;
  narrative: string;
  categories: Category[];
};

const PHASES: Phase[] = [
  {
    id: "discover",
    num: "01",
    slug: "/I_DISCOVER_OPPORTUNITIES",
    headline: "I discover the terrain",
    accentWord: "discover",
    narrative:
      "Assumptions are the most expensive thing a founder can ship. Before writing a line of code I map the market, listen to users, and let data pick the direction.",
    categories: [
      { icon: Search,      name: "Research & Discovery",  tools: ["Crawl4AI", "Puppeteer", "Playwright"] },
      { icon: Radio,       name: "Market Intelligence",   tools: ["Common Room", "SparkToro", "GummySearch"] },
      { icon: Activity,    name: "Product Intelligence",  tools: ["PostHog", "Amplitude", "Clarity"] },
      { icon: Zap,         name: "Inference",             tools: ["OpenAI", "Anthropic", "Gemini"] },
    ],
  },
  {
    id: "build",
    num: "02",
    slug: "/MINIMUM_BUYABLE_PRODUCT",
    headline: "I build to sell, not to impress",
    accentWord: "sell",
    narrative:
      "No vanity sprints. Every system I ship is sellable on day one. I cut the scope until it hurts, then ship it. Agents, retrieval, infra — all in service of the outcome.",
    categories: [
      { icon: Bot,         name: "Agent Systems",         tools: ["LangGraph", "PydanticAI"] },
      { icon: Database,    name: "Retrieval Systems",     tools: ["Qdrant", "pgvector", "Firecrawl"] },
      { icon: Server,      name: "Runtime Infrastructure",tools: ["Cloudflare", "Docker"] },
      { icon: Layers,      name: "Data Layer",            tools: ["Postgres"] },
      { icon: GitBranch,   name: "Deployment & CI/CD",   tools: ["GitHub Actions", "Terraform"] },
    ],
  },
  {
    id: "gtm",
    num: "03",
    slug: "/ENGINEER_GTM_SYSTEMS",
    headline: "I engineer distribution",
    accentWord: "distribution",
    narrative:
      "GTM is not a campaign. It's a system. I build machines that find prospects, enrich signals, automate outbound, and close — with or without a sales team.",
    categories: [
      { icon: Target,      name: "Lead Generation",       tools: ["Clay", "Apollo", "Common Room"] },
      { icon: Sparkles,    name: "Lead Enrichment",       tools: ["Clearbit", "Ocean.io", "VibeProspecting"] },
      { icon: Send,        name: "Outbound Automation",   tools: ["Instantly", "CustomBuilt"] },
      { icon: DollarSign,  name: "Sales Systems",         tools: ["HubSpot"] },
      { icon: Calendar,    name: "Meeting & Call",        tools: ["Fireflies", "Cal.com"] },
      { icon: UserCheck,   name: "LinkedIn Automation",   tools: ["HeyReach", "Dripify", "Expandi", "SelfBuilt"] },
      { icon: Share2,      name: "Social Scraping",       tools: ["Crawl4AI + Claude Code"] },
    ],
  },
  {
    id: "growth",
    num: "04",
    slug: "/AUTOMATE_GROWTH_LOOPS",
    headline: "I automate the flywheel",
    accentWord: "flywheel",
    narrative:
      "Once a channel works, I make it self-sustaining. Analytics pinpoint the leaks. Lifecycle plugs them. Experiments improve the floor, compounding each cycle.",
    categories: [
      { icon: BarChart2,   name: "Analytics",             tools: ["Mixpanel", "PostHog", "Amplitude"] },
      { icon: MousePointer,name: "Conversion Intelligence",tools: ["Hotjar", "FullStory", "LogRocket"] },
      { icon: RefreshCw,   name: "Lifecycle Automation",  tools: ["Braze", "Customer.io", "OneSignal"] },
      { icon: Microscope,  name: "Experimentation",       tools: ["Statsig", "LaunchDarkly", "Optimizely"] },
      { icon: Megaphone,   name: "Social Automation",     tools: ["Buffer", "Metricool", "Publer"] },
      { icon: Repeat,      name: "Workflow Automation",   tools: ["n8n", "Trigger.dev"] },
      { icon: Eye,         name: "AI Observability",      tools: ["LangSmith"] },
    ],
  },
  {
    id: "infra",
    num: "05",
    slug: "/OPERATE_PRODUCTION_INFRA",
    headline: "I keep it running",
    accentWord: "running",
    narrative:
      "Infra is the silent promise. You never hear about it when it works. I build for 99.9% — cloud edges, zero-trust boundaries, auth that never sleeps, logs that tell the truth.",
    categories: [
      { icon: Globe,       name: "Cloud & Edge",          tools: ["AWS", "Cloudflare"] },
      { icon: Network,     name: "Networking & Proxying", tools: ["NGINX", "HAProxy", "Envoy"] },
      { icon: Box,         name: "Containerization",      tools: ["Docker", "Fly.io"] },
      { icon: AlertTriangle,name:"Monitoring",            tools: ["Sentry"] },
      { icon: ShieldCheck, name: "Security & Auth",       tools: ["Clerk", "Auth0", "Cloudflare Zero Trust"] },
    ],
  },
];

/* flat list of every tool across all phases */
const ALL_TOOLS = PHASES.flatMap((ph) =>
  ph.categories.flatMap((cat) =>
    cat.tools.map((t) => ({ name: t, phase: ph.id, phaseNum: ph.num, category: cat.name }))
  )
);

/* ── SHARED ACCENT HELPERS ──────────────────────────────── */
const GREEN      = "#166534";
const GREEN_BG   = "rgba(22,101,52,0.08)";
const GREEN_RING = "rgba(22,101,52,0.18)";

/* ── COMPONENT ───────────────────────────────────────────── */
export function StackMatrix() {
  const [activeId, setActiveId] = useState("all");
  const phase = PHASES.find((p) => p.id === activeId);

  return (
    <section id="stack" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">

        {/* ── Section header ── */}
        <header className="border-b border-border py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2
              className="font-serif text-4xl tracking-tight text-foreground md:text-5xl"
              style={{ fontWeight: 300 }}
            >
              The{" "}
              <span
                className="not-italic text-foreground"
                style={{
                  textDecoration: "underline",
                  textDecorationColor: "#C6F54A",
                  textDecorationThickness: "4px",
                  textUnderlineOffset: "5px",
                }}
              >
                tooling
              </span>{" "}
              I run on.
            </h2>
          </div>

          {/* Phase navigation tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {/* ALL tab */}
            <button
              onClick={() => setActiveId("all")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] border transition-all duration-200 font-mono ${
                activeId === "all"
                  ? "bg-foreground border-foreground text-white shadow-sm"
                  : "bg-transparent border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              <span className="text-[10px] opacity-70">00</span>
              All Tools
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px]"
                style={
                  activeId === "all"
                    ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                    : { background: GREEN_BG, color: GREEN }
                }
              >
                {ALL_TOOLS.length}
              </span>
            </button>

            {PHASES.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] border transition-all duration-200 font-mono ${
                  activeId === p.id
                    ? "bg-foreground border-foreground text-white shadow-sm"
                    : "bg-transparent border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                <span className="text-[10px] opacity-70">{p.num}</span>
                {p.id.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="py-10" key={activeId}>

          {/* ── ALL TOOLS VIEW ── */}
          {activeId === "all" && (
            <>
              <div className="mb-7 flex items-center justify-end">
                <p className="text-sm text-muted-foreground font-mono">
                  {ALL_TOOLS.length} tools · 5 phases
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {ALL_TOOLS.map((tool, i) => {
                  const Icon = T[tool.name] ?? Zap;
                  const ph = PHASES.find((p) => p.id === tool.phase)!;
                  return (
                    <div
                      key={`${tool.name}-${i}`}
                      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-white p-4 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: GREEN_BG, border: `1px solid ${GREEN_RING}` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: GREEN }} strokeWidth={1.75} />
                      </div>
                      <span className="font-sans text-[12px] font-semibold leading-tight text-foreground">
                        {tool.name}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]"
                        style={{ color: GREEN, background: GREEN_BG, border: `1px solid ${GREEN_RING}` }}
                      >
                        {ph.num}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── PHASE VIEW ── */}
          {phase && (
            <>
              {/* Phase header */}
              <div className="mb-8">
                <h3
                  className="font-serif text-3xl tracking-tight text-foreground md:text-4xl"
                  style={{ fontWeight: 300 }}
                >
                  {phase.headline.split(phase.accentWord)[0]}
                  <span
                    className="not-italic text-foreground"
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#C6F54A",
                      textDecorationThickness: "4px",
                      textUnderlineOffset: "5px",
                    }}
                  >
                    {phase.accentWord}
                  </span>
                  {phase.headline.split(phase.accentWord)[1]}
                </h3>
              </div>

              {/* Category cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {phase.categories.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div
                      key={cat.name}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
                    >
                      {/* Category label */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: GREEN_BG, border: `1px solid ${GREEN_RING}` }}
                        >
                          <CatIcon className="h-3.5 w-3.5" style={{ color: GREEN }} strokeWidth={1.75} />
                        </div>
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                          {cat.name}
                        </span>
                      </div>

                      {/* Tools — each with its own icon */}
                      <div className="grid grid-cols-1 gap-2">
                        {cat.tools.map((tool) => {
                          const ToolIcon = T[tool] ?? Zap;
                          return (
                            <div
                              key={tool}
                              className="flex items-center gap-3 rounded-xl border border-border bg-[#F9F8F5] px-3 py-2.5 transition hover:border-[#166534]/30"
                            >
                              <div
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: "rgba(22,101,52,0.06)", border: `1px solid rgba(22,101,52,0.12)` }}
                              >
                                <ToolIcon className="h-3 w-3" style={{ color: GREEN }} strokeWidth={2} />
                              </div>
                              <span className="font-sans text-[13px] text-foreground font-medium">
                                {tool}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="mt-auto border-t border-border/60 pt-2.5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {cat.tools.length} tool{cat.tools.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phase total */}
              <div className="mt-6 flex items-center justify-end gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {phase.categories.reduce((s, c) => s + c.tools.length, 0)} tools
                </span>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
