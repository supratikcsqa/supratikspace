# PRD: Repo To Launch Pages
**Date:** 2026-03-31 | **Status:** Draft | **Owner:** Product Feature Manager Agent

## 1. Feature Summary & Strategic Rationale
Supratik.space should reposition around a sharper promise: any public GitHub repository can become a launch-ready landing page on `supratik.space`. The core product is no longer "build a personal website first"; it is "paste a repo, get a page." The existing `gitme` project already contains the generation engine needed for this wedge: it accepts a repo URL or local path, analyzes the repository, and outputs static artifacts such as `index.html`, `README.md`, metadata, diagrams, and optional marketing kits. Bringing that capability in-house lets supratik.space own a clearer, faster use case for busy builders. The primary metric this feature should move is repo-preview generation rate.

## 2. Ecosystem Fit
- **Current supratik.space stack:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **Current supratik.space routes:** `/`, `/agent/:agentId`, `/login`, `/admin`.
- **Current supratik.space limitation:** the homepage still presents an "agent command centre" story, which does not match the new repo-launch positioning.
- **Current GitMe capability:** `C:\Projects\gitme\scripts\generate-readme\index.js` already parses GitHub repo URLs and tree paths, clones or copies source, scans files, generates content, and writes static output into `readme-output/<repo>/`.
- **GitMe outputs today:** `index.html`, `README.md`, `readme-metadata.json`, diagrams, and optional thumbnail/video/social artifacts.
- **User roles for the revised product:** public visitor, claimed page owner, and internal admin/operator.
- **Shared product opportunity:** keep the current light visual system and reuse the existing frontend shell, but shift semantics from agent cards to generated repo pages and templates.
- **Adjacent flows that must not break:** existing `agent` workspace flows, the local admin route, and the visual quality of the current frontend.

## 3. User Journey Map
The current journey fails because users do not see a repo-launch workflow. The future journey begins with a repo URL input, then uses the in-house GitMe engine to produce a preview page on a dedicated subdomain, followed by an optional `$10` claim flow for ownership, regeneration, and custom domains. See `docs/user-journey-repo-launch-pages-2026-03-31.md` for the before-versus-after journey.

## 4. User Funnel Impact
This feature primarily improves Awareness and Activation by giving builders a narrow, credible first action. It also supports Revenue through the `$10` claim step and supports Retention through regeneration and custom domains. The primary JTBD is: "When I have a public GitHub repository, I want to turn it into a clean landing page fast, so I can explain, share, and launch the project without building a full website from scratch." Funnel details are documented in `docs/funnel-analysis-repo-launch-pages-2026-03-31.md`.

## 5. Functional Requirements
1. **FR-01:** Given a public visitor lands on `/`, when the homepage loads, then the visitor must see repo-to-landing-page positioning, examples, and a primary CTA to paste a public GitHub URL.
2. **FR-02:** Given a visitor submits a public GitHub repository URL or GitHub tree path, when generation begins, then the system must invoke the in-house GitMe generation flow to analyze the source and build landing-page artifacts.
3. **FR-03:** Given generation succeeds, when the preview is ready, then the system must publish a static preview page to a dedicated `*.supratik.space` subdomain for that repo.
4. **FR-04:** Given a repo landing page is generated, when the page renders, then it must include clear project framing, metadata, value-first copy, quickstart context, and links back to the source repository.
5. **FR-05:** Given a builder wants to keep and manage the page, when they pay `$10`, then the system must create an owner-facing dashboard where they can regenerate the page, add manual CTA or profile details, and manage custom-domain setup.
6. **FR-06:** Given a claimed owner wants a branded URL, when they connect a custom domain, then the system must present DNS instructions, verify the mapping, and publish the landing page at that domain.
7. **FR-07:** Given an admin or operator needs to support the system, when they inspect generated pages, then they must be able to see repo source, generation status, publish status, claim status, and custom-domain status.
8. **FR-08:** Given a repository changes over time, when an owner requests regeneration, then the system must rerun generation against the latest public source without forcing the owner to recreate the page from scratch.

## 6. Non-Functional Requirements
- The first release must support public GitHub repositories and GitHub tree paths only.
- Generation jobs should be resilient to GitHub fetch failures and large-repo timeouts, with visible job states and actionable error messages.
- Output pages must be static, fast-loading, and mobile-safe at 375px width minimum.
- Generated HTML and metadata must be sanitized before publish to avoid unsafe output or broken pages.
- Secrets for LLM usage, GitHub access, and domain verification must be kept server-side and encrypted.
- Rate limits must protect generation endpoints from abuse.
- The landing page and generated pages must meet WCAG AA accessibility as a minimum.

## 7. Out of Scope
- Hosting or deploying the repository's application runtime itself.
- Private-repository access in the first release.
- A full drag-and-drop site builder.
- A full CRM with pipelines, lead scoring, or sales automation.
- Exposing every GitMe add-on such as video, Reddit, or Instagram kits in the day-one supratik.space flow.

## 8. Brand & UX Constraints
- Replace command-centre and military-style framing with plain builder language.
- Keep copy short, practical, and easy to scan for a busy audience.
- Use the current clean light-theme system, but shift components toward examples, previews, and proof.
- The homepage should feel like a fast converter, not a complicated dashboard.
- The repo input flow should feel trustworthy and specific about what will be generated.
- Do not imply that the user's software itself is being hosted unless that is actually true; the promise is a launch page for the repo.

## 9. Success Metrics & Measurement Plan
**Primary KPI:** Repo-preview generation rate - **Target:** 35% of homepage CTA initiators generate a preview by June 30, 2026.  
**Guardrail Metrics:** generation failure rate below 10%; median generation time below 120 seconds; claimed-page support tickets below 1 per 5 paid orders; homepage bounce rate at or below 50%.  
**Measurement Plan:**  
- **30 days (April 30, 2026):** track repo URL submissions, preview generation completions, and homepage CTA click-through.
- **60 days (May 30, 2026):** track preview-to-claim conversion, regeneration usage, and subdomain publish success rate.
- **90 days (June 30, 2026):** track claimed-page retention, custom-domain completion, and referral traffic from generated pages.

## 10. Open Questions
1. **OQ-01:** What should the default public URL pattern be: `repo.supratik.space`, `owner-repo.supratik.space`, or a path-based model? | **Owner:** Supratik | **Due:** 2026-04-01
2. **OQ-02:** Should preview generation be free and public for all supported repos, or should some generation quota or email gate apply? | **Owner:** Product | **Due:** 2026-04-01
3. **OQ-03:** Which GitMe outputs are launch-critical inside supratik.space: only `index.html` and metadata, or also README regeneration and thumbnails? | **Owner:** Product + Engineering | **Due:** 2026-04-02
4. **OQ-04:** Should the `$10` payment claim a single repo page, a creator profile that can hold multiple repo pages, or both? | **Owner:** Supratik | **Due:** 2026-04-02
5. **OQ-05:** How much of the existing `gitme` CLI should be wrapped as-is in v1 versus extracted into a reusable internal service package? | **Owner:** Engineering | **Due:** 2026-04-02
