# PRD: Teacher Review Workspace
**Date:** 2026-03-31 | **Status:** Draft | **Owner:** Product Feature Manager Agent

## 1. Feature Summary & Strategic Rationale
Upgrade the paper-marking SPA from a flat image tray into a teacher workspace with foldered student/test organization, one-page review, share-ready marked exports, editable score ledgers, and optional AI-assisted mark extraction. This matters now because the teacher feedback loop has already validated the marking core, and the next retention win is reducing manual organization, score totaling, and sending friction.

## 2. Ecosystem Fit
The product remains a local-first Vite + TypeScript SPA using IndexedDB for persistence and a dual-canvas marking surface for stylus-friendly annotation. This feature extends the existing `SheetRecord` model into a workspace snapshot with folders, score entries, AI summaries, and test history while preserving backward compatibility through a legacy-sheet migration path. It must not break local persistence, existing marked sheets, touch drawing, or the currently frozen teacher ngrok build.

## 3. User Journey Map
Before: a teacher uploads loose answer-sheet images, loses student/test structure, manually infers page order, marks pages, separately totals handwritten scores, and manually sends outputs one by one. The main friction hotspot is the gap between “pages are marked” and “this is a complete, organized test result I can send and track.” After: the teacher creates a student folder, nests a test folder, uploads pages, reorders them, marks pages one at a time, records or AI-drafts scores, reviews the total, and shares the marked bundle from the same workspace. Reference the implementation plan journey in [docs/implementation-plan-2026-03-31.md](/C:/Projects/teachers/docs/implementation-plan-2026-03-31.md).

## 4. User Funnel Impact
This feature primarily improves activation, engagement, and retention. It shortens the path from first upload to finished correction, lowers the drop-off risk between marking and delivery, and creates a reason for tutors to return because historical scores stay organized per student. Primary JTBD: “When I receive multiple answer-sheet photos from a student, I want to organize, mark, total, and send them from one place so I can finish checking quickly and track performance over time.” Secondary JTBDs: keep test pages in order, share marked pages through mobile apps, and draft totals from marked pages. Negative JTBDs: do not force cloud accounts, do not hide marks behind AI-only flows, and do not make sharing depend on a zip export.

## 5. Functional Requirements
1. FR-01: Given a teacher is in the workspace, when they create a student or test folder, then the folder must persist locally and appear in the folder tree immediately.
2. FR-02: Given a teacher has selected a test folder, when they import one or more image files, then the pages must be stored inside that folder with deterministic page ordering.
3. FR-03: Given a teacher is reviewing a test folder, when they select a page and draw on it, then the strokes must render smoothly and save locally on stroke completion.
4. FR-04: Given a teacher has marked one or more pages, when they tap the share action, then the app must prepare plain marked image files for the native share sheet or download fallback.
5. FR-05: Given a teacher records awarded marks and possible marks, when values include fractions such as `1/2` or `4 1/2`, then the app must calculate totals and percentages correctly.
6. FR-06: Given a teacher selects marked pages for AI review and provides an API key, when they run AI calculation, then the app must create editable score suggestions and preserve any manual rows.
7. FR-07: Given a teacher views a student folder, when past scored tests exist under it, then the app must show a simple performance history and aggregate summary.

## 6. Non-Functional Requirements
The app must remain local-first and operate without authentication. Drawing interactions must stay responsive on touch devices and iPad-class screens, with no full-page rerenders during active stroke input. The interface must support desktop plus responsive tablet and mobile layouts, meet basic keyboard and focus accessibility expectations, and save data in the browser with graceful degradation when Web Share or AI configuration is unavailable.

## 7. Out of Scope
1. Multi-device sync or shared teacher accounts.
2. Direct WhatsApp Business API or Telegram Bot delivery.
3. Automatic handwriting recognition without an explicitly configured AI provider.
4. Cloud analytics dashboards, spreadsheets, or gradebook export integrations.
5. Production promotion of the frozen live ngrok build during active teacher feedback.

## 8. Brand & UX Constraints
Use a restrained, Apple-leaning workspace aesthetic: system typography, strict spacing scale, compact controls, limited accent usage, and clear hierarchy without oversized AI affordances. The app should feel like a calm operational tool rather than a marketing dashboard, with the page canvas as the main visual anchor, subtle glass surfaces for navigation and inspectors, and responsive layouts that preserve the marking surface on iPad and mobile screens.

## 9. Success Metrics & Measurement Plan
Primary KPI: percentage of uploaded tests that reach a completed “marked + shared or downloaded” state within one session. Guardrails: touch drawing reliability, local-save integrity, and time-to-first-mark. 30 days: measure test-folder creation, uploads per test, and marked-page completion rate. 60 days: measure use of score ledger rows, AI calculation attempts, and share action completion. 90 days: measure repeat use across multiple student folders and returning tutors who maintain test history over time.

## 10. Open Questions
1. OQ-01: Should AI suggestions merge with manual rows by label or always replace previous AI rows only? | Owner: Product / Eng | Due: next iteration kickoff
2. OQ-02: Should the next phase introduce cloud sync before richer analytics, or keep the product explicitly single-device for now? | Owner: Product | Due: after current teacher feedback cycle
3. OQ-03: Should page reordering evolve from up/down controls to drag-and-drop once the teacher workflow is stable? | Owner: UX / Eng | Due: after usability review
