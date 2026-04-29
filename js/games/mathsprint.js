/* ============================================
   mathsprint.js — Solve math problems fast
   ============================================ */
const MathSprintGame = (() => {
    let score, round, maxRounds, startTime, _ended;

    function init(container) {
        score = 0; round = 0; maxRounds = 12; _ended = false;
        startTime = Date.now();
        SoundFX.play('gameStart');
        nextProblem(container);
    }

    function genProblem() {
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b, answer;
        if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; answer = a + b; }
        else if (op === '-') { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * 20) + 1; answer = a - b; }
        else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; }
        const options = [answer];
        while (options.length < 4) {
            const fake = answer + (Math.floor(Math.random() * 11) - 5);
            if (fake !== answer && !options.includes(fake) && fake >= 0) options.push(fake);
        }
        options.sort(() => Math.random() - 0.5);
        return { text: `${a} ${op} ${b} = ?`, answer, options };
    }

    function nextProblem(container) {
        if (round >= maxRounds) return endGame(container);
        round++;
        const p = genProblem();
        const progress = ((round - 1) / maxRounds) * 100;
        container.innerHTML = `
      <div class="quiz-progress"><div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:.8rem;color:var(--text-muted)">Problem ${round}/${maxRounds}</span>
        <span style="font-size:.8rem;color:var(--neon-cyan);font-weight:700;font-family:var(--font-display)">Score: ${score}</span>
      </div><div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div></div>
      <div class="quiz-question" style="font-family:var(--font-display);font-size:2rem">${p.text}</div>
      <div class="quiz-options">
        ${p.options.map(o => `<button class="quiz-option" data-val="${o}">${o}</button>`).join('')}
      </div>`;
        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const v = parseInt(btn.dataset.val);
                container.querySelectorAll('.quiz-option').forEach(b => {
                    b.style.pointerEvents = 'none';
                    if (parseInt(b.dataset.val) === p.answer) b.classList.add('correct');
                });
                if (v === p.answer) { score += 10; SoundFX.play('correct'); }
                else { btn.classList.add('wrong'); SoundFX.play('wrong'); }
                setTimeout(() => nextProblem(container), 600);
            });
        });
    }

    function endGame(container) {
        if (_ended) return;
        _ended = true;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const won = score >= 80;
        Auth.recordGame('mathsprint', score, won);
        Auth.updateSkills(GAME_SKILL_MAP.mathsprint || {});
        Analytics.recordSession('mathsprint', score, ['logic', 'analysis', 'focus'], 0);
        const p = Auth.getPlayer();
        if (p && score > (p.mathsprintBest || 0)) {
            p.mathsprintBest = score;
            Auth.savePlayer(p);
        }
        if (won) { GameUtils.confetti(); SoundFX.play('win'); }
        const daily = DailyChallenge.getToday();
        if (daily.id === 'mathsprint' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();
        container.innerHTML = `
      <div class="game-over-overlay" style="position:relative">
        <h3>${won ? '🧮 Math Genius!' : '🧮 Time\'s Up!'}</h3>
        <div class="final-score">Score: ${score}/${maxRounds * 10} in ${elapsed}s</div>
        <div style="display:flex;gap:12px">
          <button class="btn-game btn-restart" onclick="MathSprintGame.init(document.querySelector('.game-area'))">Play Again</button>
          <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
        </div>
      </div>`;
    }

    return { init };
})();
