/* ============================================
   app.js — Brain Boost Challenge SPA Router v5
   ============================================ */

/* --- Game Skill Mapping --- */
const GAME_SKILL_MAP = {
  quiz: { memory: 3, logic: 8, analysis: 6 },
  memory: { memory: 10, observation: 6, visual: 3 },
  snake: { focus: 8, reaction: 5, visual: 4 },
  tictactoe: { logic: 7, analysis: 5 },
  rps: { logic: 3, reaction: 4 },
  reaction: { reaction: 10, focus: 5 },
  colormatch: { observation: 8, focus: 6, visual: 5, creativity: 3 },
  mathsprint: { logic: 8, analysis: 7, focus: 4 },
  wordscramble: { memory: 5, creativity: 6, analysis: 4 },
  whackamole: { reaction: 7, focus: 6, observation: 4 }
};

const GameUtils = {
  confetti() {
    const colors = ['#00f5ff', '#ff2e63', '#7b61ff', '#00ff88', '#ffd700', '#ff6b35'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = '-10px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = (Math.random() * 8 + 5) + 'px';
      p.style.height = (Math.random() * 8 + 5) + 'px';
      p.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
      p.style.setProperty('--fall-duration', (Math.random() * 2 + 1.5) + 's');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4000);
    }
  }
};

const GAME_DEFS = [
  { id: 'quiz', name: 'Quiz Challenge', desc: 'Test your knowledge with multiple choice questions and climb the score ladder.', icon: '🧠', bestKey: 'quizBest', bestLabel: 'Best Score', skills: ['logic', 'analysis', 'memory'], category: 'left' },
  { id: 'memory', name: 'Memory Card Match', desc: 'Flip cards and find matching pairs. Train your memory and beat your record!', icon: '🃏', bestKey: 'memoryWins', bestLabel: 'Wins', skills: ['memory', 'observation', 'visual'], category: 'right' },
  { id: 'snake', name: 'Snake Game', desc: 'Classic snake with increasing speed. How long can you survive the grid?', icon: '🐍', bestKey: 'snakeBest', bestLabel: 'Best Score', skills: ['focus', 'reaction', 'visual'], category: 'right' },
  { id: 'tictactoe', name: 'Tic Tac Toe', desc: 'Challenge the computer AI in a battle of strategy and wits.', icon: '❌', bestKey: 'tttWins', bestLabel: 'Wins', skills: ['logic', 'analysis'], category: 'left' },
  { id: 'rps', name: 'Rock Paper Scissors', desc: 'The classic showdown! Best your opponent with the right pick.', icon: '✊', bestKey: 'rpsBest', bestLabel: 'Win Streak', skills: ['logic', 'reaction'], category: 'left' },
  { id: 'reaction', name: 'Reaction Time', desc: 'Test your reflexes! Click as fast as you can when the color changes.', icon: '⚡', bestKey: 'reactionBest', bestLabel: 'Best Time', isTime: true, skills: ['reaction', 'focus'], category: 'right' },
  { id: 'colormatch', name: 'Color Match', desc: 'Does the word match the color? Test your brain with this tricky challenge!', icon: '🎨', bestKey: 'colormatchBest', bestLabel: 'Best Score', skills: ['observation', 'focus', 'visual'], category: 'right' },
  { id: 'mathsprint', name: 'Math Sprint', desc: 'Solve arithmetic problems as fast as you can. Race against yourself!', icon: '🧮', bestKey: 'mathsprintBest', bestLabel: 'Best Score', skills: ['logic', 'analysis', 'focus'], category: 'left' },
  { id: 'wordscramble', name: 'Word Scramble', desc: 'Unscramble jumbled letters to form the correct word.', icon: '📝', bestKey: 'wordscrambleBest', bestLabel: 'Best Score', skills: ['memory', 'creativity', 'analysis'], category: 'left' },
  { id: 'whackamole', name: 'Whack-a-Mole', desc: 'Targets appear randomly — click them fast to rack up points!', icon: '🎯', bestKey: 'whackamoleBest', bestLabel: 'Best Score', skills: ['reaction', 'focus', 'observation'], category: 'right' },
];

const GAME_INSTRUCTIONS = {
  quiz: { howTo: 'Answer multiple choice questions correctly.', controls: 'Click on the correct answer option.', goal: 'Score as high as possible across 10 questions.' },
  memory: { howTo: 'Flip cards to find matching emoji pairs.', controls: 'Click cards to flip them. Match 2 identical cards.', goal: 'Match all pairs in the fewest moves.' },
  snake: { howTo: 'Guide the snake to eat food and grow longer.', controls: 'Arrow keys or WASD / On-screen buttons.', goal: 'Eat food without hitting walls or yourself.' },
  tictactoe: { howTo: 'Place X marks to get 3 in a row before the CPU.', controls: 'Click on empty cells to place your mark.', goal: 'Get 3 in a row (horizontal, vertical, or diagonal).' },
  rps: { howTo: 'Pick Rock, Paper, or Scissors against the CPU.', controls: 'Click your choice. Rock > Scissors > Paper > Rock.', goal: 'Win as many rounds as possible.' },
  reaction: { howTo: 'Wait for the box to turn green, then click fast.', controls: 'Click the colored box when it turns green.', goal: 'Achieve the fastest average reaction time in 5 tries.' },
  colormatch: { howTo: 'Decide if the word matches the color it is displayed in.', controls: 'Click Match or No Match.', goal: 'Correctly identify 15 color-word combinations.' },
  mathsprint: { howTo: 'Solve arithmetic problems quickly.', controls: 'Click the correct answer from 4 options.', goal: 'Get the highest score in 12 problems.' },
  wordscramble: { howTo: 'Unscramble the jumbled letters to form a word.', controls: 'Type your answer and press Enter or click Submit.', goal: 'Unscramble 10 words correctly.' },
  whackamole: { howTo: 'Click targets as they appear in the grid.', controls: 'Click on the 🎯 target before it moves.', goal: 'Hit as many targets as possible in 30 seconds.' },
};

const AVATARS = [
  { emoji: '🧠', name: 'Brain', cost: 0 },
  { emoji: '🎮', name: 'Gamer', cost: 0 },
  { emoji: '🐉', name: 'Dragon', cost: 50 },
  { emoji: '🦊', name: 'Fox', cost: 100 },
  { emoji: '🤖', name: 'Robot', cost: 200 },
  { emoji: '👾', name: 'Alien', cost: 350 },
  { emoji: '🦁', name: 'Lion', cost: 500 },
  { emoji: '🧙', name: 'Wizard', cost: 750 },
  { emoji: '🔥', name: 'Flame', cost: 1000 },
];

