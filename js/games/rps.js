/* ============================================
   rps.js — Rock Paper Scissors
   ============================================ */
const RPSGame = (() => {
    const CHOICES = ['🪨', '📄', '✂️'];
    const NAMES = ['Rock', 'Paper', 'Scissors'];
    let scores;

    function init(container) {
        scores = { player: 0, cpu: 0 };
        render(container, '', '', '');
    }

    function render(container, resultText, playerPick, cpuPick) {
        container.innerHTML = `
      <div style="font-size:1.1rem;font-weight:700;margin-bottom:8px;color:var(--text-secondary);">Choose your weapon!</div>
      <div class="rps-choices">
        ${CHOICES.map((c, i) => `<div class="rps-choice" data-idx="${i}" title="${NAMES[i]}">${c}</div>`).join('')}
      </div>
      <div class="rps-result" id="rps-result">
        ${resultText ? `<span style="font-size:2.5rem;">${playerPick}</span> <span class="vs">vs</span> <span style="font-size:2.5rem;">${cpuPick}</span>` : '<span style="color:var(--text-muted);">Pick to start!</span>'}
      </div>
      <div id="rps-msg" style="font-size:1rem;font-weight:700;min-height:24px;margin-bottom:16px;">${resultText}</div>
      <div style="display:flex;gap:24px;justify-content:center;color:var(--text-secondary);font-size:0.85rem;">
        <span>You: <b style="color:var(--neon-cyan);">${scores.player}</b></span>
        <span>CPU: <b style="color:var(--neon-pink);">${scores.cpu}</b></span>
      </div>
    `;
        container.querySelectorAll('.rps-choice').forEach(el => {
            el.addEventListener('click', () => play(parseInt(el.dataset.idx), container));
        });
    }

    function play(playerIdx, container) {
        const cpuIdx = Math.floor(Math.random() * 3);
        const playerPick = CHOICES[playerIdx];
        const cpuPick = CHOICES[cpuIdx];
        let result, won = false;
        if (playerIdx === cpuIdx) {
            result = "🤝 It's a Tie!";
        } else if ((playerIdx + 1) % 3 === cpuIdx) {
            result = '😢 You Lose!';
            scores.cpu++;
        } else {
            result = '🎉 You Win!';
            scores.player++;
            won = true;
            const p = Auth.getPlayer();
            if (p && scores.player > (p.rpsBest || 0)) { p.rpsBest = scores.player; Auth.savePlayer(p); }
            GameUtils.confetti();
        }
        // Record game once per round (not separately for win/lose)
        Auth.recordGame('rps', won ? 15 : 0, won);
        Auth.updateSkills(GAME_SKILL_MAP.rps || {});
        Analytics.recordSession('rps', won ? 15 : 0, ['logic', 'reaction'], 0);
        SoundFX.play(won ? 'win' : 'click');
        const daily = DailyChallenge.getToday();
        if (daily.id === 'rps' && !DailyChallenge.hasCompletedToday() && won) DailyChallenge.markCompleted();
        render(container, result, playerPick, cpuPick);
    }

    return { init };
})();
