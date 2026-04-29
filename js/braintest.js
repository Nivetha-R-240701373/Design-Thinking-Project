/* ============================================
   braintest.js — Brain Dominance Test
   5 mini-tasks: logic, memory, pattern, spatial, reaction
   ============================================ */
const BrainTest = (() => {
  let currentStep = 0;
  let scores = { left: 0, right: 0 };
  let testContainer = null;
  let onComplete = null;

  const STEPS = [
    { id: 'logic', title: 'Logic Puzzle', icon: '🧩', brain: 'left' },
    { id: 'memory', title: 'Memory Test', icon: '🧠', brain: 'right' },
    { id: 'pattern', title: 'Pattern Recognition', icon: '🔢', brain: 'left' },
    { id: 'spatial', title: 'Spatial Reasoning', icon: '📐', brain: 'right' },
    { id: 'reaction', title: 'Reaction Time', icon: '⚡', brain: 'both' }
  ];

  function start(container, callback) {
    testContainer = container;
    onComplete = callback;
    currentStep = 0;
    scores = { left: 0, right: 0 };
    renderStep();
  }

  function renderStep() {
    if (currentStep >= STEPS.length) {
      showResults();
      return;
    }
    const step = STEPS[currentStep];
    const progress = ((currentStep) / STEPS.length) * 100;

    testContainer.innerHTML = `
      <div class="bt-container">
        <div class="bt-progress-bar"><div class="bt-progress-fill" style="width:${progress}%"></div></div>
        <div class="bt-step-label">${step.icon} Test ${currentStep + 1} of ${STEPS.length}: ${step.title}</div>
        <div class="bt-area" id="bt-game-area"></div>
      </div>
    `;

    const area = document.getElementById('bt-game-area');
    switch (step.id) {
      case 'logic': renderLogicTest(area); break;
      case 'memory': renderMemoryTest(area); break;
      case 'pattern': renderPatternTest(area); break;
      case 'spatial': renderSpatialTest(area); break;
      case 'reaction': renderReactionTest(area); break;
    }
  }

  /* --- 1. Logic Puzzle --- */
  function renderLogicTest(area) {
    const puzzles = [
      { q: 'If all roses are flowers, and some flowers fade quickly, which statement is TRUE?', opts: ['All roses fade quickly', 'Some roses might fade quickly', 'No roses fade quickly', 'Flowers are not roses'], ans: 1 },
      { q: 'What comes next: 2, 6, 18, 54, ?', opts: ['108', '162', '72', '160'], ans: 1 },
      { q: 'A is taller than B. B is taller than C. Who is shortest?', opts: ['A', 'B', 'C', 'Cannot determine'], ans: 2 }
    ];
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    
    area.innerHTML = `
      <div class="bt-question">${puzzle.q}</div>
      <div class="bt-options">
        ${puzzle.opts.map((o, i) => `<button class="bt-option" data-idx="${i}">${o}</button>`).join('')}
      </div>
    `;

    area.querySelectorAll('.bt-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (idx === puzzle.ans) {
          scores.left += 20;
          btn.classList.add('bt-correct');
        } else {
          scores.left += 5;
          btn.classList.add('bt-wrong');
          area.querySelectorAll('.bt-option')[puzzle.ans].classList.add('bt-correct');
        }
        setTimeout(() => { currentStep++; renderStep(); }, 1000);
      });
    });
  }

  /* --- 2. Memory Test --- */
  function renderMemoryTest(area) {
    const emojis = ['🍎', '🌟', '🎈', '🐱', '🌈', '🎵', '🔥', '💎', '🌙'];
    const sequence = [];
    for (let i = 0; i < 5; i++) {
      sequence.push(emojis[Math.floor(Math.random() * emojis.length)]);
    }
    
    area.innerHTML = `
      <div class="bt-memory-phase">
        <p class="bt-info">Memorize these symbols:</p>
        <div class="bt-emoji-display">${sequence.map(e => `<span class="bt-emoji-item">${e}</span>`).join('')}</div>
        <div class="bt-countdown" id="bt-countdown">3</div>
      </div>
    `;

    let count = 3;
    const iv = setInterval(() => {
      count--;
      const el = document.getElementById('bt-countdown');
      if (el) el.textContent = count;
      if (count <= 0) {
        clearInterval(iv);
        showMemoryRecall(area, sequence);
      }
    }, 1000);
  }

  function showMemoryRecall(area, sequence) {
    const shuffled = [...new Set(sequence)];
    const emojis = ['🍎', '🌟', '🎈', '🐱', '🌈', '🎵', '🔥', '💎', '🌙'];
    const extra = emojis.filter(e => !shuffled.includes(e)).slice(0, 4);
    const allOpts = [...shuffled, ...extra].sort(() => Math.random() - 0.5);
    
    area.innerHTML = `
      <p class="bt-info">Which symbols were shown? Select ${shuffled.length}:</p>
      <div class="bt-emoji-grid">
        ${allOpts.map(e => `<button class="bt-emoji-btn" data-emoji="${e}">${e}</button>`).join('')}
      </div>
      <button class="bt-submit-btn" id="bt-mem-submit" disabled>Check Answers</button>
    `;

    const selected = new Set();
    area.querySelectorAll('.bt-emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        if (selected.has(emoji)) {
          selected.delete(emoji);
          btn.classList.remove('bt-selected');
        } else if (selected.size < shuffled.length) {
          selected.add(emoji);
          btn.classList.add('bt-selected');
        }
        const submitBtn = document.getElementById('bt-mem-submit');
        if (submitBtn) submitBtn.disabled = selected.size !== shuffled.length;
      });
    });

    document.getElementById('bt-mem-submit').addEventListener('click', () => {
      let correct = 0;
      shuffled.forEach(e => { if (selected.has(e)) correct++; });
      const pct = correct / shuffled.length;
      scores.right += Math.round(pct * 20);
      currentStep++;
      renderStep();
    });
  }

  /* --- 3. Pattern Recognition --- */
  function renderPatternTest(area) {
    const patterns = [
      { seq: ['▲', '■', '▲', '■', '▲', '?'], ans: '■', opts: ['▲', '■', '●', '◆'] },
      { seq: ['1', '1', '2', '3', '5', '?'], ans: '8', opts: ['6', '7', '8', '10'] },
      { seq: ['A', 'C', 'E', 'G', '?'], ans: 'I', opts: ['H', 'I', 'J', 'K'] }
    ];
    const p = patterns[Math.floor(Math.random() * patterns.length)];

    area.innerHTML = `
      <div class="bt-question">Complete the pattern:</div>
      <div class="bt-pattern-display">
        ${p.seq.map(s => `<span class="bt-pattern-item ${s === '?' ? 'bt-missing' : ''}">${s}</span>`).join('')}
      </div>
      <div class="bt-options">
        ${p.opts.map(o => `<button class="bt-option" data-val="${o}">${o}</button>`).join('')}
      </div>
    `;

    area.querySelectorAll('.bt-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.val === p.ans) {
          scores.left += 20;
          btn.classList.add('bt-correct');
        } else {
          scores.left += 5;
          btn.classList.add('bt-wrong');
        }
        setTimeout(() => { currentStep++; renderStep(); }, 1000);
      });
    });
  }

  /* --- 4. Spatial Reasoning --- */
  function renderSpatialTest(area) {
    const questions = [
      {
        q: 'If you fold this flat cross shape (+) into a cube, which face is opposite the top?',
        opts: ['Bottom face', 'Left face', 'Right face', 'Back face'],
        ans: 0
      },
      {
        q: 'How many triangles can you see in a triangle divided by lines from each vertex to the opposite midpoint?',
        opts: ['4', '6', '8', '13'],
        ans: 1
      },
      {
        q: 'Which shape completes the 3x3 grid? Row pattern: ○□△, □△○, △○?',
        opts: ['○', '□', '△', '◇'],
        ans: 1
      }
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];

    area.innerHTML = `
      <div class="bt-question">${q.q}</div>
      <div class="bt-options">
        ${q.opts.map((o, i) => `<button class="bt-option" data-idx="${i}">${o}</button>`).join('')}
      </div>
    `;

    area.querySelectorAll('.bt-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (idx === q.ans) {
          scores.right += 20;
          btn.classList.add('bt-correct');
        } else {
          scores.right += 5;
          btn.classList.add('bt-wrong');
        }
        setTimeout(() => { currentStep++; renderStep(); }, 1000);
      });
    });
  }

  /* --- 5. Reaction Time --- */
  function renderReactionTest(area) {
    area.innerHTML = `
      <p class="bt-info">Click the box as soon as it turns <strong style="color:var(--neon-green)">GREEN</strong>!</p>
      <div class="bt-reaction-box bt-reaction-waiting" id="bt-reaction-box">Wait for green...</div>
    `;

    const box = document.getElementById('bt-reaction-box');
    let startTime = 0;
    let timeout = null;
    let clicked = false;

    const delay = 2000 + Math.random() * 3000;
    timeout = setTimeout(() => {
      box.className = 'bt-reaction-box bt-reaction-go';
      box.textContent = 'CLICK NOW!';
      startTime = performance.now();
    }, delay);

    box.addEventListener('click', () => {
      if (clicked) return;
      clicked = true;
      
      if (!startTime) {
        clearTimeout(timeout);
        box.className = 'bt-reaction-box bt-reaction-early';
        box.textContent = 'Too early! 😅';
        scores.left += 5;
        scores.right += 5;
        setTimeout(() => { currentStep++; renderStep(); }, 1200);
        return;
      }

      const reactionMs = Math.round(performance.now() - startTime);
      box.className = 'bt-reaction-box bt-reaction-result';
      box.textContent = `${reactionMs}ms`;

      if (reactionMs < 300) {
        scores.left += 10;
        scores.right += 10;
      } else if (reactionMs < 500) {
        scores.left += 7;
        scores.right += 7;
      } else {
        scores.left += 3;
        scores.right += 3;
      }

      setTimeout(() => { currentStep++; renderStep(); }, 1200);
    });
  }

  /* --- Results --- */
  function showResults() {
    const total = scores.left + scores.right;
    const leftPct = total > 0 ? Math.round((scores.left / total) * 100) : 50;
    const rightPct = 100 - leftPct;

    // Save to profile
    const p = Auth.getPlayer();
    if (p) {
      p.brainDominance = { left: leftPct, right: rightPct };
      Auth.savePlayer(p);
    }

    testContainer.innerHTML = `
      <div class="bt-results">
        <div class="bt-results-icon">🧠</div>
        <h2 class="bt-results-title">Your Brain Profile</h2>
        <div class="bt-dominance-bar">
          <div class="bt-dom-left" style="width:${leftPct}%">
            <span>🔬 Left ${leftPct}%</span>
          </div>
          <div class="bt-dom-right" style="width:${rightPct}%">
            <span>🎨 Right ${rightPct}%</span>
          </div>
        </div>
        <div class="bt-dom-labels">
          <div class="bt-dom-label-item">
            <strong>Left Brain</strong>
            <span>Analytical • Logical • Detail-oriented</span>
          </div>
          <div class="bt-dom-label-item">
            <strong>Right Brain</strong>
            <span>Creative • Intuitive • Big-picture</span>
          </div>
        </div>
        <p class="bt-results-desc">
          ${leftPct > rightPct 
            ? 'Your brain leans <strong>analytical</strong>! You excel at logic, math, and structured thinking. Try creative games to balance your skills!'
            : rightPct > leftPct 
              ? 'Your brain leans <strong>creative</strong>! You have strong intuition and spatial awareness. Try logic puzzles to sharpen your analytical side!'
              : 'Your brain is perfectly <strong>balanced</strong>! You have equal strength in both analytical and creative thinking!'}
        </p>
        <button class="hero-btn bt-done-btn" id="bt-done-btn" style="margin-top:24px;padding:14px 44px;font-size:.85rem;">🚀 Continue to Dashboard</button>
      </div>
    `;

    document.getElementById('bt-done-btn').addEventListener('click', () => {
      if (onComplete) onComplete({ left: leftPct, right: rightPct });
    });
  }

  return { start };
})();
