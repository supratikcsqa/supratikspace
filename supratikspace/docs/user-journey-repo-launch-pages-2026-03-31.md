# User Journey: Repo To Launch Page - Before vs After

Date: 2026-03-31

Supersedes the earlier builder-lite framing by making the repo itself the product input.

## Critical Friction Hotspot

A builder lands on `supratik.space` today and cannot tell that a public GitHub repo can become a polished landing page in one step.

```mermaid
flowchart LR
  subgraph Before["Before: current experience"]
    B1["Land on supratik.space"] --> B2["See command-centre language and agent cards"]
    B2 --> B3["Try to understand whether this helps a repo launch"]
    B3 --> B4["No paste-a-repo input, no examples, no preview path"]
    B4 --> B5["Bounce to GitHub Pages, readme.so, GitBook, or manual docs setup"]
  end

  subgraph After["After: repo launch page wedge"]
    A1["Land on supratik.space"] --> A2["See one clear promise: paste a public repo, get a landing page"]
    A2 --> A3["Paste GitHub repo or tree URL"]
    A3 --> A4["GitMe engine generates copy, metadata, README, and static page preview"]
    A4 --> A5["Preview opens on a dedicated supratik.space subdomain"]
    A5 --> A6["Claim the page for $10 to keep it, regenerate it, and connect a custom domain"]
    A6 --> A7["Share the page as the launch surface for the repo"]
  end
```

## Current Journey

1. A builder has an open-source repo but no sharp landing page for it.
2. They visit `supratik.space` and see an AI command-centre story instead of a repo-launch story.
3. They do not see a simple repo URL input or generated examples.
4. They leave to either hand-write docs, use GitHub Pages, or stitch together a docs tool and a marketing page.

## Future Journey

1. The builder arrives and immediately understands the product.
2. They paste a public GitHub repository or subdirectory URL.
3. The in-house GitMe pipeline analyzes the repo and produces launch-ready static artifacts.
4. A polished repo landing page appears on a deterministic `*.supratik.space` subdomain.
5. The builder either shares it immediately or pays `$10` to claim and enhance it.
6. The claimed owner connects a custom domain and regenerates the page as the repo evolves.
