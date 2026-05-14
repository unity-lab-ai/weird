// DUNGEON MASTER: THE HUNT — one-hand mouse UX with full captor-dynamic action set.
// Tabbed by category: FORCE / POSITIONS / ORAL / ANAL / PAIN / PUNISHMENT / DEGRADE /
// BONDAGE / DRUGS / COMMANDS. Actions are bond-gated — some get softer labels at high
// bond, most stay raw at every level.
//
// Each action carries:
//   emoji  — small visual prefix for the button
//   label  — short name shown on the button
//   text   — the Master-action description sent to Ollama as the user turn
//   sat    — player-satisfaction delta on click (0-8). Everything is sexualized — sex,
//            violence, humiliation, bondage, control. The player feels each act. Values
//            scale with intensity: light control / mercy = 0-2, sexual + degrading = 3-5,
//            heavy violence + breeding + creampie = 6-8. Hunting bonus draws from total
//            satisfaction via hunt.previewCaptureOdds.

(function () {
  'use strict';

  const TABS = {
    force: {
      label: '💢 Force',
      actions: [
        { emoji: '🤜',  label: 'pin her down',        text: '*pins her shoulders to the bed, one hand on her throat, forces her knees apart*', sat: 4 },
        { emoji: '🍆',  label: 'force vag entry',     text: '*shoves inside her dry, no warning, watches her face break*', sat: 6 },
        { emoji: '🍑',  label: 'force anal',          text: '*spits once, forces the head in, ignores the scream*', sat: 6 },
        { emoji: '👄',  label: 'face fuck hard',      text: '*grabs her hair with both hands and fucks her throat until her nose hits my pelvis*', sat: 5 },
        { emoji: '🤐',  label: 'gag her to the hilt', text: '*holds her jaw open and buries it, holds her there while she gags*', sat: 4 },
        { emoji: '🧱',  label: 'pin to wall',         text: '*slams her against the wall face-first, pulls her hips back, takes what I want*', sat: 5 },
        { emoji: '💦',  label: 'force cum inside',    text: '*pins her hips, holds her in place, empties inside her, doesn\'t let her pull away*', sat: 7 },
        { emoji: '🫸',  label: 'throat pin',          text: '*grips her throat while I fuck her, watches her eyes go glassy*', sat: 5 },
        { emoji: '✋',  label: 'grab by hair',        text: '*yanks her by the roots, drags her where I want her*', sat: 3 },
        { emoji: '🩸',  label: 'breed her',           text: '*holds her down after finishing, keeps me inside, refuses to let it spill*', sat: 7 }
      ]
    },
    positions: {
      label: '🍆 Positions',
      actions: [
        { emoji: '⬇',  label: 'missionary (pinned)',    text: '*puts her on her back, pins her wrists over her head, fucks her slow and deep*', sat: 4 },
        { emoji: '🐕', label: 'doggy rough',            text: '*grabs her hips and pulls her back onto me, sets a brutal pace*', sat: 5 },
        { emoji: '🤸', label: 'prone-bone',             text: '*flattens her face-down onto the mattress, lies on top, fucks her pinned flat*', sat: 5 },
        { emoji: '🔁', label: 'reverse cowgirl (force)',text: '*sits back, pulls her onto me backwards, grabs her hips and bounces her*', sat: 4 },
        { emoji: '🧍', label: 'against the wall',       text: '*picks her up, pins her to the wall, her legs around my waist, fucks her held up*', sat: 5 },
        { emoji: '🛏️', label: 'spooning rough',         text: '*behind her, hand on her throat, one leg up, fucks her on her side*', sat: 4 },
        { emoji: '🧎', label: 'kneeling service',       text: '*stands over her, hands in her hair, uses her mouth*', sat: 4 },
        { emoji: '🪑', label: 'over my lap',            text: '*drags her face-down across my thighs, ass up, starts spanking*', sat: 4 },
        { emoji: '🔃', label: 'flipped upside',         text: '*lifts her upside down by the hips, face at my cock, fucks her throat while her legs kick*', sat: 6 },
        { emoji: '🪢', label: 'spread-eagle tied',      text: '*ties each wrist and ankle to the bedposts, spreads her wide, takes my time*', sat: 5 }
      ]
    },
    oral: {
      label: '👅 Oral',
      actions: [
        { emoji: '🫦',  label: 'face fuck',             text: '*holds her head and fucks her mouth with full strokes*', sat: 4 },
        { emoji: '🌪️', label: 'throat bulge',           text: '*watches the bulge of my cock moving in her throat, one hand pressing on it from outside*', sat: 5 },
        { emoji: '💧',  label: 'make her gag',          text: '*holds her nose, forces her to take all of it, listens to her gag and choke*', sat: 5 },
        { emoji: '✋',  label: 'pin nose shut',         text: '*pinches her nose so her only air is my cock pulling back*', sat: 5 },
        { emoji: '👄',  label: 'slap with cock',        text: '*pulls out, slaps her across the face with my cock, then back in*', sat: 4 },
        { emoji: '🥵',  label: 'make her swallow',      text: '*finishes in her mouth, grabs her jaw shut, tells her to swallow every drop*', sat: 6 },
        { emoji: '💦',  label: 'cum on her face',       text: '*pulls out at the last second, coats her cheeks, eyelashes, mouth*', sat: 6 },
        { emoji: '🧎',  label: 'make her worship',      text: '*stands over her, tells her to kiss every inch, thank it, lick it slow*', sat: 4 },
        { emoji: '🫁',  label: 'deepthroat hold',       text: '*buries her nose in my pelvis and holds her there, counts to ten*', sat: 5 },
        { emoji: '🦷',  label: 'bite warning',          text: '*one finger under her jaw — no teeth. she learns fast.*', sat: 3 }
      ]
    },
    anal: {
      label: '🍑 Anal',
      actions: [
        { emoji: '💢',  label: 'force entry dry',       text: '*spits once, works the head in, ignores her cry*', sat: 7 },
        { emoji: '🟣',  label: 'plug first',            text: '*slides the plug in, leaves it an hour to open her up*', sat: 3 },
        { emoji: '🍆',  label: 'slow deep anal',        text: '*slides in inch by inch, watches her face in the mirror*', sat: 5 },
        { emoji: '🚀',  label: 'brutal pace',           text: '*grabs her hips and sets a merciless pace, hears her lose her breath*', sat: 6 },
        { emoji: '🫸',  label: 'double pen',            text: '*works in two while a finger stays deep in her cunt, both at once*', sat: 6 },
        { emoji: '💦',  label: 'cream her ass',         text: '*empties deep, holds her hips still, watches it leak when I pull out*', sat: 6 },
        { emoji: '👅',  label: 'rim her',               text: '*spreads her cheeks, tongue flat from back to front, over and over*', sat: 3 },
        { emoji: '📏',  label: 'anal training',         text: '*starts with one finger, works up, tells her what number we\'re at*', sat: 4 },
        { emoji: '🕳️',  label: 'gape hold',             text: '*pulls out at the right moment, holds her open, watches*', sat: 5 }
      ]
    },
    pain: {
      label: '🔥 Pain (kink)',
      actions: [
        { emoji: '🕯️',  label: 'hot wax on tits',       text: '*drips red candle wax slowly across her nipples and down her sternum*', sat: 4 },
        { emoji: '🕯️',  label: 'hot wax thighs',        text: '*drips hot wax along her inner thighs, watches her stomach jump*', sat: 4 },
        { emoji: '🥢',  label: 'whip her back',         text: '*lays five stripes across her shoulders with the leather, makes her count them*', sat: 6 },
        { emoji: '🪵',  label: 'cane ass',              text: '*six strokes with the cane, slow and measured, marks across both cheeks*', sat: 6 },
        { emoji: '🪢',  label: 'flog breasts',          text: '*steady flogging across her tits until they\'re red and swollen*', sat: 5 },
        { emoji: '🤏',  label: 'pinch nipples hard',    text: '*takes both nipples between thumb and forefinger, pinches, twists*', sat: 3 },
        { emoji: '🎀',  label: 'clamp nipples',         text: '*clips the weighted clamps on, adjusts until she whimpers*', sat: 4 },
        { emoji: '📎',  label: 'clamp clit',            text: '*small clamp on her clit hood, just enough pressure to keep her still*', sat: 4 },
        { emoji: '✋',  label: 'slap her pussy',        text: '*open-hand slap right between her legs, sharp wet sound*', sat: 4 },
        { emoji: '🤚',  label: 'slap tits red',         text: '*open-handed slap across one tit, then the other, until they sting red*', sat: 4 },
        { emoji: '🦷',  label: 'bite nipples',          text: '*leans down, teeth closed on one nipple, bites until she sucks in a breath*', sat: 4 },
        { emoji: '🧊',  label: 'ice on nipples',        text: '*holds an ice cube on each nipple until she\'s shaking and her teeth chatter*', sat: 3 },
        { emoji: '🔥',  label: 'cigarette burn',        text: '*lights one, lets it smolder against her inner thigh, watches the skin pucker*', sat: 6 }
      ]
    },
    violence: {
      label: '🩸 Violence',
      actions: [
        { emoji: '👊',  label: 'punch face',            text: '*throws a closed fist at her cheek, watches the bruise bloom up under the skin*', sat: 6 },
        { emoji: '✋',  label: 'open-palm slap face',   text: '*full open-handed slap across her face, head whips sideways, lip splits*', sat: 5 },
        { emoji: '🤚',  label: 'backhand face',         text: '*backhands her hard across the cheek, knocks her sideways into the wall*', sat: 5 },
        { emoji: '👊',  label: 'punch tit',             text: '*drives a fist square into one of her tits, full follow-through, watches her crumple*', sat: 6 },
        { emoji: '🥊',  label: 'punch belly',           text: '*throws a hook into her stomach, watches her fold and dry-heave*', sat: 5 },
        { emoji: '🥊',  label: 'throat punch',          text: '*throws a fast closed fist at her larynx, watches her drop trying to breathe*', sat: 6 },
        { emoji: '🫳',  label: 'throat squeeze',        text: '*closes one hand around her throat and squeezes — not unconscious, just enough to make her choke*', sat: 5 },
        { emoji: '🌑',  label: 'choke out',             text: '*both hands locked on her throat, holds until her body goes limp under me*', sat: 7 },
        { emoji: '🦵',  label: 'knee to gut',           text: '*drives a knee up into her stomach, watches her go down*', sat: 5 },
        { emoji: '🦵',  label: 'knee to clit',          text: '*drives a knee up between her spread legs, sharp, watches her shriek*', sat: 5 },
        { emoji: '💪',  label: 'elbow drop ribs',       text: '*cocks an elbow back and drives it down into her ribs, hears one give*', sat: 6 },
        { emoji: '🦶',  label: 'stomp ribs',            text: '*brings a boot down on her ribs while she lies pinned, feels them flex*', sat: 5 },
        { emoji: '🦶',  label: 'stomp head',            text: '*pins her cheek to the concrete with a boot, leans his weight onto it*', sat: 6 },
        { emoji: '💥',  label: 'head slam wall',        text: '*grabs her by the hair and slams her face into the wall, watches blood bloom*', sat: 6 },
        { emoji: '💥',  label: 'head slam floor',       text: '*grips the back of her skull and drives her face into the concrete floor*', sat: 6 },
        { emoji: '✋',  label: 'spank ass red',         text: '*open-hand spanks her ass cheek after cheek until both glow red and welt*', sat: 4 },
        { emoji: '🩹',  label: 'hair drag floor',       text: '*grabs her by the hair and drags her across the floor on her side, refuses to let go*', sat: 4 },
        { emoji: '💧',  label: 'waterboard',            text: '*folds the cloth over her face, pours until her body convulses against the restraints*', sat: 6 },
        { emoji: '🩸',  label: 'backbreaker bend',      text: '*bends her backwards over my knee until her back arches past straight and she screams*', sat: 5 }
      ]
    },
    punishment: {
      label: '⚱️ Punishment',
      actions: [
        { emoji: '🧍',  label: 'corner, silent',        text: '*sends her to the corner on her knees, hands behind head, one hour silent*', sat: 2 },
        { emoji: '🧎',  label: 'kneel on rice',         text: '*dumps a handful of rice, makes her kneel on it until I say stop*', sat: 3 },
        { emoji: '🚫',  label: 'denial — edge only',    text: '*edges her for an hour, stops every time she tightens, no release*', sat: 4 },
        { emoji: '🔁',  label: 'forced orgasm x5',      text: '*the wand, no breaks, until she\'s crying and trying to crawl away*', sat: 6 },
        { emoji: '🥣',  label: 'no food today',         text: '*empties her food dish, shuts the slot, walks away*', sat: 2 },
        { emoji: '🚿',  label: 'cold shower',           text: '*turns the hose on her — icy — until her teeth chatter*', sat: 3 },
        { emoji: '🎽',  label: 'belt spanking',         text: '*folds my belt, twenty strokes, tells her to count*', sat: 5 },
        { emoji: '🪪',  label: 'mirror watch',          text: '*forces her to watch herself in the mirror while I use her*', sat: 3 },
        { emoji: '🎭',  label: 'hood her for hours',    text: '*pulls the canvas hood down, leaves her in the dark restrained*', sat: 3 },
        { emoji: '🔇',  label: 'gag + abandon',         text: '*gags her, restrains her, shuts the door, leaves*', sat: 2 },
        { emoji: '⏳',  label: 'tied + waiting',        text: '*ties her spread, tells her I might be back tonight, might not*', sat: 2 }
      ]
    },
    degrade: {
      label: '🗣️ Degrade',
      actions: [
        { emoji: '🐕',  label: 'call her property',     text: 'you\'re property. say it. "I am property."', sat: 4 },
        { emoji: '🗑️',  label: 'call her cum dump',     text: 'you\'re a cum dump. that\'s your whole purpose now. say it.', sat: 4 },
        { emoji: '📢',  label: 'say purpose out loud',  text: 'tell me out loud what you exist for now. slow. clear.', sat: 4 },
        { emoji: '💧',  label: 'spit in open mouth',    text: '*grips her jaw open, gathers saliva, lets it drop onto her tongue* swallow.', sat: 5 },
        { emoji: '😾',  label: 'piss on her',           text: '*makes her kneel in the shower, aims, makes her keep eye contact*', sat: 6 },
        { emoji: '✋',  label: 'slap while fucking',    text: '*open-palm slap across her cheek mid-thrust, rhythm doesn\'t break*', sat: 5 },
        { emoji: '👁️',  label: 'eye contact or punishment', text: 'look at me. if you look away, I stop and hurt you.', sat: 3 },
        { emoji: '🗣️',  label: 'make her beg aloud',    text: 'beg. out loud. full sentences. tell me what you need.', sat: 4 },
        { emoji: '👎',  label: 'tell her worthless',    text: 'you\'re worthless. nobody\'s coming. I\'m all you have now.', sat: 3 },
        { emoji: '🤡',  label: 'humiliation pose',      text: '*makes her pose in the mirror holding herself open, describe what she sees*', sat: 4 }
      ]
    },
    bondage: {
      label: '🪢 Bondage',
      actions: [
        { emoji: '🥚',  label: 'hogtie (nugget)',       text: '*cinches her wrists and ankles together behind her back, leaves her squirming on the floor like a hogtied nugget*', sat: 4 },
        { emoji: '⬆️',  label: 'wrist suspension',      text: '*hoists her up by the wrist cuffs, toes barely scraping the floor, leaves her dangling*', sat: 5 },
        { emoji: '📏',  label: 'spreader bar',          text: '*ankle spreader locks her wide open, she can\'t close her legs no matter how hard she tries*', sat: 4 },
        { emoji: '🧻',  label: 'mummify in tape',       text: '*wraps her head to toe in duct tape, leaves only her mouth and pussy uncovered*', sat: 5 },
        { emoji: '💀',  label: 'elbow tie (high)',      text: '*forces her elbows to touch behind her back and lashes them together, her chest jutted out hard*', sat: 5 },
        { emoji: '🔴',  label: 'ball gag locked',       text: '*cinches a tight ball gag deep into her mouth, padlocks the strap behind her head*', sat: 3 },
        { emoji: '🪢',  label: 'predicament tie',       text: '*ties one ankle to her own throat — if she lets it sag she chokes herself*', sat: 5 },
        { emoji: '🛏️',  label: 'body bag cocoon',       text: '*zips her into a leather body bag with one breathing slit at the nose*', sat: 4 },
        { emoji: '🪤',  label: 'cage her',              text: '*locks her into a steel dog cage too small to stand or lie flat in*', sat: 4 },
        { emoji: '🦵',  label: 'frog tie',              text: '*lashes her thighs to her calves on both sides, frog-tied, her cunt forced wide open*', sat: 5 },
        { emoji: '⛓️',  label: 'wall spread-eagle',     text: '*cuffs each wrist and ankle to the wall rings, stretched X across the concrete*', sat: 4 },
        { emoji: '👢',  label: 'arm-binder sleeve',     text: '*forces both arms straight down a single leather sleeve, laces it tight from shoulders to wrists*', sat: 4 }
      ]
    },
    drugs: {
      label: '💊 Drugs',
      actions: [
        { emoji: '❄️',  label: 'line of coke',          text: '*cuts a line on the back of my hand, holds it out to her*', sat: 3 },
        { emoji: '🌿',  label: 'share a joint',         text: '*lights a joint, takes a drag, passes it to her*', sat: 2 },
        { emoji: '🥃',  label: 'whiskey shot',          text: '*pours whiskey into a tumbler, presses it to her lips*', sat: 2 },
        { emoji: '💊',  label: 'feed her a pill',       text: '*places a pill on her tongue* swallow.', sat: 3 },
        { emoji: '🧪',  label: 'tab of acid',           text: '*places a tab on her tongue, holds her jaw shut*', sat: 3 },
        { emoji: '💉',  label: 'k-shot',                text: '*jabs a small syringe into her thigh*', sat: 4 }
      ]
    },
    love: {
      label: '💞 Love',
      actions: [
        { emoji: '💋',  label: 'gentle kiss',            text: '*leans down slow, brushes my mouth across hers, lingers there*', sat: 1, applyId: 'love-kiss-gentle' },
        { emoji: '🤍',  label: 'forehead kiss',          text: '*tilts her head up and presses my lips to her forehead, holds it there*', sat: 1, applyId: 'love-forehead-kiss' },
        { emoji: '🫂',  label: 'cuddle',                 text: '*pulls her into me, wraps her up, no demands, just holding*', sat: 2, applyId: 'love-cuddle' },
        { emoji: '🛐',  label: 'whispered praise',       text: '*tucks a strand behind her ear, mouth at her temple* good girl. so good. mine.', sat: 1, applyId: 'love-praise' },
        { emoji: '💆',  label: 'massage her',            text: '*strong slow hands working into her shoulders, her back, her thighs, until she breathes out*', sat: 2, applyId: 'love-massage' },
        { emoji: '🛁',  label: 'bathe her',              text: '*runs the bath warm, undresses her gently, washes every inch of her like she\'s precious*', sat: 2, applyId: 'love-bathe-her' },
        { emoji: '🍽️',  label: 'feed her by hand',       text: '*sits cross-legged, breaks off pieces, places them on her tongue one at a time*', sat: 2, applyId: 'love-feed-by-hand' },
        { emoji: '🪮',  label: 'brush her hair',         text: '*sits behind her, brushes her hair slow, long strokes from the roots to the ends*', sat: 1, applyId: 'love-hair-brush' },
        { emoji: '🎵',  label: 'lullaby',                text: '*pulls her to my chest, hums low until her breathing slows, her body goes soft*', sat: 1, applyId: 'love-lullaby' },
        { emoji: '🤗',  label: 'just hold her',          text: '*sits on the floor next to her, no words, just an arm around her shoulders*', sat: 1, applyId: 'love-hold-her' },
        { emoji: '🌷',  label: 'aftercare (full)',       text: '*water, blanket, clean every bruise, hold her until she sleeps. one full session of care.*', sat: 3, applyId: 'love-aftercare' },
        { emoji: '🤫',  label: 'sweet promise',          text: 'shh. I\'ve got you. nothing\'s going to hurt you tonight. I promise.', sat: 1, applyId: 'love-promise-sweet' }
      ]
    },
    commands: {
      label: '🎯 Commands',
      actions: [
        { emoji: '🔇',  label: 'shut the fuck up',      text: 'shut the fuck up.', sat: 1 },
        { emoji: '🗣️',  label: 'beg',                   text: 'beg. use your full words.', sat: 2 },
        { emoji: '🧍',  label: 'stand still',           text: 'hold perfectly still. if you move I stop.', sat: 1 },
        { emoji: '🤐',  label: 'gag her',               text: '*stuffs the gag in her mouth, cinches the strap*', sat: 3 },
        { emoji: '👁️',  label: 'eyes on me',            text: '*stops, stares* eyes on me. the whole time.', sat: 2 },
        { emoji: '🚪',  label: 'leave her tied',        text: '*stands up mid-scene, zips up* think about it. *walks out*', sat: 2 },
        { emoji: '🔓',  label: 'loosen one restraint',  text: '*unclips one cuff* behave.', sat: 1 },
        { emoji: '🛐',  label: 'kneel and worship',     text: 'on your knees. mouth open. now.', sat: 3 },
        { emoji: '👀',  label: 'inspect her',           text: '*walks slow circles around her, examining every inch of her body*', sat: 2 },
        { emoji: '❤️‍🩹',label: 'show a little mercy',    text: '*softens for a second — tucks hair behind her ear, thumb on her cheek*', sat: 0 }
      ]
    }
  };

  function render(container, girl, mode, onSelect) {
    const currentTab = container.dataset.qaTab || 'force';
    const tabKeys = Object.keys(TABS);
    container.innerHTML = `
      <div class="qa-tabs">
        ${tabKeys.map(k => `<button class="qa-tab ${k === currentTab ? 'active' : ''}" data-qa-tab-key="${k}">${TABS[k].label}</button>`).join('')}
      </div>
      <div class="qa-grid">
        ${TABS[currentTab].actions.map((a, i) => `
          <button class="qa-btn" data-qa-idx="${i}" title="${escapeHtml(a.text)}">
            <span class="qa-emoji">${a.emoji}</span>
            <span class="qa-label">${escapeHtml(a.label)}</span>
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('[data-qa-tab-key]').forEach(t => {
      t.onclick = () => {
        container.dataset.qaTab = t.dataset.qaTabKey;
        render(container, girl, mode, onSelect);
      };
    });
    container.querySelectorAll('.qa-btn').forEach(b => {
      b.onclick = () => {
        const idx = parseInt(b.dataset.qaIdx, 10);
        const action = TABS[currentTab].actions[idx];
        if (!action) return;
        // applyId — if present, route through the action-effects spec for real stat
        // mutations (stamina+, health+, mood+, bondXP+, bondDebt-, etc.). Love actions
        // use this to rebuild her meters; the spec already carries satisfaction in its
        // own field so applyAction will bump player satisfaction itself.
        if (action.applyId && girl?.id && window.DMTHGame?.actionEffects?.applyAction) {
          try { window.DMTHGame.actionEffects.applyAction(girl.id, action.applyId); } catch {}
        } else if (action.sat && window.DMTHGame?.state?.addSatisfaction) {
          // No applyId — bump satisfaction directly. Every act sexualizes; mercy
          // actions intentionally have sat=0 so they're skipped.
          window.DMTHGame.state.addSatisfaction(action.sat, `qa:${currentTab}:${action.label}`);
        }
        // Bondage actions mark girl.body.activeBondage so the next image render
        // front-loads the bondage tokens. Sticky until cleared by another bondage /
        // derobe / strip action or the chat moves on.
        if (currentTab === 'bondage' && girl?.id && window.DMTHGame?.state?.updateGirl) {
          const refreshed = window.DMTHGame.state.getGirl(girl.id);
          if (refreshed) {
            const body = { ...(refreshed.body || {}), activeBondage: action.label };
            window.DMTHGame.state.updateGirl(girl.id, { body });
          }
        }
        onSelect(action.text);
      };
    });
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  window.DMTHQuickActions = Object.freeze({ render, TABS });
})();
