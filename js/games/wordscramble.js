/* ============================================
   wordscramble.js — Unscramble the word
   ============================================ */
const WordScrambleGame = (() => {
    const WORDS = ['GALAXY', 'ROCKET', 'PLANET', 'CODING', 'PYTHON', 'GAMING', 'PUZZLE', 'DRAGON', 'CASTLE', 'KNIGHT',
        'SHIELD', 'PORTAL', 'MATRIX', 'CIPHER', 'BINARY', 'PIXEL', 'VECTOR', 'TURBO', 'ARCADE', 'LASER'];
    let score, round, maxRounds, currentWord, _ended;

    function init(container) {
        score = 0; round = 0; maxRounds = 10; _ended = false;
        SoundFX.play('gameStart');
        nextWord(container);
    }

    function scramble(word) {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const s = arr.join('');
        return s === word ? scramble(word) : s;
    }

    function nextWord(container) {
        if (round >= maxRounds) return endGame(container);
        round++;
        currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        const scrambled = scramble(currentWord);
        container.innerHTML = `
      <div style="margin-bottom:8px;color:var(--text-muted);font-size:.8rem">Word ${round}/${maxRounds}</div>
      <div style="font-size:.95rem;color:var(--text-secondary);margin-bottom:24px">Unscramble this word!</div>
      <div style="font-family:var(--font-display);font-size:2.5rem;letter-spacing:12px;color:var(--neon-pink);margin-bottom:32px;text-shadow:0 0 20px rgba(255,0,170,.4)">${scrambled}</div>
      <input type="text" id="ws-input" class="login-input" style="max-width:300px;text-align:center;text-transform:uppercase;letter-spacing:4px;font-family:var(--font-display)" placeholder="Your answer..." maxlength="10" autocomplete="off">
      <div style="margin-top:16px">
        <button class="btn-game btn-restart" id="ws-submit" style="padding:12px 36px">Submit</button>
        <button class="btn-game btn-back" id="ws-skip" style="padding:12px 36px;margin-left:8px">Skip</button>
      </div>
      <div style="margin-top:20px;color:var(--neon-cyan);font-weight:700;font-family:var(--font-display)">Score: ${score}</div>
      <div id="ws-feedback" style="margin-top:12px;min-height:24px;font-weight:700"></div>
    `;
        const input = document.getElementById('ws-input');
        input.focus();
        input.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(container); });
        document.getElementById('ws-submit').addEventListener('click', () => checkAnswer(container));
        document.getElementById('ws-skip').addEventListener('click', () => {
            document.getElementById('ws-feedback').innerHTML = `<span style="color:var(--neon-orange)">Answer: ${currentWord}</span>`;
            setTimeout(() => nextWord(container), 1000);
        });
    }

    function checkAnswer(container) {
        const input = document.getElementById('ws-input');
        const guess = input.value.trim().toUpperCase();
        const fb = document.getElementById('ws-feedback');
        if (!guess) return;
        if (guess === currentWord) {
            score += 10;
            fb.innerHTML = '<span style="color:var(--neon-green)">✅ Correct!</span>';
            SoundFX.play('correct');
            setTimeout(() => nextWord(container), 800);
        } else {
            fb.innerHTML = '<span style="color:var(--neon-pink)">❌ Try again!</span>';
            SoundFX.play('wrong');
            input.value = '';
            input.focus();
        }
    }

    function endGame(container) {
        if (_ended) return;
        _ended = true;
        const won = score >= 60;
        Auth.recordGame('wordscramble', score, won);
        Auth.updateSkills(GAME_SKILL_MAP.wordscramble || {});
        Analytics.recordSession('wordscramble', score, ['memory', 'creativity', 'analysis'], 0);
        const p = Auth.getPlayer();
        if (p && score > (p.wordscrambleBest || 0)) {
            p.wordscrambleBest = score;
            Auth.savePlayer(p);
        }
        if (won) { GameUtils.confetti(); SoundFX.play('win'); }
        const daily = DailyChallenge.getToday();
        if (daily.id === 'wordscramble' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();
        container.innerHTML = `
      <div class="game-over-overlay" style="position:relative">
        <h3>${won ? '📝 Word Wizard!' : '📝 Game Over'}</h3>
        <div class="final-score">Score: ${score}/${maxRounds * 10}</div>
        <div style="display:flex;gap:12px">
          <button class="btn-game btn-restart" onclick="WordScrambleGame.init(document.querySelector('.game-area'))">Play Again</button>
          <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
        </div>
      </div>`;
    }

    return { init };
})();
