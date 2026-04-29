/* ============================================
   memory.js — Memory Card Match game
   ============================================ */
const MemoryGame = (() => {
    const EMOJIS = ['🎮', '🎲', '🎯', '🏆', '⚡', '🔥', '💎', '🚀'];
    let cards, flipped, matched, moves, lockBoard, _ended;

    function init(container) {
        const pairs = [...EMOJIS, ...EMOJIS];
        cards = shuffle(pairs);
        flipped = [];
        matched = 0;
        moves = 0;
        lockBoard = false;
        _ended = false;
        SoundFX.play('gameStart');
        render(container);
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function render(container) {
        container.innerHTML = `
      <div style="margin-bottom:16px;color:var(--text-secondary);">
        Moves: <span id="memory-moves" style="color:var(--neon-cyan);font-weight:700;">${moves}</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Matched: <span id="memory-matched" style="color:var(--neon-green);font-weight:700;">${matched}/${EMOJIS.length}</span>
      </div>
      <div class="memory-grid" id="memory-grid">
        ${cards.map((emoji, i) => `<div class="memory-card" data-idx="${i}" data-emoji="${emoji}">❓</div>`).join('')}
      </div>
    `;
        container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => flipCard(card, container));
        });
    }

    function flipCard(card, container) {
        if (lockBoard) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.emoji;
        flipped.push(card);
        SoundFX.play('click');

        if (flipped.length === 2) {
            moves++;
            document.getElementById('memory-moves').textContent = moves;
            lockBoard = true;

            const [a, b] = flipped;
            if (a.dataset.emoji === b.dataset.emoji) {
                a.classList.add('matched');
                b.classList.add('matched');
                matched++;
                document.getElementById('memory-matched').textContent = `${matched}/${EMOJIS.length}`;
                flipped = [];
                lockBoard = false;
                SoundFX.play('correct');

                if (matched === EMOJIS.length) {
                    setTimeout(() => gameOver(container), 600);
                }
            } else {
                SoundFX.play('wrong');
                setTimeout(() => {
                    a.classList.remove('flipped');
                    b.classList.remove('flipped');
                    a.textContent = '❓';
                    b.textContent = '❓';
                    flipped = [];
                    lockBoard = false;
                }, 800);
            }
        }
    }

    function gameOver(container) {
        if (_ended) return;
        _ended = true;
        const score = Math.max(100 - moves * 2, 10);
        Auth.recordGame('memory', score, true);
        Auth.updateSkills(GAME_SKILL_MAP.memory || {});
        Analytics.recordSession('memory', score, ['memory', 'observation', 'visual'], 0);
        const p = Auth.getPlayer();
        if (p) {
            p.memoryWins = (p.memoryWins || 0) + 1;
            Auth.savePlayer(p);
        }
        Achievements.checkAndNotify();
        const daily = DailyChallenge.getToday();
        if (daily.id === 'memory' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();
        GameUtils.confetti();
        SoundFX.play('win');
        container.innerHTML = `
      <div class="game-over-overlay" style="position:relative;">
        <h3>🎉 All Matched!</h3>
        <div class="final-score">Completed in ${moves} moves • Score: ${score}</div>
        <div style="display:flex;gap:12px;">
          <button class="btn-game btn-restart" onclick="MemoryGame.init(document.querySelector('.game-area'))">Play Again</button>
          <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
        </div>
      </div>
    `;
    }

    return { init };
})();
