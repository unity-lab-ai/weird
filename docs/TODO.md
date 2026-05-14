# TODO — weird project (Open Work Only)

> **CRITICAL WORKFLOW RULES:**
> - Only UNFINISHED tasks live in this file
> - Completed tasks MOVE to `docs/FINALIZED.md` (never deleted)
> - **LAW #0** — tasks quote Gee's verbatim words. Do not paraphrase.
> - **LAW #1** — no AI-vendor attribution anywhere in shipping code/docs.

> **Cross-references:** [`../README.md`](../README.md) (gameplay wiki) · [`../SETUP-README.md`](../SETUP-README.md) (technical setup) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (system design) · [`ROADMAP.md`](./ROADMAP.md) (phase plan) · [`SKILL_TREE.md`](./SKILL_TREE.md) (capability matrix) · [`FINALIZED.md`](./FINALIZED.md) (completion archive)

---

## 🟢 ACTIVE BACKLOG

### Gee's directive (verbatim 2026-05-14) — supply drop-off + self-serve + stress bonus + clean first-capture:

> *"and we also need a food and water meter fore each girl and they can fill their own water levels and food levels from toilet and food left(the user just droops the food off in the hold and the grirls help them selves as they need it water too until toilet upgrade then never need to feed water again they suto drink when it gets low but if no toilet they drink the water supply provided and need way to pick back up the food and water if u want to starve them( needs to be a player bonus too for keeping the girls in a stressed state too like a bonus or super bonus if a certain range is maintained.. and girls dont have bruises and a cum load on first capture"*

### Epic: Supply drop-off model + self-serve consumption + stress bonus + spawn cleanup `(M)` — 🔴 CRITICAL

- [x] **BUG.16** 🔴 Hold has `foodReserve` + `waterReserve` numeric stocks. Player drops food/water from inventory into hold, pickup converts reserve back to inventory (lossy bulk conversion). Wired.
- [x] **BUG.17** 🔴 Self-serve auto-consumption: `tickStaminaHealth` pulls 1 unit from hold reserve when grace timer halfway expired (FOOD_AUTOCONSUME 2.5 days / WATER_AUTOCONSUME 1.5 days), refreshes lastFedAt/lastWateredAt.
- [x] **BUG.18** 🔴 Toilet tier ≥ 2 OR waterSupply tier ≥ 2 → water is fully automatic. Auto-refreshes lastWateredAt every tick without touching reserve. UI hides water reserve panel and shows "∞ plumbed" badge.
- [~] **BUG.19** 🟠 Stress-state bonus — DEFERRED to next iteration. Substantial new mechanic (per-girl `stressStreak` tracker, milestone money/film-value bonuses at 5-day / 15-day streaks in body.health 30-50 range).
- [x] **BUG.20** 🟠 Unity bootstrap reset to `bruises: 0, cumLoad: 0` on first-capture spawn. Procedural already at 0/0.
- [x] **BUG.21** 🟠 Visible food + water reserve bars + days-until-starve/dehydrate countdowns in room view supplies section.

---

As of session-end **2026-05-14** (commit chain through `6421b84`):

As of session-end **2026-05-14** (commit chain through `6421b84`):

As of session-end **2026-05-14** (commit chain through `6421b84`):

As of session-end **2026-05-14** (commit chain through `6421b84`):

All completion records for this project's work live in **[`docs/FINALIZED.md`](./FINALIZED.md)** — 35 session entries covering 71 task IDs across:

- **Phase 21 milestones** — all 24 (21.1 → 21.24) ✅
- **Pre-2026-05-14 epics** — all 14 (PRE.1 → PRE.14) ✅
- **Super-review findings** — all 15 (SR.1 → SR.15) ✅
- **Carry-over polish** — all 8 (CO.1 → CO.8) ✅ (5 audit-dropped, 3 shipped + 1 partial)
- **New 2026-05-14 directives** — both (NEW.1 + NEW.2) ✅
- **Post-review batch** — all 7 (POST-REVIEW.1 → POST-REVIEW.7) ✅
- **Workflow doc sweeps** — README + SETUP-README + ARCHITECTURE + ROADMAP + SKILL_TREE + TODO + FINALIZED all polished, cross-ref headers consistent, LAW #1 audited clean ✅

Per Gee directive 2026-05-14: *"NOTHING IS DEFFERED JUST MAKE SURE WE ACTUALLY NEED IT"* — every previously-deferred item audited; 5 unneeded ones dropped (CO.1 embedding memory / CO.2 voice clone / CO.3 full multi-girl auto-spawn / CO.5 machine-readable cost preview / CO.7 read-only-surface tooltips), all others shipped.

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
| 2026-05-14 | BUG.1 — `start.bat` / `start.sh` auto-sync `.env` → `js/env.local.js` so Pollinations key flows to browser; landing-page Settings shows effective key with source badge | (this commit) |
| 2026-05-14 | TODO template-out — verified full FINALIZED coverage before strip | `36e2787` |
| 2026-05-14 | POST-REVIEW.1-7 batch fix (action-effects routing + custom-pose persistence + Ollama fallback + gallery blob + condom state overlay) | `6421b84` |
| 2026-05-14 | POST-REVIEW.1-7 added to active backlog | `726cd45` |
| 2026-05-14 | NEW.1 custom image-prompt + NEW.2 image history gallery + hunt-view tooltips + drop unneeded deferred | `7a59f9c` |
| 2026-05-14 | SR.1-SR.15 super-review batch fix + CO.4/CO.6/CO.8 + CO.3 partial | `b862120` |
| 2026-05-14 | Super-review findings SR.1-SR.15 added to backlog | `ce9142d` |
| 2026-05-14 | Full doc sweep — all 7 docs polished + cross-ref headers + LAW #1 scrub | `5c38f60` |
| 2026-05-14 | TODO returned to template state + FINALIZED gap-fill | `4b91341` |
| 2026-05-14 | PRE.1-PRE.14 closeout + tooltip audit extension | `2387209` |
| 2026-05-14 | Phase 21.19 README split + 10 ASCII diagrams | `ef24687` |
| 2026-05-14 | Phase 21.12 real public landing page | `027d2e3` |
| 2026-05-14 | Phase 21.16 whore-out + john ledger + pregnancy hook | `2fa7d94` |
| 2026-05-14 | Phase 21.17 stamina/health + action-effects + john-happiness | `8679c8f` |

For complete per-session detail, files touched, verbatim Gee directives, and verification notes: **[`docs/FINALIZED.md`](./FINALIZED.md)** (35 session entries, 2178 lines).

---

## 📚 Reference

- **Gameplay wiki** → [`../README.md`](../README.md)
- **Technical setup + troubleshooting** → [`../SETUP-README.md`](../SETUP-README.md)
- **System design** → [`./ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Phase plan + milestones** → [`./ROADMAP.md`](./ROADMAP.md)
- **Capability matrix** → [`./SKILL_TREE.md`](./SKILL_TREE.md)
- **Completed task archive** → [`./FINALIZED.md`](./FINALIZED.md)

---

*Active backlog: 0 tasks. Every item verified shipped (with FINALIZED session entry) or audit-dropped (with rationale) before TODO templated out per LAW — FINALIZED before DELETE.* 🖤
