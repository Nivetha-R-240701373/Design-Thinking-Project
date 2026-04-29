/* ============================================
   colormatch.js — Match color name to display
   ============================================ */
const ColorMatchGame = (() => {
    const COLORS = [
        { name: 'Red', hex: '#ff4444' },
        { name: 'Blue', hex: '#4488ff' },
        { name: 'Green', hex: '#44dd44' },
        { name: 'Yellow', hex: '#ffdd44' },
        { name: 'Purple', hex: '#bb44ff' },
        { name: 'Orange', hex: '#ff8844' },
        { name: 'Pink', hex: '#ff66aa' },
        { name: 'Cyan', hex: '#44ddff' },
    ];
    let score, round, maxRounds, _ended;

    function init(container) {
        score = 0; round = 0; maxRounds = 15; _ended = false;
        SoundFX.play('gameStart');
        startRound(container);
    }

    function startRound(container) {
        if (round >= maxRounds) return endGame(container);
        round++;
        const word = COLORS[Math.floor(Math.random() * COLORS.length)];
        const display = COLORS[Math.floor(Math.random() * COLORS.length)];
        const isMatch = Math.random() > 0.5;
        const shownColor = isMatch ? word.hex : display.hex;

        container.innerHTML = `
      <div style="margin-bottom:12px;color:var(--text-muted);font-size:.8rem">Round ${round}/${maxRounds}</div>
      <div style="font-size:.95rem;color:var(--text-secondary);margin-bottom:20px">Does the <b>word</b> match the <b>color</b> shown?</div>
      <div style="font-size:3.5rem;font-weight:900;color:${shownColor};margin-bottom:32px;font-family:var(--font-display);text-shadow:0 0 20px ${shownColor}">${word.name}</div>
      <div style="display:flex;gap:16px;justify-content:center">
        <button class="quiz-option" style="padding:16px 40px;font-size:1rem" data-ans="yes">✅ Match</button>
        <button class="quiz-option" style="padding:16px 40px;font-size:1rem" data-ans="no">❌ No Match</button>
      </div>
      <div style="margin-top:20px;color:var(--neon-cyan);font-weight:700;font-family:var(--font-display)">Score: ${score}</div>
    `;
        const actualMatch = shownColor === word.hex ? 'yes' : 'no';

        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.ans === actualMatch) {
                    score += 10;
                    btn.classList.add('correct');
                    SoundFX.play('correct');
                } else {
                    btn.classList.add('wrong');
                    SoundFX.play('wrong');
                }
                container.querySelectorAll('.quiz-option').forEach(b => b.style.pointerEvents = 'none');
                setTimeout(() => startRound(container), 700);
            });
        });
    }

    function endGame(container) {
        if (_ended) return;
        _ended = true;
        const won = score >= 80;
        Auth.recordGame('colormatch', score, won);
        Auth.updateSkills(GAME_SKILL_MAP.colormatch || {});
        Analytics.recordSession('colormatch', score, ['observation', 'focus', 'visual'], 0);
        const p = Auth.getPlayer();
        if (p && score > (p.colormatchBest || 0)) {
            p.colormatchBest = score;
            Auth.savePlayer(p);
        }
        if (won) { GameUtils.confetti(); SoundFX.play('win'); }
        const daily = DailyChallenge.getToday();
        if (daily.id === 'colormatch' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();
        container.innerHTML = `
      <div class="game-over-overlay" style="position:relative">
        <h3>${won ? '🎨 Color Master!' : '🎨 Game Over'}</h3>
        <div class="final-score">Score: ${score} / ${maxRounds * 10}</div>
        <div style="display:flex;gap:12px">
          <button class="btn-game btn-restart" onclick="ColorMatchGame.init(document.querySelector('.game-area'))">Play Again</button>
          <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
        </div>
      </div>`;
    }

    return { init };
})();
