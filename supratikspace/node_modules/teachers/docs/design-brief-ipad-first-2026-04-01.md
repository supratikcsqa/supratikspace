# Design Brief: Paper Review Desk

**Date:** 2026-04-01  
**Audience:** Senior UI/UX Manager, Senior Product Designer  
**Platform Priority:** Tablet and iPad only  
**Status:** Draft design brief for a ground-up UI rethink

## 1. Brief Summary

Paper Review Desk is a local-first teacher workspace for reviewing student answer-sheet images on iPad or tablet. The product helps a tutor organize images by student and test, mark them naturally with a stylus, total marks, and share corrected pages back to the student.

This is not a general dashboard, file manager, LMS, or whiteboard. It is a focused correction tool for one repetitive workflow: turn a messy image batch into an organized, marked, scored, share-ready test result.

The redesign should optimize for calm, premium, task-first product UX, with the marking experience as the center of gravity.

## 2. Product Definition

### What the product does

- lets a teacher create folders for students
- lets a teacher create test folders inside each student
- imports multiple answer-sheet images into a test folder
- lets the teacher reorder pages
- opens one page at a time for stylus-based marking
- stores marked pages and score entries locally on the device
- helps the teacher total marks manually or through optional AI drafts
- lets the teacher share corrected pages back as plain images

### What the product is really selling

The product sells speed, clarity, and control in the paper-checking workflow.

The teacher should feel:

- "I know exactly where each paper belongs."
- "I can mark naturally with my Pencil."
- "I can move through papers quickly."
- "I can total and send results without leaving the workspace."

## 3. Primary User

### Core user

A private tutor or tuition teacher checking handwritten answer sheets sent as phone photos.

### Working reality

- teaches one or more small batches
- often works on an iPad with Apple Pencil
- receives pages over WhatsApp or similar chat apps
- handles multiple students and multiple tests each week
- needs a clean record of marked tests and performance history

### User mindset

- busy
- repetitive task load
- low tolerance for friction
- wants confidence that work is saved
- values speed and ease over feature richness

## 4. Platform Priority

Design for iPad and tablet first. Do not optimize for desktop first and then compress downward.

The primary target conditions are:

- portrait and landscape tablet layouts
- Apple Pencil and touch interaction
- 44px minimum tap targets
- low-latency, zero-conflict edit mode
- clear thumb and hand reach zones
- easy use while seated at a desk, often switching between Pencil and hand touch

Do not let desktop dashboard conventions dominate the design language.

## 5. Core Job To Be Done

When a student sends me multiple answer-sheet photos in random order, I want to organize them, mark them naturally, calculate the score, and send the corrected pages back from one place so I can finish checking quickly and keep a record of the student's performance.

## 6. Current Product Problem

The product is functionally moving in the right direction, but the UI still feels too much like a prototype. It does not yet feel like a premium, purpose-built teacher tool.

Current issues to solve in the redesign:

- too much panel chrome relative to task value
- too much setup UI visible at once
- weak visual hierarchy
- marking workflow is not yet the unquestioned hero
- empty states feel instructional rather than product-grade
- overall feel is closer to "tool demo" than "lovable daily workspace"

## 7. Product Modes

The product has four real modes. The redesign should make these modes obvious and distinct.

### A. Structure mode

Use case:
- create student folders
- create test folders
- understand where work belongs

Needs:
- simple folder tree
- clear parent-child hierarchy
- low visual noise

### B. Review mode

Use case:
- choose a page
- see current test context
- move page to page

Needs:
- current page clearly selected
- page order visible and editable
- next action obvious

### C. Edit mode

Use case:
- mark one page with Apple Pencil

Needs:
- full-screen, focused, no-scroll environment
- buttery stylus interaction
- save, cancel, undo, clear always accessible
- no competing UI

### D. Results mode

Use case:
- review total marks
- edit or confirm score entries
- share corrected pages
- inspect performance history

Needs:
- simple marks entry
- confidence in totals
- easy share flow
- clean student history

## 8. Design Goal

Create an iPad-first correction workspace that feels calm, premium, and operationally fast. The product should feel closer to a beautifully designed professional tool than to a dashboard or startup admin app.

The redesign should make teachers fall in love with the marking experience, not just tolerate it.

