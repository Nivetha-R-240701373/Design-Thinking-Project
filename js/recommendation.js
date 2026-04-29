/* ============================================
   recommendation.js — Smart Game Recommendations
   Mood-based, skill-based, and brain age calculator
   ============================================ */
const Recommendation = (() => {

  /* --- Skill-to-game mapping --- */
  const SKILL_GAMES = {
    memory: ['memory', 'colormatch'],
    logic: ['quiz', 'mathsprint', 'tictactoe'],
    creativity: ['wordscramble', 'colormatch'],
    focus: ['snake', 'whackamole'],
    reaction: ['reaction', 'whackamole'],
    analysis: ['quiz', 'mathsprint'],
    observation: ['memory', 'colormatch'],
    visual: ['colormatch', 'snake']
  };

  /* --- Mood-to-game mapping --- */
  const MOOD_GAMES = {
    happy: { games: ['whackamole', 'rps', 'memory'], msg: 'Keep the vibes going! Try these fun games 🎉' },
    stressed: { games: ['memory', 'snake', 'colormatch'], msg: 'Let\'s relax your mind with calming games 🧘' },
    tired: { games: ['reaction', 'rps', 'quiz'], msg: 'Quick and easy games to wake you up ☕' },
    focused: { games: ['mathsprint', 'quiz', 'wordscramble'], msg: 'Channel that focus into intense brain training! 🎯' }
  };

  /* --- Get weak skills (bottom 3) --- */
  function getWeakSkills() {
    const p = Auth.getPlayer();
    if (!p || !p.skillScores) return [];
    const entries = Object.entries(p.skillScores);
    entries.sort((a, b) => a[1] - b[1]);
    return entries.slice(0, 3).map(e => e[0]);
  }

  /* --- Get strong skills (top 3) --- */
  function getStrongSkills() {
    const p = Auth.getPlayer();
    if (!p || !p.skillScores) return [];
    const entries = Object.entries(p.skillScores);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 3).map(e => e[0]);
  }

  /* --- Recommend games based on weak skills --- */
  function getSkillRecommendations() {
    const weak = getWeakSkills();
    const recommended = new Set();
    const reasons = {};

    weak.forEach(skill => {
      const games = SKILL_GAMES[skill] || [];
      games.forEach(g => {
        recommended.add(g);
        if (!reasons[g]) reasons[g] = [];
        reasons[g].push(skill);
      });
    });

    return Array.from(recommended).map(id => ({
      id,
      reasons: reasons[id] || []
    }));
  }

  /* --- Mood-based recommendations --- */
  function getMoodRecommendations(mood) {
    const data = MOOD_GAMES[mood] || MOOD_GAMES.happy;
    return {
      games: data.games,
      message: data.msg
    };
  }

  /* --- Brain Age Calculator --- */
  function calculateBrainAge() {
    const p = Auth.getPlayer();
    if (!p || !p.skillScores) return null;

    const realAge = parseInt(p.age) || 20;
    const skills = p.skillScores;
    const totalSkill = Object.values(skills).reduce((s, v) => s + v, 0);
    const avgSkill = totalSkill / Object.keys(skills).length;

    // Higher skills = younger brain age
    // Base: real age, adjust by +/- up to 10 years based on performance
    const maxScore = 100;
    const skillRatio = Math.min(avgSkill / maxScore, 1);
    const adjustment = Math.round((0.5 - skillRatio) * 20);
    const brainAge = Math.max(10, realAge + adjustment);

    // Save
    p.brainAge = brainAge;
    Auth.savePlayer(p);

    return {
      realAge,
      brainAge,
      difference: realAge - brainAge,
      skillAvg: Math.round(avgSkill)
    };
  }

  /* --- Get recommended difficulty --- */
  function getAdaptiveDifficulty(gameId) {
    const p = Auth.getPlayer();
    if (!p) return 'easy';

    const history = (p.activityHistory || []).filter(s => s.gameId === gameId);
    const recent = history.slice(-5);

    if (recent.length < 3) return 'easy';

    const avgScore = recent.reduce((s, x) => s + x.score, 0) / recent.length;

    if (avgScore > 80) return 'expert';
    if (avgScore > 60) return 'hard';
    if (avgScore > 40) return 'medium';
    return 'easy';
  }

  /* --- Coach messages --- */
  function getCoachMessage() {
    const p = Auth.getPlayer();
    if (!p) return { icon: '🤖', msg: 'Welcome! Start training to get personalized advice.' };

    const weak = getWeakSkills();
    const strong = getStrongSkills();
    const today = Analytics.getTodaySessions();
    const streak = p.streak || 0;

    const messages = [];

    if (today.length === 0) {
      messages.push({ icon: '🎯', msg: 'You haven\'t trained today yet! Start with a quick game to keep your streak going.' });
    } else if (today.length < 3) {
      messages.push({ icon: '💪', msg: `Good start! You've played ${today.length} game${today.length > 1 ? 's' : ''} today. Try to reach 3 for maximum benefit!` });
    } else {
      messages.push({ icon: '🌟', msg: `Amazing! ${today.length} games today! Your brain is getting a great workout!` });
    }

    if (weak.length > 0) {
      messages.push({ icon: '📊', msg: `Your ${weak[0]} skill could use some work. Try games that train ${weak[0]}!` });
    }

    if (strong.length > 0) {
      messages.push({ icon: '🏆', msg: `You're strong in ${strong[0]}! Keep it up and try to improve other areas too.` });
    }

    if (streak >= 7) {
      messages.push({ icon: '🔥', msg: `${streak}-day streak! You're building excellent habits. Keep going!` });
    } else if (streak >= 3) {
      messages.push({ icon: '⚡', msg: `${streak}-day streak! You're on a roll!` });
    }

    return messages[Math.floor(Math.random() * messages.length)] || messages[0];
  }

  return {
    getWeakSkills,
    getStrongSkills,
    getSkillRecommendations,
    getMoodRecommendations,
    calculateBrainAge,
    getAdaptiveDifficulty,
    getCoachMessage,
    SKILL_GAMES,
    MOOD_GAMES
  };
})();
