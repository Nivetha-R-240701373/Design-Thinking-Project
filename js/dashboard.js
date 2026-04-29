/* ============================================
   dashboard.js — Brain Health Dashboard
   Radar chart, brain age, weekly performance,
   activity timeline, streak counter, cognitive heatmap
   ============================================ */
const Dashboard = (() => {

  /* --- Render full dashboard page --- */
  function render() {
    const p = Auth.getPlayer();
    if (!p) return `<div class="page login-page"><div class="auth-card"><h2 class="auth-title">Dashboard</h2><p class="auth-subtitle">Please log in to view your dashboard.</p><button class="auth-btn primary" onclick="location.hash='#login'">Go to Login</button></div></div>`;

    const skills = p.skillScores || {};
    const dominance = p.brainDominance || { left: 50, right: 50 };
    const brainAge = p.brainAge || parseInt(p.age) || 20;
    const streak = p.streak || 0;
    const daily = Analytics.getDailySummary();
    const coach = Recommendation.getCoachMessage();

    return `<div class="page">
      <section class="section">
        <h2 class="section-title reveal">🧠 Brain Health Dashboard</h2>
        <p class="section-subtitle reveal">Your cognitive training overview</p>

        <!-- Coach Tip -->
        <div class="dash-coach reveal">
          <div class="dash-coach-icon">${coach.icon}</div>
          <div class="dash-coach-msg">${coach.msg}</div>
        </div>

        <!-- Top Stats Row -->
        <div class="dash-stats-row reveal">
          <div class="dash-stat-card">
            <div class="dash-stat-icon">🔥</div>
            <div class="dash-stat-value stat-value">${streak}</div>
            <div class="dash-stat-label">Day Streak</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">🧠</div>
            <div class="dash-stat-value stat-value">${brainAge}</div>
            <div class="dash-stat-label">Brain Age</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">🎮</div>
            <div class="dash-stat-value stat-value">${daily.gamesPlayed}</div>
            <div class="dash-stat-label">Today's Games</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">⭐</div>
            <div class="dash-stat-value stat-value">${daily.avgScore}</div>
            <div class="dash-stat-label">Today's Avg Score</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">🪙</div>
            <div class="dash-stat-value stat-value">${p.coins || 0}</div>
            <div class="dash-stat-label">Coins</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">⚡</div>
            <div class="dash-stat-value stat-value">${p.xp || 0}</div>
            <div class="dash-stat-label">Total XP</div>
          </div>
        </div>

        <!-- Main Grid: Radar + Brain Dominance -->
        <div class="dash-grid reveal">
          <div class="dash-panel">
            <h3 class="dash-panel-title">📊 Cognitive Skills</h3>
            <canvas id="dash-radar" width="320" height="320"></canvas>
          </div>
          <div class="dash-panel">
            <h3 class="dash-panel-title">🧠 Brain Dominance</h3>
            <div class="dash-brain-visual">
              <div class="dash-brain-half dash-brain-left">
                <div class="dash-brain-emoji">🔬</div>
                <div class="dash-brain-pct">${dominance.left}%</div>
                <div class="dash-brain-type">Left Brain</div>
                <div class="dash-brain-traits">Logic • Analysis • Math</div>
              </div>
              <div class="dash-brain-divider">🧠</div>
              <div class="dash-brain-half dash-brain-right">
                <div class="dash-brain-emoji">🎨</div>
                <div class="dash-brain-pct">${dominance.right}%</div>
                <div class="dash-brain-type">Right Brain</div>
                <div class="dash-brain-traits">Creativity • Intuition • Art</div>
              </div>
            </div>
            ${renderBrainAge(brainAge, parseInt(p.age) || 20)}
          </div>
        </div>

        <!-- Weekly Performance -->
        <div class="dash-panel dash-wide reveal">
          <h3 class="dash-panel-title">📈 Weekly Performance</h3>
          <canvas id="dash-weekly" width="700" height="220"></canvas>
        </div>

        <!-- Cognitive Heatmap -->
        <div class="dash-panel dash-wide reveal">
          <h3 class="dash-panel-title">🗺️ Cognitive Heatmap</h3>
          <div class="dash-heatmap" id="dash-heatmap">
            ${renderHeatmap(skills)}
          </div>
        </div>

        <!-- Recommendations -->
        <div class="dash-panel dash-wide reveal">
          <h3 class="dash-panel-title">💡 Recommended Training</h3>
          <div class="dash-recs" id="dash-recs">${renderRecommendations()}</div>
        </div>

        <!-- Activity Timeline -->
        <div class="dash-panel dash-wide reveal">
          <h3 class="dash-panel-title">📋 Recent Activity</h3>
          <div class="dash-timeline">${renderTimeline()}</div>
        </div>
      </section>
    </div>`;
  }

  /* --- Brain Age Visual --- */
  function renderBrainAge(brainAge, realAge) {
    const diff = realAge - brainAge;
    const color = diff > 0 ? 'var(--neon-green)' : diff < 0 ? 'var(--neon-pink)' : 'var(--neon-cyan)';
    const msg = diff > 0 ? `${diff} years younger! 🎉` : diff < 0 ? `${Math.abs(diff)} years older 😤` : 'Right on target! ✨';

    return `
      <div class="dash-brain-age">
        <div class="dash-ba-circle" style="border-color:${color}">
          <div class="dash-ba-value" style="color:${color}">${brainAge}</div>
          <div class="dash-ba-label">Brain Age</div>
        </div>
        <div class="dash-ba-info">
          <div>Real Age: <strong>${realAge}</strong></div>
          <div style="color:${color};font-weight:700">${msg}</div>
        </div>
      </div>
    `;
  }

  /* --- Cognitive Heatmap --- */
  function renderHeatmap(skills) {
    const entries = Object.entries(skills);
    if (entries.length === 0) return '<p style="color:var(--text-muted);text-align:center;padding:20px;">Play some games to see your heatmap!</p>';

    const icons = { memory: '🧠', logic: '🧩', creativity: '🎨', focus: '🎯', reaction: '⚡', analysis: '📊', observation: '👁️', visual: '🌈' };

    return entries.map(([skill, val]) => {
      val = Number(val) || 0;
      let level, color;
      if (val >= 75) { level = 'Strong'; color = 'var(--neon-green)'; }
      else if (val >= 40) { level = 'Average'; color = 'var(--neon-gold)'; }
      else { level = 'Needs Work'; color = 'var(--neon-pink)'; }

      return `<div class="dash-heatmap-cell" style="--cell-color:${color}">
        <div class="dash-hm-icon">${icons[skill] || '🔮'}</div>
        <div class="dash-hm-name">${skill.charAt(0).toUpperCase() + skill.slice(1)}</div>
        <div class="dash-hm-bar"><div class="dash-hm-fill" style="width:${val}%;background:${color}"></div></div>
        <div class="dash-hm-level" style="color:${color}">${level} (${val})</div>
      </div>`;
    }).join('');
  }

  /* --- Recommendations --- */
  function renderRecommendations() {
    const recs = Recommendation.getSkillRecommendations();
    if (recs.length === 0) return '<p style="color:var(--text-muted);text-align:center;padding:20px;">Play more games to get personalized recommendations!</p>';

    return recs.slice(0, 4).map(r => {
      const def = (typeof GAME_DEFS !== 'undefined') ? GAME_DEFS.find(g => g.id === r.id) : null;
      if (!def) return '';
      return `<div class="dash-rec-card" onclick="location.hash='#game/${r.id}'">
        <div class="dash-rec-icon">${def.icon}</div>
        <div class="dash-rec-info">
          <div class="dash-rec-name">${def.name}</div>
          <div class="dash-rec-reason">Trains: ${r.reasons.join(', ')}</div>
        </div>
        <div class="dash-rec-arrow">→</div>
      </div>`;
    }).join('');
  }

  /* --- Activity Timeline --- */
  function renderTimeline() {
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory || p.activityHistory.length === 0) {
      return '<p style="color:var(--text-muted);text-align:center;padding:20px;">No activity yet. Start playing!</p>';
    }

    const recent = p.activityHistory.slice(-10).reverse();
    return recent.map(s => {
      const def = (typeof GAME_DEFS !== 'undefined') ? GAME_DEFS.find(g => g.id === s.gameId) : null;
      const timeAgo = formatTimeAgo(s.timestamp);
      return `<div class="dash-timeline-item">
        <div class="dash-tl-icon">${def ? def.icon : '🎮'}</div>
        <div class="dash-tl-info">
          <div class="dash-tl-name">${def ? def.name : s.gameId}</div>
          <div class="dash-tl-meta">Score: ${s.score} • ${timeAgo}</div>
        </div>
      </div>`;
    }).join('');
  }

  function formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  }

  /* --- Draw Radar Chart (Canvas) --- */
  function drawRadarChart() {
    const canvas = document.getElementById('dash-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const p = Auth.getPlayer();
    const skills = p ? (p.skillScores || {}) : {};

    const labels = ['Memory', 'Logic', 'Creativity', 'Focus', 'Reaction', 'Analysis', 'Observation', 'Visual'];
    const keys = ['memory', 'logic', 'creativity', 'focus', 'reaction', 'analysis', 'observation', 'visual'];
    const values = keys.map(k => Math.min(Number(skills[k]) || 0, 100));

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.min(cx, cy) - 40;
    const n = labels.length;
    const angleStep = (2 * Math.PI) / n;

    // DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 320 * dpr;
    canvas.style.width = '320px';
    canvas.style.height = '320px';
    ctx.scale(dpr, dpr);

    const cxS = 160, cyS = 160, maxRS = 110;

    ctx.clearRect(0, 0, 320, 320);

    // Draw grid circles
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * maxRS;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= n; i++) {
        const a = (i % n) * angleStep - Math.PI / 2;
        const x = cxS + r * Math.cos(a);
        const y = cyS + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < n; i++) {
      const a = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.moveTo(cxS, cyS);
      ctx.lineTo(cxS + maxRS * Math.cos(a), cyS + maxRS * Math.sin(a));
      ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = i * angleStep - Math.PI / 2;
      const r = (values[i] / 100) * maxRS;
      const x = cxS + r * Math.cos(a);
      const y = cyS + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < n; i++) {
      const a = i * angleStep - Math.PI / 2;
      const r = (values[i] / 100) * maxRS;
      const x = cxS + r * Math.cos(a);
      const y = cyS + r * Math.sin(a);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00F5FF';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,245,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw labels
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const a = i * angleStep - Math.PI / 2;
      const r = maxRS + 24;
      const x = cxS + r * Math.cos(a);
      const y = cyS + r * Math.sin(a);
      ctx.fillStyle = 'rgba(232,232,240,0.7)';
      ctx.fillText(labels[i], x, y);
    }
  }

  /* --- Draw Weekly Chart (Canvas) --- */
  function drawWeeklyChart() {
    const canvas = document.getElementById('dash-weekly');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = Analytics.getWeeklyData();

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.offsetWidth - 40 || 660;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const maxScore = Math.max(10, ...data.map(d => d.score));
    const barW = Math.min(50, (w - 80) / data.length - 10);
    const startX = 40;
    const bottomY = h - 30;
    const chartH = bottomY - 20;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = bottomY - (i / 4) * chartH;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.moveTo(startX, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();

      ctx.font = '10px Outfit';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / 4) * maxScore), startX - 8, y + 3);
    }

    // Bars
    data.forEach((d, i) => {
      const x = startX + i * ((w - startX - 10) / data.length) + ((w - startX - 10) / data.length - barW) / 2;
      const barH = (d.score / maxScore) * chartH;
      const y = bottomY - barH;

      // Gradient bar
      const grad = ctx.createLinearGradient(x, y, x, bottomY);
      grad.addColorStop(0, 'rgba(0, 245, 255, 0.8)');
      grad.addColorStop(1, 'rgba(123, 97, 255, 0.4)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Bar glow
      ctx.shadowColor = 'rgba(0, 245, 255, 0.3)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Day label
      ctx.font = '600 11px Outfit';
      ctx.fillStyle = 'rgba(232,232,240,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(d.day, x + barW / 2, bottomY + 16);

      // Score on top
      if (d.score > 0) {
        ctx.font = '600 10px Orbitron';
        ctx.fillStyle = 'rgba(0,245,255,0.9)';
        ctx.fillText(d.score, x + barW / 2, y - 8);
      }
    });
  }

  /* --- Init charts after render --- */
  function initCharts() {
    requestAnimationFrame(() => {
      drawRadarChart();
      drawWeeklyChart();
    });
  }

  return { render, initCharts, drawRadarChart, drawWeeklyChart };
})();