## 9. Design Principles

### 1. Marking is the hero

The design should always make the paper and the act of reviewing it feel central.

### 2. One dominant task per screen

Do not make the teacher manage folders, metadata, scores, and sharing decisions at the same time unless the current step truly requires it.

### 3. Calm utility over dashboard energy

This should not feel like analytics software. It should feel like a quiet, elegant correction desk.

### 4. Strong hierarchy, low noise

Every screen should make it obvious:

- where the teacher is
- what they are working on
- what they should do next

### 5. Apple Pencil respect

Edit mode is not just another screen. It is the trust surface of the whole product.

### 6. Local-first confidence

The teacher must feel their work is safely stored on this device without thinking about infrastructure.

## 10. Key Screens To Design

### Screen 1: Workspace home

Purpose:
- orient the teacher
- show the folder structure area
- make first setup feel simple and premium

### Screen 2: Student folder

Purpose:
- show tests for one student
- show recent results and performance history
- let the teacher enter a specific test context

### Screen 3: Test review workspace

Purpose:
- show test context
- show ordered page list
- show current page preview
- support movement into full-screen edit mode

### Screen 4: Full-screen edit mode

Purpose:
- provide the best possible marking experience
- lock the user into a confident, focused, Pencil-first environment

### Screen 5: Marks and totals

Purpose:
- let the teacher review score entries
- see total and percent
- optionally review AI-drafted marks

### Screen 6: Share and completion state

Purpose:
- help the teacher send marked pages back quickly
- provide closure on the review job

## 11. Information Architecture Priorities

The redesign should likely organize around these layers:

- stable left context rail: students, tests, structure
- primary center workspace: current task and current page
- contextual right inspector or bottom sheet: metadata, marks, share, AI, history

Edit mode may intentionally break this layout and become a dedicated single-purpose canvas environment.

## 12. Interaction Requirements

### Pencil and touch

- Pencil interaction must feel immediate
- hand touch should remain usable
- no accidental scroll conflicts while marking
- controls in edit mode must be easy to reach without covering the paper

### Navigation

- easy switching between students and tests
- easy movement between pages
- obvious selected state

### Data confidence

- local save status should feel reassuring but not noisy
- destructive actions must be clear and safe

## 13. Visual Direction

Desired tone:

- premium
- quiet
- precise
- modern
- warm enough for educators, but not playful

Suggested direction:

- white and slate surfaces
- restrained blue as the main action color
- strong typography
- very little decorative treatment
- generous but disciplined spacing
- minimal ornament

Avoid:

- generic SaaS card grids
- oversized AI callouts
- loud gradients
- startup dashboard cliches
- toy-like educational styling

## 14. Non-Goals

Do not redesign this into:

- a general education platform
- a generic notes or whiteboard app
- a file explorer
- a desktop admin dashboard
- an AI-first product

AI is optional support. The core product is still manual teacher review.

## 15. Product Constraints

- local-first browser app
- no required login for core flow
- no cloud sync in this phase
- optional AI only when teacher enters an API key locally
- share uses native device/browser capabilities where available
- current teacher-facing live build must remain stable while redesign happens in staging

## 16. What We Need From The Senior UI/UX Manager

- rethink the information architecture from scratch
- define the right product modes and transitions between them
- make the iPad correction workflow feel premium and fluid
- identify what belongs permanently on screen versus contextually on demand
- simplify setup and navigation
- define a component system appropriate for this product
- produce a visual system that can scale across workspace, review, edit, and results modes

## 17. Expected Deliverables

- product-level design concept
- iPad portrait and landscape layouts
- full-screen edit mode concept
- folder and test navigation model
- page review and progression model
- score entry and result review model
- design system foundations: type, spacing, color, surfaces, buttons, input patterns
- interaction notes for Pencil and touch

## 18. Success Criteria

The redesign is successful if:

- a teacher understands the product in one glance
- the teacher can get from upload to first mark with almost no friction
- full-screen edit mode feels notably better than the rest of the market
- the product looks like a serious professional tool, not a prototype
- the experience is strong enough that a teacher prefers this workflow over manually juggling chat, photos, and markup

## 19. One-Line Design Challenge

Design the best iPad-first correction workspace for teachers who review handwritten test photos with Apple Pencil.
