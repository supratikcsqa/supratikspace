# PRD: Supratik Space Builder Lite
**Date:** 2026-03-31 | **Status:** Draft | **Owner:** Product Feature Manager Agent

## 1. Feature Summary & Strategic Rationale
Supratik.space should pivot from an "agent command centre" presentation into a builder-first personal website product with three lightweight updates: a landing page that explains the value clearly, a GitHub-driven subdomain publishing flow for public projects, and a $10 template-clone offer that gives the buyer a simple dashboard plus optional custom-domain setup. This matters now because the current site already has premium visual polish but is misaligned with the real story: busy builders want a fast way to present live work, not a heavy website-builder workflow. The primary metric this feature should move is preview-to-publish activation rate.

## 2. Ecosystem Fit
- **Stack:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **Current routes:** `/` for the main experience, `/agent/:agentId` for native agent workspaces, `/login`, and `/admin`.
- **Current data model:** `Agent`, `Category`, and `AgentPersonality` live entirely in frontend code and local storage. There is no real user account, payment, domain, or project model yet.
- **Current API surface:** the only live integration is a frontend `fetch` call to `${agent.url}/generate` for native agents. There is no internal backend for site provisioning.
- **User roles:** public visitor and a local-password admin.
- **Reusable UI:** the current hero layout, grid/card patterns, navbar shell, footer, Tailwind tokens, and the emerald/slate visual system should be reused where possible.
- **Constraints:** the product is static today, the homepage copy is mispositioned, there is only one template, and no internal persistence exists beyond local storage.
- **Adjacent features that must not break:** the current admin CRUD flow, existing native agent workspace routes, external project links, and the general visual quality of the site.

## 3. User Journey Map
The current journey has a single major failure: a builder lands on the site and cannot tell that it is meant to help them publish a personal website. The future journey replaces that confusion with a fast landing page, a GitHub-first import step, a live subdomain preview, a $10 publish action, and optional custom-domain mapping. See `docs/user-journey-builder-platform-lite-2026-03-31.md` for the before-versus-after diagram and walkthrough.

## 4. User Funnel Impact
This feature primarily targets Awareness, Activation, and Revenue, while also improving Engagement and Retention by making the site useful after first publish. The primary JTBD is: "When I am a busy builder with projects spread across GitHub and creator tools, I want a personal site generated from my live work, so I can look credible and current without becoming a full-time website maintainer." Secondary and negative jobs, along with the funnel table, are documented in `docs/funnel-analysis-builder-platform-lite-2026-03-31.md`.

## 5. Functional Requirements
1. **FR-01:** Given a visitor lands on `/`, when the homepage loads, then the visitor must see builder-focused copy, three clear use cases (resume, portfolio, project showcase), template previews, and a primary CTA to start a preview or buy the template.
2. **FR-02:** Given a visitor pastes a public GitHub repository or account, when they start the import flow, then the product must create a preview-ready project entry that can be published to a dedicated `*.supratik.space` subdomain.
3. **FR-03:** Given the site currently has only one template, when a visitor selects a use case, then the product must configure the same template with the right section order and labels for that use case instead of requiring multiple themes.
4. **FR-04:** Given a visitor pays $10, when checkout completes, then the product must clone the starter personal website for that user and provision a simple dashboard where the user can edit handles, links, featured projects, and publishing settings.
5. **FR-05:** Given a user wants a richer profile, when they connect supported sources such as GitHub and optional external handles like Beehiiv or Behance, then the dashboard must store and display those sources so the site can render them without manual re-entry.
6. **FR-06:** Given a user owns a custom domain, when they choose to connect it, then the product must present clear DNS instructions, verify the mapping, and publish the selected site to that domain once verification succeeds.
7. **FR-07:** Given an admin or operator needs to support the launch, when they review created sites, then they must have a clear internal way to view site state, payment state, source connections, and publish status for the first lightweight release.

## 6. Non-Functional Requirements
- The landing page and generated sites must meet WCAG AA accessibility as a minimum.
- Mobile layouts must work at 375px width and desktop layouts must remain fast and readable.
- The first contentful paint for the landing page should stay within a modern Vite static-site budget, and preview generation should feel near-instant from the user perspective.
- Any stored tokens or external profile credentials must use least-privilege scopes and encrypted storage once backend persistence exists.
- The first release should prefer public-data ingestion where possible to reduce auth complexity.
- Publish and domain-mapping failures must return actionable error messages, not silent failures.
- Generated sites must preserve SEO-friendly metadata, readable URLs, and basic social-preview fields.

## 7. Out of Scope
- A drag-and-drop website editor or full no-code page builder.
- A true enterprise CRM with pipelines, sales stages, and deep automation.
- A multi-template marketplace with dozens of themes in the first release.
- Domain purchasing or registrar management inside supratik.space.
- Private-repository ingestion or broad OAuth scopes on day one.

## 8. Brand & UX Constraints
- Keep the current premium, clean, light visual system: emerald accent, slate neutrals, `Outfit` display typography, and restrained motion.
- Replace militaristic or control-centre copy with plain, builder-first language aimed at busy people.
- Keep copy value-oriented and short; avoid heavy conceptual language or feature-stuffed paragraphs.
- The homepage should feel like a fast decision surface, not a product tour maze.
- Reuse existing card and grid structure where helpful, but the semantics must shift from "agents" to "templates, projects, and sites."
- Make the single existing template feel versatile by framing modes and outcomes instead of apologizing for template count.

## 9. Success Metrics & Measurement Plan
**Primary KPI:** Preview-to-publish activation rate - **Target:** 25% by June 30, 2026.  
**Guardrail Metrics:** homepage bounce rate at or below 55%; time to first preview at or below 3 minutes; publish failure rate below 5%; manual support required on no more than 20% of paid orders in the lightweight release.  
**Measurement Plan:**  
- **30 days (April 30, 2026):** track homepage CTA click-through rate, template preview starts, and GitHub import completion rate.
- **60 days (May 30, 2026):** track preview-to-paid conversion rate, subdomain publish success rate, and profile-connection attach rate.
- **90 days (June 30, 2026):** track preview-to-publish activation rate, custom-domain completion rate, and weekly active published-site owners.

## 10. Open Questions
1. **OQ-01:** Should the subdomain model be repo-first (`project.supratik.space`) or creator-first (`name.supratik.space/project`)? | **Owner:** Supratik | **Due:** 2026-04-01
2. **OQ-02:** Is the first release allowed to use manual fulfillment after payment for dashboard setup and publish actions, or must the flow be fully self-serve? | **Owner:** Supratik + Engineering | **Due:** 2026-04-01
3. **OQ-03:** What is the minimum acceptable definition of "CRM" for the lightweight release: profile control panel, leads inbox, or a broader customer database? | **Owner:** Product + Supratik | **Due:** 2026-04-02
4. **OQ-04:** Which payment provider should own the $10 transaction in v1, and does the offer need taxes or invoice support? | **Owner:** Engineering | **Due:** 2026-04-02
5. **OQ-05:** Which external sources beyond GitHub are launch-critical versus nice-to-have: Beehiiv, Behance, X, LinkedIn, or others? | **Owner:** Product | **Due:** 2026-04-02
