# Funnel Analysis: Repo To Launch Pages

Date: 2026-03-31

## Funnel Impact

| Funnel Stage | Impacted | Expected Lift | Drop-off Risk Without Feature |
| --- | --- | --- | --- |
| Awareness | Yes | High: the homepage story becomes concrete and instantly legible. | Visitors think supratik.space is an unrelated agent dashboard. |
| Activation | Yes | High: repo URL input is a low-effort first action for open-source builders. | Users hesitate because "build a personal website" feels broader and slower than they want. |
| Engagement | Yes | Medium: regeneration and page claiming create reasons to return. | Builders try once, copy the output elsewhere, and never come back. |
| Retention | Yes | Medium: subdomains, updates, and custom domains tie the page to the repo lifecycle. | The generated page becomes stale or gets replaced by GitHub Pages or a docs stack. |
| Revenue | Yes | Medium to high: a simple `$10` claim flow monetizes demonstrated value. | Users see no clear paid next step after preview. |

## Jobs To Be Done

### Primary Job

When I have a public GitHub repository, I want to turn it into a clean landing page fast, so I can explain, share, and launch the project without building a full website from scratch.

### Secondary Jobs

1. When I share an open-source project, I want a better first impression than a raw README.
2. When I launch often, I want each repo to get a fast marketing surface with minimal extra work.
3. When a project matters, I want to attach my own domain and keep the page fresh as the repo changes.

### Negative Jobs

1. I do not want to maintain a separate docs stack and a separate landing page.
2. I do not want the product to promise hosting of the app itself when it only generates the page.
3. I do not want claim, domain, or regeneration flows to become support-heavy.

## Prioritization Note

Using the Product Manager Toolkit RICE model with directional inputs:

1. Homepage pivot to repo-to-landing-page story: RICE 1000
2. GitMe in-house repo analysis plus landing page generation: RICE 336
3. `$10` claim page upgrade with custom domain and regeneration dashboard: RICE 96

This supports a release order of message first, generation second, monetization third.
