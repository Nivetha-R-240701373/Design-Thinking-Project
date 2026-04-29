/* ============================================
dailyChallenge.js — Daily challenge system
============================================ */
const DailyChallenge = (() => {
    const GAMES = [
        { id: 'quiz', name: 'Quiz Challenge', icon: '🧠' },
        { id: 'memory', name: 'Memory Card Match', icon: '🃏' },
        { id: 'snake', name: 'Snake Game', icon: '🐍' },
        { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌' },
        { id: 'rps', name: 'Rock Paper Scissors', icon: '✊' },
        { id: 'reaction', name: 'Reaction Time', icon: '⚡' },
        { id: 'colormatch', name: 'Color Match', icon: '🎨' },
        { id: 'mathsprint', name: 'Math Sprint', icon: '🧮' },
        { id: 'wordscramble', name: 'Word Scramble', icon: '📝' },
        { id: 'whackamole', name: 'Whack-a-Mole', icon: '🎯' },
    ];

    const BONUS_XP = 50;

    function getTodayIndex() {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        return dayOfYear % GAMES.length;
    }

    function getToday() {
        return GAMES[getTodayIndex()];
    }

    function getCountdown() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow - now;
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function hasCompletedToday() {
        const key = 'gv_daily_' + new Date().toISOString().slice(0, 10);
        return localStorage.getItem(key) === 'done';
    }

    function markCompleted() {
        const key = 'gv_daily_' + new Date().toISOString().slice(0, 10);
        localStorage.setItem(key, 'done');
        Auth.addXp(BONUS_XP);
    }

    function renderSection() {
        const today = getToday();
        const completed = hasCompletedToday();
        return `
    <div class="daily-challenge">
        <div class="daily-badge">⚡ Daily Challenge</div>
        <div class="daily-game-name">${today.icon} ${today.name}</div>
        <div class="daily-reward">Reward: +${BONUS_XP} XP</div>
        ${completed
                ? '<div style="color:var(--neon-green);font-weight:700;">✅ Completed Today!</div>'
                : `<button class="hero-btn" onclick="location.hash='#game/${today.id}'" style="margin-top:12px;padding:12px 36px;font-size:0.9rem;">Play Challenge</button>`
            }
        <div class="daily-countdown" style="margin-top:16px;">Next challenge in: <span id="daily-timer">${getCountdown()}</span></div>
    </div>
    `;
    }

    // Update countdown timer every second
    function startTimer() {
        setInterval(() => {
            const el = document.getElementById('daily-timer');
            if (el) el.textContent = getCountdown();
        }, 1000);
    }

    return { getToday, hasCompletedToday, markCompleted, renderSection, startTimer, BONUS_XP };
})();
