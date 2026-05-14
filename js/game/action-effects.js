// SEX SLAVE DUNGEON — central per-action stat-impact spec (Phase 21.17, 2026-05-14).
// Gee verbatim 2026-05-14: "they also need a stamina bar thet gets used up and thinks like
// degrad build it back up and other things each have their stat boost and health + - 's for
// all actions some heal some hurt some use stamina some rebuild it all levels of system
// like this".
//
// Every actionable button or in-dungeon event consults this table to learn its per-stat
// delta envelope. Keys are action IDs; values are signed integer deltas applied to body
// fields. Negative = drains, positive = boosts. UI tooltips can preview costs by reading
// the entry directly.
//
// Schema (all fields optional, default 0):
//   {
//     stamina:   -100..+100   // 0-100 capped, drains or boosts
//     health:    -100..+100   // 0-100 capped, harder to refill than stamina
//     mood:      -20..+20     // mood-shift word selection
//     arousal:   -30..+30     // 0-100 capped
//     wetness:   -30..+30
//     bruises:   -10..+15     // 0-99 capped
//     cumLoad:   -2..+2       // float, no upper cap
//     bondXP:    -20..+20
//     bondDebt:  -20..+20
//     notoriety: -5..+5       // bumps the wallet, not the body
//     notes:     string       // human-readable label, used in tooltip previews
//   }