const REGISTER_AVATARS = ['🧠', '🎮', '👤', '🐉', '🦊', '🤖', '👾', '🦁', '🧙', '🔥', '🐺', '🦅'];

const GAME_MODULES = { quiz: QuizGame, memory: MemoryGame, snake: SnakeGame, tictactoe: TicTacToeGame, rps: RPSGame, reaction: ReactionGame, colormatch: ColorMatchGame, mathsprint: MathSprintGame, wordscramble: WordScrambleGame, whackamole: WhackAMoleGame };

/* --- Scroll Reveal Observer --- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* --- Navbar scroll effect --- */
function initNavScroll() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* --- Loader --- */
function runLoader(cb) {
  const bar = document.getElementById('loader-bar');
  const pct = document.getElementById('loader-percent');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 8 + 2;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
    if (p >= 100) { clearInterval(iv); setTimeout(() => { document.getElementById('loader').classList.add('hidden'); cb(); }, 600); }
  }, 80);
}

/* --- Router --- */
function getRoute() { return (location.hash.slice(1) || 'home'); }

function cleanupGames() {
  if (typeof SnakeGame !== 'undefined' && SnakeGame.cleanup) SnakeGame.cleanup();
  if (typeof WhackAMoleGame !== 'undefined' && WhackAMoleGame.cleanup) WhackAMoleGame.cleanup();
  if (typeof ReactionGame !== 'undefined' && ReactionGame.cleanup) ReactionGame.cleanup();
}

function navigate() {
  cleanupGames();
  const route = getRoute(), main = document.getElementById('main-content');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.nav === route.split('/')[0]));
  document.getElementById('nav-links').classList.remove('open');
  document.getElementById('nav-hamburger').classList.remove('active');

  // Mandatory Brain Dominance Test for new users
  const player = Auth.getPlayer();
  if (player && !player.onboardingComplete && route !== 'brain-test' && route !== 'login' && route !== 'register') {
    location.hash = '#brain-test';
    return;
  }

  if (route === 'home') main.innerHTML = renderHome();
  else if (route === 'games') main.innerHTML = renderGames();
  else if (route === 'dashboard') { main.innerHTML = Dashboard.render(); requestAnimationFrame(() => { Dashboard.initCharts(); renderActivityCalendar(); }); }
  else if (route === 'leaderboard') main.innerHTML = renderLeaderboard();
  else if (route === 'achievements') main.innerHTML = renderAchievementsPage();
  else if (route === 'profile') main.innerHTML = renderProfile();
  else if (route === 'login') main.innerHTML = renderLoginPage();
  else if (route === 'register') main.innerHTML = renderRegisterPage();
  else if (route === 'onboarding') main.innerHTML = renderOnboarding();
  else if (route === 'brain-test') { main.innerHTML = '<div class="page"><section class="section"><div id="brain-test-container"></div></section></div>'; BrainTest.start(document.getElementById('brain-test-container'), onBrainTestComplete); }
  else if (route === 'left-brain') main.innerHTML = renderBrainSection('left');
  else if (route === 'right-brain') main.innerHTML = renderBrainSection('right');
  else if (route === 'coach') main.innerHTML = Coach.render();
  else if (route === 'quick-boost') { main.innerHTML = QuickBoost.renderPage(); requestAnimationFrame(() => QuickBoost.start()); }
  else if (route === 'share-profile') main.innerHTML = renderShareProfile();
  else if (route.startsWith('game/')) renderGamePage(main, route.split('/')[1]);
  else main.innerHTML = renderHome();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  requestAnimationFrame(() => { initScrollReveal(); UI.onPageLoad(); });
}

function onBrainTestComplete(result) {
  const p = Auth.getPlayer();
  if (p) {
    p.brainDominance = result;
    p.onboardingComplete = true;
    Auth.savePlayer(p);
    Recommendation.calculateBrainAge();
  }
  GameUtils.confetti();
  location.hash = '#dashboard';
}

/* ============================================
   GAME INSTRUCTIONS MODAL
   ============================================ */
