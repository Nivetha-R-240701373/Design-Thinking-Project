/* ============================================
achievements.js — Brain Boost Achievement System
============================================ */
const Achievements = (() => {
    const DEFINITIONS = [
        // Original achievements
        { id: 'first_game', name: 'First Game Played', desc: 'Play your first game', icon: '🎮', condition: d => d.gamesPlayed >= 1 },
        { id: 'first_win', name: 'First Victory', desc: 'Win a game for the first time', icon: '🏆', condition: d => d.wins >= 1 },
        { id: 'score_100', name: 'Century Club', desc: 'Score 100 total points', icon: '💯', condition: d => d.totalScore >= 100 },
        { id: 'score_500', name: 'Score Legend', desc: 'Score 500 total points', icon: '⭐', condition: d => d.totalScore >= 500 },
        { id: 'score_1000', name: 'Point Master', desc: 'Score 1000 total points', icon: '🌟', condition: d => d.totalScore >= 1000 },
        { id: 'play_10', name: 'Dedicated Trainer', desc: 'Play 10 games', icon: '🔥', condition: d => d.gamesPlayed >= 10 },
        { id: 'play_25', name: 'Brain Addict', desc: 'Play 25 games', icon: '💥', condition: d => d.gamesPlayed >= 25 },
        { id: 'play_50', name: 'Unstoppable Mind', desc: 'Play 50 games', icon: '🚀', condition: d => d.gamesPlayed >= 50 },
        { id: 'win_10', name: 'Champion', desc: 'Win 10 games', icon: '👑', condition: d => d.wins >= 10 },
        { id: 'win_25', name: 'Grandmaster', desc: 'Win 25 games', icon: '🎖️', condition: d => d.wins >= 25 },
        { id: 'coins_100', name: 'Coin Collector', desc: 'Earn 100 coins', icon: '🪙', condition: d => (d.coins || 0) >= 100 },
        { id: 'coins_500', name: 'Treasure Hunter', desc: 'Earn 500 coins', icon: '💰', condition: d => (d.coins || 0) >= 500 },
        { id: 'memory_master', name: 'Memory Master', desc: 'Complete Memory Match', icon: '🧠', condition: d => d.memoryWins >= 1 },
        { id: 'snake_survivor', name: 'Snake Survivor', desc: 'Score 50+ in Snake', icon: '🐍', condition: d => d.snakeBest >= 50 },
        { id: 'quiz_ace', name: 'Quiz Ace', desc: 'Score 80+ in Quiz', icon: '📚', condition: d => (d.quizBest || 0) >= 80 },
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Reaction time under 250ms', icon: '⚡', condition: d => d.reactionBest > 0 && d.reactionBest < 250 },
        
        // New Brain Boost achievements
        { id: 'brain_beginner', name: 'Brain Beginner', desc: 'Complete the Brain Dominance Test', icon: '🧩', condition: d => d.onboardingComplete === true },
        { id: 'logic_master', name: 'Logic Master', desc: 'Reach 50+ in logic skill', icon: '🔬', condition: d => d.skillScores && d.skillScores.logic >= 50 },
        { id: 'memory_genius', name: 'Memory Genius', desc: 'Reach 50+ in memory skill', icon: '💡', condition: d => d.skillScores && d.skillScores.memory >= 50 },
        { id: 'speed_thinker', name: 'Speed Thinker', desc: 'Reach 50+ in reaction skill', icon: '⚡', condition: d => d.skillScores && d.skillScores.reaction >= 50 },
        { id: 'puzzle_champion', name: 'Puzzle Champion', desc: 'Reach 50+ in analysis skill', icon: '🏅', condition: d => d.skillScores && d.skillScores.analysis >= 50 },
        { id: 'streak_3', name: 'Habit Builder', desc: 'Maintain a 3-day streak', icon: '🔥', condition: d => (d.streak || 0) >= 3 },
        { id: 'streak_7', name: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: '💪', condition: d => (d.streak || 0) >= 7 },
        { id: 'streak_30', name: 'Brain Champion', desc: 'Maintain a 30-day streak', icon: '🏆', condition: d => (d.streak || 0) >= 30 },
        { id: 'all_skills', name: 'Well Rounded', desc: 'All skills above 20', icon: '🌈', condition: d => d.skillScores && Object.values(d.skillScores).every(v => v >= 20) },
        { id: 'young_brain', name: 'Young Mind', desc: 'Brain age younger than real age', icon: '🧒', condition: d => d.brainAge > 0 && d.age && d.brainAge < parseInt(d.age) },
    ];

    function getPlayerData() {
        const p = Auth.getPlayer();
        return p || {};
    }

    function getUnlocked() {
        const p = Auth.getPlayer();
        return (p && p.achievements) ? p.achievements : [];
    }

    function saveUnlocked(list) {
        const p = Auth.getPlayer();
        if (!p) return;
        p.achievements = list;
        Auth.savePlayer(p);
    }

    function check() {
        const data = getPlayerData();
        const unlocked = [...getUnlocked()];
        const newlyUnlocked = [];
        DEFINITIONS.forEach(a => {
            if (!unlocked.includes(a.id) && a.condition(data)) {
                unlocked.push(a.id);
                newlyUnlocked.push(a);
            }
        });
        if (newlyUnlocked.length > 0) saveUnlocked(unlocked);
        return newlyUnlocked;
    }

    function showPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
    <div class="achieve-icon">${achievement.icon}</div>
    <div>
        <div class="achieve-label">Achievement Unlocked!</div>
        <div class="achieve-name">${achievement.name}</div>
    </div>
    `;
        document.body.appendChild(popup);
        SoundFX.play('win');
        setTimeout(() => popup.remove(), 4200);
    }

    function checkAndNotify() {
        const newOnes = check();
        newOnes.forEach((a, i) => {
            setTimeout(() => showPopup(a), i * 600);
        });
    }

    function renderAchievementsGrid() {
        const unlocked = getUnlocked();
        return DEFINITIONS.map(a => {
            const isUnlocked = unlocked.includes(a.id);
            return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
        </div>
    `;
        }).join('');
    }

    return { DEFINITIONS, check, checkAndNotify, getUnlocked, renderAchievementsGrid };
})();
