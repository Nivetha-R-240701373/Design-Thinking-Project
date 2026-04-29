/* ============================================
   analytics.js — Brain Boost Analytics Engine
   Session tracking, skill trends, performance summaries
   ============================================ */
const Analytics = (() => {
  
  /* --- Record a game session --- */
  function recordSession(gameId, score, skills, duration) {
    const p = Auth.getPlayer();
    if (!p) return;
    if (!p.activityHistory) p.activityHistory = [];
    
    const session = {
      gameId,
      score: Number(score) || 0,
      skills: skills || [],
      duration: Number(duration) || 0,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    p.activityHistory.push(session);
    
    // Keep last 200 sessions max
    if (p.activityHistory.length > 200) {
      p.activityHistory = p.activityHistory.slice(-200);
    }
    
    Auth.savePlayer(p);
  }
  
  /* --- Get sessions for date range --- */
  function getSessionsForDays(days) {
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory) return [];
    const cutoff = Date.now() - (days * 86400000);
    return p.activityHistory.filter(s => s.timestamp >= cutoff);
  }
  
  /* --- Get today's sessions --- */
  function getTodaySessions() {
    const today = new Date().toISOString().split('T')[0];
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory) return [];
    return p.activityHistory.filter(s => s.date === today);
  }
  
  /* --- Daily performance summary --- */
  function getDailySummary() {
    const sessions = getTodaySessions();
    return {
      gamesPlayed: sessions.length,
      totalScore: sessions.reduce((s, x) => s + x.score, 0),
      avgScore: sessions.length ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length) : 0,
      totalTime: sessions.reduce((s, x) => s + x.duration, 0),
      skillsWorked: [...new Set(sessions.flatMap(s => s.skills))]
    };
  }
  
  /* --- Weekly performance data (last 7 days) --- */
  function getWeeklyData() {
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory) return [];
    
    const result = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = p.activityHistory.filter(s => s.date === dateStr);
      
      result.push({
        day: dayNames[d.getDay()],
        date: dateStr,
        games: daySessions.length,
        score: daySessions.reduce((s, x) => s + x.score, 0),
        avgScore: daySessions.length ? Math.round(daySessions.reduce((s, x) => s + x.score, 0) / daySessions.length) : 0
      });
    }
    
    return result;
  }
  
  /* --- Skill improvement trends --- */
  function getSkillTrends() {
    const p = Auth.getPlayer();
    if (!p || !p.skillScores) return {};
    return { ...p.skillScores };
  }
  
  /* --- Game popularity stats --- */
  function getGamePopularity() {
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory) return [];
    
    const counts = {};
    p.activityHistory.forEach(s => {
      counts[s.gameId] = (counts[s.gameId] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  /* --- Active days count --- */
  function getActiveDays() {
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory) return 0;
    const uniqueDays = new Set(p.activityHistory.map(s => s.date));
    return uniqueDays.size;
  }
  
  /* --- Total play time (minutes) --- */
  function getTotalPlayTime() {
    const p = Auth.getPlayer();
    if (!p || !p.activityHistory) return 0;
    const totalMs = p.activityHistory.reduce((s, x) => s + (x.duration || 0), 0);
    return Math.round(totalMs / 60000);
  }
  
  return {
    recordSession,
    getSessionsForDays,
    getTodaySessions,
    getDailySummary,
    getWeeklyData,
    getSkillTrends,
    getGamePopularity,
    getActiveDays,
    getTotalPlayTime
  };
})();
