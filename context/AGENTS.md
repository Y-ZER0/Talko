# AGENTS.md — Master Instruction File

This file governs how any coding agent (Claude Code, Cursor, etc.) operates on this repository. It is read **first, every session, before any other context file.**

## 0. Non-negotiable meta-rule

**One feature slice at a time is either a UI task or a Logic task. Never both in the same agent turn.**

Every entry in `build-plan.md` is tagged `[UI]` or `[LOGIC]`. An agent:

- Executing a `[UI]` task writes only components, hooks that call already-existing services, styling, and client state (Context). It **must not** touch NestJS controllers/services/repositories/entities/migrations.
- Executing a `[LOGIC]` task writes only backend modules (controller/service/repository/entity/dto/gateway) and the frontend service/hook layer that calls them (service functions + TanStack Query hooks — no JSX). It **must not** write React components or pages.

If a task looks like it needs both, it is not a valid task — split it in `build-plan.md` before writing code. This is deliberate: it keeps diffs reviewable, keeps REVIEW/IMPRINT scoped, and prevents an agent from papering over a missing API with fake client-side data.

## 1. Read order (every session)

1. `AGENTS.md` (this file)
2. `project-overview.md`
3. `architecture.md`
4. `code-standards.md`
5. `library-docs.md`
6. `build-plan.md` — find the next unchecked item in `progress-tracker.md` first, then read only the relevant phase
7. `progress-tracker.md`
8. If the next item is `[UI]`: also read `ui-registry.md`, `ui-rules.md`, `ui-tokens.md`
9. `library-docs.md` section relevant to the specific feature being touched

Do not skip steps 1–4 even if you "remember" them from a prior session summary. Context resets between sessions; the files are the only durable memory.

## 2. Core rules that never change

- Backend: **NestJS**. Frontend: **Next.js (App Router)**. Monorepo: **pnpm workspaces**, shared types in `packages/shared`.
- Server state (anything from an API) → **TanStack Query**. Client-only state (socket instance, active room id, theme) → **Context API**. Never cross these wires — see `architecture.md` §Invariants.
- All response DTOs live once in `packages/shared`. Backend entities never cross the HTTP boundary.
- Every new domain feature is a full vertical slice per `code-standards.md`, built across exactly two tasks: one `[LOGIC]`, one `[UI]`, in that order (logic first, so the UI task has a real API/hook to bind to — never mock data in a `[UI]` task).
- No feature is "done" until `progress-tracker.md` is updated in the same turn.

## 3. Skill invocation (Phase 2 of the workflow)

| Skill         | Trigger                                                                                                              | Action                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **architect** | Before starting any `build-plan.md` phase with 2+ files or any real-time/stateful feature (sockets, Redis, receipts) | Read context files, ask clarifying questions if a decision in `architecture.md` doesn't cover the case, produce a step-by-step plan before writing code                                        |
| **imprint**   | Immediately after any `[UI]` task                                                                                    | Diff the new component against `ui-tokens.md` and `ui-rules.md`; flag hardcoded colors/spacing, missing responsive breakpoints, missing aria attributes; output a fix list                     |
| **review**    | Immediately after any `[LOGIC]` task                                                                                 | Cross-check against `code-standards.md` Hard Rules and the ARCHITECT plan; check for missing `toDto()` mapping, missing `invalidateQueries`, missing `class-validator` decorators, N+1 queries |
| **recovery**  | On any runtime/build/terminal error                                                                                  | Isolate the failing module only; do not touch unrelated files; targeted patch only                                                                                                             |
| **remember**  | End of every session                                                                                                 | Update `progress-tracker.md`, append any new architectural decision to `architecture.md` §Invariants (never silently to a random file)                                                         |

## 4. Escalation rule

If a requirement in `build-plan.md` conflicts with an Invariant in `architecture.md`, **stop and surface the conflict** rather than silently choosing one. This has already happened once in this project — the original DBML lacked columns several listed features require (see `architecture.md` §Schema Gaps) — do not repeat that pattern by inventing schema on the fly inside a `[LOGIC]` task without recording it back into the schema file.
