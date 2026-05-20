---
name: learn-from-commit
description: Inspect a specific commit and extract any conventions, patterns, or architectural decisions worth adding to CLAUDE.md or saving as memory. Use when the user says "learn from commit", "what can we learn from <hash>", "document this commit", "add this commit to claude.md", or passes a commit hash with the intent to capture its lessons. Also trigger when the user points at a specific PR, merge, or refactor commit and asks what should be documented.
---

## Goal

A single commit often encodes an important decision, a hard-won convention, or a pattern that should guide all future work. This skill surfaces that knowledge and offers to persist it before it gets buried in git history.

## Workflow

### 1. Identify the commit

If the user provided a commit hash or ref, use it. If not, default to `HEAD` (the latest commit) — no need to ask.

### 2. Inspect the commit

Run these without waiting for the user:

```bash
git log -1 --pretty=fuller <ref>
git show <ref> --stat
git show <ref>
```

Read the full diff. Pay attention to:

- What files changed and in what pattern
- What was added vs. removed vs. restructured
- The commit message — does it explain a _why_?
- Any comments in the diff that hint at a constraint or workaround

### 3. Read what's already documented

Read both before proposing anything:

- `CLAUDE.md` in the project root
- `/Users/vincent/.claude/projects/-Users-vincent-Desktop-vinLab-bezold/memory/MEMORY.md`

### 4. Extract lessons

Think about what this commit reveals that isn't already documented. Good candidates:

- **Conventions enforced** — a naming pattern, file structure, or import order that was applied consistently
- **Architectural decisions** — a choice between two approaches with a clear reason (performance, DX, type safety)
- **Things that were wrong** — if this is a fix, what was the root cause? What rule prevents it from happening again?
- **Patterns introduced** — a new utility, hook, or abstraction that future code should reuse rather than reinvent

Skip anything already covered in CLAUDE.md. Skip obvious things that any developer would infer from the code.

### 5. Propose additions

Present a short, scannable list:

---

**CLAUDE.md additions** (conventions all future Claude instances should follow):

- [ ] `<section>`: `<one-line rule>`

**Memory additions** (project context or personal preferences):

- [ ] `project`: `<fact>` — _why it matters: <context>_
- [ ] `feedback`: `<rule>` — _why: <reason>_

---

3–5 items max. If nothing non-obvious emerged from the commit, say so plainly.

### 6. Ask before writing

> Which of these should I apply? Say "all", list numbers, or "none".

Do not write anything until the user confirms.

### 7. Apply approved changes

For approved CLAUDE.md items: edit the file, inserting into the most relevant existing section or creating a new one. Match tone and formatting of existing content.

For approved memory items: write individual files to `/Users/vincent/.claude/projects/-Users-vincent-Desktop-vinLab-bezold/memory/` with standard frontmatter, then add a one-line entry to `MEMORY.md`.

Memory file format:

```markdown
---
name: <name>
description: <one-line description>
type: feedback | project | user | reference
---

<body — lead with the rule/fact, then Why: and How to apply: lines>
```
