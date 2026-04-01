# User Journey: Supratik Space Builder Lite - Before vs After

Date: 2026-03-31

## Critical Friction Hotspot

The current homepage looks like an agent dashboard, so a busy builder never reaches a fast, confident "this is for me" moment.

```mermaid
flowchart LR
  subgraph Before["Before: current experience"]
    B1["Land on supratik.space"] --> B2["See command-centre framing<br/>FRICTION: unclear product"]
    B2 --> B3["Try to map the site to a personal brand need<br/>FRUSTRATION: extra thinking required"]
    B3 --> B4["No template showcase, import flow, or clear pricing<br/>FRUSTRATION: no path to action"]
    B4 --> B5["Leave for Framer, Carrd, GitHub Pages, or Super<br/>FRUSTRATION: trust and momentum lost"]
  end

  subgraph After["After: builder-platform lite"]
    A1["Land on a lightweight builder landing page"] --> A2["Choose a use case: resume, portfolio, project showcase"]
    A2 --> A3["Paste a GitHub repo or connect GitHub plus optional profiles"]
    A3 --> A4["Get a live preview on a supratik.space subdomain<br/>DELIGHT: immediate proof"]
    A4 --> A5["Pay $10 to clone the template and unlock the dashboard"]
    A5 --> A6["Optionally connect a custom domain with guided DNS steps"]
    A6 --> A7["Maintain a live builder site from one simple control panel<br/>DELIGHT: low-maintenance credibility"]
  end
```

## Current Journey

1. The visitor arrives expecting a personal-site or project-showcase product.
2. The homepage language signals "agent fleet" rather than "builder website."
3. The visitor cannot quickly see templates, pricing, or import options.
4. The visitor has no fast route to publish a site or showcase open source.
5. The visitor exits to a simpler website builder or GitHub Pages flow.

## Future Journey

1. The visitor lands on a clear landing page for busy builders.
2. The visitor selects a use case and sees one template framed in three modes.
3. The visitor imports a public GitHub repo or connects profile handles.
4. The visitor receives a live preview under `*.supratik.space`.
5. The visitor pays $10 to publish the site and access the dashboard.
6. The visitor optionally maps a custom domain without leaving the flow.
7. The visitor returns to the dashboard only when needed, not to babysit the site.
