/* ============================================
   quiz.js — Quiz Challenge game
   ============================================ */
const QuizGame = (() => {
    const QUESTIONS = [
        { q: 'What is the largest planet in our solar system?', options: ['Earth', 'Jupiter', 'Saturn', 'Mars'], answer: 1 },
        { q: 'Which language runs in a web browser?', options: ['Java', 'C', 'Python', 'JavaScript'], answer: 3 },
        { q: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], answer: 0 },
        { q: 'What year was JavaScript created?', options: ['1990', '1995', '2000', '2005'], answer: 1 },
        { q: 'What is 15 × 4?', options: ['45', '50', '60', '75'], answer: 2 },
        { q: 'Which element has the chemical symbol "O"?', options: ['Gold', 'Iron', 'Oxygen', 'Silver'], answer: 2 },
        { q: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 },
        { q: 'What is the speed of light?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], answer: 0 },
        { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1 },
        { q: 'What is the boiling point of water?', options: ['90°C', '95°C', '100°C', '110°C'], answer: 2 },
    ];

    let current = 0, score = 0, answered = false, _ended = false;

    function init(container) {
        current = 0; score = 0; _ended = false;
        SoundFX.play('gameStart');
        render(container);
    }

    function render(container) {
        if (current >= QUESTIONS.length) {
            showResult(container);
            return;
        }
        const q = QUESTIONS[current];
        const progress = ((current) / QUESTIONS.length) * 100;
        container.innerHTML = `
      <div class="quiz-progress">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:0.8rem;color:var(--text-muted);">Question ${current + 1}/${QUESTIONS.length}</span>
          <span style="font-size:0.8rem;color:var(--neon-cyan);font-weight:700;">Score: ${score}</span>
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
      </div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-option" data-idx="${i}">${opt}</button>`).join('')}
      </div>
    `;
        answered = false;
        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn, container));
        });
    }

    function handleAnswer(btn, container) {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.idx);
        const q = QUESTIONS[current];
        const buttons = container.querySelectorAll('.quiz-option');
        buttons.forEach(b => {
            const bidx = parseInt(b.dataset.idx);
            if (bidx === q.answer) b.classList.add('correct');
            if (bidx === idx && idx !== q.answer) b.classList.add('wrong');
            b.style.pointerEvents = 'none';
        });
        if (idx === q.answer) { score += 10; SoundFX.play('correct'); }
        else SoundFX.play('wrong');
        setTimeout(() => { current++; render(container); }, 1200);
    }

    function showResult(container) {
        if (_ended) return;
        _ended = true;
        const won = score >= 50;
        Auth.recordGame('quiz', score, won);
        Auth.updateSkills(GAME_SKILL_MAP.quiz || {});
        Analytics.recordSession('quiz', score, ['logic', 'analysis', 'memory'], 0);
        const p = Auth.getPlayer();
        if (p && score > (p.quizBest || 0)) {
            p.quizBest = score;
            Auth.savePlayer(p);
        }
        const daily = DailyChallenge.getToday();
        if (daily.id === 'quiz' && !DailyChallenge.hasCompletedToday()) {
            DailyChallenge.markCompleted();
        }
        if (won) { GameUtils.confetti(); SoundFX.play('win'); }
        container.innerHTML = `
      <div class="game-over-overlay" style="position:relative;">
        <h3>${won ? '🎉 Excellent!' : '📝 Quiz Complete'}</h3>
        <div class="final-score">You scored ${score} / ${QUESTIONS.length * 10}</div>
        <div style="display:flex;gap:12px;">
          <button class="btn-game btn-restart" onclick="QuizGame.init(document.querySelector('.game-area'))">Play Again</button>
          <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
        </div>
      </div>
    `;
    }

    return { init };
})();
