# AI Design Prompt: Figma or Google Stitch

Design an iPad-first SaaS web app called **Paper Review Desk**.

This is a premium correction workspace for private tutors and teachers who receive answer-sheet photos from students over WhatsApp or chat, then need to organize them, mark them with Apple Pencil, total scores, and send corrected pages back.

## Product context

This is **not** a generic dashboard, LMS, whiteboard, or file manager.

It is a focused teacher workflow tool with four product modes:

1. structure mode: organize students and tests
2. review mode: choose and move through pages
3. edit mode: full-screen stylus marking
4. results mode: total marks, review scores, share corrected pages

The design should feel like a premium daily-use professional tool for educators.

## Platform priority

Prioritize **tablet and iPad users only**.

Design for:

- iPad portrait
- iPad landscape
- Apple Pencil interaction
- touch-friendly controls

Do not optimize for desktop-first patterns.
Do not design phone-first layouts.

## Core job to be done

When a student sends multiple answer-sheet photos in random order, the teacher wants to organize them, mark them naturally with Pencil, calculate the total, and send the corrected pages back quickly from one place.

## Visual direction

Create a calm, premium, Apple-adjacent product aesthetic:

- white and slate surfaces
- restrained blue accent color
- strong typography
- disciplined spacing
- minimal visual noise
- almost no decorative flourish
- product UI, not marketing UI

Avoid:

- generic SaaS card grids
- startup dashboard look
- oversized AI buttons
- loud gradients
- playful classroom theme
- cluttered inspector panels
- dark mode concepts for this pass

## UX principles

- the paper-marking task is the hero
- one dominant task per screen
- clear hierarchy at a glance
- smooth, focused edit mode
- low cognitive load
- context always visible
- AI is secondary, optional, and quiet

## Key screens to design

### 1. Workspace home

Show:

- app identity
- student and test structure entry point
- quick orientation
- premium first impression

### 2. Student folder view

Show:

- student context
- list of tests
- recent results
- clear action to open a specific test

### 3. Test review workspace

Show:

- selected test context
- ordered page rail or page list
- current page preview
- next/previous page progression
- clear action to enter full-screen edit mode

### 4. Full-screen edit mode

This is the most important screen.

Show:

- large answer-sheet canvas
- Pencil-first marking experience
- save, cancel, undo, clear controls
- no scroll conflicts
- minimal chrome

Make this the standout moment of the product.

### 5. Marks and totals panel

Show:

- question-level scores
- support for partial marks like 4 1/2
- total, possible, percent
- optional AI-drafted suggestions without making AI the center of the experience

### 6. Share completion state

Show:

- marked pages ready to send
- clear completion state
- confidence that the review job is finished

## Information architecture

Base the app around:

- stable left context rail for students and tests
- large central workspace for the current task
- contextual right inspector or bottom sheet for marks, metadata, history, and sharing

For edit mode, break from the normal shell if needed and create a dedicated single-purpose full-screen experience.

## Interaction notes

- design for Pencil and touch targets
- minimum 44px tap targets
- easy one-handed access to primary actions in edit mode
- selected page state must be obvious
- moving through pages should feel fast and calm
- save state should feel reassuring without being noisy

## Deliverables

Create a polished concept with:

- iPad portrait screens
- iPad landscape screens
- one clear visual system
- type, color, spacing, buttons, inputs, panels
- a strong edit mode concept
- components that feel consistent and production-ready

## Tone test

The final design should make a teacher feel:

- "this was made for my workflow"
- "this is calm and easy to trust"
- "marking on this feels smooth and premium"

## Hard instruction

Do not give me a generic SaaS dashboard.
Do not make the layout card-heavy.
Do not make AI the hero.
Make the marking experience the emotional and functional center of the product.
