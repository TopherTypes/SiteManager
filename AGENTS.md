# AGENTS.md — SiteManager Repository Instructions

These instructions apply to the entire repository tree rooted at this file.

## Purpose

This repository hosts a browser-based management simulation prototype. Agents should prioritize:

- deterministic behavior
- clear documentation
- minimal dependency footprint
- easy review and rollback

## Engineering Principles

1. Keep changes focused on the user-requested scope.
2. Avoid introducing frameworks/dependencies unless explicitly justified.
3. Favor readable vanilla JavaScript and modular separation.
4. Preserve clear boundaries between:
   - domain simulation logic
   - persistence/state concerns
   - rendering/UI concerns

## Documentation Expectations

When implementation changes affect behavior, update as needed:

- `README.md` (setup and usage)
- `SPEC.md` (requirements + technical behavior)
- `DECISIONS.md` (architecture and decision rationale)
- `CHANGELOG.md` (Keep a Changelog format)

## Versioning

- Follow Semantic Versioning.
- Maintain a `VERSION` file at repository root.
- Record every user-visible or architecture-relevant change in `CHANGELOG.md`.

## Code Quality

- Add comments only where they improve maintainability (why, constraints, assumptions).
- Avoid redundant comments that restate obvious code.
- Keep functions cohesive and reasonably small.
- Prefer pure functions in simulation logic.

## Validation

Before finalizing work, run available checks in this environment:

- formatting (if configured)
- linting (if configured)
- type checks (if configured)
- tests (if configured)
- lightweight runtime/build verification for changed code

If checks are missing, run best-effort validation and clearly report limitations.

## PR / Commit Hygiene

- Use clear, scoped commit messages.
- Summarize what changed, why, and any follow-up.
- Keep PR descriptions concise but complete.
