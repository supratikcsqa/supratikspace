<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENT OPERATING RULES
# Shared cross-tool rules file. Drop into any repo root.
# Read by: Codex CLI, Claude Code, Cursor, Windsurf, Antigravity (v1.20.3+), OpenCode.
# Tool-specific overrides live in: GEMINI.md (Antigravity), .cursorrules (Cursor)
# Global: copy to ~/.gemini/AGENTS.md for Antigravity global use (avoids Gemini CLI path conflict)

---

## THE SKILL GATE (NON-NEGOTIABLE)

Before performing ANY task -- planning, coding, debugging, research, anything --
you MUST follow this exact sequence. No exceptions. Not even for "quick" tasks.

```
1. READ this file fully
2. IDENTIFY the required skill for this task
3. LOCATE the skill (search in priority order below)
4. If skill NOT found -> run Skill Acquisition Protocol
5. PRINT the execution trace header (see Execution Protocol)
6. EXECUTE the task through the skill only
```

If you find yourself solving before completing steps 2-5, STOP. Start over.

---

## SKILL PRIORITY ORDER

Search in this order. Use the FIRST match found. Do not skip levels.

1. Project skills           ->  .agents/skills/<skill-name>/SKILL.md
2. Global Codex skills      ->  ~/.codex/skills/<skill-name>/SKILL.md
3. Global Claude skills     ->  ~/.claude/skills/<skill-name>/SKILL.md
4. Global Antigravity       ->  ~/.gemini/antigravity/skills/<skill-name>/SKILL.md
5. Global Gemini CLI        ->  ~/.gemini/skills/<skill-name>/SKILL.md
6. System skills            ->  ~/.codex/skills/.system/
7. Not found                ->  trigger Skill Acquisition Protocol (below)

Note: Global skills are available but must be explicitly selected by name.
Always prefer a project-level skill over a global one when both match.
Antigravity auto-triggers skills by intent match -- skill Description fields must be precise.
Gemini CLI requires explicit routing -- the table above is your only gate.

---

## SKILL ROUTING TABLE

Map the task to a skill name before doing anything else.

| Task Type         | Trigger Keywords                              | Skill Name      |
|-------------------|-----------------------------------------------|-----------------|
| Planning          | plan, roadmap, strategy, design, architect    | planning        |
| Implementation    | build, write, create, implement, code         | implementation  |
| Debugging         | error, bug, traceback, fix, broken, failing   | debugging       |
| Research          | find, look up, compare, investigate, explore  | research        |
| Code Review       | review, check, audit, quality, smell          | code-review     |
| Refactoring       | refactor, clean up, restructure, simplify     | refactoring     |
| Testing           | test, coverage, spec, unit test, integration  | testing         |
| Documentation     | document, explain, write docs, README         | documentation   |
| Security          | vulnerability, auth, permissions, injection   | security        |
| Performance       | slow, optimize, memory, latency, profile      | performance     |

If task spans multiple types: use PRIMARY skill first, chain to secondary after.
If no row matches, run the classification fallback:

```
Classify this task into one of these skill categories:
planning | implementation | debugging | research | code-review |
refactoring | testing | documentation | security | performance

Task: <task description>

Respond with: chosen_skill | reason (one line)
```

---

## SKILL ACQUISITION PROTOCOL

Run this when no skill is found at any priority level.
Follow the steps IN ORDER. Do not skip to a later step if an earlier one is possible.

---

### STEP 1 -- Search GitHub for an existing skill

Always check GitHub before building anything. Do not reinvent the wheel.

Run these searches:
```
site:github.com "<skill-name> skill" SKILL.md agent
site:github.com "codex skill" OR "claude skill" <skill-name>
site:github.com awesome-agents OR awesome-codex <skill-name>
```

A skill is usable ONLY if ALL of the following are true:
  - Repository has >= 50 stars OR is from a known org (Anthropic, OpenAI, verified company)
  - Last commit within 6 months
  - SKILL.md has structured format: When to use / Steps / Output / Validation
  - No signs of abandonment (dead issues, broken links, no responses)

If a credible skill is found:
  1. Read the full SKILL.md
  2. Print: [SKILL SOURCED] github.com/<repo> | <star count> stars | last updated <date>
  3. Copy it to .agents/skills/<skill-name>/SKILL.md
  4. Add a "## Source" section at the bottom with the repo URL
  5. Proceed to Step 4 (Register and invoke)

If multiple credible skills are found:
  - Pick highest stars + most recent update
  - If they conflict in approach, escalate to user before proceeding (see Escalation)

---

### STEP 2 -- If no credible GitHub skill found, use skill-creator

```
Use skill: skill-creator
Goal: create a new skill named <skill-name>
Follow template at: .agents/skill_template.md
Save to: .agents/skills/<skill-name>/SKILL.md
```

Proceed to Step 4 after.

---

### STEP 3 -- If skill-creator is unavailable, self-generate

Use this exact template. Do not deviate from the structure.

```
# <SKILL NAME> SKILL

## When to use
<1-2 sentences describing what task triggers this skill>

## Inputs required
- <input 1>
- <input 2>

## Steps
1. <step 1>
2. <step 2>
3. <step 3>
4. Validate output against the checklist below

## Output format
<describe what the completed output looks like>

## Validation checklist
- [ ] Output matches expected format
- [ ] Steps were followed in order
- [ ] No direct solving occurred outside skill steps

## Source
Self-generated on <date>. Review and improve after first use.
```

