/* ============================================
   whackamole.js — Click targets as they appear
   ============================================ */
const WhackAMoleGame = (() => {
    let score, timeLeft, timer, moleTimer, active, _ended;

    function init(container) {
        score = 0; timeLeft = 30; active = -1; _ended = false;
        SoundFX.play('gameStart');
        render(container);
        startGame(container);
    }

    function render(container) {
        container.innerHTML = `
      <div style="display:flex;gap:24px;justify-content:center;margin-bottom:24px">
        <div class="score-item"><div class="label">Score</div><div class="value" id="wam-score">0</div></div>
        <div class="score-item"><div class="label">Time</div><div class="value" id="wam-time">30</div></div>
      </div>
      <div id="wam-grid" style="display:grid;grid-template-columns:repeat(3,90px);gap:10px;justify-content:center">
        ${Array(9).fill(0).map((_, i) => `
          <div class="wam-hole" data-idx="${i}" style="width:90px;height:90px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:2.2rem;cursor:pointer;transition:all .15s ease;user-select:none">
          </div>`).join('')}
      </div>`;
        container.querySelectorAll('.wam-hole').forEach(hole => {
            hole.addEventListener('click', () => whack(hole, container));
        });
    }

    function startGame(container) {
        timer = setInterval(() => {
            timeLeft--;
            const el = document.getElementById('wam-time');
            if (el) el.textContent = timeLeft;
            if (timeLeft <= 0) endGame(container);
        }, 1000);
        showMole(container);
    }

    function showMole(container) {
        const holes = container.querySelectorAll('.wam-hole');
        if (!holes.length) return;
        holes.forEach(h => { h.textContent = ''; h.style.background = 'var(--bg-glass)'; h.style.borderColor = 'var(--border-glass)'; });
        active = Math.floor(Math.random() * 9);
        const hole = holes[active];
        if (hole) {
            hole.textContent = '🎯';
            hole.style.background = 'rgba(0,240,255,.08)';
            hole.style.borderColor = 'var(--neon-cyan)';
            hole.style.transform = 'scale(1.1)';
            setTimeout(() => { hole.style.transform = 'scale(1)'; }, 100);
        }
        const speed = Math.max(500, 1200 - score * 15);
        moleTimer = setTimeout(() => showMole(container), speed);
    }

    function whack(hole, container) {
        const idx = parseInt(hole.dataset.idx);
        if (idx === active) {
            score++;
            const el = document.getElementById('wam-score');
            if (el) el.textContent = score;
            hole.textContent = '💥';
            hole.style.background = 'rgba(0,255,136,.1)';
            hole.style.borderColor = 'var(--neon-green)';
            active = -1;
            SoundFX.play('correct');
            clearTimeout(moleTimer);
            setTimeout(() => showMole(container), 300);
        }
    }

    function endGame(container) {
        if (_ended) return;
        _ended = true;
        clearInterval(timer);
        clearTimeout(moleTimer);
        const won = score >= 15;
        Auth.recordGame('whackamole', score * 5, won);
        Auth.updateSkills(GAME_SKILL_MAP.whackamole || {});
        Analytics.recordSession('whackamole', score * 5, ['reaction', 'focus', 'observation'], 0);
        const p = Auth.getPlayer();
        if (p && (score * 5) > (p.whackamoleBest || 0)) {
            p.whackamoleBest = score * 5;
            Auth.savePlayer(p);
        }
        if (won) { GameUtils.confetti(); SoundFX.play('win'); }
        const daily = DailyChallenge.getToday();
        if (daily.id === 'whackamole' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
      <h3>${won ? '🎯 Sharpshooter!' : '🎯 Time\'s Up!'}</h3>
      <div class="final-score">Targets Hit: ${score} • Score: ${score * 5}</div>
      <div style="display:flex;gap:12px">
        <button class="btn-game btn-restart" onclick="WhackAMoleGame.init(document.querySelector('.game-area'))">Play Again</button>
        <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
      </div>`;
        const area = document.querySelector('.game-area');
        if (area) { area.style.position = 'relative'; area.appendChild(overlay); }
    }

    function cleanup() {
        clearInterval(timer);
        clearTimeout(moleTimer);
        _ended = true;
    }

    return { init, cleanup };
})();
