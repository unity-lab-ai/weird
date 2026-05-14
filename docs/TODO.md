# TODO — weird project (Open Work Only)

> **CRITICAL WORKFLOW RULES:**
> - Only UNFINISHED tasks live in this file
> - Completed tasks MOVE to `docs/FINALIZED.md` (never deleted)
> - **LAW #0** — tasks quote Gee's verbatim words. Do not paraphrase.
> - **LAW #1** — no AI-vendor attribution anywhere in shipping code/docs.

---

## 🟢 ACTIVE BACKLOG — empty

As of session-end **2026-05-14** (commit `2387209`):

- **All Phase 21 milestones (21.1 → 21.24) — SHIPPED** ✅
- **All pre-2026-05-14 epics (PRE.1 → PRE.14) — SHIPPED** ✅
- **Workflow doc closeout — DONE** ✅

The full history of every completed task lives in **[`docs/FINALIZED.md`](./FINALIZED.md)** with verbatim Gee directives + per-task implementation detail + files touched + syntax verification per session.

Latest session entries (most recent first):

| Date | Session focus | Commit |
|---|---|---|
| 2026-05-14 | PRE.1-PRE.14 closeout + tooltip audit extension | `2387209` |
| 2026-05-14 | Phase 21.19 README split + 10 ASCII diagrams | `ef24687` |
| 2026-05-14 | Phase 21.12 real public landing page | `027d2e3` |
| 2026-05-14 | Phase 21.16 whore-out + john ledger + pregnancy hook | `2fa7d94` |
| 2026-05-14 | Phase 21.17 stamina/health + action-effects + john-happiness | `8679c8f` |
| 2026-05-14 | Phase 21.18 universal tooltip engine + 8 surfaces | `93eca36` |
| 2026-05-14 | Phase 21.13 cleanup carry-overs from super-review | `22ea085` |
| 2026-05-14 | Phase 21.10 pregnancy subsystem + 3 mid-flight addendums | `529aba7` |
| 2026-05-14 | Phase 21.23 captured-clothes-persist + 21.24 tranquilizer 4-min | `2fc5fa8` |

---

## 📥 Adding new work

When a new directive lands, follow this pattern per the LAWs:

### 1. Capture verbatim (LAW #0)

Paste Gee's exact words into the task description. Never paraphrase. Never collapse a list of items into one bullet. One task per item if he listed multiple.

### 2. File under the appropriate section

Use this template structure (sections appear only when work is in flight):

```markdown
### Gee's directive (verbatim YYYY-MM-DD) — short summary:

> *"verbatim quote here"*

### Epic: <descriptive title> `(S | M | L | XL)` — <PRIORITY>

- [ ] **TXX.Y** 🔴/🟠/🟡/🟢 verbatim-quoted sub-task description
```

Priority emoji legend:

- 🔴 **Critical** — blocking play / blocking next ship
- 🟠 **High** — important, ship within session
- 🟡 **Medium** — schedule into next batch
- 🟢 **Low** — polish, schedule when nothing else is pressing
- ⚪ **Deferred** — known but not currently active

### 3. Run the work

Per LAW: **read full file in 800-line chunks before any edit**. No partial reads, no editing without full file context. Mark task `[~]` in_progress at start.

### 4. Ship + atomic commit

Per `[[feedback-batch-commits]]`: bundle multiple related milestones into a single atomic commit at session end with a single combined FINALIZED entry. Every affected doc updated in the SAME commit per LAW — DOCS BEFORE PUSH.

### 5. Move to FINALIZED (LAW — FINALIZED before DELETE)

After commit lands:

1. Write the verbatim task text to `docs/FINALIZED.md` FIRST (append to top of the archive, never edit existing entries)
2. Verify the write succeeded
3. Then strip the entry from `docs/TODO.md`, leaving TODO at template state

---

## 🚫 Deferred (not blocking play, not active)

These are known follow-ups that don't block current play and aren't on any critical path:

- **⚪ DEF.1** — Embedding memory retrieval (`nomic-embed-text` + top-K). Current chronological memory is sufficient.
- **⚪ DEF.2** — Kokoro voice-clone for custom Unity voice. kokoro-js v1.2 doesn't expose clone primitives. Would require a different TTS backend.
- **⚪ DEF.3** — Multi-girl birthed-to-roster spawning for Phase 21.10 birthed-kept branch (40% outcome). Currently flags `status: 'birthed'` but doesn't auto-add a new captive entry. Needs the multi-girl plumbing decision.
- **⚪ DEF.4** — `condom-on` wardrobe-equipped outfit (catalog item exists; wardrobe-equip side deferred — current gate is inventory-based).
- **⚪ DEF.5** — Per-button machine-readable cost preview tooltips. `previewCost(actionId)` helper exists from Phase 21.17; integration with existing tooltips is mechanical polish.
- **⚪ DEF.6** — Routing existing room.js drug/feed/water/sex buttons through `applyAction()` so the central spec is the only path that mutates stat fields. Currently they bypass action-effects.js. Refactor deferred to avoid double-mutation paths.
- **⚪ DEF.7** — Tooltip audit follow-up on remaining surfaces: hunt-view (capture-stage UI, 470 lines, complex), in-game-settings, achievements-view, timeline-view, escape-recovery-view, upgrade-view, newgame, landing index.html anchors. Engine auto-binds — just need to add `data-tooltip="..."` attrs.
- **⚪ DEF.8** — Persistent repeat-client tracking for whore-out. The `repeat` archetype is marked `repeatable: true` but the current resolver doesn't yet persist a specific john ID across encounters.

---

## 📚 Reference

- **Completed task archive** → [`docs/FINALIZED.md`](./FINALIZED.md)
- **Phase plan + milestones** → [`docs/ROADMAP.md`](./ROADMAP.md)
- **Capability matrix** → [`docs/SKILL_TREE.md`](./SKILL_TREE.md)
- **Full system design** → [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Gameplay wiki** → [`../README.md`](../README.md)
- **Technical setup + troubleshooting** → [`../SETUP-README.md`](../SETUP-README.md)

---

*Active backlog: 0 tasks. Phase 21 + pre-super-review epics complete.* 🖤
