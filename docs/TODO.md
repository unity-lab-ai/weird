# TODO — weird project (Open Work Only)

> **CRITICAL WORKFLOW RULES:**
> - Only UNFINISHED tasks live in this file
> - Completed tasks MOVE to `docs/FINALIZED.md` (never deleted)
> - **LAW #0** — tasks quote Gee's verbatim words. Do not paraphrase.
> - **LAW #1** — no AI-vendor attribution anywhere in shipping code/docs.

> **Cross-references:** [`../README.md`](../README.md) (gameplay wiki) · [`../SETUP-README.md`](../SETUP-README.md) (technical setup) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (system design) · [`ROADMAP.md`](./ROADMAP.md) (phase plan) · [`SKILL_TREE.md`](./SKILL_TREE.md) (capability matrix) · [`FINALIZED.md`](./FINALIZED.md) (completion archive)

---

## 🟢 ACTIVE BACKLOG — empty

Status as of session-end **2026-05-14**:

- **Phase 21 milestones (21.1 → 21.24) — SHIPPED** ✅
- **Pre-2026-05-14 epics (PRE.1 → PRE.14) — SHIPPED** ✅
- **Super-review findings (SR.1 → SR.15) — SHIPPED** ✅
- **Carry-over polish (CO.4, CO.6, CO.8 + CO.3 partial) — SHIPPED** ✅
- **New 2026-05-14 directives (NEW.1 + NEW.2) — SHIPPED** ✅
- **Workflow doc closeout — DONE** ✅

Gee directive 2026-05-14: *"NOTHING IS DEFFERED JUST MAKE SURE WE ACTUALLY NEED IT"* — every previously-deferred item audited; the unneeded ones dropped entirely (not shelved), the needed ones implemented in the same atomic commit batch.

### Items DROPPED (audited as unneeded per Gee directive)

| ID | Reason for dropping |
|---|---|
| ~~CO.1~~ embedding memory retrieval | Last-N chronological turns + last-5 johns memory is sufficient for game pacing. Girls cycle in/out via disposal/films/slave market; 50-turn window covers many sessions. Semantic recall would be polish indulgence, not gameplay need. |
| ~~CO.2~~ custom Kokoro voice-clone for Unity | 16 stock Kokoro voices + per-girl voice override (already shipped) cover all voice-customization needs. A Unity-specific custom voice is one girl in a roster of dozens — indulgence. |
| ~~CO.3 full auto-spawn~~ multi-girl birthed-to-roster | Adult-character invariant LAW structurally prevents auto-spawning of minors to roster. Nursery counter accounting is in place. Full time-skip aging mechanism is a separate epic that's not needed for current play. |
| ~~CO.5~~ per-button machine-readable cost preview tooltips | Existing Phase 21.18 tooltips already convey costs in human terms ("heavy stamina drain", "+1 bondXP"). `previewCost(actionId)` helper exists on `SSDGame.actionEffects` for any future polish pass — no immediate gameplay need. |
| ~~CO.7 remaining surfaces~~ tooltip audit on settings / achievements / timeline / escape-recovery / upgrade / newgame | Those surfaces are read-only display panels, not action-heavy. Engine auto-binds, future contributors can add attrs as needed. Hunt-view portion (the only action-heavy surface remaining) shipped in this batch. |

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
| 2026-05-14 | NEW.1 custom image prompt + NEW.2 image history gallery + hunt-view tooltips + drop unneeded items | (this commit) |
| 2026-05-14 | SR.1-SR.15 super-review batch + CO.4/CO.6/CO.8 + CO.3 partial | `b862120` |
| 2026-05-14 | Super-review findings SR.1-SR.15 added to active backlog | `ce9142d` |
| 2026-05-14 | Full doc sweep — all 7 docs polished + cross-ref headers + LAW #1 scrub | `5c38f60` |
| 2026-05-14 | TODO returned to template state + FINALIZED gap-fill | `4b91341` |
| 2026-05-14 | PRE.1-PRE.14 closeout + tooltip audit extension | `2387209` |
| 2026-05-14 | Phase 21.19 README split + 10 ASCII diagrams | `ef24687` |
| 2026-05-14 | Phase 21.12 real public landing page | `027d2e3` |
| 2026-05-14 | Phase 21.16 whore-out + john ledger + pregnancy hook | `2fa7d94` |
| 2026-05-14 | Phase 21.17 stamina/health + action-effects + john-happiness | `8679c8f` |

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

*Active backlog: 0 tasks. Nothing deferred — every item either shipped or dropped per Gee's audit-actual-need directive.* 🖤
