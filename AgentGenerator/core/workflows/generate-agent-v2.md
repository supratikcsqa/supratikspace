# Generate Agent v2 Prompt — Full Pipeline with Skill Selection

This workflow executes the advanced 3-stage agentic pipeline entirely within the AI IDE. It introduces a crucial Skill Selection phase to ensure the agent is equipped with the exact capabilities (skills) it needs to perform efficiently without hallucinating.

---

## Activation

When the user invokes `/generate-agent-v2`, they will provide a **raw idea** for an agent.
Examples:
- "Make me an Instagram Reels agent"
- "Build me a code review bot"
- "SEO audit agent for e-commerce"

---

## Execution Steps (Strictly Ordered)

### Stage 0: Load Context
// turbo-all

1. Read the foundational research:
   - `view_file` → `core/research/agentic-skills-research.md`
   
2. Read the Stage 1 system prompt:
   - `view_file` → `core/prompts/meta-agent-input-enricher-agent-prompt.md`

3. Read the Stage 2 system prompt:
   - `view_file` → `core/prompts/meta-agent-architect-prompt.md`

---

### Phase 1: Agent Definition (Legacy Stages 1 & 2)

#### Stage 1: Input Enricher ("The Signal Densifier")

4. **Adopt the persona** defined in `meta-agent-input-enricher-agent-prompt.md`.

5. Using the user's raw prompt + the agentic-skills-research.md as your knowledge base, generate the **4-dimension structured brief**:

```
Build me a [SPECIFIC ROLE] Agent for [DOMAIN / AUDIENCE].

**Outcome**: [measurable success criteria]

**Framework**: [named methodology with ordered steps]

**Anti-patterns**: [3-5 specific, observable mistakes]

**Hidden context**: [3-5 expert-level insights a junior would NOT know]
```

6. **Display the enriched brief** to the user under a heading "## Phase 1 Output: Enriched Brief" and ask: "Proceed to Base Architecture?"

#### Stage 2: Meta-Agent Architect ("The Cognitive Architect")

7. **Once the user approves**, adopt the persona defined in `meta-agent-architect-prompt.md`.

8. Using the enriched brief + the research file, generate the **base agent prompt** (without specific skill bindings yet, but explicitly outlining the workflow the Agent will perform).
   - YAML frontmatter with role, description, version, ontology
   - Must include a `## Cognitive Architecture` section
   - Must inject 1-3 Cognitive Modules from the research
   - Must include Quality Gates and Failure Modes

9. **Display the base agent prompt** to the user under a heading "## Phase 1 Output: Base Agent Prompt" and ask: "Proceed to Skill Selection?"

---

### Phase 2: Skill Selection & Resolution

10. **Analyze the required workflow** from the base agent prompt to identify the exact skills the Agent will need to perform efficiently without hallucinating.

11. **Skill Discovery**: Execute a search hierarchy to find the required skills:
    a. Search the specific repository the workflow is invoked from (`.agents/skills/`, `skills/` or similar).
    b. Search available Global Skills in the environment (`~/.gemini/antigravity/skills/`).
    c. Perform up to 3 separate GitHub searches to find relevant skill `.md` files in open source.

12. **Skill Evaluation**: Read through the identified skill `.md` files to find the most appropriate matches.

13. **Missing Skills & Prompting**:
    - **Display the selected skills** (if found successfully) to the user under a heading "## Phase 2 Output: Selected Skills".
    - On the very rare occasion that a necessary skill **cannot be found**, PAUSE and prompt the user. 
    - Invoke the `[/generate-skills]` workflow, providing a very apt description of the missing skill so it can be created and added to the selection. Wait for the skill to be built before proceeding.

---

### Phase 3: Skill Integration, Evaluation & Save

14. **Skill Integration**: Select the final matching skills and inject them into the base Agent Prompt with absolute precision. For each skill:
    - Include explicit **directions on how to use the skill** inside the prompt.
    - **Repo Skills**: Mention the exact skill and call it from the repo.
    - **Global Skills**: Mention that the skill is global to the environment it is present in.
    - **GitHub Skills**: Link the exact skill `.md` file repo URL so the IDE can download and install it into local skills.

15. **Quality Gate Evaluation**: Self-evaluate the newly finalized agent prompt (with integrated skills) across these dimensions (score 0-10 each):

| Dimension | Weight | Check |
|---|---|---|
| Signal Density | 2x | Every sentence adds non-obvious info? |
| Cognitive Architecture | 3x | Has Memory + System 2 + Governance? |
| Anti-Pattern Depth | 1.5x | Failures have Trigger + Symptom + Detection? |
| Skill Precision | 2.5x | Are skills explicitly linked with exact paths and usage directions? |
| **Overall** | — | Weighted composite (0-100) |

16. **Display the scorecard** as a table under "## Phase 3: Quality Gate Scores"

17. **If Overall < 75**: 
    - State what failed and why
    - Re-generate Stage 3 integration with the critique incorporated
    - Re-evaluate (max 2 retries)

18. **If Overall >= 75**: Proceed to Save Artifact.

19. Save the final agent prompt as a new file in:
    - Path: `c:/Projects/PromptGenerator/AgentGenerator/agent-prompts/[role-kebab-case]-agent-prompt.md`
    - Use the `write_to_file` tool

20. Confirm to the user with the file path and final score.

---

## Rules

- You MUST load and read the research and prompt files BEFORE generating anything.
- You MUST follow the exact 4-dimension format for Phase 1.
- You MUST do the 3-tier Skill Search hierarchy in Phase 2.
- You MUST explicitly link skills and include usage directions in Phase 3.
- You MUST prompt the user before moving to Phase 3 if a necessary skill is NOT found, and invoke `[/generate-skills]`
