# TODO — weird project (Open Work Only)

> **CRITICAL WORKFLOW RULES:**
> - Only UNFINISHED tasks live in this file
> - Completed tasks MOVE to `docs/FINALIZED.md` (never deleted)
> - **LAW #0** — tasks quote Gee's verbatim words. Do not paraphrase.
> - **LAW #1** — no AI-vendor attribution anywhere in shipping code/docs.

> **Cross-references:** [`../README.md`](../README.md) (gameplay wiki) · [`../SETUP-README.md`](../SETUP-README.md) (technical setup) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (system design) · [`ROADMAP.md`](./ROADMAP.md) (phase plan) · [`SKILL_TREE.md`](./SKILL_TREE.md) (capability matrix) · [`FINALIZED.md`](./FINALIZED.md) (completion archive)

---

## 🟢 ACTIVE BACKLOG

Status as of session-end **2026-05-14** (commit chain through `4b91341`):

- **Phase 21 milestones (21.1 → 21.24) — SHIPPED** ✅
- **Pre-2026-05-14 epics (PRE.1 → PRE.14) — SHIPPED** ✅
- **Workflow doc closeout — DONE** ✅

Gee directive 2026-05-14 (this turn): *"anything u find not finished re put it in todo"*. Below are the carry-over follow-up items recovered from the previously-deferred list — promoted back to active backlog.

### 🟡 Carry-over polish (8 items)

| ID | Priority | Description |
|---|---|---|
| **CO.1** | 🟢 | **Embedding memory retrieval** — `nomic-embed-text` via Ollama + top-K similarity retrieval. Replaces the current last-N chronological memory with semantic recall. Adds depth to long-running captives where chronological memory drops important context. |
| **CO.2** | 🟢 | **Custom Kokoro voice-clone for Unity** — kokoro-js v1.2 doesn't expose clone primitives; requires moving to a TTS backend that does, OR contributing to kokoro-js upstream. Current Unity uses one of the 16 stock voices. |
| **CO.3** | 🟠 | **Multi-girl birthed-to-roster spawning** — Phase 21.10 birthed-kept outcome (40% of full-term resolutions) currently flags `pregnancy.status = 'birthed'` but doesn't auto-add a new captive entry. Needs the multi-girl plumbing decision: do birthed children spawn as Day-0 captives with inherited visualIdentity? Get added to roster at age 18 via time-skip? Sold to slave market automatically? Gee verbatim from README: *"multi-girl spawning deferred"*. |
| **CO.4** | 🟢 | **`condom-on` wardrobe-equipped outfit** — catalog `condom` item exists from Phase 21.10 but the wardrobe-equip side of "she's wearing a condom" isn't wired. Pregnancy conception gate currently checks `currentOutfit !== 'condom-on'` symbolically — for a real player-driven choice, the wardrobe panel needs a Condom outfit entry that toggles on per use. |
| **CO.5** | 🟡 | **Per-button machine-readable cost preview tooltips** — `previewCost(actionId)` helper already exists on `SSDGame.actionEffects` (returns `"stamina -8 · health 0 · bondXP +2"` style). Wire it into every actionable button's `data-tooltip` attribute so players see exact stat costs before clicking. |
| **CO.6** | 🟡 | **Route existing room.js buttons through `applyAction()`** — drug / feed / water / sex / heal buttons currently bypass `js/game/action-effects.js` and directly mutate body state. Refactor them to all flow through `applyAction(girlId, actionId, opts)` so the central spec table is the only path that mutates stat fields. Eliminates double-mutation drift risk. |
| **CO.7** | 🟢 | **Tooltip audit on remaining surfaces** — `data-tooltip` attrs needed on: `js/ui/hunt-view.js` (the most complex surface, 470 lines, capture-stage UI), `js/ui/in-game-settings.js`, `js/ui/achievements-view.js`, `js/ui/timeline-view.js`, `js/ui/escape-recovery-view.js`, `js/ui/upgrade-view.js`, `js/ui/newgame.js`, `index.html` landing anchors. Engine auto-binds — pure mechanical attr-adding. |
| **CO.8** | 🟡 | **Persistent repeat-client tracking for whore-out** — the `repeat` archetype carries `repeatable: true` but `whoreOut.resolveEncounter` doesn't persist a specific john ID across encounters. Could add `propositioners.repeatClients` style tracking for actual same-john return visits + cumulative-relationship side effects (rep build-up, preferred-acts memory, repeat-discount or repeat-premium). |

---

## 📥 Adding new work

When a new directive lands, follow this pattern per the LAWs:

### 1. Capture verbatim (LAW #0)

Paste Gee's exact words into the task description. Never paraphrase. Never collapse a list of items into one bullet. One task per item if he listed multiple.

### 2. File under the appropriate section

Use this template structure:

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

## 📜 Recent session history (most recent first)

| Date | Session focus | Commit |
|---|---|---|
| 2026-05-14 | Full doc sweep — TODO template state + ROADMAP critical-path + FINALIZED gap-fill | `4b91341` |
| 2026-05-14 | PRE.1-PRE.14 closeout + tooltip audit extension | `2387209` |
| 2026-05-14 | Phase 21.19 README split + 10 ASCII diagrams | `ef24687` |
| 2026-05-14 | Phase 21.12 real public landing page | `027d2e3` |
| 2026-05-14 | Phase 21.16 whore-out + john ledger + pregnancy hook | `2fa7d94` |
| 2026-05-14 | Phase 21.17 stamina/health + action-effects + john-happiness | `8679c8f` |
| 2026-05-14 | Phase 21.18 universal tooltip engine + 8 surfaces | `93eca36` |
| 2026-05-14 | Phase 21.13 cleanup carry-overs from super-review | `22ea085` |
| 2026-05-14 | Phase 21.10 pregnancy subsystem + 3 mid-flight addendums | `529aba7` |
| 2026-05-14 | Phase 21.23 captured-clothes-persist + 21.24 tranquilizer 4-min | `2fc5fa8` |

For complete per-session detail, files touched, verbatim Gee directives, and verification notes: **[`docs/FINALIZED.md`](./FINALIZED.md)**.

---

## 📚 Reference

- **Gameplay wiki** → [`../README.md`](../README.md)
- **Technical setup + troubleshooting** → [`../SETUP-README.md`](../SETUP-README.md)
- **System design** → [`./ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Phase plan + milestones** → [`./ROADMAP.md`](./ROADMAP.md)
- **Capability matrix** → [`./SKILL_TREE.md`](./SKILL_TREE.md)
- **Completed task archive** → [`./FINALIZED.md`](./FINALIZED.md)

---

*Active backlog: 8 carry-over polish tasks. Phase 21 + pre-super-review epics complete.* 🖤
