# Backend Architecture: Repo To Launch Pages

## 1. Scope
Design the backend needed to bring `C:\Projects\gitme` in-house as the generation engine behind `supratik.space`, so a public GitHub repo can become a published landing page on a dedicated subdomain, with a later `$10` claim flow for ownership and custom domains.

## 2. Current System Fit
- **Current supratik.space fit:** the current project is a frontend-only Vite app with local-storage state and no internal backend for generation, payments, pages, or domains.
- **Current GitMe fit:** `scripts/generate-readme/index.js` is a Node CLI pipeline that already handles URL parsing, repo cloning or copying, file scanning, content generation, and static artifact rendering to `readme-output/<repo>/`.
- **Operational implication:** the fastest path is to wrap GitMe in a service boundary instead of rewriting the engine from scratch.

## 3. Proposed Components and Responsibilities
1. **Marketing Frontend Service**
   - Owns homepage input, examples, preview states, and claim CTAs.
2. **Generation API Service**
   - Accepts repo URL submissions.
   - Validates repo source and feature flags.
   - Creates generation jobs.
3. **GitMe Worker**
   - Executes the existing GitMe flow in an isolated worker process or extracted module.
   - Produces `index.html`, README, metadata, thumbnails, and artifacts.
4. **Artifact Storage and Publisher**
   - Stores generated assets.
   - Publishes the chosen page artifact to a subdomain or CDN-backed static path.
5. **Page Registry**
   - Tracks source repo, generated page slug, generation version, publish state, claim state, and owner linkage.
6. **Claim and Domain Service**
   - Handles payment confirmation, ownership, regeneration authorization, and custom-domain verification.
7. **Admin Operations Console**
   - Shows job queue, failure states, claim states, and publish status. This can extend the existing admin route later.

## 4. API Contract
### `POST /api/pages/preview`
- **Purpose:** start generation for a public repo.
- **Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "branch": "main",
  "subPath": "",
  "features": {
    "thumbnail": true,
    "video": false
  }
}
```
- **Response:**
```json
{
  "jobId": "job_123",
  "status": "queued"
}
```

### `GET /api/jobs/:jobId`
- **Purpose:** poll generation status.
- **Response fields:** `status`, `error`, `previewUrl`, `pageId`.

### `POST /api/pages/:pageId/claim`
- **Purpose:** create or attach an owner after successful payment.
- **Auth:** required.

### `POST /api/pages/:pageId/regenerate`
- **Purpose:** rerun GitMe against the latest public source.
- **Auth:** required for claimed pages.

### `POST /api/pages/:pageId/custom-domain`
- **Purpose:** save a requested custom domain and return DNS instructions.
- **Auth:** required.

### `POST /api/pages/:pageId/custom-domain/verify`
- **Purpose:** validate DNS and mark the domain active.
- **Auth:** required.

## 5. Data Model and Migration Plan
### Core Tables
- **`repo_sources`**
  - `id`
  - `repo_url`
  - `owner`
  - `repo_name`
  - `branch`
  - `sub_path`
  - `source_type`
  - `last_seen_commit`

- **`generation_jobs`**
  - `id`
  - `repo_source_id`
  - `status`
  - `requested_features`
  - `started_at`
  - `completed_at`
  - `error_code`
  - `error_message`

- **`generated_pages`**
  - `id`
  - `repo_source_id`
  - `current_job_id`
  - `slug`
  - `preview_url`
  - `artifact_manifest`
  - `publish_status`
  - `claim_status`

- **`claimed_sites`**
  - `id`
  - `generated_page_id`
  - `owner_user_id`
  - `payment_status`
  - `claimed_at`
  - `manual_overrides_json`

- **`custom_domains`**
  - `id`
  - `generated_page_id`
  - `hostname`
  - `verification_status`
  - `verified_at`

### Migration Sequencing
1. Add registry tables without touching current frontend flows.
2. Enable preview jobs first.
3. Add claim-state and payment-state tables second.
4. Add custom-domain verification last.

## 6. Background Jobs and Integrations
- **Repo fetch job:** clone or download the requested public source.
- **Generation job:** run GitMe generation using existing URL parsing, scan, content, and render steps.
- **Artifact publish job:** upload output artifacts and bind the preview URL.
- **Regeneration job:** rerun generation on demand or when explicitly requested.
- **Custom-domain verification job:** periodically verify DNS records until success or timeout.
- **External integrations:** GitHub public repo access, LLM provider for copy generation, storage/CDN provider, payment provider, and DNS/domain verification service.

## 7. Security and Permission Model
- Public users may request preview generation only for public repos and only within rate limits.
- Claimed-page actions require authenticated ownership.
- Admin actions require elevated access.
- All LLM keys and payment secrets remain server-side.
- Generated HTML must be sanitized and validated before publish.
- Repo URLs and subpaths must be normalized to prevent path abuse or unsupported hosts.

## 8. Observability and Alerting
- **Logs:** job creation, repo fetch outcome, generation duration, publish outcome, custom-domain verification attempts.
- **Metrics:** preview requests, success rate, median generation time, claim conversion rate, regeneration frequency, custom-domain completion rate.
- **Alerts:** sustained generation failures, storage publish failures, payment webhook failures, and repeated GitHub fetch rate-limit errors.

## 9. Failure Modes and Recovery
- **GitHub fetch failure:** mark job failed with retryable message; allow resubmit.
- **Large or malformed repo:** fail early with a repo-scope warning.
- **LLM generation failure:** retry once, then surface clear failure to the user.
- **Artifact publish failure:** keep generated outputs in storage and retry publish separately.
- **Custom-domain verification failure:** preserve the page on the default subdomain and keep DNS instructions visible.
- **Duplicate preview requests:** dedupe by normalized repo URL plus branch plus subpath when possible.

## 10. Rollout and Rollback Plan
### Rollout
1. Launch homepage repositioning with static examples first.
2. Enable preview generation for a controlled beta set of public repos.
3. Publish previews only on `supratik.space` subdomains.
4. Add `$10` claim and regeneration once preview quality is stable.
5. Add custom-domain support after publish reliability is proven.

### Rollback
- Disable preview submission at the frontend.
- Keep already-generated static pages live.
- Pause worker processing without deleting stored artifacts.
- Revert claim and custom-domain flows independently if needed.

## 11. Open Risks and Decisions
- **Risk:** wrapping GitMe as a CLI subprocess is the fastest route, but module extraction may be needed for better control and observability.
- **Risk:** LLM-generated launch copy can drift into generic language unless prompts are tuned for repo specificity.
- **Decision needed:** whether to make preview generation synchronous for small repos or always queue-backed.
- **Decision needed:** whether to store the full artifact bundle per generation or only the active published version.
