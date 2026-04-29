/* ============================================
   leaderboard.js — Card-based leaderboard
   ============================================ */
const Leaderboard = (() => {
    const KEY = 'gv_leaderboard';
    const DEFAULTS = [
        { username: 'NeonBlade', score: 820, gamesPlayed: 34 },
        { username: 'PixelQueen', score: 690, gamesPlayed: 28 },
        { username: 'ShadowFox', score: 575, gamesPlayed: 22 },
        { username: 'CyberWolf', score: 450, gamesPlayed: 19 },
        { username: 'StarDust', score: 380, gamesPlayed: 15 },
        { username: 'GlitchRider', score: 310, gamesPlayed: 12 },
        { username: 'VoidWalker', score: 240, gamesPlayed: 10 },
    ];

    let backendLoaded = false;

    function getAll() {
        let data = localStorage.getItem(KEY);
        if (!data) { localStorage.setItem(KEY, JSON.stringify(DEFAULTS)); return [...DEFAULTS]; }
        return JSON.parse(data);
    }

    function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

    async function hydrateFromBackend() {
        if (backendLoaded || typeof API === 'undefined') return;
        backendLoaded = true;
        try {
            const payload = await API.getLeaderboard(10);
            if (!payload || !Array.isArray(payload.items)) return;
            const mapped = payload.items.map((item) => ({
                username: item.username,
                score: Number(item.totalScore || 0),
                gamesPlayed: Number(item.gamesPlayed || 0)
            }));
            if (mapped.length) save(mapped);
        } catch (_) { }
    }

    function update(username, score, gamesPlayed) {
        const list = getAll();
        const idx = list.findIndex(e => e.username === username);
        if (idx >= 0) { list[idx].score = score; list[idx].gamesPlayed = gamesPlayed; }
        else list.push({ username, score, gamesPlayed });
        list.sort((a, b) => b.score - a.score);
        save(list);
    }

    function getTop(n = 10) { return getAll().slice(0, n); }

    function renderCards() {
        const top = getTop(10);
        const trophies = ['🥇', '🥈', '🥉'];
        return `<div class="lb-cards">
      ${top.map((p, i) => {
            const topClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const rankLabel = i < 3 ? trophies[i] : `#${i + 1}`;
            return `<div class="lb-card ${topClass} reveal" style="transition-delay:${i * 0.06}s">
          <div class="lb-rank ${rankClass}">${rankLabel}</div>
          <div class="lb-name">${p.username}</div>
          <div class="lb-score">${p.score} pts</div>
          <div class="lb-games">${p.gamesPlayed} games</div>
        </div>`;
        }).join('')}
    </div>`;
    }

    // Keep old renderTable for compatibility
    function renderTable() { return renderCards(); }

    hydrateFromBackend();
    return { getAll, update, getTop, renderTable, renderCards };
})();
