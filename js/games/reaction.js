/* ============================================
   reaction.js — Reaction Time game
   ============================================ */
const ReactionGame = (() => {
  let state, timeout, startTime, times, _ended;

  function init(container) {
    state = 'idle';
    times = [];
    _ended = false;
    SoundFX.play('gameStart');
    render(container);
  }

  function render(container) {
    const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : '—';
    const best = times.length > 0 ? Math.min(...times) : '—';
    container.innerHTML = `
      <div style="margin-bottom:20px;color:var(--text-secondary);">
        Average: <span style="color:var(--neon-cyan);font-weight:700;">${avg}${typeof avg === 'number' ? 'ms' : ''}</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Best: <span style="color:var(--neon-green);font-weight:700;">${best}${typeof best === 'number' ? 'ms' : ''}</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Attempts: <span style="font-weight:700;">${times.length}/5</span>
      </div>
      <div class="reaction-box ${state}" id="reaction-box">
        ${state === 'idle' ? 'Click to Start' :
        state === 'waiting' ? 'Wait for green...' :
          state === 'ready' ? 'CLICK NOW!' :
            state === 'early' ? 'Too early! Click to retry' : 'Click to Start'}
      </div>
      <div class="reaction-times" id="reaction-times">
        ${times.map((t, i) => `<span class="reaction-time-badge">#${i + 1}: ${t}ms</span>`).join('')}
      </div>
    `;
    document.getElementById('reaction-box').addEventListener('click', handleClick.bind(null, container));
  }

  function handleClick(container) {
    if (state === 'idle' || state === 'early') {
      state = 'waiting';
      render(container);
      const delay = 1000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        state = 'ready';
        startTime = Date.now();
        render(container);
      }, delay);
    } else if (state === 'waiting') {
      clearTimeout(timeout);
      state = 'early';
      SoundFX.play('wrong');
      render(container);
    } else if (state === 'ready') {
      const reaction = Date.now() - startTime;
      times.push(reaction);
      state = 'idle';
      SoundFX.play('correct');

      if (times.length >= 5) {
        finishGame(container);
      } else {
        render(container);
      }
    }
  }

  function finishGame(container) {
    if (_ended) return;
    _ended = true;
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const best = Math.min(...times);
    const score = Math.max(500 - avg, 10);
    const won = avg < 400;
    Auth.recordGame('reaction', score, won);
    Auth.updateSkills(GAME_SKILL_MAP.reaction || {});
    Analytics.recordSession('reaction', score, ['reaction', 'focus'], 0);
    const p = Auth.getPlayer();
    if (p && (p.reactionBest === 0 || best < (p.reactionBest || Infinity))) {
      p.reactionBest = best;
      Auth.savePlayer(p);
    }
    const daily = DailyChallenge.getToday();
    if (daily.id === 'reaction' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();
    if (won) { GameUtils.confetti(); SoundFX.play('win'); }

    container.innerHTML = `
      <div class="game-over-overlay" style="position:relative;">
        <h3>${won ? '⚡ Lightning Fast!' : '⚡ Results'}</h3>
        <div class="final-score">Average: ${avg}ms • Best: ${best}ms</div>
        <div class="reaction-times" style="margin-bottom:20px;">
          ${times.map((t, i) => `<span class="reaction-time-badge">#${i + 1}: ${t}ms</span>`).join('')}
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn-game btn-restart" onclick="ReactionGame.init(document.querySelector('.game-area'))">Play Again</button>
          <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
        </div>
      </div>
    `;
  }

  return { init, cleanup: () => { clearTimeout(timeout); } };
})();
