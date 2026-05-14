// SEX SLAVE DUNGEON — multi-stage capture engine.
// Replaces the prior single-tool-single-roll capture model with a 4-stage progress-bar
// attempt sequence (Approach → Engage → Subdue → Secure) where each stage has its own
// 0-100% progress meter driven by the selected tool's per-stage stats vs the girl-archetype's
// per-stage resistance. Tools become stage-specific (rohypnol fills Engage; duct-tape fills
// Secure; pipe spans Approach+Subdue; ketamine is heavy Subdue). Spam dies as a play pattern
// because mashing one tool advances ONE meter — the other three stages still need their own
// qualifying tool to clear.

(function () {
  'use strict';

  const STAGES = ['approach', 'engage', 'subdue', 'secure'];
  const STAGE_LABELS = {
    approach: '🔍 Approach',
    engage:   '✋ Engage',
    subdue:   '💤 Subdue',
    secure:   '⛓️ Secure'
  };
  const STAGE_DESCRIPTIONS = {
    approach: 'Close distance, stealth, set up the action',
    engage:   'Apply the active subduing tool — social, chemical, or grapple-distance',
    subdue:   'Wear her down until incapacitated — per-tick subdue rate',
    secure:   'Bind and restrain so transport is possible'
  };

  // Stage-clear threshold — stages clear at this progress % or above.
  const STAGE_CLEAR_THRESHOLD = 60;

  // Default stage stats / resistance when an item or archetype is missing the field.
  const DEFAULT_TOOL_STAGES = { approach: 0, engage: 0, subdue: 0, secure: 0 };
  const DEFAULT_RESISTANCE  = { approach: 25, engage: 25, subdue: 25, secure: 25 };

  // Single-use tools (consumed per-stage they're activated in). Multi-use tools (pipe,
  // handcuffs, shackles, harness) survive the attempt. Cross-referenced against catalog
  // so adding new tools doesn't break the consumption logic.
  const SINGLE_USE_TOOLS = new Set([
    'rohypnol', 'chloroform', 'ether', 'ketamine', 'tranquilizer',
    'duct-tape', 'rope', 'zip-ties'
  ]);

  // Canonical list of capture-loop tools. UI dropdowns filter inventory against this.
  // Tranquilizer (Subdue 50 single-use, mirrors ketamine in the capture
  // path; distinct behavior only in the in-dungeon administered drug path via drug-scheduler).
  const CAPTURE_TOOL_IDS = [
    'pipe', 'rohypnol', 'chloroform', 'ether', 'ketamine', 'tranquilizer',
    'duct-tape', 'rope', 'zip-ties', 'handcuffs', 'shackles', 'harness'
  ];

  // --- Lookups ---

  function getToolStages(toolId) {
    if (!toolId) return DEFAULT_TOOL_STAGES;
    const item = window.SSDAssets.getById('item', toolId);
    return item?.captureStages || DEFAULT_TOOL_STAGES;
  }

  function getArchetypeResistance(archetypeId) {
    const reg = window.SSDGame.hunt.ARCHETYPE_CAPTURE_RESISTANCE;
    return reg?.[archetypeId] || DEFAULT_RESISTANCE;
  }

  // Tools in player inventory that have non-zero stat for the given stage.
  function eligibleToolsForStage(stageKey) {
    const inv = window.SSDGame.state.current.inventory || {};
    return CAPTURE_TOOL_IDS.filter(id => {
      if (!inv[id] || inv[id] < 1) return false;
      const stages = getToolStages(id);
      return (stages[stageKey] || 0) > 0;
    });
  }

  // Player skill scales with notoriety (experience proxy) — same as existing previewCaptureOdds
  // notorietyBonus pattern. 0-30 cap so player skill never dominates the math.
  function getPlayerSkill() {
    const notoriety = window.SSDGame.state.current?.wallet?.notoriety || 0;
    return Math.min(30, Math.round(notoriety * 0.4));
  }

  // Witness roll fires ONCE per attempt (before the first stage). Higher exposure +
  // higher location suspicion = more likely. Witness flag carries through every stage
  // as a flat -30 progress penalty (makes the attempt much harder once spotted).
  function rollWitness({ locationId }) {
    const exposure = window.SSDGame.hunt.LOCATION_EXPOSURE?.[locationId] || 0;
    const suspicion = window.SSDGame.state.current?.wallet?.suspicionByLocation?.[locationId] || 0;
    const chance = Math.max(0, Math.min(0.6, exposure + suspicion * 0.04));
    return Math.random() < chance;
  }

  // Per-stage resolution math:
  //   stageProgress = toolStageBonus * 2 + playerSkill - resistance - locDifficulty
  //                 - witnessPenalty + RNG
  // Where:
  //   toolStageBonus: 0-50 (tool's stat for this stage). Doubled → 0-100 contribution.
  //   playerSkill:    0-30 (notoriety experience).
  //   resistance:     0-50 (archetype's stage resistance).
  //   locDifficulty:  exposure proxy * 100, 0-20 typical.
  //   witnessPenalty: 30 flat if witness present, 0 otherwise.
  //   RNG:            -5 to +15 (slight upward bias to keep play forgiving).
  // Clamped to 0-100. Stage clears at progress >= STAGE_CLEAR_THRESHOLD (60%).
  function resolveStage({ stageKey, toolId, girl, locationId, playerSkill, witness }) {
    if (!toolId) {
      return {
        stageKey,
        toolId: null,
        toolBonus: 0,
        resistance: getArchetypeResistance(girl.archetypeTemplate)[stageKey] || 0,
        progress: 0,
        cleared: false,
        reason: 'no tool assigned for this stage'
      };
    }
    const stages = getToolStages(toolId);
    const toolBonus = stages[stageKey] || 0;
    const resistance = getArchetypeResistance(girl.archetypeTemplate)[stageKey] || 25;
    const exposure = window.SSDGame.hunt.LOCATION_EXPOSURE?.[locationId] || 0;
    const locDifficulty = exposure * 100;
    const witnessPenalty = witness ? 30 : 0;
    const rng = Math.random() * 20 - 5;
    const raw = toolBonus * 2 + (playerSkill || 0) - resistance - locDifficulty + rng - witnessPenalty;
    const progress = Math.max(0, Math.min(100, Math.round(raw)));
    const cleared = progress >= STAGE_CLEAR_THRESHOLD;
    return {
      stageKey,
      toolId,
      toolBonus,
      resistance,
      progress,
      cleared,
      reason: cleared
        ? null
        : `tool too weak for stage (progress ${progress}%, needed ${STAGE_CLEAR_THRESHOLD}%, resistance ${resistance}${witness ? ', witness present' : ''})`
    };
  }

  // Run the full 4-stage attempt. `toolPerStage` is `{ approach, engage, subdue, secure }`
  // mapping stage key → tool ID (or null/undefined for unassigned stages).
  //
  // Returns:
  //   {
  //     outcome:       'success' | 'failed',
  //     stages:        [{ stageKey, toolId, toolBonus, resistance, progress, cleared, reason }],
  //     failedAtStage: stageKey | null,
  //     witness:       bool,
  //     playerSkill:   number,
  //     consumed:      [{ toolId, count }],
  //     consequences:  { suspicionDelta, notorietyDelta, warinessDelta }
  //   }
  //
  // Side effects on failure: bumps location suspicion + adds wariness flag to girl + adds
  // notoriety if a witness saw it. Side effects on success: per-stage single-use tool
  // consumption only (escortToHold + capture-flow narrative handled by caller).
  function runAttempt({ girl, toolPerStage, locationId }) {
    const playerSkill = getPlayerSkill();
    const witness = rollWitness({ locationId });

    // Pre-validate every assigned single-use tool against
    // inventory BEFORE resolution math fires. Guards against UI-engine desync race
    // (state mutated between render and attempt-fire). For non-single-use tools the
    // engine relies on UI eligibleToolsForStage filtering, which is render-time-only.
    const inv = window.SSDGame.state.current?.inventory || {};
    const required = {};
    for (const stageKey of STAGES) {
      const tid = toolPerStage?.[stageKey];
      if (tid && SINGLE_USE_TOOLS.has(tid)) {
        required[tid] = (required[tid] || 0) + 1;
      }
    }
    for (const [tid, count] of Object.entries(required)) {
      if ((inv[tid] || 0) < count) {
        return {
          outcome: 'failed',
          failedAtStage: STAGES.find(s => toolPerStage?.[s] === tid) || 'approach',
          witness: false,
          playerSkill,
          stages: [],
          consumed: [],
          consequences: { suspicionDelta: 0, notorietyDelta: 0, warinessDelta: 0 },
          reason: `inventory desync — need ${count}× ${tid} but only ${inv[tid] || 0} in inventory`
        };
      }
    }

    const stages = [];
    let failedAtStage = null;

    for (const stageKey of STAGES) {
      const toolId = toolPerStage?.[stageKey];
      const result = resolveStage({ stageKey, toolId, girl, locationId, playerSkill, witness });
      stages.push(result);
      if (!result.cleared) {
        failedAtStage = result.stageKey;
        break;   // stop running stages once one fails — girl escapes
      }
    }

    // Per-stage single-use inventory consumption. Reusable tools (pipe / handcuffs /
    // shackles / harness) survive. Only stages that actually executed consume their tool.
    const consumed = [];
    const consumeCounts = {};
    for (const stage of stages) {
      if (!stage.toolId || !SINGLE_USE_TOOLS.has(stage.toolId)) continue;
      consumeCounts[stage.toolId] = (consumeCounts[stage.toolId] || 0) + 1;
    }
    for (const [toolId, count] of Object.entries(consumeCounts)) {
      const ok = window.SSDGame.state.consumeItem(toolId, count);
      if (ok) consumed.push({ toolId, count });
    }

    const outcome = failedAtStage ? 'failed' : 'success';
    const s = window.SSDGame.state.current;
    const consequences = { suspicionDelta: 0, notorietyDelta: 0, warinessDelta: 0 };

    if (outcome === 'failed') {
      const sus = s.wallet.suspicionByLocation[locationId] || 0;
      let susBump = 2;
      if (witness) {
        susBump = 5;
        consequences.notorietyDelta = 2;
        window.SSDGame.state.addNotoriety(2);
      }
      consequences.suspicionDelta = susBump;
      s.wallet.suspicionByLocation[locationId] = sus + susBump;
      consequences.warinessDelta = 1;
      girl.wariness = (girl.wariness || 0) + 1;
    }

    return {
      outcome,
      stages,
      failedAtStage,
      witness,
      playerSkill,
      consumed,
      consequences
    };
  }

  // Compose a human-readable summary of one stage outcome — used by UI for inline feedback.
  function summarizeStage(stageResult) {
    if (!stageResult) return '(no result)';
    if (!stageResult.toolId) return `${STAGE_LABELS[stageResult.stageKey]}: ${stageResult.reason}`;
    const tool = window.SSDAssets.getById('item', stageResult.toolId);
    const toolName = tool?.displayName || stageResult.toolId;
    const status = stageResult.cleared ? '✓ cleared' : '✗ failed';
    return `${STAGE_LABELS[stageResult.stageKey]} — ${tool?.emoji || ''}${toolName} → ${stageResult.progress}% ${status}`;
  }

  window.SSDGame = window.SSDGame || {};
  window.SSDGame.capture = Object.freeze({
    STAGES,
    STAGE_LABELS,
    STAGE_DESCRIPTIONS,
    STAGE_CLEAR_THRESHOLD,
    SINGLE_USE_TOOLS,
    CAPTURE_TOOL_IDS,
    DEFAULT_TOOL_STAGES,
    DEFAULT_RESISTANCE,
    getToolStages,
    getArchetypeResistance,
    eligibleToolsForStage,
    getPlayerSkill,
    rollWitness,
    resolveStage,
    runAttempt,
    summarizeStage
  });
})();
