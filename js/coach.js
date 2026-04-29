/* ============================================
   coach.js — AI Brain Coach Page
   Training plans, tips, progress insights
   ============================================ */
const Coach = (() => {

  /* --- Training plans based on profile --- */
  function getTrainingPlan() {
    const p = Auth.getPlayer();
    if (!p) return [];
    const weak = Recommendation.getWeakSkills();
    const plans = [];
    const skillGames = Recommendation.SKILL_GAMES;

    weak.forEach(skill => {
      const games = (skillGames[skill] || []).slice(0, 2);
      plans.push({
        skill,
        games,
        message: `Your ${skill} needs improvement. Play ${games.length} recommended games.`,
        priority: p.skillScores[skill] < 20 ? 'high' : 'medium'
      });
    });

    return plans;
  }

  /* --- Daily tips pool --- */
  const TIPS = [
    { icon: '💡', tip: 'Playing memory games before studying can improve information retention by up to 30%.' },
    { icon: '🧘', tip: 'Take short breaks between training sessions. Your brain consolidates learning during rest.' },
    { icon: '💤', tip: 'Sleep is crucial for memory. Aim for 7-9 hours to maximize cognitive performance.' },
    { icon: '🏃', tip: 'Physical exercise boosts brain-derived neurotrophic factor (BDNF), which helps grow new neurons.' },
    { icon: '🥗', tip: 'Foods rich in omega-3 fatty acids, like fish and walnuts, support brain health.' },
    { icon: '🎵', tip: 'Listening to music while doing spatial or logic tasks can enhance performance.' },
    { icon: '💧', tip: 'Even mild dehydration can impair concentration. Keep a water bottle nearby while training.' },
    { icon: '📖', tip: 'Reading fiction improves empathy and theory of mind — a key cognitive skill.' },
    { icon: '🧩', tip: 'Variety is key! Training different skills prevents cognitive plateaus.' },
    { icon: '⏰', tip: 'The brain is most alert 2-4 hours after waking. Schedule challenging tasks then.' },
    { icon: '🌿', tip: 'Spending time in nature reduces mental fatigue and restores attention capacity.' },
    { icon: '📱', tip: 'Reduce screen time before bed. Blue light disrupts melatonin and impairs sleep quality.' },
  ];

  function getDailyTip() {
    const dayIdx = Math.floor(Date.now() / 86400000) % TIPS.length;
    return TIPS[dayIdx];
  }

  /* --- Progress insights --- */
  function getInsights() {
    const p = Auth.getPlayer();
    if (!p) return [];
    const insights = [];
    const total = Analytics.getTotalPlayTime();
    const days = Analytics.getActiveDays();
    const weekly = Analytics.getWeeklyData();
    const todayGames = Analytics.getTodaySessions().length;

    if (total > 60) insights.push({ icon: '⏱️', text: `You've trained for ${total} minutes total. That's ${Math.floor(total / 60)} hours of brain improvement!` });
    else if (total > 0) insights.push({ icon: '⏱️', text: `${total} minutes of total training. Keep building that habit!` });

    if (days > 7) insights.push({ icon: '📅', text: `Active on ${days} different days. Consistency is the key to cognitive growth!` });
    else if (days > 0) insights.push({ icon: '📅', text: `Active on ${days} day${days > 1 ? 's' : ''}. Try to train at least 3 times a week.` });

    const weekTotal = weekly.reduce((s, d) => s + d.games, 0);
    if (weekTotal > 20) insights.push({ icon: '📈', text: `${weekTotal} games this week! You're a training machine!` });
    else if (weekTotal > 5) insights.push({ icon: '📈', text: `${weekTotal} games this week. Aim for 3+ games per day for optimal results.` });

    if (todayGames === 0) insights.push({ icon: '🎯', text: 'No training today yet. Even a single game makes a difference!' });
    else if (todayGames >= 5) insights.push({ icon: '🌟', text: `${todayGames} games today! Outstanding dedication!` });

    const skills = p.skillScores || {};
    const maxSkill = Object.entries(skills).sort((a, b) => b[1] - a[1])[0];
    const minSkill = Object.entries(skills).sort((a, b) => a[1] - b[1])[0];
    if (maxSkill && maxSkill[1] > 30) insights.push({ icon: '💪', text: `Your strongest skill is ${maxSkill[0]} (${maxSkill[1]}). Keep pushing!` });
    if (minSkill && maxSkill && maxSkill[1] - minSkill[1] > 30) insights.push({ icon: '⚖️', text: `Big gap between ${maxSkill[0]} and ${minSkill[0]}. Try balancing your training.` });

    return insights.slice(0, 5);
  }

  /* --- Render coach page --- */
  function render() {
    const p = Auth.getPlayer();
    if (!p) return '<div class="page login-page"><div class="auth-card"><h2 class="auth-title">Brain Coach</h2><p class="auth-subtitle">Log in to access your personal coach.</p><button class="auth-btn primary" onclick="location.hash=\'#login\'">Login</button></div></div>';

    const tip = getDailyTip();
    const plans = getTrainingPlan();
    const insights = getInsights();
    const brainAge = Recommendation.calculateBrainAge();
    const streak = p.streak || 0;

    return `<div class="page"><section class="section">
      <h2 class="section-title reveal">🤖 AI Brain Coach</h2>
      <p class="section-subtitle reveal">Your personalized cognitive training advisor</p>

      <!-- Daily Tip -->
      <div class="coach-tip-card reveal">
        <div class="coach-tip-icon">${tip.icon}</div>
        <div class="coach-tip-content">
          <div class="coach-tip-label">💡 Brain Tip of the Day</div>
          <div class="coach-tip-text">${tip.tip}</div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="coach-stats reveal">
        <div class="coach-stat"><span class="coach-stat-val">${streak}</span><span class="coach-stat-lbl">🔥 Streak</span></div>
        <div class="coach-stat"><span class="coach-stat-val">${brainAge ? brainAge.brainAge : '?'}</span><span class="coach-stat-lbl">🧠 Brain Age</span></div>
        <div class="coach-stat"><span class="coach-stat-val">${Analytics.getTodaySessions().length}</span><span class="coach-stat-lbl">🎮 Today</span></div>
        <div class="coach-stat"><span class="coach-stat-val">${Analytics.getTotalPlayTime()}</span><span class="coach-stat-lbl">⏱️ Minutes</span></div>
      </div>

      <!-- Training Plan -->
      <div class="coach-section reveal">
        <h3 class="dash-panel-title">📋 Your Training Plan</h3>
        ${plans.length === 0 ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">Play more games to get a training plan!</p>' : ''}
        <div class="coach-plans">
          ${plans.map(pl => `<div class="coach-plan-card priority-${pl.priority}">
            <div class="coach-plan-skill">${pl.skill.charAt(0).toUpperCase() + pl.skill.slice(1)}</div>
            <div class="coach-plan-msg">${pl.message}</div>
            <div class="coach-plan-games">${pl.games.map(g => {
              const def = GAME_DEFS.find(d => d.id === g);
              return def ? `<button class="coach-game-btn" onclick="location.hash='#game/${g}'">${def.icon} ${def.name}</button>` : '';
            }).join('')}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Progress Insights -->
      <div class="coach-section reveal">
        <h3 class="dash-panel-title">📊 Progress Insights</h3>
        ${insights.length === 0 ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">Start training to unlock insights!</p>' : ''}
        <div class="coach-insights">
          ${insights.map(ins => `<div class="coach-insight-card">
            <div class="coach-insight-icon">${ins.icon}</div>
            <div class="coach-insight-text">${ins.text}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="coach-actions reveal">
        <button class="hero-btn" onclick="location.hash='#quick-boost'" style="padding:14px 36px;font-size:.85rem;">⚡ Quick Brain Boost</button>
        <button class="hero-btn" onclick="location.hash='#dashboard'" style="padding:14px 36px;font-size:.85rem;background:linear-gradient(135deg,var(--neon-purple),var(--neon-pink));">📊 View Dashboard</button>
      </div>
    </section></div>`;
  }

  return { render, getDailyTip, getTrainingPlan, getInsights };
})();
