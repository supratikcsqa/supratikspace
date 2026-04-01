# Implementation Plan: Student Folders, Review Workflows, Sharing, and Marks Intelligence

**Date:** 2026-03-31  
**Owner:** Product Feature Manager + Senior Engineering Stack  
**Target Environment:** Local/staging only. The live teacher ngrok build stays frozen until explicit promotion.

## 1. Product Goal

Turn the current flat paper-marking desk into a teacher workspace that can:

- organize students and tests in nested folders
- upload and order pages within a test folder
- review one page at a time with smooth stylus marking
- share marked pages as a simple image bundle through the native share sheet
- store per-test marks and show student performance over time
- optionally use AI to read teacher-awarded marks from selected marked pages and draft totals

## 2. Core Assumptions

- The app remains local-first in this version.
- Teacher data is stored in the browser on the current device.
- AI scoring is optional and only runs when the teacher enters an API key locally.
- No automatic cloud sync is introduced in this version.
- WhatsApp and Telegram sharing will use the browser or device share sheet, not direct platform APIs.

## 3. Scope For This Implementation

### Must Ship

1. Hierarchical folder system
2. Student folder and test folder workflow
3. Folder-scoped multi-image upload
4. Ordered page review with next and previous controls
5. Manual page ordering inside a test folder
6. Marked-image bundle sharing using the Web Share API with a download fallback
7. Folder-level score ledger with half-mark support
8. Student history and performance summaries
9. AI score drafting from selected marked pages when an API key is configured

### Explicitly Out Of Scope

1. Multi-device sync or shared cloud accounts
2. Direct WhatsApp Business API or Telegram Bot sending
3. Automatic handwriting recognition without a configured AI provider
4. Gradebook exports to Google Sheets or Excel
5. Authentication and teacher logins

## 4. User Workflow

1. Teacher creates a student folder such as `Riya`.
2. Teacher creates a test folder inside it such as `Monday Test - 21 Aug`.
3. Teacher uploads the pages for that test into the selected folder.
4. Teacher reorders pages until the sequence is correct.
5. Teacher marks one page at a time and saves automatically.
6. Teacher either enters scores manually or runs AI on selected marked pages.
7. Teacher reviews the computed total and adjusts any score items if needed.
8. Teacher shares all marked pages from that test through the native share sheet.
9. Teacher later opens the student folder to review test history and score trend.

## 5. Technical Plan

### Data Model

- Replace the flat sheet-only store with a workspace snapshot.
- Add folder records with `id`, `name`, `parentId`, `kind`, timestamps, and optional score metadata.
- Extend sheet records with `folderId`, `sortOrder`, `pageLabel`, `markedAt`, and selection flags for AI or sharing.
- Add score entries with question label, awarded marks, maximum marks, source, confidence, and linked sheet IDs.
- Add local settings for AI provider key and chosen model.

### Persistence

- Upgrade IndexedDB from the legacy flat `sheets` store to a new `workspace` snapshot store.
- Migrate old flat sheets into a default imported folder on first load after upgrade.
- Keep migration one-way and local-only.

### Frontend

- Replace the current flat sidebar with a folder tree.
- Add a folder content pane for subfolders and page list.
- Keep the improved dual-canvas marking stack and attach it to the selected page.
- Add score ledger UI, AI controls, and performance summaries.
- Redesign the interface with a restrained Apple-like utility aesthetic:
  - strict spacing scale
  - system typography
  - constrained content widths
  - small, calm controls
  - no oversized AI CTA treatments

### AI Scoring

- Build a local, optional OpenAI Responses API client using direct `fetch`.
- Send selected marked pages as image inputs.
- Request structured JSON output for question-level marks.
- Parse and normalize marks such as `4 1/2`, `1/2`, `4.5`, and optional `out of` values.
- Store AI suggestions as editable score entries rather than hidden calculations.

## 6. Risks And Mitigations

- Handwritten marks can be ambiguous.
  - Mitigation: AI returns editable suggestions with confidence and notes.
- Web Share API support differs by browser.
  - Mitigation: bundle download fallback.
- Current live ngrok preview must not change.
  - Mitigation: no `vite build` against the frozen preview while implementing this version.
- Existing flat-sheet users could lose access if migration is careless.
  - Mitigation: import legacy sheets into a default folder automatically.

## 7. Implementation Order

### Phase A

- New types
- IndexedDB workspace model
- Legacy migration path

### Phase B

- Folder tree
- Test-folder navigation
- Page ordering and selection

### Phase C

- Review workspace
- Next and previous controls
- Share marked bundle

### Phase D

- Score ledger
- Student analytics
- AI scorer setup and invocation

### Phase E

- Local QA on a non-live port
- Responsive verification
- Promotion guidance for later release

## 8. Acceptance Criteria

1. A teacher can create nested student and test folders.
2. A teacher can upload pages into the currently selected folder.
3. A teacher can reorder pages and review them one by one.
4. Marking stays smooth and saves locally per page.
5. The app can share marked pages from a test folder through the native share sheet when supported.
6. The app falls back to downloading marked pages when sharing is unavailable.
7. The teacher can enter and edit awarded marks and maximum marks per question.
8. The app calculates totals and percentages correctly with half marks.
9. The app shows test history and score summaries per student folder.
10. AI scoring works when an API key is configured and fails gracefully when it is not.
