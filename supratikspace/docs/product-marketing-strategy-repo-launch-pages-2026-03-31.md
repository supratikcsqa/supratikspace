# Product Marketing Strategy: Repo To Launch Pages

## 1. Executive Summary
Supratik.space should market one sharp idea: paste a public repo, get a launch page. This is a stronger and faster wedge than "build your personal website," because it starts from work the builder already has. The in-house GitMe engine becomes the product backbone, while supratik.space becomes the public conversion surface, preview host, and claim flow.

## 2. ICP and Buyer Map
**Primary ICP:** open-source maintainers, indie hackers, hackathon builders, and developer-creators who ship repos but do not want to handcraft a launch page for each one.  
**Buyer pains:** raw READMEs undersell the project, GitHub profiles are noisy, and separate docs or website stacks take too much time.  
**Trigger moments:** a public launch, a showcase post, a product demo, a job application, an investor intro, or a community share.  
**Decision style:** fast, skeptical, highly practical, willing to pay a small amount once value is already visible.

## 3. Market Problem and Timing
The surrounding market proves demand, but each option stops short of the wedge you can own:

- **GitHub Pages** says "websites for you and your projects" hosted directly from the repo, but the builder still has to make the site. Source: [GitHub Pages](https://pages.github.com/)
- **readme.so** promises "the easiest way to create a README" with a simple editor, but the user still assembles the content manually. Source: [readme.so](https://readme.so/)
- **GitBook** is an AI-native documentation platform, which is stronger for docs operations than instant repo launch pages. Source: [GitBook](https://www.gitbook.com/)
- **Docusaurus** helps teams build optimized documentation websites from content, but still expects a docs-site setup path. Source: [Docusaurus](https://docusaurus.io/)

The opening is a product that turns a repo into a launch-ready page in one action, not a blank canvas the user still has to build.

## 4. Positioning Statement
Supratik.space turns any public GitHub repo into a clean launch page in minutes, so builders can explain and share what they shipped without building another website.

## 5. Key Messages and Proof Points
1. **Start from the repo, not a blank page.** Proof point: the in-house GitMe engine already accepts repo URLs and produces static page artifacts.
2. **Your project gets marketed, not just documented.** Proof point: GitMe was built around "sold, not told" copy and launch-style outputs.
3. **You can share it instantly.** Proof point: each generation can be published to a dedicated `supratik.space` subdomain.
4. **Claim it only when it matters.** Proof point: a low-friction `$10` step can unlock ownership, regeneration, and custom domains after the preview proves value.

## 6. Offer, Packaging, or Pricing Hypotheses
- **Top-level offer:** free or low-friction repo preview on a `supratik.space` subdomain.
- **Paid step:** `$10` to claim the generated page, regenerate it, add custom calls-to-action, and connect a custom domain.
- **Packaging rule:** position the paid step as "claim your launch page," not as buying a website builder.
- **Future packaging:** a multi-repo creator profile can follow once the single-repo page proves demand.

## 7. Launch Plan and Channel Strategy
1. **Homepage relaunch first:** update `supratik.space` to lead with repo-to-launch-page messaging and examples.
2. **Dogfood with your own repos:** publish several of your existing open-source repos as generated landing pages on `supratik.space`.
3. **Builder-community distribution:** share before/after repo pages on X, LinkedIn, GitHub README badges, and indie hacker communities.
4. **Viral loop:** generated pages should include a subtle "made with supratik.space" credit or footer link where acceptable.
5. **Founder-led onboarding:** for the first batch of claimed pages, stay close to users so the claim flow and custom-domain expectations are shaped by real behavior.

## 8. Funnel and Conversion Metrics
- **Top of funnel:** homepage CTA click-through, repo URL submissions, example-page clicks.
- **Mid funnel:** preview generation completion, time to first preview, preview share-outs.
- **Bottom of funnel:** preview-to-claim conversion, regeneration rate, custom-domain completion.
- **Retention:** repeat claimed owners, repeat generations from the same creator, and visits referred by generated pages.

## 9. Sales Enablement Assets Needed
- A homepage hero with one-sentence clarity.
- Three strong example repo pages from your own projects.
- A short GIF or clip showing repo URL to live preview.
- A FAQ that explains what gets generated, what does not get hosted, and what `$10` unlocks.
- A founder outreach script for maintainers who already have promising repos but weak launch surfaces.

## 10. Risks, Assumptions, and Open Questions
- **Risk:** users may interpret "repo to landing page" as app hosting, not page generation. The copy must stay precise.
- **Risk:** if generation quality feels generic, builders will treat the preview as disposable.
- **Risk:** GitMe currently behaves like a CLI output pipeline; productionizing it inside supratik.space needs careful service wrapping.
- **Assumption:** a public preview before payment will materially improve conversion because the product value is easy to judge visually.
- **Open question:** should supratik.space be branded publicly as "powered by GitMe" or should GitMe remain an internal engine only?
