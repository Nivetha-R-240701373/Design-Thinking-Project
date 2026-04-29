/* ============================================
   quickboost.js — Quick Brain Boost Mode
   3-game speed training session
   ============================================ */
const QuickBoost = (() => {
  let currentRound = 0;
  let sessionGames = [];
  let totalScore = 0;
  let startTime = 0;

  const MINI_GAMES = [
    { id: 'qb-math', name: 'Speed Math', icon: '🧮', skill: 'logic' },
    { id: 'qb-memory', name: 'Quick Memory', icon: '🧠', skill: 'memory' },
    { id: 'qb-reaction', name: 'Fast Reflex', icon: '⚡', skill: 'reaction' },
    { id: 'qb-pattern', name: 'Pattern Snap', icon: '🔢', skill: 'analysis' },
    { id: 'qb-color', name: 'Color Flash', icon: '🎨', skill: 'observation' },
  ];

  function start() {
    currentRound = 0;
    totalScore = 0;
    startTime = Date.now();
    // Pick 3 random games
    const shuffled = [...MINI_GAMES].sort(() => Math.random() - 0.5);
    sessionGames = shuffled.slice(0, 3);
    renderRound();
  }

  function renderRound() {
    const main = document.getElementById('qb-area');
    if (!main) return;

    if (currentRound >= 3) {
      showSummary(main);
      return;
    }

    const game = sessionGames[currentRound];
    main.innerHTML = `
      <div class="qb-round-header">
        <div class="qb-round-label">Round ${currentRound + 1}/3</div>
        <div class="qb-round-name">${game.icon} ${game.name}</div>
        <div class="qb-dots">${[0,1,2].map(i => `<span class="qb-dot ${i < currentRound ? 'done' : ''} ${i === currentRound ? 'active' : ''}"></span>`).join('')}</div>
      </div>
      <div id="qb-game-content" class="qb-game-content"></div>
    `;

    const content = document.getElementById('qb-game-content');
    switch (game.id) {
      case 'qb-math': runMathGame(content); break;
      case 'qb-memory': runMemoryGame(content); break;
      case 'qb-reaction': runReactionGame(content); break;
      case 'qb-pattern': runPatternGame(content); break;
      case 'qb-color': runColorGame(content); break;
    }
  }

  /* --- Mini-game: Speed Math (5 questions) --- */
  function runMathGame(el) {
    let q = 0, correct = 0;
    function nextQ() {
      if (q >= 5) { finishRound(correct * 20); return; }
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let answer;
      if (op === '+') answer = a + b;
      else if (op === '-') answer = a - b;
      else answer = a * b;

      const opts = [answer];
      while (opts.length < 4) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (wrong !== answer && !opts.includes(wrong)) opts.push(wrong);
      }
      opts.sort(() => Math.random() - 0.5);

      el.innerHTML = `
        <div class="qb-question">${a} ${op} ${b} = ?</div>
        <div class="qb-opts">${opts.map(o => `<button class="qb-opt-btn" data-val="${o}">${o}</button>`).join('')}</div>
      `;
      el.querySelectorAll('.qb-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (parseInt(btn.dataset.val) === answer) { correct++; btn.classList.add('qb-correct'); }
          else btn.classList.add('qb-wrong');
          q++;
          setTimeout(nextQ, 400);
        });
      });
    }
    nextQ();
  }

  /* --- Mini-game: Quick Memory (remember 4 emojis) --- */
  function runMemoryGame(el) {
    const pool = ['🍎','🌟','🎈','🐱','🌈','🎵','🔥','💎','🌙','🍕','🎸','🌺'];
    const pick = [];
    while (pick.length < 4) {
      const e = pool[Math.floor(Math.random() * pool.length)];
      if (!pick.includes(e)) pick.push(e);
    }

    el.innerHTML = `<p class="qb-info">Memorize these!</p><div class="qb-emoji-row">${pick.map(e => `<span class="qb-emoji">${e}</span>`).join('')}</div>`;

    setTimeout(() => {
      const extra = pool.filter(e => !pick.includes(e)).slice(0, 4);
      const allOpts = [...pick, ...extra].sort(() => Math.random() - 0.5);
      const selected = new Set();

      el.innerHTML = `<p class="qb-info">Select the 4 you saw:</p>
        <div class="qb-emoji-grid">${allOpts.map(e => `<button class="qb-emoji-btn" data-e="${e}">${e}</button>`).join('')}</div>
        <button class="bt-submit-btn qb-submit" id="qb-mem-done" disabled>Done</button>`;

      el.querySelectorAll('.qb-emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const e = btn.dataset.e;
          if (selected.has(e)) { selected.delete(e); btn.classList.remove('bt-selected'); }
          else if (selected.size < 4) { selected.add(e); btn.classList.add('bt-selected'); }
          document.getElementById('qb-mem-done').disabled = selected.size !== 4;
        });
      });

      document.getElementById('qb-mem-done').addEventListener('click', () => {
        let c = 0;
        pick.forEach(e => { if (selected.has(e)) c++; });
        finishRound(c * 25);
      });
    }, 2500);
  }

  /* --- Mini-game: Fast Reflex (3 clicks) --- */
  function runReactionGame(el) {
    let clicks = 0, totalMs = 0;
    function nextClick() {
      if (clicks >= 3) { finishRound(Math.max(100 - Math.floor(totalMs / 3 / 5), 10)); return; }
      el.innerHTML = `<div class="qb-reaction-box qb-wait" id="qb-rbox">Wait...</div><p class="qb-info">Click ${clicks + 1}/3</p>`;
      const box = document.getElementById('qb-rbox');
      let st = 0, clicked = false;
      const delay = 1000 + Math.random() * 2000;
      const to = setTimeout(() => { box.className = 'qb-reaction-box qb-go'; box.textContent = 'NOW!'; st = performance.now(); }, delay);
      box.addEventListener('click', () => {
        if (clicked) return; clicked = true;
        if (!st) { clearTimeout(to); box.className = 'qb-reaction-box qb-early'; box.textContent = 'Too early!'; setTimeout(nextClick, 800); return; }
        const ms = Math.round(performance.now() - st);
        totalMs += ms;
        box.className = 'qb-reaction-box qb-done'; box.textContent = ms + 'ms';
        clicks++;
        setTimeout(nextClick, 600);
      });
    }
    nextClick();
  }

  /* --- Mini-game: Pattern Snap --- */
  function runPatternGame(el) {
    const patterns = [
      { seq: [2,4,6,8], ans: 10, opts: [9,10,11,12] },
      { seq: [3,6,9,12], ans: 15, opts: [14,15,16,18] },
      { seq: [1,4,9,16], ans: 25, opts: [20,25,30,36] },
      { seq: [5,10,20,40], ans: 80, opts: [60,70,80,100] },
    ];
    let q = 0, correct = 0;
    function nextQ() {
      if (q >= 3) { finishRound(correct * 33); return; }
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      el.innerHTML = `<div class="qb-question">${p.seq.join(', ')}, ?</div>
        <div class="qb-opts">${p.opts.map(o => `<button class="qb-opt-btn" data-val="${o}">${o}</button>`).join('')}</div>`;
      el.querySelectorAll('.qb-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (parseInt(btn.dataset.val) === p.ans) { correct++; btn.classList.add('qb-correct'); }
          else btn.classList.add('qb-wrong');
          q++;
          setTimeout(nextQ, 400);
        });
      });
    }
    nextQ();
  }

  /* --- Mini-game: Color Flash --- */
  function runColorGame(el) {
    const colors = ['red','blue','green','yellow','purple','orange'];
    const names = ['RED','BLUE','GREEN','YELLOW','PURPLE','ORANGE'];
    let q = 0, correct = 0;
    function nextQ() {
      if (q >= 5) { finishRound(correct * 20); return; }
      const wordIdx = Math.floor(Math.random() * names.length);
      const colorIdx = Math.random() > 0.5 ? wordIdx : Math.floor(Math.random() * colors.length);
      const match = wordIdx === colorIdx;

      el.innerHTML = `<p class="qb-info">Does the word match the color?</p>
        <div class="qb-color-word" style="color:${colors[colorIdx]}">${names[wordIdx]}</div>
        <div class="qb-opts"><button class="qb-opt-btn qb-match" data-val="yes">✓ Match</button><button class="qb-opt-btn qb-no-match" data-val="no">✗ No Match</button></div>`;
      el.querySelectorAll('.qb-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ans = btn.dataset.val === 'yes';
          if (ans === match) { correct++; btn.classList.add('qb-correct'); }
          else btn.classList.add('qb-wrong');
          q++;
          setTimeout(nextQ, 400);
        });
      });
    }
    nextQ();
  }

  /* --- Finish a round --- */
  function finishRound(score) {
    totalScore += score;
    const skill = sessionGames[currentRound].skill;
    Auth.updateSkills({ [skill]: Math.ceil(score / 20) });
    currentRound++;
    setTimeout(renderRound, 500);
  }

  /* --- Summary --- */
  function showSummary(el) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const skills = sessionGames.map(g => g.skill);
    Analytics.recordSession('quick-boost', totalScore, skills, elapsed * 1000);
    Auth.addXp(Math.round(totalScore / 2));
    Auth.addCoins(Math.round(totalScore / 10));
    GameUtils.confetti();

    el.innerHTML = `
      <div class="qb-summary">
        <div class="qb-summary-icon">🎉</div>
        <h2 class="qb-summary-title">Brain Boost Complete!</h2>
        <div class="qb-summary-score">${totalScore}<span style="font-size:.6em;color:var(--text-muted);"> pts</span></div>
        <div class="qb-summary-time">Completed in ${elapsed}s</div>
        <div class="qb-summary-skills">Skills trained: ${skills.map(s => `<span class="skill-tag skill-${s}">${s}</span>`).join(' ')}</div>
        <div class="qb-summary-rewards">
          <span>+${Math.round(totalScore / 2)} XP</span> • <span>+${Math.round(totalScore / 10)} 🪙</span>
        </div>
        <div class="qb-summary-actions">
          <button class="hero-btn" onclick="QuickBoost.start()" style="padding:12px 32px;font-size:.85rem;">⚡ Play Again</button>
          <button class="hero-btn" onclick="location.hash='#dashboard'" style="padding:12px 32px;font-size:.85rem;background:linear-gradient(135deg,var(--neon-purple),var(--neon-pink))">📊 Dashboard</button>
        </div>
      </div>
    `;
  }

  /* --- Render page --- */
  function renderPage() {
    return `<div class="page"><section class="section">
      <h2 class="section-title reveal">⚡ Quick Brain Boost</h2>
      <p class="section-subtitle reveal">3 rapid-fire mini-games to sharpen your mind</p>
      <div class="qb-container" id="qb-area"></div>
    </section></div>`;
  }

  return { start, renderPage };
})();
