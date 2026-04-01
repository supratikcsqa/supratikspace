# Implementation Plan: Workspace-First Teacher Navigation

**Date:** 2026-04-01  
**Status:** In Progress

## Product Decision
Make the `Workspace` page the real home page.

The app should no longer behave like:
- dashboard first
- then student pages
- then exam pages

It should behave like:
- one persistent teacher workspace
- nested left navigation
- content pane changes based on selected class, student, or exam

## Target Information Architecture

```text
Workspace
  Class
    Student
      Exam
        Exam copies
```

## Key UX Rules

1. Left panel is the teacher dashboard at all times.
2. Classes are always visible and easy to reach.
3. Clicking a class immediately reveals its students in the same left tree.
4. Clicking a student immediately shows:
   - student performance
   - exam list
   - recent checked copies context
5. Clicking an exam immediately shows:
   - uploaded exam copies
   - checking workflow
   - scoring
   - share actions
6. The app should feel like a compact workbench, not a card-heavy mobile app.

## Implementation Scope

### 1. Persistent Workspace Shell
- Replace the separate dashboard home with one workspace shell.
- Keep a persistent left sidebar with:
  - brand / workspace identity
  - quick create
  - nested class > student > exam tree
  - compact stats

### 2. Root Workspace Content
- When nothing is selected, show a simple workspace overview:
  - classes
  - recent exams
  - quick orientation
- No large “dashboard card” experience.

### 3. Class View
- Main pane shows:
  - student list
  - class-level exam activity
  - class summary

### 4. Student View
- Main pane shows:
  - student performance
  - all exams
  - quick access to latest exam

### 5. Exam View
- Main pane shows:
  - exam copies
  - check-copy action
  - calculate marks
  - checking complete
  - share all checked copies
  - share current checked copy

## Visual Direction
- compact density
- minimal padding
- strong hierarchy
- no AI-fluff empty states
- VS Code / Linear style density, not tablet-card layouts

## Immediate Engineering Steps

1. Add reusable workspace sidebar renderer
2. Replace home dashboard renderer with workspace root renderer
3. Wrap class, student, and exam screens in the same workspace shell
4. Reverse content hierarchy on exam cards:
   - student + class line bold
   - exam title secondary
5. Reduce remaining decorative padding and oversized headings

## Success Criteria

- Teacher always sees the class tree on the left
- Teacher can move from class to student to exam in one consistent layout
- No confusing “which page am I on?” moments
- Exam actions are obvious and student-specific
- Workspace feels clean, dense, and operational
