// SEX SLAVE DUNGEON — hunt / outside world page.

(function () {
  'use strict';

  function render(el, params) {
    const stage = params.stage || 'map';
    if (stage === 'map')       { window.SSDRouter.go('town'); return; }   // redirect to the plot page
    if (stage === 'location') return renderLocation(el, params);
    if (stage === 'approach') return renderApproach(el, params);
  }

  function renderLocation(el, params) {
    const locId = params.loc;
    const loc = window.SSDAssets.getById('location', locId);
    if (!loc) { el.innerHTML = `<p>unknown location</p>`; return; }
    const encounters = window.SSDGame.hunt.rollEncounters(locId, 3);
    const inv = window.SSDGame.state.current.inventory;

    el.innerHTML = `
      <div class="panel">
        <h2>${loc.emoji} ${loc.displayName}</h2>
        <p class="small muted">${loc.notes}</p>
        <div class="stat-row small"><span>Notoriety</span><b>${window.SSDGame.state.current.wallet.notoriety}</b>
          <span class="muted">(experience bonus applied to acquisitions)</span></div>
        <a href="#hunt" class="btn-small">← back to map</a>
      </div>
      <div class="panel">
        <h2>Girls available to acquire</h2>
        <div class="girl-grid">
          ${encounters.map(g => {
            const archDiff = window.SSDGame.hunt.ARCHETYPE_DIFFICULTY[g.archetypeTemplate] ?? 0.5;
            const captureTools = ['rohypnol','chloroform','ether','ketamine','duct-tape','rope','zip-ties','handcuffs'].filter(id => inv[id] > 0);
            const bestOdds = captureTools.length === 0 ? null : Math.max(...captureTools.map(tid =>
              window.SSDGame.hunt.previewCaptureOdds({ girl: g, toolId: tid, locationId: locId }).successP
            ));
            const oddsLabel = bestOdds === null ? 'no tool owned' : `${Math.round(bestOdds * 100)}% best odds`;
            return `
            <div class="girl-card approach-card">
              <div class="girl-emoji">${moodEmoji(g)}</div>
              <div class="girl-name">${g.name} <span class="muted small">(${g.age})</span></div>
              <div class="girl-meta">
                <span>${g.archetypeTemplate}</span>
                <span>type diff ${Math.round(archDiff*100)}%</span>
              </div>
              <div class="small muted">${g.backstoryFragment}</div>
              <div class="stat-row small"><span>Defiance</span><b>${g.stats.defiance}</b></div>
              <div class="stat-row small"><span>Intelligence</span><b>${g.stats.intelligence}</b></div>
              <div class="stat-row small"><span>Stamina</span><b>${g.stats.stamina}</b></div>
              <div class="stat-row small"><span>Pain tolerance</span><b>${g.stats.painTolerance}</b></div>
              <div class="stat-row small"><span>Acquire odds</span><b class="${bestOdds && bestOdds > 0.5 ? 'gold' : (bestOdds && bestOdds > 0.3 ? '' : 'danger')}">${oddsLabel}</b></div>
              <div class="btn-row">
                <button data-approach="${g.id}" class="btn-small btn-primary">Acquire →</button>
                <button data-walk="${g.id}" class="btn-small">Walk away</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;

    // Stash current roll in module state so approach page can find them
    window._SSD_lastEncounters = encounters;
    window._SSD_lastLocationId = locId;

    el.querySelectorAll('[data-approach]').forEach(b => {
      b.onclick = () => window.SSDRouter.go('hunt', { stage: 'approach', girl: b.dataset.approach, loc: locId });
    });
    el.querySelectorAll('[data-walk]').forEach(b => {
      b.onclick = () => window.SSDRouter.go('hunt');
    });

    // Make the whole card clickable — click anywhere on a girl card to approach her
    el.querySelectorAll('.approach-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.onclick = (ev) => {
        // Ignore clicks on inner buttons (they have their own handlers)
        if (ev.target.closest('button, a')) return;
        const id = card.querySelector('[data-approach]')?.dataset.approach;
        if (id) window.SSDRouter.go('hunt', { stage: 'approach', girl: id, loc: locId });
      };
    });

    // Per-encounter thumbnail generation — SEQUENTIAL (one at a time, in order).
    // Pass girl object directly (not via state) so we don't pollute roster with encounters.
    (async () => {
      for (let i = 0; i < encounters.length; i++) {
        const g = encounters[i];
        const card = el.querySelector(`[data-approach="${g.id}"]`)?.closest('.girl-card');
        if (!card) continue;
        const slot = document.createElement('div');
        slot.className = 'hunt-thumb-slot small muted';
        slot.textContent = `📷 generating ${i+1}/${encounters.length}…`;
        card.insertBefore(slot, card.firstChild.nextSibling);

        const situation = `hunt-encounter-${locId}`;
        try {
          const result = await window.SSDGame.imaging.generateFor(g, { situation, locationId: locId });
          if (result && result.url) {
            slot.innerHTML = `<img src="${result.url}" alt="${g.name}" class="gen-img hunt-thumb" onerror="this.outerHTML='<div class=\\'small muted\\'>(image blocked — click to approach anyway)</div>';" />`;
          } else {
            slot.innerHTML = `<div class="small muted">(no thumb — ${result?.error || 'skipped'})</div>`;
          }
        } catch (err) {
          slot.innerHTML = `<div class="small muted">(thumb error — click to approach anyway)</div>`;
        }
      }
    })();
  }

  // Phase 21.11 (2026-05-14) — renderApproach rewritten as 4-stage capture progress-bar UI.
  // Replaces the prior single-tool-single-roll button row. Player assigns one tool per stage
  // (Approach / Engage / Subdue / Secure) from inventory, clicks "Begin Attempt", and the four
  // stages resolve via `window.SSDGame.capture.runAttempt()` with animated progress bars.
  function renderApproach(el, params) {
    const encounters = window._SSD_lastEncounters || [];
    const girl = encounters.find(g => g.id === params.girl);
    const locId = params.loc;
    if (!girl) { el.innerHTML = `<p>encounter expired — <a href="#hunt">back to map</a></p>`; return; }
    const inv = window.SSDGame.state.current.inventory;
    const locName = window.SSDAssets.getById('location', locId)?.displayName;

    const cap = window.SSDGame.capture;
    const archResist = cap.getArchetypeResistance(girl.archetypeTemplate);

    // Build per-stage eligible-tool option lists. Pre-select the best-stat tool per stage.
    const stageLoadout = {};
    for (const stageKey of cap.STAGES) {
      const eligible = cap.eligibleToolsForStage(stageKey);
      if (eligible.length === 0) {
        stageLoadout[stageKey] = null;
      } else {
        // Pre-select tool with highest stage stat.
        eligible.sort((a, b) => (cap.getToolStages(b)[stageKey] || 0) - (cap.getToolStages(a)[stageKey] || 0));
        stageLoadout[stageKey] = eligible[0];
      }
    }

    function renderStageLoadoutRow(stageKey) {
      const eligible = cap.eligibleToolsForStage(stageKey);
      const label = cap.STAGE_LABELS[stageKey];
      const desc = cap.STAGE_DESCRIPTIONS[stageKey];
      const resistance = archResist[stageKey] || 25;
      if (eligible.length === 0) {
        return `
          <div class="capture-stage-row">
            <div class="capture-stage-head"><b>${label}</b> <span class="muted small">— ${desc}</span></div>
            <div class="capture-stage-body"><span class="danger small">no tool in inventory for this stage — <a href="#shop">shop →</a></span></div>
            <div class="capture-stage-foot small muted">${girl.name}'s ${stageKey} resistance: <b>${resistance}</b></div>
          </div>
        `;
      }
      const optionsHtml = eligible.map(id => {
        const item = window.SSDAssets.getById('item', id);
        const stat = cap.getToolStages(id)[stageKey] || 0;
        const isSelected = stageLoadout[stageKey] === id;
        return `<option value="${id}"${isSelected ? ' selected' : ''}>${item.emoji} ${item.displayName} — stage stat ${stat} (have ${inv[id]})</option>`;
      }).join('');
      return `
        <div class="capture-stage-row" data-stage="${stageKey}">
          <div class="capture-stage-head"><b>${label}</b> <span class="muted small">— ${desc}</span></div>
          <div class="capture-stage-body">
            <select class="inline-select capture-tool-select" data-stage-key="${stageKey}">${optionsHtml}</select>
          </div>
          <div class="capture-stage-foot small muted">${girl.name}'s ${stageKey} resistance: <b>${resistance}</b></div>
        </div>
      `;
    }

    function renderProgressMeter(stageKey, progress = 0, cleared = false, toolId = null) {
      const label = cap.STAGE_LABELS[stageKey];
      const item = toolId ? window.SSDAssets.getById('item', toolId) : null;
      const toolBadge = item ? `<span class="capture-tool-badge">${item.emoji}</span>` : '<span class="muted">—</span>';
      const cls = cleared ? 'cleared' : (progress > 0 ? 'in-progress' : 'idle');
      return `
        <div class="capture-progress-row ${cls}" data-progress-stage="${stageKey}">
          <div class="capture-progress-label">${label} ${toolBadge}</div>
          <div class="capture-progress-bar-wrap">
            <div class="capture-progress-bar" style="width: ${progress}%"></div>
            <span class="capture-progress-pct">${progress}%${cleared ? ' ✓' : ''}</span>
          </div>
        </div>
      `;
    }

    const playerSkillNow = cap.getPlayerSkill();
    const suspicionNow = window.SSDGame.state.current?.wallet?.suspicionByLocation?.[locId] || 0;

    el.innerHTML = `
      <div class="panel">
        <h2>Approach: ${moodEmoji(girl)} ${girl.name}</h2>
        <p class="small muted">${girl.backstoryFragment}</p>
        <div class="stat-row small"><span>Archetype</span><b>${girl.archetypeTemplate}</b></div>
        <div class="stat-row small"><span>Defiance / Intelligence</span><b>${girl.stats.defiance} / ${girl.stats.intelligence}</b></div>
        <div class="stat-row small"><span>Stamina / Pain tolerance</span><b>${girl.stats.stamina} / ${girl.stats.painTolerance}</b></div>
        <div class="stat-row small"><span>Player skill (notoriety XP)</span><b>${playerSkillNow}/30</b></div>
        <div class="stat-row small"><span>Location suspicion</span><b class="${suspicionNow > 5 ? 'warn' : ''}">${suspicionNow}</b></div>
        <div class="btn-row">
          <a href="#hunt?stage=location&loc=${locId}" class="btn-small">← back</a>
        </div>
      </div>

      <div class="panel">
        <h2>Talk first</h2>
        <div class="btn-col">
          <button data-action="talk" class="btn-small">💬 Open with a line (low commitment)</button>
          <button data-action="walk" class="btn-small">🚪 Walk away</button>
        </div>
      </div>

      <div class="panel">
        <h2>Capture loadout — pick one tool per stage</h2>
        <p class="small muted">Each stage needs its own qualifying tool. Spam-one-tool doesn't work — you have to plan the loadout. Stage clears at ≥ ${cap.STAGE_CLEAR_THRESHOLD}% progress. Any stage failing = girl escapes.</p>
        <div class="capture-stage-grid">
          ${cap.STAGES.map(renderStageLoadoutRow).join('')}
        </div>
        <div class="btn-row">
          <button data-action="begin-attempt" class="btn-primary btn-danger">⚡ Begin 4-stage capture attempt</button>
        </div>
      </div>

      <div id="result"></div>
    `;

    el.querySelector('[data-action="talk"]').onclick = async () => {
      const resultEl = el.querySelector('#result');
      resultEl.innerHTML = `<div class="panel"><p class="small muted">${girl.name} turns to look at you…</p></div>`;
      await runSceneNarration({
        girl, sceneKey: 'first_encounter', sceneVars: { LOCATION: locName },
        userText: '', resultEl, heading: `${girl.name} says:`
      });
    };
    el.querySelector('[data-action="walk"]').onclick = () => window.SSDRouter.go('hunt');

    // Live update stageLoadout when player changes a per-stage tool select.
    el.querySelectorAll('.capture-tool-select').forEach(sel => {
      sel.onchange = () => { stageLoadout[sel.dataset.stageKey] = sel.value; };
    });

    el.querySelector('[data-action="begin-attempt"]').onclick = async () => {
      const beginBtn = el.querySelector('[data-action="begin-attempt"]');
      beginBtn.disabled = true;
      beginBtn.textContent = '⚡ Resolving 4 stages…';

      // Validate: at least one stage must have a tool assigned. If ALL stages are null,
      // there's nothing to attempt. (Empty stages will auto-fail.)
      const anyAssigned = cap.STAGES.some(k => stageLoadout[k]);
      if (!anyAssigned) {
        beginBtn.disabled = false;
        beginBtn.textContent = '⚡ Begin 4-stage capture attempt';
        alert('Assign at least one tool to a stage before attempting.');
        return;
      }

      const result = window.SSDGame.capture.runAttempt({
        girl,
        toolPerStage: stageLoadout,
        locationId: locId
      });

      // Build the progress-bar visualization area
      const resultEl = el.querySelector('#result');
      const heading = result.outcome === 'success'
        ? '🎯 ACQUIRED — full 4-stage capture successful'
        : `❌ ATTEMPT FAILED — stalled at ${cap.STAGE_LABELS[result.failedAtStage] || result.failedAtStage}`;
      const witnessNote = result.witness ? `<p class="danger small">⚠️ A witness saw the attempt — full -30 progress penalty applied to every stage</p>` : '';

      resultEl.innerHTML = `
        <div class="panel">
          <h3>${heading}</h3>
          ${witnessNote}
          <div class="capture-progress-grid">
            ${cap.STAGES.map(k => {
              const stageData = result.stages.find(s => s.stageKey === k);
              return renderProgressMeter(k, 0, false, stageData?.toolId);   // start at 0, animate up
            }).join('')}
          </div>
          <div class="capture-mech-summary small muted" id="capture-mech-summary"></div>
          <div class="log"><div class="log-entry assistant streaming"><b>${girl.name}:</b> <span id="acquire-narr"></span></div></div>
        </div>
      `;

      // Animate the progress bars filling sequentially
      for (const stageData of result.stages) {
        const meterEl = resultEl.querySelector(`[data-progress-stage="${stageData.stageKey}"]`);
        if (!meterEl) continue;
        await animateProgressBar(meterEl, stageData.progress, stageData.cleared);
        // Insert per-stage summary line after each meter resolves
        const sumDiv = document.createElement('div');
        sumDiv.className = 'capture-stage-summary small';
        sumDiv.innerHTML = window.SSDGame.capture.summarizeStage(stageData);
        if (stageData.reason) {
          sumDiv.innerHTML += ` <span class="muted">(${stageData.reason})</span>`;
        }
        resultEl.querySelector('#capture-mech-summary').appendChild(sumDiv);
        if (!stageData.cleared) break;   // failure stops the animation
      }

      // Mechanical consequences summary
      const consElEl = resultEl.querySelector('#capture-mech-summary');
      const consequences = result.consequences || {};
      if (consequences.suspicionDelta) consElEl.insertAdjacentHTML('beforeend',
        `<div class="stat-row small"><span>Location suspicion</span><b class="warn">+${consequences.suspicionDelta}</b></div>`);
      if (consequences.notorietyDelta) consElEl.insertAdjacentHTML('beforeend',
        `<div class="stat-row small"><span>Notoriety</span><b class="warn">+${consequences.notorietyDelta}</b></div>`);
      if (consequences.warinessDelta)  consElEl.insertAdjacentHTML('beforeend',
        `<div class="stat-row small"><span>${girl.name} wariness</span><b class="warn">+${consequences.warinessDelta} (next attempt harder)</b></div>`);
      if (result.consumed?.length) {
        result.consumed.forEach(c => {
          const item = window.SSDAssets.getById('item', c.toolId);
          consElEl.insertAdjacentHTML('beforeend',
            `<div class="stat-row small"><span>Consumed</span><b>${item?.emoji || ''} ${item?.displayName || c.toolId} ×${c.count}</b></div>`);
        });
      }

      // Ollama scene narration — pick the scene per outcome + which stage failed
      let sceneKey, sceneTool;
      if (result.outcome === 'success') {
        sceneKey = 'acquire_success';
        // Pick the most impactful tool from the run for the narration (highest stage stat)
        sceneTool = pickHeroToolFromStages(result.stages);
      } else {
        sceneKey = result.witness ? 'acquire_critical_fail' : 'acquire_fail';
        sceneTool = result.stages.find(s => s.toolId)?.toolId || null;
      }
      const sceneToolItem = sceneTool ? window.SSDAssets.getById('item', sceneTool) : null;
      await runSceneNarration({
        girl, sceneKey,
        sceneVars: { LOCATION: locName, TOOL: sceneToolItem?.displayName || 'mixed approach' },
        userText: '',
        injectInto: resultEl.querySelector('#acquire-narr')
      });

      // On success — escort + 4-beat transition sequence
      if (result.outcome === 'success') {
        const escortResult = window.SSDGame.hunt.escortToHold(girl);
        const sceneVars = window.SSDGame.hunt.composeSceneVars({
          girl, toolId: sceneTool, locationId: locId, dungeonId: escortResult.dungeonId
        });
        await playTransitionSequence({ resultEl, girl, sceneVars });
        const followup = document.createElement('div');
        followup.className = 'btn-row';
        followup.innerHTML = `<a href="#room?girl=${girl.id}" class="btn-primary">Enter her hold →</a>`;
        resultEl.querySelector('.panel').appendChild(followup);
      } else {
        // Failure path — offer back-to-hunt + walk away
        const followup = document.createElement('div');
        followup.className = 'btn-row';
        followup.innerHTML = `<a href="#hunt?stage=location&loc=${locId}" class="btn-small">← back to location (next encounter)</a> <a href="#hunt" class="btn-small">map</a>`;
        resultEl.querySelector('.panel').appendChild(followup);
      }
    };
  }

  // Animate one progress bar from 0% to its final value over ~600ms.
  function animateProgressBar(meterEl, finalProgress, cleared) {
    return new Promise(resolve => {
      const bar = meterEl.querySelector('.capture-progress-bar');
      const pct = meterEl.querySelector('.capture-progress-pct');
      if (!bar || !pct) { resolve(); return; }
      const start = performance.now();
      const duration = 600;
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(finalProgress * eased);
        bar.style.width = current + '%';
        pct.textContent = current + '%' + (cleared && t >= 1 ? ' ✓' : '');
        if (t < 1) requestAnimationFrame(step);
        else {
          if (cleared) meterEl.classList.add('cleared');
          else meterEl.classList.add('failed');
          meterEl.classList.remove('in-progress', 'idle');
          resolve();
        }
      }
      meterEl.classList.add('in-progress');
      requestAnimationFrame(step);
    });
  }

  // Pick the highest-stage-stat tool from the cleared stages (for narration "TOOL").
  function pickHeroToolFromStages(stages) {
    let best = null;
    let bestStat = -1;
    for (const s of stages) {
      if (!s.toolId || !s.cleared) continue;
      if (s.toolBonus > bestStat) {
        bestStat = s.toolBonus;
        best = s.toolId;
      }
    }
    return best;
  }

  // Play the 4-beat capture transition as sequential Ollama scenes.
  async function playTransitionSequence({ resultEl, girl, sceneVars }) {
    const beats = [
      { key: 'transition_subdue',        heading: '🔸 beat 1 — subdue' },
      { key: 'transition_transport',     heading: '🔸 beat 2 — transport' },
      { key: 'transition_arrival',       heading: '🔸 beat 3 — arrival' },
      { key: 'transition_first_moment',  heading: '🔸 beat 4 — first moment in her hold' }
    ];
    const container = document.createElement('div');
    container.className = 'panel transition-panel';
    container.innerHTML = `<h3>📽️ Capture transition</h3><div class="transition-log"></div>`;
    resultEl.appendChild(container);
    const logEl = container.querySelector('.transition-log');

    for (const beat of beats) {
      const beatDiv = document.createElement('div');
      beatDiv.className = 'log-entry assistant streaming';
      beatDiv.innerHTML = `<b>${beat.heading}</b><br><span></span>`;
      logEl.appendChild(beatDiv);
      const spanEl = beatDiv.querySelector('span');
      try {
        const system = window.SSDTemplates.buildSystemPrompt(girl, 'sexy', beat.key, sceneVars);
        const { raw, parsed } = await window.SSDGame.ollama.chatStream({
          system,
          messages: [{ role: 'user', content: '(play out this beat in first person from her POV)' }],
          onChunk: (chunk, full) => {
            spanEl.textContent = full.replace(/<delta>[\s\S]*?<\/delta>/g, '').trim();
            logEl.scrollTop = logEl.scrollHeight;
          }
        });
        spanEl.textContent = (parsed.cleanText || raw).trim();
        beatDiv.classList.remove('streaming');
        // Append to girl's turn log so she remembers her own narration
        window.SSDGame.state.appendTurn(girl.id, 'assistant', `[${beat.heading}] ${spanEl.textContent}`);
      } catch (err) {
        spanEl.textContent = `(Ollama unreachable — beat skipped: ${err.message})`;
        beatDiv.classList.remove('streaming');
      }
    }
  }

  // Run a scene narration — calls Ollama with the scene template, streams text into a DOM target.
  async function runSceneNarration({ girl, sceneKey, sceneVars, userText = '', resultEl, heading, injectInto }) {
    try {
      const system = window.SSDTemplates.buildSystemPrompt(girl, 'sexy', sceneKey, sceneVars);
      let target = injectInto;
      if (!target && resultEl) {
        resultEl.innerHTML = `<div class="panel"><h3>${heading || girl.name}</h3><div class="log"><div class="log-entry assistant streaming"><b>${girl.name}:</b> <span id="narr-txt"></span></div></div></div>`;
        target = resultEl.querySelector('#narr-txt');
      }
      const { raw, parsed } = await window.SSDGame.ollama.chatStream({
        system,
        messages: [{ role: 'user', content: userText || `(Master initiates the scene — narrate from your POV.)` }],
        onChunk: (chunk, full) => {
          if (!target) return;
          target.textContent = full.replace(/<delta>[\s\S]*?<\/delta>/g, '').trim();
        }
      });
      if (target) target.textContent = (parsed.cleanText || raw).trim();
    } catch (err) {
      if (resultEl) {
        resultEl.insertAdjacentHTML('beforeend', `<p class="small danger">(Ollama unreachable: ${err.message} — game mechanics still applied.)</p>`);
      } else if (injectInto) {
        injectInto.textContent = `(Ollama unreachable: ${err.message} — mechanics applied.)`;
      }
    }
  }

  function moodEmoji(g) { return g.mood?.moodEmoji || '😐'; }
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  window.SSDRouter.register('hunt', render);
})();