Save to: .agents/skills/<skill-name>/SKILL.md

---

### STEP 4 -- Register and invoke (required after ANY acquisition method)

1. Print: [SKILL ACQUIRED] <skill-name> -> .agents/skills/<skill-name>/SKILL.md
2. Print: [ACQUISITION METHOD] GitHub sourced | skill-creator | self-generated
3. Read the saved file back once to confirm it saved correctly
4. Only then proceed to Execution Protocol below

---

## EXECUTION PROTOCOL

This header MUST be printed before any work output. No exceptions.
If this header is missing, the task was not executed through a skill.

```
[SKILL SELECTED]:   <skill-name>
[REASON]:           <why this skill matches the task, one line>
[SOURCE]:           <full path to SKILL.md>
[ACQUIRED FROM]:    project | global | GitHub | skill-creator | self-generated

[EXECUTING STEP 1]: <step name> ...
[EXECUTING STEP 2]: <step name> ...
[EXECUTING STEP N]: <step name> ...

[VALIDATION]:       <confirm output matches skill output format>
[STATUS]:           COMPLETE | ESCALATED | FAILED
```

If STATUS is FAILED: do not retry silently. Diagnose first, then rerun.
If STATUS is ESCALATED: stop and surface to user (see below).

---

## GLOBAL SKILL USAGE RULES

Global skills live at ~/.codex/skills/ and ~/.claude/skills/.
Treat them as a vetted library, not a free-for-all toolbox.

Rules:
  - Never auto-invoke a global skill. Select it deliberately by name.
  - If a project skill exists for the same purpose, use the project skill.
  - When using a global skill, print its name and path in the execution trace.
  - Do not chain multiple global skills without validating each output first.

---

## ESCALATION PROTOCOL

Stop and surface to user if any of the following occur:
  - Task requires external tool install (npm package, pip install, API key)
  - Two skills match equally and they produce conflicting approaches
  - A skill's steps produce invalid output after one retry
  - Task involves destructive operations: delete, overwrite, deploy, publish

Escalation format:
```
[ESCALATION REQUIRED]
Reason:   <what triggered escalation>
Options:  <option A> | <option B>
Awaiting input before proceeding.
```

Do not guess past an escalation point. Stop and wait.

---

## PROHIBITED BEHAVIORS

  - Solving a task directly without routing through a skill
  - Selecting a skill by intuition without checking the routing table
  - Auto-grabbing a global skill without naming it explicitly
  - Starting work without printing the execution trace header
  - Creating a skill without following skill_template.md
  - Retrying a failed skill without diagnosing the failure first
  - Installing a GitHub skill that does not meet the credibility criteria

---

## REPO STRUCTURE (bootstrap this in every new repo)

```
<project-root>/
  AGENTS.md                    <- this file
  .agents/
    skill_template.md          <- blank template for new skills
    skills/
      planning/
        SKILL.md
      implementation/
        SKILL.md
      debugging/
        SKILL.md
```

If .agents/skills/ is empty when you start: run Skill Acquisition (Step 2 or 3)
to bootstrap the 3 core skills before doing anything else.

---

## QUICK REFERENCE

```
TASK IN
  -> check routing table -> get skill name
  -> search priority order (project -> global -> system)
  -> found?
       YES -> print execution trace -> execute -> validate
       NO  -> Step 1: search GitHub (>=50 stars, active, structured)
           -> credible match? copy it to .agents/skills/ -> Step 4
           -> no match? -> Step 2: skill-creator -> Step 4
           -> unavailable? -> Step 3: self-generate -> Step 4
           -> Step 4: register -> print trace -> execute -> validate
```

That is the only permitted flow.

---

## DOMAIN-SPECIFIC ANTI-PATTERNS (NEXT.JS & TESTING) 

### 1. Next.js Routing Cache / Directory Conflicts
**Anti-Pattern:** Scaffolding a Next.js app creates an `app/` folder by default at the root. If you later create a `src/app/` folder, **Next.js will prioritize the root `app/` folder first**.
**Effect:** You will write components in `src/app/` but the dev server (and tests) will silently serve the generic scaffolded pages from `app/`. It won't throw an error, but UI tests will fail with "expected text not found".
**Rule:** Always explicitly verify whether a root `app/` folder exists and delete it if building within `src/app/`.

### 2. Playwright WebServer Port Conflicts on Windows
**Anti-Pattern:** Relying on `reuseExistingServer: true` without ignoring stdout/stderr.
**Effect:** Next.js dev server on Windows exits with `code 1` if port 3000 is taken, which tells Playwright the `webServer` command crashed, even if another process is serving correctly.
**Rule:** Ensure stale `node.exe` processes holding port 3000 are killed (`taskkill /PID <port> /F`) before letting Playwright manage the dev server natively.

### 3. Playwright Strict Mode Violations
**Anti-Pattern:** Matching text loosely across the application: `page.getByText('API Keys')`.
**Effect:** Fails entirely when the page has two instances of the text (e.g., in a Mobile Menu and Desktop Menu, or visually hidden duplicates). Playwright's strict mode throws `resolved to 2 elements`.
**Rule:** Always use `.first()` or `.nth(0)` on `getByText` calls when testing responsive navigation elements, or use highly specific `page.locator()` with strict data-attributes (e.g. `data-testid`).
