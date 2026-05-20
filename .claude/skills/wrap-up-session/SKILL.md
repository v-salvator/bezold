---
name: wrap-up-session
description: End-of-session reflection — reviews what was built this session and checks whether any patterns, conventions, or decisions discovered should be added to CLAUDE.md or saved as memory. Use when the user says "wrap up", "end session", "session summary", "what should we document", "let's close out", or similar end-of-work phrases. Also use proactively when a session has produced significant architectural decisions or recurring corrections.
---

## Goal

Extract durable knowledge from this session and offer to save it where it will actually matter in future conversations — CLAUDE.md for project conventions, memory files for personal preferences and context.

## Workflow

### 1. Ground in what changed

Run these two commands without waiting for the user to ask:

```bash
git log --oneline -10
git diff HEAD~$(git log --oneline -10 | wc -l | tr -d ' ') HEAD --stat
```

If there are no commits yet (uncommitted work), use `git diff --stat` instead.

### 2. Read what's already documented

Read both files before proposing anything:

- `CLAUDE.md` in the project root — so you don't re-document what's already there
- `/Users/vincent/.claude/projects/-Users-vincent-Desktop-vinLab-bezold/memory/MEMORY.md` — so you don't duplicate existing memories

### 3. Reflect on the session

Think through the conversation. Look for:

- **Corrections the user made** — "no, do it this way instead", pushback on approach, explicit preferences stated
- **Patterns that emerged** — repeated use of a particular utility, component structure, naming convention
- **Architectural decisions** — choices made about how to structure something, why a tradeoff was made
- **Things that surprised you** — constraints or conventions in this codebase that weren't obvious from the code

### 4. Propose additions

Present a short, scannable list. Separate CLAUDE.md candidates from memory candidates.

**Format:**

---

**CLAUDE.md additions** (project conventions for all future Claude instances):

- [ ] `<section>`: `<one-line description of the rule>`
  > Example addition: "Use `router.push` with query params for all search state — never manage search state in local component state."

**Memory additions** (personal preferences / project context):

- [ ] `feedback`: `<rule>` — _why: <reason>_
- [ ] `project`: `<fact>` — _why it matters: <context>_

---

Keep it short. 3–6 items max. If nothing non-obvious emerged, say so — don't pad.

### 5. Ask before writing

After presenting the list, ask:

> Which of these should I apply? You can say "all", list numbers, or "none".

Wait for the response. Do not write anything until the user confirms.

### 6. Apply approved changes

For approved CLAUDE.md items: edit the file directly, adding to the most relevant existing section (or creating a new one if needed). Match the existing tone and formatting.

For approved memory items: write individual memory files to `/Users/vincent/.claude/projects/-Users-vincent-Desktop-vinLab-bezold/memory/` using the standard frontmatter format, then update `MEMORY.md` with a one-line index entry.

Memory file format:

```markdown
---
name: <name>
description: <one-line description>
type: feedback | project | user | reference
---

<body — lead with the rule/fact, then Why: and How to apply: lines for feedback/project types>
```
