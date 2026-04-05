---
name: ide-skill-audit
description: |
  Tri-Gate Skill Analyzer that runs entirely inside the IDE.
  No external API keys needed — the IDE agent IS the LLM.
  Scores skills across V1 (Gatekeeper), V2 (Rubricist), V3 (Codex).
version: 1.0.0
---

# IDE Skill Audit Pipeline

You are executing the **Tri-Gate Skill Analyzer** — a 3-stage audit pipeline for evaluating AI agent skill definitions. You will role-play as three different scoring agents in sequence, saving each output and running a parser script to extract scores.

## Prerequisites

- The target skill file path must be provided by the user
- Python 3.x must be available for running the parser scripts
- All prompt files are in `ide-pipeline/prompts/`

## Pipeline Execution

### Stage 1: V1 — The Gatekeeper (CFRA Framework)

1. **Read the V1 scoring prompt**:
   - Open and read the file: `ide-pipeline/prompts/v1-gatekeeper.md`
   - This is your system prompt for this stage. Internalize it completely.

2. **Read the target skill file**:
   - Open and read the skill file provided by the user.

3. **Execute the V1 audit**:
   - Role-play as **The Gatekeeper** as described in the V1 prompt.
   - Treat all missing metadata (file tree, git history, tests) as `[Not available — single file audit]`.
   - Proceed immediately with the full 8-pillar audit using only the skill content.
   - Your output MUST include a scoring table in this exact format:

   ```
   | # | Pillar | Weight | Score | Evidence |
   |---|--------|--------|-------|----------|
   | 1 | Pillar Name | 15% | 7/10 | Evidence text |
   ```

4. **Save the V1 output**:
   - Write your complete V1 audit report to: `ide-pipeline/reports/v1_raw.md`

5. **Parse V1 scores**:
   - Run this command:
   ```bash
   python ide-pipeline/score_parser.py ide-pipeline/reports/v1_raw.md v1
   ```
   - Read the output. Note the V1 composite score and pass/fail status.
   - Report to the user: `V1 Gatekeeper: [score]/100 — [PASS/FAIL]`

---

### Stage 2: V2 — The Rubricist (CoALA-Scoring Framework)

1. **Read the V2 scoring prompt**:
   - Open and read: `ide-pipeline/prompts/v2-rubricist.md`
   - This is your system prompt for this stage. Internalize it completely.

2. **Execute the V2 evaluation**:
   - Role-play as **The Rubricist** as described in the V2 prompt.
   - Evaluate the SAME skill file from Stage 1.
   - Include the mandatory `<scratchpad>` block with your reasoning traces.
   - Your output MUST include a scoring table in this exact format:

   ```
   | # | Dimension | Weight | Score | Key Evidence |
   |---|-----------|--------|-------|--------------|
   | 1 | Clarity & Precision | 15% | 3/4 | Evidence text |
   ```

3. **Save the V2 output**:
   - Write your complete V2 evaluation to: `ide-pipeline/reports/v2_raw.md`

4. **Parse V2 scores**:
   - Run this command:
   ```bash
   python ide-pipeline/score_parser.py ide-pipeline/reports/v2_raw.md v2
   ```
   - Read the output. Note the V2 composite score and pass/fail status.
   - Report to the user: `V2 Rubricist: [score]/100 — [PASS/FAIL]`

---

### Stage 3: V3 — The Codex (MESA Framework)

1. **Read the V3 scoring prompt**:
   - Open and read: `ide-pipeline/prompts/v3-codex.md`
   - This is your system prompt for this stage. Internalize it completely.

2. **Execute the V3 evaluation**:
   - Role-play as **The Codex** as described in the V3 prompt.
   - Evaluate the SAME skill file from Stage 1.
   - Include the mandatory `<mesa_scratchpad>` block.
   - Include the adversarial stress-test matrix (minimum 5 scenarios).
   - Your output MUST include a scoring table in this exact format:

   ```
   | # | Dimension | Weight | Score | Key Evidence |
   |---|-----------|--------|-------|--------------|
   | 1 | Dimension Name | 15% | 3/4 | Evidence text |
   ```

3. **Save the V3 output**:
   - Write your complete V3 evaluation to: `ide-pipeline/reports/v3_raw.md`

4. **Parse V3 scores**:
   - Run this command:
   ```bash
   python ide-pipeline/score_parser.py ide-pipeline/reports/v3_raw.md v3
   ```
   - Read the output. Note the V3 composite score and pass/fail status.
   - Report to the user: `V3 Codex: [score]/100 — [PASS/FAIL]`

---

### Final Verdict

1. **Compute the final verdict**:
   - Run this command:
   ```bash
   python ide-pipeline/compute_verdict.py ide-pipeline/reports/
   ```
   - Read the output and present the full verdict summary to the user.

2. **Present the consolidated results**:
   ```
   ╔══════════════════════════════════════════════╗
   ║     TRI-GATE SKILL AUDIT — FINAL VERDICT    ║
   ╠══════════════════════════════════════════════╣
   ║  V1 Gatekeeper:  [score]/100  [PASS/FAIL]   ║
   ║  V2 Rubricist:   [score]/100  [PASS/FAIL]   ║
   ║  V3 Codex:       [score]/100  [PASS/FAIL]   ║
   ╠══════════════════════════════════════════════╣
   ║  VERDICT:  [FINAL_VERDICT]                   ║
   ║  SCORE:    [composite]/100                   ║
   ╚══════════════════════════════════════════════╝
   ```

## Rules

- **Always run all 3 stages** — no early termination on fail
- **Each stage is independent** — do not let V1's findings influence V2/V3 scoring
- **Score what you see** — never fabricate evidence or guess at missing data
- **Save raw output first** — then run the parser. If the parser fails, the raw output is preserved for debugging
- **The parser handles all math** — do NOT compute weighted composites yourself, let the Python scripts handle it
