// SEX SLAVE DUNGEON — maintenance tick. Runs on interval while game page is open.

(function () {
  'use strict';

  let timer = null;

  const INTERVAL_MS = 30_000;    // 30 seconds between ticks

  function start() {
    if (timer) return;
    timer = setInterval(runTick, INTERVAL_MS);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function runTick() {
    const s = window.SSDGame.state.current;
    if (!s || !s.createdAt) return;

    window.SSDGame.state.bumpTick();

    // 0. Advance the game clock. 1 real second = 1 game minute, so each 30-second
    // tick advances game time by 30 game minutes.
    // Computed from the real-clock delta so the clock stays continuous even if
    // ticks miss/throttle (browser tab backgrounded, etc).
    if (window.SSDGame.gameClock) window.SSDGame.gameClock.advanceFromTick();

    // 1. Consumable decay per girl
    for (const girl of s.roster) {
      if (girl.encounterState !== 'captive') continue;
      decayConsumables(girl);
    }

    // 2. Escape rolls per captive
    for (const girl of s.roster) {
      if (girl.encounterState !== 'captive') continue;
      runEscapeRoll(girl);
    }

    // 3. Market sale pass (films)
    window.SSDGame.market.runSaleTick();

    // 4. Propositioner arrivals
    if (window.SSDGame.propositioner.shouldArriveThisTick()) {
      const p = window.SSDGame.propositioner.rollPropositioner();
      window.SSDGame.state.enqueuePropositioner(p);
    }

    // 5. Slave-market buyer tick
    window.SSDGame.slaveMarket.runBuyerTick();

    // 6. Drug scheduler — pharmacokinetic curves drive high + active list
    if (window.SSDGame.drugs) window.SSDGame.drugs.tickAll();

    // 7. Notoriety slow decay — heat cools over time
    if (window.SSDGame.balancing) window.SSDGame.balancing.decayTick();

    // 9. Achievements check
    if (window.SSDGame.achievements) {
      const unlocks = window.SSDGame.achievements.check();
      if (unlocks.length && window.SSDNotify) {
        unlocks.forEach(u => window.SSDNotify.show(`${u.emoji} ${u.title} — ${u.description}`));
      }
    }

    // 10. Escape-recovery window expiration
    if (window.SSDGame.escapeRecovery) window.SSDGame.escapeRecovery.expireTick();

    // 11. Lifespan system — days-captive aging + neglect/care evaluation + terminal state transitions
    if (window.SSDGame.lifespan) window.SSDGame.lifespan.tickAll();

    // 12. Pregnancy — advance gestation by GESTATION_DAYS_PER_TICK
    // for every pregnant captive; auto-resolve at day 280 (birthed / sold / lost branches).
    if (window.SSDGame.pregnancy) window.SSDGame.pregnancy.tickPregnancies();

    // 13. Stamina + health drain/regen. Starvation/dehydration/
    // chronic-bruise penalties + passive rest regen when no negative pressure is active.
    if (window.SSDGame.actionEffects) window.SSDGame.actionEffects.tickStaminaHealth();

    // Player satisfaction slow decay — without intimacy this tick, the meter drifts down.
    // 0.5/tick = full decay (50 → 0) over ~100 ticks (~50 real minutes). Sex acts via
    // applyAction bump it back up; balance is tuned for "stop hunting and fuck for a bit"
    // to be a real strategic choice.
    if (window.SSDGame.state?.current?.wallet) {
      const w = window.SSDGame.state.current.wallet;
      const cur = typeof w.playerSatisfaction === 'number' ? w.playerSatisfaction : 50;
      if (cur > 0) w.playerSatisfaction = Math.max(0, cur - 0.5);
    }

    // 14. Whore-out john arrivals. Per-rate arrival rolls per
    // whored-out captive; each arrival resolves the encounter, drains stamina via action-
    // effects, accrues unclaimedEarnings, persists to johnLedger, fires pregnancy hook on
    // vaginal-cum + !condomUsed.
    if (window.SSDGame.whoreOut) window.SSDGame.whoreOut.runJohnTick();
  }

  // Decay food + water per tick, GATED by the hold's automation tiers.
  // Gating rules:
  //   - Water decay zeroes if hold's `toilet` tier >= 2 (full plumbing) OR
  //                            hold's `waterSupply` tier >= 2 (plumbed faucet+).
  //     A captive with a toilet no longer needs a manual water supply — plumbed sources
  //     draw their own water, so no manual stock burn.
  //   - Food decay zeroes if hold's `feedAutomation` tier >= 2 (auto-feeder dispenser+).
  //     Auto-feeder + IV-line draw from their own reservoir of stocked feed (game-abstract);
  //     player still buys food via the shop to bump the food.tier quality multiplier, but
  //     the per-tick stock decay stops.
  // Bond-debt accrues only when manual decay actually runs the stock to zero.
  function decayConsumables(girl) {
    const dungeon = window.SSDGame.state.getDungeon(girl.assignedDungeonId);
    const hold = dungeon?.holds?.[girl.assignedHoldIdx ?? 0];
    const toiletTier = hold?.upgrades?.toilet ?? 0;
    const waterSupplyTier = hold?.upgrades?.waterSupply ?? 0;
    const feedAutomationTier = hold?.upgrades?.feedAutomation ?? 0;

    const waterPlumbed = toiletTier >= 2 || waterSupplyTier >= 2;
    const foodAutomated = feedAutomationTier >= 2;

    const c = girl.consumables || {};
    const newC = JSON.parse(JSON.stringify(c));
    let moodPenalty = 0;

    if (newC.food && !foodAutomated) {
      newC.food.stock = Math.max(0, (newC.food.stock || 0) - (newC.food.decayPerTick || 1));
      if (newC.food.stock === 0) moodPenalty += 1;
    }
    if (newC.water && !waterPlumbed) {
      newC.water.stock = Math.max(0, (newC.water.stock || 0) - (newC.water.decayPerTick || 1));
      if (newC.water.stock === 0) moodPenalty += 1;
    }

    const patch = { consumables: newC };
    if (moodPenalty > 0) {
      const newBond = { ...girl.bond, bondDebt: (girl.bond.bondDebt || 0) + moodPenalty };
      patch.bond = newBond;
    }
    window.SSDGame.state.updateGirl(girl.id, patch);
  }

  function runEscapeRoll(girl) {
    if (!girl.escape) return;
    const threshold = Math.min(0.6, girl.escape.currentRisk || 0.1);
    if (Math.random() < threshold * 0.1) {       // slow rate — per-tick chance
      // Escape attempt
      const dungeon = window.SSDGame.state.getDungeon(girl.assignedDungeonId);
      const dungeonTpl = dungeon && window.SSDAssets.getById('dungeon', dungeon.templateId);
      const concealment = dungeonTpl?.concealment || 0.5;
      const isolation = dungeonTpl?.isolation || 0.5;
      const containmentChance = Math.min(0.95, 0.4 + concealment * 0.3 + isolation * 0.3);
      const caught = Math.random() < containmentChance;
      if (caught) {
        // Contained — small bruise hit, bond debt
        const newBody = { ...girl.body, bruises: girl.body.bruises + 2 };
        const newBond = { ...girl.bond, bondDebt: girl.bond.bondDebt + 3 };
        const newMood = { mood: 'defiant', moodEmoji: '😤', history: [...(girl.mood.history || []), { shift: 'escape-caught', ts: Date.now() }] };
        window.SSDGame.state.updateGirl(girl.id, {
          body: newBody, bond: newBond, mood: newMood,
          escape: { ...girl.escape, lastAttempt: { outcome: 'caught', ts: Date.now() } }
        });
      } else {
        // She got out — move encounter state, notoriety spike
        window.SSDGame.state.updateGirl(girl.id, {
          encounterState: 'escaped',
          escape: { ...girl.escape, lastAttempt: { outcome: 'escaped', ts: Date.now() } }
        });
        window.SSDGame.state.addNotoriety(4);
      }
    }
  }

  window.SSDGame = window.SSDGame || {};
  window.SSDGame.tick = Object.freeze({ start, stop, runTick });
})();