function showGameInstructions(gameId, callback) {
  const def = GAME_DEFS.find(g => g.id === gameId);
  const instr = GAME_INSTRUCTIONS[gameId];
  if (!def || !instr) { callback(); return; }

  const skillTags = (def.skills || []).map(s => `<span class="skill-tag skill-${s}">${s}</span>`).join('');
  const difficulty = Recommendation.getAdaptiveDifficulty(gameId);

  const modal = document.createElement('div');
  modal.className = 'game-modal-overlay';
  modal.innerHTML = `
    <div class="game-modal">
      <div class="game-modal-icon">${def.icon}</div>
      <h3 class="game-modal-title">${def.name}</h3>
      <div class="game-modal-skills">${skillTags}</div>
      <div class="game-modal-diff">Difficulty: <strong class="diff-${difficulty}">${difficulty.toUpperCase()}</strong></div>
      <div class="game-modal-section">
        <div class="game-modal-label">📖 How to Play</div>
        <p>${instr.howTo}</p>
      </div>
      <div class="game-modal-section">
        <div class="game-modal-label">🎮 Controls</div>
        <p>${instr.controls}</p>
      </div>
      <div class="game-modal-section">
        <div class="game-modal-label">🎯 Goal</div>
        <p>${instr.goal}</p>
      </div>
      <button class="hero-btn game-modal-start" style="margin-top:20px;padding:14px 44px;font-size:.9rem;" id="modal-start">🚀 START GAME</button>
      <button class="game-modal-close" id="modal-close">✕</button>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('visible'));

  document.getElementById('modal-start').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => { modal.remove(); callback(); }, 300);
    SoundFX.play('gameStart');
  });
  document.getElementById('modal-close').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

/* ============================================
   PAGE RENDERERS
   ============================================ */
function renderHome() {
  const top = Leaderboard.getTop(3);
  const trophies = ['🥇', '🥈', '🥉'];
  const player = Auth.getPlayer();
  const coach = player ? Recommendation.getCoachMessage() : null;
  
  return `<div class="page">
    <section class="hero">
      <div class="hero-brain-icon">🧠</div>
      <h1 class="hero-title">BRAIN BOOST</h1>
      <p class="hero-tagline">Train Your Brain. Unlock Your Potential.</p>
      <button class="hero-btn" onclick="location.hash='${player ? '#dashboard' : '#register'}'">
        ${player ? '📊 DASHBOARD' : '🚀 START TRAINING'}
      </button>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hero-stat-value">10</div><div class="hero-stat-label">Games</div></div>
        <div class="hero-stat"><div class="hero-stat-value">9</div><div class="hero-stat-label">Cognitive Skills</div></div>
        <div class="hero-stat"><div class="hero-stat-value">∞</div><div class="hero-stat-label">Potential</div></div>
      </div>
    </section>

    ${coach ? `<section class="section" style="padding-top:20px;padding-bottom:0">
      <div class="dash-coach reveal">
        <div class="dash-coach-icon">${coach.icon}</div>
        <div class="dash-coach-msg">${coach.msg}</div>
      </div>
    </section>` : ''}

    <section class="section">
      <h2 class="section-title reveal">🧠 Brain Training Games</h2>
      <p class="section-subtitle reveal">Scientifically designed to sharpen your cognitive abilities</p>
      <div class="games-grid">${GAME_DEFS.slice(0, 3).map((g, i) => gameCard(g, i)).join('')}</div>
    </section>

    <section class="section">
      <h2 class="section-title reveal">🔬 Left Brain vs 🎨 Right Brain</h2>
      <p class="section-subtitle reveal">Explore training for both hemispheres</p>
      <div class="brain-section-cards reveal">
        <div class="brain-hemi-card brain-left-card" onclick="location.hash='#left-brain'">
          <div class="brain-hemi-icon">🔬</div>
          <h3>Left Brain Activities</h3>
          <p>Logic • Math • Analysis • Problem Solving</p>
          <span class="game-card-btn">Explore →</span>
        </div>
        <div class="brain-hemi-card brain-right-card" onclick="location.hash='#right-brain'">
          <div class="brain-hemi-icon">🎨</div>
          <h3>Right Brain Activities</h3>
          <p>Creativity • Memory • Visual • Spatial</p>
          <span class="game-card-btn">Explore →</span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title reveal">⚡ Daily Challenge</h2>
      <p class="section-subtitle reveal">Complete today's challenge for bonus XP & coins</p>
      <div class="reveal">${DailyChallenge.renderSection()}</div>
    </section>

    <section class="section">
      <h2 class="section-title reveal">🏆 Top Trainers</h2>
      <p class="section-subtitle reveal">The cognitive champions</p>
      <div class="top-players-list">
        ${top.map((p, i) => `<div class="glass-card top-player-card reveal" style="transition-delay:${i * 0.1}s">
          <div class="top-player-rank">${trophies[i]}</div>
          <div class="top-player-name">${p.username}</div>
          <div class="top-player-score">${p.score} pts</div>
        </div>`).join('')}
      </div>
    </section>

    <section class="section">
      <h2 class="section-title reveal">🏅 Achievements</h2>
      <p class="section-subtitle reveal">Unlock badges by training and reaching milestones</p>
      <div class="achievements-grid reveal">${Achievements.renderAchievementsGrid()}</div>
    </section>

    <section class="section">
      <h2 class="section-title reveal">⚡ Quick Brain Boost</h2>
      <p class="section-subtitle reveal">3 rapid-fire mini-games in under 2 minutes</p>
      <div class="quick-boost-banner reveal" onclick="location.hash='#quick-boost'">
        <div class="qb-banner-icon">⚡</div>
        <div class="qb-banner-text"><h3>Start a Quick Brain Boost</h3><p>3 mini-games • Train 3 skills • Earn XP & Coins</p></div>
        <span class="game-card-btn">Go →</span>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title reveal">About Brain Boost Challenge</h2>
      <p class="section-subtitle reveal">Your AI-powered cognitive training platform</p>
      <div class="about-grid">
        <div class="glass-card about-card reveal" style="transition-delay:0s"><div class="about-icon">🧠</div><h3>AI-Powered Training</h3><p>Personalized game recommendations based on your cognitive profile.</p></div>
        <div class="glass-card about-card reveal" style="transition-delay:.1s"><div class="about-icon">📊</div><h3>Brain Analytics</h3><p>Track your cognitive skills with radar charts and performance trends.</p></div>
        <div class="glass-card about-card reveal" style="transition-delay:.2s"><div class="about-icon">⚡</div><h3>Adaptive Difficulty</h3><p>Games that grow with you—difficulty adjusts to match your skill level.</p></div>
        <div class="glass-card about-card reveal" style="transition-delay:.3s"><div class="about-icon">🔥</div><h3>Streak System</h3><p>Build daily training habits and earn bonus rewards.</p></div>
      </div>
    </section>

    <section class="cta-section reveal">
      <h2>Ready to Boost Your Brain?</h2>
      <p>Join Brain Boost Challenge and discover your cognitive potential.</p>
      <button class="hero-btn" onclick="location.hash='${player ? '#games' : '#register'}'" style="font-size:.9rem;padding:14px 42px">
        ${player ? '🎮 START TRAINING' : '🚀 GET STARTED'}
      </button>
    </section>
  </div>`;
}

function gameCard(g, idx) {
  const delay = idx !== undefined ? `style="transition-delay:${(idx || 0) * 0.08}s"` : '';
  const skillTags = (g.skills || []).map(s => `<span class="skill-tag-sm skill-${s}">${s}</span>`).join('');
  return `<div class="game-card reveal" ${delay} onclick="location.hash='#game/${g.id}'">
    <div class="game-card-img">${g.icon}</div>
    <div class="game-card-body">
      <div class="game-card-title">${g.name}</div>
      <div class="game-card-skills">${skillTags}</div>
      <div class="game-card-desc">${g.desc}</div>
      <span class="game-card-btn">Train Now →</span>
    </div>
  </div>`;
}

function renderGames() {
  const p = Auth.getPlayer();
  return `<div class="page"><section class="section">
    <h2 class="section-title reveal">🧠 Game Library</h2>
    <p class="section-subtitle reveal">Choose a training exercise to boost your cognitive skills</p>

    <!-- Mood Selector -->
    <div class="mood-selector reveal">
      <div class="mood-label">How are you feeling?</div>
      <div class="mood-options">
        <button class="mood-btn" onclick="selectMood('happy')" data-mood="happy">😊<span>Happy</span></button>
        <button class="mood-btn" onclick="selectMood('focused')" data-mood="focused">🎯<span>Focused</span></button>
        <button class="mood-btn" onclick="selectMood('stressed')" data-mood="stressed">😤<span>Stressed</span></button>
        <button class="mood-btn" onclick="selectMood('tired')" data-mood="tired">😴<span>Tired</span></button>
      </div>
      <div id="mood-result" class="mood-result"></div>
    </div>

    <!-- Quick Boost Banner -->
    <div class="quick-boost-banner reveal" onclick="location.hash='#quick-boost'" style="margin-bottom:30px">
      <div class="qb-banner-icon">⚡</div>
      <div class="qb-banner-text"><h3>Quick Brain Boost</h3><p>3 mini-games • 2 minutes • Max results</p></div>
      <span class="game-card-btn">Go →</span>
    </div>

    <div class="search-bar reveal"><span class="search-icon">🔍</span><input type="text" id="game-search" placeholder="Search games..." oninput="filterGames()"></div>
    <div class="game-filter-row reveal">
      <button class="filter-btn active" data-filter="all" onclick="filterByCategory('all', this)">All</button>
      <button class="filter-btn" data-filter="left" onclick="filterByCategory('left', this)">🔬 Left Brain</button>
      <button class="filter-btn" data-filter="right" onclick="filterByCategory('right', this)">🎨 Right Brain</button>
    </div>
    <div class="games-grid" id="games-grid-container">${GAME_DEFS.map((g, i) => gameCard(g, i)).join('')}</div>
  </section></div>`;
}

function filterGames() {
  const q = document.getElementById('game-search').value.toLowerCase();
  const c = document.getElementById('games-grid-container');
  const f = GAME_DEFS.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q));
  c.innerHTML = f.length ? f.map((g, i) => gameCard(g, i)).join('') : '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">No games found.</p>';
  initScrollReveal();
}

function filterByCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const c = document.getElementById('games-grid-container');
  const f = cat === 'all' ? GAME_DEFS : GAME_DEFS.filter(g => g.category === cat);
  c.innerHTML = f.length ? f.map((g, i) => gameCard(g, i)).join('') : '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">No games found.</p>';
  initScrollReveal();
}

function renderBrainSection(side) {
  const title = side === 'left' ? '🔬 Left Brain Activities' : '🎨 Right Brain Activities';
  const subtitle = side === 'left' ? 'Analytical & logical training exercises' : 'Creative & intuitive training exercises';
  const games = GAME_DEFS.filter(g => g.category === side);

  return `<div class="page"><section class="section">
    <h2 class="section-title reveal">${title}</h2>
    <p class="section-subtitle reveal">${subtitle}</p>
    <div class="games-grid">${games.map((g, i) => gameCard(g, i)).join('')}</div>
  </section></div>`;
}

function renderGamePage(main, gid) {
  const def = GAME_DEFS.find(g => g.id === gid);
  if (!def) { main.innerHTML = renderHome(); return; }
  main.innerHTML = `<div class="page game-page">
    <div class="game-header"><h2>${def.icon} ${def.name}</h2>
      <div class="game-controls">
        <button class="btn-game btn-restart" id="game-restart-btn">↻ Restart</button>
        <button class="btn-game btn-back" onclick="location.hash='#games'">← Back</button>
      </div>
    </div>
    <div class="game-area" id="game-area"><div class="game-loading"><div class="game-loading-spinner"></div><div style="margin-top:16px;color:var(--text-muted);font-size:.85rem;">Loading game...</div></div></div>
  </div>`;
  const area = document.getElementById('game-area');
  const mod = GAME_MODULES[gid];
  showGameInstructions(gid, () => {
    if (mod) {
      mod.init(area);
      document.getElementById('game-restart-btn').addEventListener('click', () => { cleanupGames(); mod.init(area); });
    }
  });
}

function renderLeaderboard() {
  return `<div class="page"><section class="section">
    <h2 class="section-title reveal">🏆 Leaderboard</h2>
    <p class="section-subtitle reveal">Top trainers ranked by total score</p>
    <div class="reveal">${Leaderboard.renderCards()}</div>
  </section></div>`;
}

function renderAchievementsPage() {
  const unlocked = Achievements.getUnlocked();
  const total = Achievements.DEFINITIONS.length;
  const pct = Math.round((unlocked.length / total) * 100);
  return `<div class="page"><section class="section">
    <h2 class="section-title reveal">🏅 Achievements</h2>
    <p class="section-subtitle reveal">Unlock badges by training and reaching milestones</p>
    <div class="glass-card reveal" style="text-align:center;margin-bottom:40px;padding:30px;">
      <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--neon-cyan);">${unlocked.length}/${total}</div>
      <div style="color:var(--text-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">Achievements Unlocked</div>
      <div class="xp-bar-track" style="max-width:300px;margin:16px auto 0;"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="achievements-grid reveal">${Achievements.renderAchievementsGrid()}</div>
  </section></div>`;
}

/* ============================================
   ONBOARDING
   ============================================ */
function renderOnboarding() {
  const p = Auth.getPlayer();
  if (!p) { location.hash = '#login'; return ''; }
  if (p.onboardingComplete) { location.hash = '#dashboard'; return ''; }

  return `<div class="page login-page">
    <div class="onboarding-card">
      <div class="ob-progress">
        <div class="ob-step active" data-step="1">1</div>
        <div class="ob-line"></div>
        <div class="ob-step" data-step="2">2</div>
        <div class="ob-line"></div>
        <div class="ob-step" data-step="3">3</div>
        <div class="ob-line"></div>
        <div class="ob-step" data-step="4">4</div>
      </div>
      <div id="ob-content">${renderObStep1()}</div>
    </div>
  </div>`;
}

function renderObStep1() {
  return `
    <div class="ob-step-content">
      <h2 class="auth-title">Choose Your Avatar</h2>
      <p class="auth-subtitle">Pick an avatar that represents you</p>
      <div class="auth-avatar-grid" id="ob-avatar-grid">
        ${REGISTER_AVATARS.map((a, i) => `<div class="auth-avatar-option ${i === 0 ? 'selected' : ''}" data-avatar="${a}" onclick="selectRegAvatar(this)">${a}</div>`).join('')}
      </div>
      <button class="auth-btn primary" onclick="obNext(1)">Next →</button>
    </div>
  `;
}

function renderObStep2() {
  return `
    <div class="ob-step-content">
      <h2 class="auth-title">About You</h2>
      <p class="auth-subtitle">Help us personalize your training</p>
      <div class="auth-field">
        <label class="auth-label">Age</label>
        <input type="number" class="auth-input" id="ob-age" placeholder="Your age" min="10" max="99">
      </div>
      <div class="auth-field">
        <label class="auth-label">Education Level</label>
        <select class="auth-input" id="ob-education">
          <option value="">Select...</option>
          <option value="high-school">High School</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="postgraduate">Post Graduate</option>
        </select>
      </div>
      <button class="auth-btn primary" onclick="obNext(2)">Next →</button>
    </div>
  `;
}

function renderObStep3() {
  const interests = ['Logic Puzzles', 'Memory Training', 'Math Challenges', 'Speed Games', 'Pattern Recognition', 'Word Games', 'Strategy', 'Creativity'];
  return `
    <div class="ob-step-content">
      <h2 class="auth-title">Your Interests</h2>
      <p class="auth-subtitle">Select what excites you most</p>
      <div class="ob-interests-grid">
        ${interests.map(i => `<button class="ob-interest-btn" onclick="this.classList.toggle('selected')" data-interest="${i}">${i}</button>`).join('')}
      </div>
      <button class="auth-btn primary" onclick="obNext(3)">Start Brain Test →</button>
    </div>
  `;
}

function obNext(step) {
  const p = Auth.getPlayer();
  if (!p) return;

  if (step === 1) {
    const sel = document.querySelector('.auth-avatar-option.selected');
    if (sel) p.avatar = sel.dataset.avatar;
    Auth.savePlayer(p);
    Auth.updateNavbar();
    document.getElementById('ob-content').innerHTML = renderObStep2();
    updateObProgress(2);
  } else if (step === 2) {
    p.age = document.getElementById('ob-age')?.value || '';
    p.education = document.getElementById('ob-education')?.value || '';
    Auth.savePlayer(p);
    document.getElementById('ob-content').innerHTML = renderObStep3();
    updateObProgress(3);
  } else if (step === 3) {
    const selected = [];
    document.querySelectorAll('.ob-interest-btn.selected').forEach(b => selected.push(b.dataset.interest));
    p.interests = selected;
    Auth.savePlayer(p);
    updateObProgress(4);
    location.hash = '#brain-test';
  }
}

function updateObProgress(activeStep) {
  document.querySelectorAll('.ob-step').forEach(s => {
    const step = parseInt(s.dataset.step);
    s.classList.toggle('active', step <= activeStep);
    s.classList.toggle('completed', step < activeStep);
  });
}

/* ============================================
   LOGIN PAGE
   ============================================ */
function renderLoginPage() {
  const p = Auth.getPlayer();
  if (p) {
    return `<div class="page login-page"><div class="auth-card">
      <div class="auth-avatar-display">${p.avatar || '🧠'}</div>
      <h2 class="auth-title">Welcome Back!</h2>
      <p class="auth-subtitle">Logged in as <strong style="color:var(--neon-cyan)">${p.username}</strong></p>
      <p style="color:var(--text-muted);font-size:.82rem;margin-bottom:20px;">Level ${Auth.getLevel(p.xp)} • 🪙 ${p.coins || 0} coins • 🔥 ${p.streak || 0} day streak</p>
      <button class="auth-btn primary" onclick="location.hash='#dashboard'">📊 Dashboard</button>
      <button class="auth-btn secondary" onclick="location.hash='#games'">🎮 Play Games</button>
      <button class="auth-btn ghost" onclick="handleLogout()">🚪 Logout</button>
    </div></div>`;
  }
  return `<div class="page login-page"><div class="auth-card">
    <div class="auth-logo">🧠</div>
    <h2 class="auth-title">Welcome to Brain Boost</h2>
    <p class="auth-subtitle">Sign in to track your cognitive progress</p>
    <div id="auth-error" class="auth-error" style="display:none;"></div>
    <div class="auth-field">
      <label class="auth-label">Username or Email</label>
      <input type="text" class="auth-input" id="login-username" placeholder="Enter username or email" maxlength="50" onkeydown="if(event.key==='Enter')document.getElementById('login-password').focus()">
    </div>
    <div class="auth-field">
      <label class="auth-label">Password</label>
      <div class="auth-password-wrap">
        <input type="password" class="auth-input" id="login-password" placeholder="Enter your password" maxlength="32" onkeydown="if(event.key==='Enter')handleLogin()">
        <button class="auth-eye" onclick="togglePasswordVisibility('login-password', this)" type="button">👁️</button>
      </div>
    </div>
    <div class="auth-row">
      <label class="auth-checkbox-wrap"><input type="checkbox" id="login-remember"> <span>Remember me</span></label>
    </div>
    <button class="auth-btn primary" onclick="handleLogin()">🚀 LOGIN</button>
    <div class="auth-divider"><span>or</span></div>
    <button class="auth-btn ghost" onclick="handleGuestLogin()">👤 Play as Guest</button>
    <p class="auth-footer-text">Don't have an account? <a href="#register" class="auth-link">Register here</a></p>
  </div></div>`;
}

/* ============================================
   REGISTER PAGE
   ============================================ */
function renderRegisterPage() {
  return `<div class="page login-page"><div class="auth-card">
    <div class="auth-logo">🚀</div>
    <h2 class="auth-title">Join Brain Boost</h2>
    <p class="auth-subtitle">Create an account to start training your brain</p>
    <div id="auth-error" class="auth-error" style="display:none;"></div>
    <div class="auth-field">
      <label class="auth-label">Username</label>
      <input type="text" class="auth-input" id="reg-username" placeholder="Choose a username" maxlength="20">
    </div>
    <div class="auth-field">
      <label class="auth-label">Email <span style="color:var(--text-muted);font-size:.7rem">(optional)</span></label>
      <input type="email" class="auth-input" id="reg-email" placeholder="your@email.com" maxlength="50">
    </div>
    <div class="auth-field">
      <label class="auth-label">Password</label>
      <div class="auth-password-wrap">
        <input type="password" class="auth-input" id="reg-password" placeholder="Min 4 characters" maxlength="32">
        <button class="auth-eye" onclick="togglePasswordVisibility('reg-password', this)" type="button">👁️</button>
      </div>
    </div>
    <div class="auth-field">
      <label class="auth-label">Confirm Password</label>
      <div class="auth-password-wrap">
        <input type="password" class="auth-input" id="reg-confirm" placeholder="Re-enter password" maxlength="32" onkeydown="if(event.key==='Enter')handleRegister()">
        <button class="auth-eye" onclick="togglePasswordVisibility('reg-confirm', this)" type="button">👁️</button>
      </div>
    </div>
    <div class="auth-field">
      <label class="auth-label">Choose Avatar</label>
      <div class="auth-avatar-grid" id="avatar-grid">
        ${REGISTER_AVATARS.map((a, i) => `<div class="auth-avatar-option ${i === 0 ? 'selected' : ''}" data-avatar="${a}" onclick="selectRegAvatar(this)">${a}</div>`).join('')}
      </div>
    </div>
    <button class="auth-btn primary" onclick="handleRegister()">🧠 CREATE ACCOUNT</button>
    <div class="auth-divider"><span>or</span></div>
    <button class="auth-btn ghost" onclick="handleGuestLogin()">👤 Play as Guest</button>
    <p class="auth-footer-text">Already have an account? <a href="#login" class="auth-link">Login here</a></p>
  </div></div>`;
}

/* ============================================
   AUTH HANDLERS
   ============================================ */
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = 'authShake .4s ease'; });
}

function togglePasswordVisibility(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁️'; }
}

function selectRegAvatar(el) {
  document.querySelectorAll('.auth-avatar-option').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
}

async function handleLogin() {
  const u = (document.getElementById('login-username')?.value || '').trim();
  const p = document.getElementById('login-password')?.value || '';
  const remember = document.getElementById('login-remember')?.checked || false;
  if (!u) { showAuthError('Please enter your username or email'); return; }
  const result = await Auth.login(u, p, remember);
  if (!result.ok) { showAuthError(result.msg); return; }
  Auth.updateNavbar();
  SoundFX.play('win');
  GameUtils.confetti();
  const player = Auth.getPlayer();
  location.hash = player && !player.onboardingComplete ? '#brain-test' : '#home';
}

async function handleRegister() {
  const u = (document.getElementById('reg-username')?.value || '').trim();
  const e = (document.getElementById('reg-email')?.value || '').trim();
  const p = document.getElementById('reg-password')?.value || '';
  const c = document.getElementById('reg-confirm')?.value || '';
  const avatarEl = document.querySelector('.auth-avatar-option.selected');
  const avatar = avatarEl ? avatarEl.dataset.avatar : '🧠';

  if (!u) { showAuthError('Please choose a username'); return; }
  if (u.length < 3) { showAuthError('Username must be at least 3 characters'); return; }
  if (!p) { showAuthError('Please enter a password'); return; }
  if (p.length < 4) { showAuthError('Password must be at least 4 characters'); return; }
  if (p !== c) { showAuthError('Passwords do not match'); return; }

  const result = await Auth.register(u, e, p, avatar);
  if (!result.ok) { showAuthError(result.msg); return; }

  Auth.updateNavbar();
  SoundFX.play('win');
  GameUtils.confetti();
  location.hash = '#brain-test';
}

function handleGuestLogin() {
  Auth.loginAsGuest();
  Auth.updateNavbar();
  SoundFX.play('gameStart');
  location.hash = '#games';
}

function handleLogout() {
  Auth.logout();
  SoundFX.play('click');
  location.hash = '#login';
}

/* ============================================
   PROFILE PAGE
   ============================================ */
function renderProfile() {
  const p = Auth.getPlayer();
  if (!p) return `<div class="page login-page"><div class="auth-card"><h2 class="auth-title">Profile</h2><p class="auth-subtitle">Please log in to view your profile.</p><button class="auth-btn primary" onclick="location.hash='#login'">Go to Login</button></div></div>`;
  const lv = Auth.getLevel(p.xp), xpProg = Auth.getXpProgress(p.xp);
  const avatar = p.avatar || '🧠';
  const nextLvXp = Auth.getXpForLevel(lv + 1);
  const currLvXp = Auth.getXpForLevel(lv);
  return `<div class="page"><section class="section">
    <div class="profile-header reveal">
      <div class="profile-avatar">${avatar}</div>
      <div class="profile-info">
        <h2>${p.username}</h2>
        <div class="profile-level"><span class="badge">Level ${lv}</span> <span class="coin-badge-lg">🪙 ${p.coins || 0}</span> <span class="streak-badge">🔥 ${p.streak || 0} day streak</span></div>
        <div class="xp-bar-container">
          <div class="xp-bar-track"><div class="xp-bar-fill xp-bar-animated" style="width:${xpProg}%"></div></div>
          <div class="xp-text">${(Number(p.xp)||0) - currLvXp} / ${nextLvXp - currLvXp} XP to Level ${lv + 1}</div>
        </div>
      </div>
    </div>
    <div class="profile-stats-grid">
      <div class="profile-stat-card reveal" style="transition-delay:0s"><div class="stat-value">${p.gamesPlayed || 0}</div><div class="stat-label">Games Played</div></div>
      <div class="profile-stat-card reveal" style="transition-delay:.08s"><div class="stat-value">${p.wins || 0}</div><div class="stat-label">Victories</div></div>
      <div class="profile-stat-card reveal" style="transition-delay:.16s"><div class="stat-value">${p.totalScore || 0}</div><div class="stat-label">Total Score</div></div>
      <div class="profile-stat-card reveal" style="transition-delay:.24s"><div class="stat-value">${p.highestScore || 0}</div><div class="stat-label">Highest Score</div></div>
      <div class="profile-stat-card reveal" style="transition-delay:.32s"><div class="stat-value">${p.xp || 0}</div><div class="stat-label">Total XP</div></div>
      <div class="profile-stat-card reveal" style="transition-delay:.40s"><div class="stat-value">🪙 ${p.coins || 0}</div><div class="stat-label">Coins</div></div>
    </div>

    <h3 class="section-title reveal" style="font-size:1.2rem">🎨 Avatars</h3>
    <p class="section-subtitle reveal">Spend coins to unlock avatars</p>
    <div class="avatar-grid reveal">
      ${AVATARS.map(a => {
        const owned = (Number(p.coins) || 0) >= a.cost || a.cost === 0;
        const selected = avatar === a.emoji;
        return `<div class="avatar-card ${selected ? 'selected' : ''} ${owned ? 'owned' : 'locked'}" onclick="${owned ? `selectAvatar('${a.emoji}')` : ''}">
          <div class="avatar-emoji">${a.emoji}</div>
          <div class="avatar-name">${a.name}</div>
          <div class="avatar-cost">${a.cost === 0 ? 'Free' : (owned ? '✓ Owned' : '🪙 ' + a.cost)}</div>
        </div>`;
      }).join('')}
    </div>

    <h3 class="section-title reveal" style="font-size:1.2rem">🏅 Achievements</h3>
    <p class="section-subtitle reveal">Your unlocked badges</p>
    <div class="achievements-grid reveal" style="margin-bottom:44px">${Achievements.renderAchievementsGrid()}</div>

    <h3 class="section-title reveal" style="font-size:1.2rem">📊 Best Scores</h3>
    <p class="section-subtitle reveal">Personal records across all games</p>
    <div class="profile-stats-grid">
      ${GAME_DEFS.map((g, i) => {
        let v = Number(p[g.bestKey]) || 0;
        let lb = g.bestLabel;
        if (g.isTime) { v = v === 0 ? '—' : v + 'ms'; }
        return `<div class="profile-stat-card reveal" style="transition-delay:${i * .06}s"><div style="font-size:1.5rem;margin-bottom:4px">${g.icon}</div><div class="stat-value">${v}</div><div class="stat-label">${g.name}<br>${lb}</div></div>`;
      }).join('')}
    </div>

    <div style="text-align:center;margin-top:40px" class="reveal">
      <button class="auth-btn ghost" onclick="handleLogout()" style="max-width:200px;margin:0 auto;">🚪 Logout</button>
    </div>
  </section></div>`;
}

function selectAvatar(emoji) {
  Auth.setAvatar(emoji);
  SoundFX.play('correct');
  navigate();
}

/* ============================================
   MOOD SELECTOR
   ============================================ */
function selectMood(mood) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.mood-btn[data-mood="${mood}"]`)?.classList.add('active');
  const rec = Recommendation.getMoodRecommendations(mood);
  const resultEl = document.getElementById('mood-result');
  if (!resultEl) return;
  resultEl.innerHTML = `
    <div class="mood-msg">${rec.message}</div>
    <div class="mood-games">
      ${rec.games.map(gid => {
        const def = GAME_DEFS.find(g => g.id === gid);
        return def ? `<div class="mood-game-card" onclick="location.hash='#game/${gid}'">
          <span class="mood-game-icon">${def.icon}</span>
          <span class="mood-game-name">${def.name}</span>
        </div>` : '';
      }).join('')}
    </div>
  `;
  resultEl.classList.add('visible');
}