(function () {
  'use strict';

  const ACTIONS = Object.freeze({
    // -----------------------------------------------------------------
    // CARETAKING — generally restore stamina/health/bond
    // -----------------------------------------------------------------
    'feed-basic': {
      stamina: +6, health: +2, mood: +3, bondXP: +1,
      notes: 'Basic meal — light stamina + health restore. Modest bond.'
    },
    'feed-gourmet': {
      stamina: +12, health: +5, mood: +6, bondXP: +3,
      notes: 'Gourmet meal — stronger restore + bond bump. She remembers who fed her well.'
    },
    'water-bottled': {
      stamina: +4, health: +2, mood: +2, bondXP: +1,
      notes: 'Bottled water — hydration restore.'
    },
    'water-filtered': {
      stamina: +6, health: +3, mood: +3, bondXP: +2,
      notes: 'Filtered water — better hydration + small bond bump.'
    },
    'heal': {
      stamina: +10, health: +20, mood: +6, bruises: -10,
      notes: 'Heal — major bruise reset + meaningful health restore.'
    },
    'rest-tick': {                  // passive, fired from tick.js when no scene happens
      stamina: +8, health: +2,
      notes: 'Passive rest — quiet tick, mild stamina regen.'
    },

    // -----------------------------------------------------------------
    // DRUGS — artificial stamina bumps + health hits
    // -----------------------------------------------------------------
    'drug-coke': {
      stamina: +20, health: -2, mood: +5, arousal: +5,
      notes: 'Cocaine — artificial stamina spike, small health cost.'
    },
    'drug-weed': {
      stamina: +3, health: 0, mood: +4, arousal: +3,
      notes: 'Weed — mild stamina boost, no health cost. Relaxes her.'
    },
    'drug-mdma': {
      stamina: +15, health: -3, mood: +12, bondXP: +2, arousal: +12, wetness: +15,
      notes: 'MDMA — euphoric stamina lift + arousal flood. Small health hit.'
    },
    'drug-acid': {
      stamina: +5, health: -2, mood: +8, arousal: +5,
      notes: 'Acid — long curve. Mind-altering more than body-altering.'
    },
    'drug-whiskey': {
      stamina: -3, health: -3, mood: +5, arousal: +6,
      notes: 'Whiskey — actually drops stamina (depressant) but loosens her up.'
    },
    'drug-ketamine': {
      stamina: -15, health: -4, mood: -5,
      notes: 'Ketamine — heavy stamina drain (dissociation), health hit.'
    },
    'drug-tranquilizer': {
      stamina: -30, health: -2, mood: -8,
      notes: 'Tranquilizer dart — knocks her out. Heavy stamina drain.'
    },

    // -----------------------------------------------------------------
    // SEXUAL — drain stamina + arousal/wetness/cumLoad shifts
    // -----------------------------------------------------------------
    'sex-gentle': {
      stamina: -8, health: 0, mood: +2, arousal: +12, wetness: +15, cumLoad: +0.6, bondXP: +2,
      notes: 'Gentle sex — moderate stamina cost, positive mood + bond.'
    },
    'sex-rough': {
      stamina: -18, health: -3, mood: -4, arousal: +18, wetness: +20, cumLoad: +0.9, bruises: +2, bondDebt: +3,
      notes: 'Rough sex — bigger stamina hit + bruise accumulation + bond-debt.'
    },
    'sex-anal': {
      stamina: -15, health: -2, mood: -2, arousal: +12, wetness: +10, cumLoad: +0.7, bondDebt: +2,
      notes: 'Anal — high stamina cost, some bond debt.'
    },
    'sex-oral': {
      stamina: -6, health: -1, mood: 0, arousal: +8, wetness: +8, cumLoad: +0.5,
      notes: 'Oral — lower stamina cost, no breeding risk (vag-only gate).'
    },
    'sex-cum-inside': {              // vaginal cum delivery — fires pregnancy conception roll
      stamina: -3, health: 0, mood: -2, cumLoad: +1.2, bondDebt: +2,
      notes: 'Cum inside her pussy — adds bondDebt, fires pregnancy conception roll.'
    },

    // -----------------------------------------------------------------
    // VIOLENCE / HURTME — bruise accumulation + health hits
    // -----------------------------------------------------------------
    'slap': {
      stamina: -2, health: -3, mood: -8, bruises: +1, bondDebt: +3,
      notes: 'Slap — small physical cost, mood hit, bruise.'
    },
    'choke': {
      stamina: -8, health: -5, mood: -6, arousal: +6, bruises: +2, bondDebt: +4,
      notes: 'Choke — stamina drain + health hit + bond debt. Arousal spike for kink fit.'
    },
    'whip': {
      stamina: -10, health: -8, mood: -10, bruises: +4, bondDebt: +6,
      notes: 'Whip — heavy bruise count + health hit. Bond-debt accumulates.'
    },
    'punch': {
      stamina: -5, health: -6, mood: -10, bruises: +3, bondDebt: +5,
      notes: 'Punch — meaningful health hit + bruise + mood + bond debt.'
    },

    // -----------------------------------------------------------------
    // RESTRAINT — low stamina, mood drop
    // -----------------------------------------------------------------
    'restrain': {
      stamina: -1, health: 0, mood: -3, bondDebt: +1,
      notes: 'Restrain her — minimal physical cost, mood drop, bond-debt blip.'
    },

    // -----------------------------------------------------------------
    // PASSIVE STARVATION / DEHYDRATION — applied by tick.js when supplies hit 0
    // -----------------------------------------------------------------
    'starve-tick': {
      stamina: -3, health: -3, mood: -5,
      notes: 'Food at 0 — per-tick starvation drain. Compounds if persistent.'
    },
    'dehydrate-tick': {
      stamina: -4, health: -5, mood: -6,
      notes: 'Water at 0 — per-tick dehydration drain. More aggressive than starvation.'
    },
    'chronic-bruise-tick': {
      stamina: -1, health: -2, mood: -2,
      notes: 'Bruises ≥ 15 — chronic injury drain per tick.'
    },

    // -----------------------------------------------------------------
    // WHORE-OUT — johns drain stamina per encounter (Phase 21.16 hook)
    // -----------------------------------------------------------------
    'john-gentle': {
      stamina: -5, health: 0, mood: -2, bondDebt: +2,
      notes: 'Gentle john — moderate stamina cost, light bond debt.'
    },
    'john-rough': {
      stamina: -15, health: -3, mood: -8, bruises: +1, bondDebt: +5,
      notes: 'Rough john — heavy stamina cost + health hit + bond debt.'
    },
    'john-quick': {
      stamina: -3, health: 0, mood: -1, bondDebt: +1,
      notes: 'Quick john — minimal stamina cost, premium per-minute pay (Phase 21.16).'
    },
    'john-degrader': {
      stamina: -10, health: -2, mood: -15, bondDebt: +8,
      notes: 'Degrader john — mood and bond destruction.'
    }
  });

  // Threshold below which actions become gated. Returns the minimum stamina required
  // for the action to land cleanly. Stamina < required = action still runs but takes
  // a bigger health hit + bigger mood penalty.
  const STAMINA_THRESHOLD_FOR_STRAIN = 20;

  // Apply an action's deltas to a girl. Optional opts:
  //   { strain: true } — applies a strain multiplier (1.5x cost on negative effects)
  function applyAction(girlId, actionId, opts = {}) {
    const action = ACTIONS[actionId];
    if (!action) {
      console.warn(`[action-effects] unknown action: ${actionId}`);
      return { ok: false, reason: 'unknown action' };
    }
    const girl = window.SSDGame.state.getGirl(girlId);
    if (!girl) return { ok: false, reason: 'no such girl' };

    const strainMul = opts.strain ? 1.5 : 1.0;
    const body = { ...girl.body };
    const bond = { ...girl.bond };

    if (action.stamina) {
      const d = action.stamina < 0 ? action.stamina * strainMul : action.stamina;
      body.stamina = clamp((body.stamina ?? 70) + d, 0, 100);
    }
    if (action.health) {
      const d = action.health < 0 ? action.health * strainMul : action.health;
      body.health = clamp((body.health ?? 100) + d, 0, 100);
    }
    if (action.arousal) body.arousal = clamp((body.arousal ?? 0) + action.arousal, 0, 100);
    if (action.wetness) body.wetness = clamp((body.wetness ?? 0) + action.wetness, 0, 100);
    if (action.bruises) body.bruises = clamp((body.bruises ?? 0) + (action.bruises < 0 ? action.bruises : action.bruises * strainMul), 0, 99);
    if (action.cumLoad) body.cumLoad = Math.max(0, (body.cumLoad ?? 0) + action.cumLoad);

    if (action.bondXP) bond.bondXP = Math.max(0, (bond.bondXP ?? 0) + action.bondXP);
    if (action.bondDebt) {
      const d = action.bondDebt < 0 ? action.bondDebt : action.bondDebt * strainMul;
      bond.bondDebt = Math.max(0, (bond.bondDebt ?? 0) + d);
    }

    if (action.notoriety && window.SSDGame.state.addNotoriety) {
      window.SSDGame.state.addNotoriety(action.notoriety);
    }

    window.SSDGame.state.updateGirl(girlId, { body, bond });
    return { ok: true, action, strain: !!opts.strain };
  }

  // Lookup the cost summary for tooltip rendering. Returns a short string like
  // "stamina -8 · health 0 · bond +2" suitable for inline tooltips.
  function previewCost(actionId) {
    const a = ACTIONS[actionId];
    if (!a) return '';
    const parts = [];
    for (const k of ['stamina', 'health', 'mood', 'arousal', 'wetness', 'bruises', 'cumLoad', 'bondXP', 'bondDebt']) {
      if (a[k] != null && a[k] !== 0) {
        const sign = a[k] > 0 ? '+' : '';
        parts.push(`${k} ${sign}${a[k]}`);
      }
    }
    return parts.join(' · ');
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Defensive helper for any subsystem that needs to advance the body fields per-tick.
  // Used by tick.js to evaluate health-decline factors + passive rest regen.
  function tickStaminaHealth() {
    const s = window.SSDGame.state.current;
    if (!s) return;
    for (const girl of s.roster) {
      if (girl.encounterState !== 'captive') continue;
      const body = girl.body || {};
      const food = girl.consumables?.food?.stock || 0;
      const water = girl.consumables?.water?.stock || 0;
      const bruises = body.bruises || 0;

      // Build a delta envelope; apply once.
      let staminaDelta = 0;
      let healthDelta = 0;
      const reasons = [];

      // Starvation
      if (food === 0) {
        staminaDelta += ACTIONS['starve-tick'].stamina;
        healthDelta += ACTIONS['starve-tick'].health;
        reasons.push('starving');
      }
      // Dehydration
      if (water === 0) {
        // Check if the hold provides plumbed water
        const dungeon = window.SSDGame.state.getDungeon(girl.assignedDungeonId);
        const hold = dungeon?.holds?.[girl.assignedHoldIdx ?? 0];
        const toiletTier = hold?.upgrades?.toilet ?? 0;
        const waterSupplyTier = hold?.upgrades?.waterSupply ?? 0;
        if (toiletTier < 2 && waterSupplyTier < 2) {
          staminaDelta += ACTIONS['dehydrate-tick'].stamina;
          healthDelta += ACTIONS['dehydrate-tick'].health;
          reasons.push('dehydrated');
        }
      }
      // Chronic bruising
      if (bruises >= 15) {
        staminaDelta += ACTIONS['chronic-bruise-tick'].stamina;
        healthDelta += ACTIONS['chronic-bruise-tick'].health;
        reasons.push('chronic-injury');
      }

      // Passive rest regen — only if there's no negative pressure this tick
      if (staminaDelta === 0 && healthDelta === 0) {
        staminaDelta += ACTIONS['rest-tick'].stamina;
        healthDelta += ACTIONS['rest-tick'].health;
      }

      if (staminaDelta !== 0 || healthDelta !== 0) {
        const newBody = { ...body };
        newBody.stamina = clamp((body.stamina ?? 70) + staminaDelta, 0, 100);
        newBody.health = clamp((body.health ?? 100) + healthDelta, 0, 100);
        window.SSDGame.state.updateGirl(girl.id, { body: newBody, _lastStaminaReasons: reasons });
      }
    }
  }

  // Phase 21.16+21.17 cross-link — Gee verbatim 2026-05-14: "better girls gorwen stats =
  // hap[pier johns= more money". Computes a 0..1.5 happiness multiplier for a girl,
  // suitable for multiplying basePay in the john-resolver. Inputs: Stockholm bond
  // (trained = bigger payout), stamina + health (above threshold = good service),
  // mood (happy mood = happy john), outfit multiplier. Returns the multiplier + a
  // diagnostic breakdown for tooltip display.
  //
  // Phase 21.16 john-resolver should call this when computing per-encounter pay:
  //   const { multiplier } = SSDGame.actionEffects.johnHappinessForGirl(girl);
  //   const finalPay = basePay * multiplier;
  function johnHappinessForGirl(girl) {
    if (!girl) return { multiplier: 1.0, breakdown: {} };
    const body = girl.body || {};
    const bond = girl.bond || {};
    const stamina = body.stamina ?? 70;
    const health = body.health ?? 100;
    const mood = girl.mood?.mood || 'neutral';
    const currentOutfit = (girl.wardrobe || []).find(w => w.id === girl.currentOutfit);
    const outfitMul = currentOutfit?.multiplier || 1.0;

    // Stockholm bond — every level multiplies pay by ~10%. Cap at 1.9 (L9).
    const bondFactor = 1 + (bond.bondLevel || 0) * 0.10;

    // Stamina — above STAMINA_THRESHOLD_FOR_STRAIN = full, below = degraded
    const staminaFactor = stamina >= STAMINA_THRESHOLD_FOR_STRAIN
      ? Math.min(1.2, 0.6 + stamina / 100 * 0.6)
      : Math.max(0.3, stamina / STAMINA_THRESHOLD_FOR_STRAIN * 0.6);

    // Health — same shape but harder to recover from
    const healthFactor = health >= 30
      ? Math.min(1.15, 0.7 + health / 100 * 0.45)
      : Math.max(0.4, health / 30 * 0.7);

    // Mood — happy moods multiply, broken moods penalize
    const moodTable = {
      'fully-bonded': 1.20, 'devoted': 1.15, 'partner': 1.10, 'dependent': 1.05,
      'reciprocated': 1.05, 'ambivalent': 1.00, 'curious': 1.02, 'acclimating': 0.95,
      'wary': 0.85, 'terrified': 0.75, 'broken': 0.60, 'catatonic': 0.50,
      'aroused': 1.10, 'needy': 1.08, 'playful': 1.05,
      'defiant': 0.70, 'traumatized': 0.55, 'subdued': 0.85
    };
    let moodFactor = 1.0;
    for (const [k, v] of Object.entries(moodTable)) {
      if (mood.includes(k)) { moodFactor = v; break; }
    }

    const multiplier = clamp(bondFactor * staminaFactor * healthFactor * moodFactor * outfitMul, 0.2, 3.0);
    return {
      multiplier,
      breakdown: {
        bondFactor, staminaFactor, healthFactor, moodFactor, outfitMul,
        stamina, health, mood, bondLevel: bond.bondLevel || 0
      }
    };
  }

  window.SSDGame = window.SSDGame || {};
  window.SSDGame.actionEffects = Object.freeze({
    ACTIONS,
    STAMINA_THRESHOLD_FOR_STRAIN,
    applyAction,
    previewCost,
    tickStaminaHealth,
    johnHappinessForGirl
  });
})();