/* ============================================
   ENHANCED LEADERBOARD
   ============================================ */
function renderLeaderboard() {
  const users = Auth.getAllUsers();
  const allUsers = Object.values(users).filter(u => u.gamesPlayed > 0);

  // Sort by different criteria
  const byScore = [...allUsers].sort((a, b) => (b.totalScore||0) - (a.totalScore||0)).slice(0, 10);
  const byXp = [...allUsers].sort((a, b) => (b.xp||0) - (a.xp||0)).slice(0, 10);
  const byStreak = [...allUsers].sort((a, b) => (b.streak||0) - (a.streak||0)).slice(0, 10);

  const trophies = ['🥇', '🥈', '🥉'];
  function renderLbList(list, valKey, valLabel) {
    if (list.length === 0) return '<p style="color:var(--text-muted);text-align:center;padding:20px;">No trainers yet!</p>';
    return `<div class="lb-cards">${list.map((p, i) => {
      const rank = i < 3 ? trophies[i] : `#${i + 1}`;
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const val = valKey === 'streak' ? `${p[valKey]||0} days` : (p[valKey]||0) + ' ' + valLabel;
      return `<div class="lb-card ${i < 3 ? 'top-' + (i+1) : ''} reveal" style="transition-delay:${i * 0.06}s">
        <div class="lb-rank ${rankClass}">${rank}</div>
        <div class="lb-avatar">${p.avatar || '🧠'}</div>
        <div class="lb-name">${p.username}</div>
        <div class="lb-score">${val}</div>
        <div class="lb-games">${p.gamesPlayed||0} games</div>
      </div>`;
    }).join('')}</div>`;
  }

  // Also include default leaderboard entries
  const defaultLb = Leaderboard.getTop(10);
  const combined = [...byScore];
  defaultLb.forEach(d => {
    if (!combined.find(u => u.username === d.username)) {
      combined.push({ username: d.username, totalScore: d.score, gamesPlayed: d.gamesPlayed, avatar: '🎮', xp: 0, streak: 0 });
    }
  });
  combined.sort((a, b) => (b.totalScore||0) - (a.totalScore||0));

  return `<div class="page"><section class="section">
    <h2 class="section-title reveal">🏆 Leaderboard</h2>
    <p class="section-subtitle reveal">Top trainers ranked by performance</p>
    <div class="lb-tabs reveal">
      <button class="lb-tab active" onclick="switchLbTab('score', this)">🏆 Score</button>
      <button class="lb-tab" onclick="switchLbTab('xp', this)">⚡ XP</button>
      <button class="lb-tab" onclick="switchLbTab('streak', this)">🔥 Streak</button>
    </div>
    <div id="lb-content">${renderLbList(combined.slice(0, 10), 'totalScore', 'pts')}</div>
  </section></div>`;
}

function switchLbTab(tab, btn) {
  document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const users = Auth.getAllUsers();
  const allUsers = Object.values(users).filter(u => u.gamesPlayed > 0);
  const trophies = ['🥇', '🥈', '🥉'];

  let list, valKey, valLabel;
  if (tab === 'xp') { list = [...allUsers].sort((a, b) => (b.xp||0) - (a.xp||0)); valKey = 'xp'; valLabel = 'XP'; }
  else if (tab === 'streak') { list = [...allUsers].sort((a, b) => (b.streak||0) - (a.streak||0)); valKey = 'streak'; valLabel = 'days'; }
  else {
    list = [...allUsers].sort((a, b) => (b.totalScore||0) - (a.totalScore||0));
    const defaultLb = Leaderboard.getTop(10);
    defaultLb.forEach(d => { if (!list.find(u => u.username === d.username)) list.push({ username: d.username, totalScore: d.score, gamesPlayed: d.gamesPlayed, avatar: '🎮', xp: 0, streak: 0 }); });
    list.sort((a, b) => (b.totalScore||0) - (a.totalScore||0));
    valKey = 'totalScore'; valLabel = 'pts';
  }

  const content = document.getElementById('lb-content');
  const top = list.slice(0, 10);
  if (top.length === 0) { content.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No data yet!</p>'; return; }
  content.innerHTML = `<div class="lb-cards">${top.map((p, i) => {
    const rank = i < 3 ? trophies[i] : `#${i + 1}`;
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const val = valKey === 'streak' ? `${p[valKey]||0} days` : (p[valKey]||0) + ' ' + valLabel;
    return `<div class="lb-card ${i < 3 ? 'top-' + (i+1) : ''} reveal" style="transition-delay:${i * 0.06}s">
      <div class="lb-rank ${rankClass}">${rank}</div>
      <div class="lb-avatar">${p.avatar || '🧠'}</div>
      <div class="lb-name">${p.username}</div>
      <div class="lb-score">${val}</div>
      <div class="lb-games">${p.gamesPlayed||0} games</div>
    </div>`;
  }).join('')}</div>`;
  initScrollReveal();
}

/* ============================================
   ACTIVITY CALENDAR (GitHub-style heatmap)
   ============================================ */
function renderActivityCalendar() {
  const el = document.getElementById('dash-heatmap');
  if (!el) return;
  // Add calendar after existing heatmap content
  const p = Auth.getPlayer();
  if (!p || !p.activityHistory || p.activityHistory.length === 0) return;

  const calEl = document.createElement('div');
  calEl.className = 'activity-calendar';
  calEl.innerHTML = '<h4 class="dash-panel-title" style="margin-top:30px">📅 Training Calendar</h4>' + buildCalendar(p.activityHistory);

  // Append after heatmap panel
  const panels = document.querySelectorAll('.dash-panel.dash-wide');
  if (panels.length >= 2) panels[1].appendChild(calEl);
}

function buildCalendar(history) {
  const today = new Date();
  const days = 91; // ~3 months
  const dayCounts = {};

  history.forEach(s => { dayCounts[s.date] = (dayCounts[s.date] || 0) + 1; });

  let html = '<div class="cal-grid">';
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = dayCounts[dateStr] || 0;
    let level = 0;
    if (count >= 5) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 1) level = 2;
    else if (count > 0) level = 1;
    html += `<div class="cal-day cal-level-${level}" title="${dateStr}: ${count} games"></div>`;
  }
  html += '</div>';
  html += '<div class="cal-legend"><span>Less</span>';
  for (let i = 0; i <= 4; i++) html += `<div class="cal-day cal-level-${i}"></div>`;
  html += '<span>More</span></div>';
  return html;
}

/* ============================================
   SHARE BRAIN PROFILE
   ============================================ */
function renderShareProfile() {
  const p = Auth.getPlayer();
  if (!p) return '<div class="page login-page"><div class="auth-card"><h2 class="auth-title">Share Profile</h2><p class="auth-subtitle">Log in to share your profile.</p><button class="auth-btn primary" onclick="location.hash=\'#login\'">Login</button></div></div>';

  const skills = p.skillScores || {};
  const dom = p.brainDominance || { left: 50, right: 50 };
  const lv = Auth.getLevel(p.xp);
  const brainAge = p.brainAge || parseInt(p.age) || '?';
  const avgSkill = Object.values(skills).length ? Math.round(Object.values(skills).reduce((s,v)=>s+v,0) / Object.values(skills).length) : 0;

  return `<div class="page"><section class="section">
    <h2 class="section-title reveal">🔗 Share Your Brain Profile</h2>
    <p class="section-subtitle reveal">Show off your cognitive achievements</p>

    <div class="share-card reveal" id="share-card">
      <div class="share-header">
        <div class="share-avatar">${p.avatar || '🧠'}</div>
        <div class="share-name">${p.username}</div>
        <div class="share-level">Level ${lv}</div>
      </div>
      <div class="share-stats">
        <div class="share-stat"><span class="share-stat-val">${brainAge}</span><span class="share-stat-lbl">Brain Age</span></div>
        <div class="share-stat"><span class="share-stat-val">${dom.left}/${dom.right}</span><span class="share-stat-lbl">L/R Brain</span></div>
        <div class="share-stat"><span class="share-stat-val">${avgSkill}</span><span class="share-stat-lbl">Avg Skill</span></div>
        <div class="share-stat"><span class="share-stat-val">${p.streak||0}🔥</span><span class="share-stat-lbl">Streak</span></div>
      </div>
      <div class="share-skills">
        ${Object.entries(skills).map(([k, v]) => {
          const pct = Math.min(v, 100);
          return `<div class="share-skill"><span class="share-skill-name">${k}</span><div class="share-skill-bar"><div class="share-skill-fill" style="width:${pct}%"></div></div><span class="share-skill-val">${v}</span></div>`;
        }).join('')}
      </div>
      <div class="share-footer">🧠 Brain Boost Challenge</div>
    </div>

    <div class="share-actions reveal" style="text-align:center;margin-top:24px;">
      <button class="hero-btn" onclick="copyShareText()" style="padding:12px 32px;font-size:.85rem;">📋 Copy Stats</button>
      <button class="hero-btn" onclick="location.hash='#dashboard'" style="padding:12px 32px;font-size:.85rem;background:linear-gradient(135deg,var(--neon-purple),var(--neon-pink))">📊 Dashboard</button>
    </div>
  </section></div>`;
}

function copyShareText() {
  const p = Auth.getPlayer();
  if (!p) return;
  const skills = p.skillScores || {};
  const lv = Auth.getLevel(p.xp);
  const text = `🧠 Brain Boost Challenge\n` +
    `Player: ${p.username} (Level ${lv})\n` +
    `Brain Age: ${p.brainAge || '?'} | Streak: ${p.streak||0} days\n` +
    `Skills: ${Object.entries(skills).map(([k,v]) => `${k}:${v}`).join(' | ')}\n` +
    `Train your brain at Brain Boost Challenge! 🚀`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.share-actions .hero-btn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Stats'; }, 2000); }
  }).catch(() => {});
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  Particles.init();
  initNavScroll();
  SoundFX.updateToggleBtn();
  UI.init();
  runLoader(() => { Auth.updateNavbar(); navigate(); DailyChallenge.startTimer(); });
  window.addEventListener('hashchange', navigate);
  document.getElementById('nav-hamburger').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
    document.getElementById('nav-hamburger').classList.toggle('active');
  });
});
