/* ============================================
   auth.js — Brain Boost Challenge Auth System
   Multi-user, XP/Level/Coins, Streak, Skills
   ============================================ */
const Auth = (() => {
    const USERS_KEY = 'bb_users';
    const SESSION_KEY = 'bb_session';
    const REMEMBER_KEY = 'bb_remember';

    /* ---------- Default player with full skill model ---------- */
    function defaultPlayer(username, email, passHash, avatar) {
        return {
            username,
            email: email || '',
            passHash: passHash || '',
            avatar: avatar || '🧠',
            age: '',
            education: '',
            interests: [],
            gamesPlayed: 0,
            wins: 0,
            totalScore: 0,
            highestScore: 0,
            xp: 0,
            coins: 0,
            level: 1,
            streak: 0,
            lastLoginDate: new Date().toISOString().split('T')[0],
            brainDominance: { left: 50, right: 50 },
            brainAge: 0,
            onboardingComplete: false,
            difficulty: 'easy',
            skillScores: {
                memory: 0,
                logic: 0,
                creativity: 0,
                focus: 0,
                reaction: 0,
                analysis: 0,
                observation: 0,
                visual: 0
            },
            memoryWins: 0,
            snakeBest: 0,
            quizBest: 0,
            rpsBest: 0,
            tttWins: 0,
            reactionBest: 0,
            colormatchBest: 0,
            mathsprintBest: 0,
            wordscrambleBest: 0,
            whackamoleBest: 0,
            gameScores: {},
            achievements: [],
            activityHistory: [],
            createdAt: Date.now(),
        };
    }

    /* ---------- Simple string hash ---------- */
    function hashPass(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash |= 0;
        }
        return 'h_' + Math.abs(hash).toString(36);
    }

    /* ---------- Users DB ---------- */
    function getAllUsers() {
        // Try new key first, fall back to old
        let d = localStorage.getItem(USERS_KEY);
        if (!d) d = localStorage.getItem('gv_users');
        if (!d) return {};
        try { return JSON.parse(d); } catch (e) { return {}; }
    }

    function saveAllUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    /* ---------- Migration ---------- */
    function migrateOldData() {
        // Migrate from old gv_player
        const old = localStorage.getItem('gv_player');
        if (old) {
            try {
                const p = JSON.parse(old);
                if (p && p.username) {
                    const users = getAllUsers();
                    if (!users[p.username]) {
                        if (p.reactionBest === 9999) p.reactionBest = 0;
                        // Add new fields
                        p.skillScores = p.skillScores || { memory: 0, logic: 0, creativity: 0, focus: 0, reaction: 0, analysis: 0, observation: 0, visual: 0 };
                        p.brainDominance = p.brainDominance || { left: 50, right: 50 };
                        p.brainAge = p.brainAge || 0;
                        p.streak = p.streak || 0;
                        p.lastLoginDate = p.lastLoginDate || new Date().toISOString().split('T')[0];
                        p.onboardingComplete = p.onboardingComplete || false;
                        p.activityHistory = p.activityHistory || [];
                        p.age = p.age || '';
                        p.education = p.education || '';
                        p.interests = p.interests || [];
                        p.difficulty = p.difficulty || 'easy';
                        users[p.username] = p;
                        saveAllUsers(users);
                        localStorage.setItem(SESSION_KEY, p.username);
                    }
                    localStorage.removeItem('gv_player');
                }
            } catch (e) {}
        }

        // Also migrate gv_users to bb_users
        const gvUsers = localStorage.getItem('gv_users');
        if (gvUsers && !localStorage.getItem(USERS_KEY)) {
            try {
                const parsed = JSON.parse(gvUsers);
                Object.values(parsed).forEach(p => {
                    p.skillScores = p.skillScores || { memory: 0, logic: 0, creativity: 0, focus: 0, reaction: 0, analysis: 0, observation: 0, visual: 0 };
                    p.brainDominance = p.brainDominance || { left: 50, right: 50 };
                    p.brainAge = p.brainAge || 0;
                    p.streak = p.streak || 0;
                    p.lastLoginDate = p.lastLoginDate || new Date().toISOString().split('T')[0];
                    p.onboardingComplete = p.onboardingComplete || false;
                    p.activityHistory = p.activityHistory || [];
                    p.age = p.age || '';
                    p.education = p.education || '';
                    p.interests = p.interests || [];
                    p.difficulty = p.difficulty || 'easy';
                });
                saveAllUsers(parsed);
            } catch (e) {}
        }

        // Migrate session keys
        const gvSession = localStorage.getItem('gv_session');
        if (gvSession && !localStorage.getItem(SESSION_KEY)) {
            localStorage.setItem(SESSION_KEY, gvSession);
        }
    }

    /* ---------- Session ---------- */
    function getSessionUser() {
        return localStorage.getItem(SESSION_KEY) || null;
    }

    function getPlayer() {
        const uname = getSessionUser();
        if (!uname) return null;
        const users = getAllUsers();
        const p = users[uname];
        if (!p) return null;
        // Live migration
        if (p.reactionBest === 9999) p.reactionBest = 0;
        if (p.coins === undefined) p.coins = 0;
        if (p.avatar === undefined) p.avatar = '🧠';
        if (p.highestScore === undefined) p.highestScore = 0;
        if (p.colormatchBest === undefined) p.colormatchBest = 0;
        if (p.mathsprintBest === undefined) p.mathsprintBest = 0;
        if (p.wordscrambleBest === undefined) p.wordscrambleBest = 0;
        if (p.whackamoleBest === undefined) p.whackamoleBest = 0;
        if (p.level === undefined) p.level = getLevel(p.xp);
        if (p.gameScores === undefined) p.gameScores = {};
        if (p.achievements === undefined) p.achievements = [];
        if (!p.skillScores) p.skillScores = { memory: 0, logic: 0, creativity: 0, focus: 0, reaction: 0, analysis: 0, observation: 0, visual: 0 };
        if (!p.brainDominance) p.brainDominance = { left: 50, right: 50 };
        if (p.brainAge === undefined) p.brainAge = 0;
        if (p.streak === undefined) p.streak = 0;
        if (!p.lastLoginDate) p.lastLoginDate = new Date().toISOString().split('T')[0];
        if (p.onboardingComplete === undefined) p.onboardingComplete = false;
        if (!p.activityHistory) p.activityHistory = [];
        if (!p.age) p.age = '';
        if (!p.education) p.education = '';
        if (!p.interests) p.interests = [];
        if (!p.difficulty) p.difficulty = 'easy';
        return p;
    }

    function syncProfileToBackend(data) {
        if (!data || typeof API === 'undefined') return;
        API.upsertProfile(data).catch(() => { });
    }

    function savePlayer(data) {
        const uname = getSessionUser();
        if (!uname) return;
        const users = getAllUsers();
        data.totalScore = Number(data.totalScore) || 0;
        data.gamesPlayed = Number(data.gamesPlayed) || 0;
        data.wins = Number(data.wins) || 0;
        data.xp = Number(data.xp) || 0;
        data.coins = Number(data.coins) || 0;
        data.highestScore = Number(data.highestScore) || 0;
        data.level = getLevel(data.xp);
        users[uname] = data;
        saveAllUsers(users);
        syncProfileToBackend(data);
    }

    /* ---------- Register ---------- */
    async function register(username, email, password, avatar) {
        if (!username || !username.trim()) return { ok: false, msg: 'Username is required' };
        username = username.trim();
        if (username.length < 3) return { ok: false, msg: 'Username must be at least 3 characters' };
        if (password && password.length < 4) return { ok: false, msg: 'Password must be at least 4 characters' };

        const users = getAllUsers();
        if (users[username]) return { ok: false, msg: 'Username already taken' };

        if (typeof API !== 'undefined') {
            try {
                await API.register({ username, email, password, avatar: avatar || '🧠' });
            } catch (e) {
                return { ok: false, msg: e.message || 'Registration failed' };
            }
        }

        const ph = password ? hashPass(password) : '';
        users[username] = defaultPlayer(username, email, ph, avatar || '🧠');
        saveAllUsers(users);
        localStorage.setItem(SESSION_KEY, username);
        syncProfileToBackend(users[username]);
        return { ok: true };
    }

    /* ---------- Login ---------- */
    async function login(username, password, remember) {
        if (!username || !username.trim()) return { ok: false, msg: 'Username is required' };
        username = username.trim();
        if (typeof API !== 'undefined') {
            try {
                await API.login({ usernameOrEmail: username, password });
            } catch (e) {
                return { ok: false, msg: e.message || 'Login failed' };
            }
        }
        const users = getAllUsers();

        // Support email login
        let user = users[username];
        if (!user) {
            const byEmail = Object.values(users).find(u => u.email && u.email.toLowerCase() === username.toLowerCase());
            if (byEmail) {
                user = byEmail;
                username = byEmail.username;
            }
        }

        if (!user) return { ok: false, msg: 'User not found. Please register first.' };
        if (user.passHash && password && hashPass(password) !== user.passHash) {
            return { ok: false, msg: 'Incorrect password' };
        }
        if (user.passHash && !password) {
            return { ok: false, msg: 'Password required' };
        }

        // Update streak
        updateStreak(user);
        users[username] = user;
        saveAllUsers(users);

        localStorage.setItem(SESSION_KEY, username);
        if (remember) localStorage.setItem(REMEMBER_KEY, username);
        return { ok: true };
    }

    /* ---------- Streak Logic ---------- */
    function updateStreak(player) {
        const today = new Date().toISOString().split('T')[0];
        const last = player.lastLoginDate || '';
        
        if (last === today) return; // Already logged in today

        const lastDate = new Date(last);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / 86400000);

        if (diffDays === 1) {
            player.streak = (player.streak || 0) + 1;
        } else if (diffDays > 1) {
            player.streak = 1;
        }

        player.lastLoginDate = today;
    }

    /* ---------- Guest ---------- */
    function loginAsGuest() {
        const guestName = 'Guest_' + Math.random().toString(36).slice(2, 7);
        const users = getAllUsers();
        const p = defaultPlayer(guestName, '', '', '👤');
        p.onboardingComplete = true; // Skip onboarding for guests
        users[guestName] = p;
        saveAllUsers(users);
        localStorage.setItem(SESSION_KEY, guestName);
        return guestName;
    }

    /* ---------- Logout ---------- */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        updateNavbar();
    }

    function isLoggedIn() {
        return !!getPlayer();
    }

    /* ---------- Levels / XP ---------- */
    function getLevel(xp) {
        xp = Number(xp) || 0;
        let lv = 1, threshold = 0, step = 200;
        while (xp >= threshold + step) {
            threshold += step;
            lv++;
            step += 100;
        }
        return lv;
    }

    function getXpForLevel(lv) {
        let threshold = 0, step = 200;
        for (let i = 1; i < lv; i++) { threshold += step; step += 100; }
        return threshold;
    }

    function getXpProgress(xp) {
        xp = Number(xp) || 0;
        const lv = getLevel(xp);
        const curr = getXpForLevel(lv);
        const next = getXpForLevel(lv + 1);
        const range = next - curr;
        return range > 0 ? Math.round(((xp - curr) / range) * 100) : 0;
    }

    function addXp(amount) {
        const p = getPlayer();
        if (!p) return;
        const oldLv = getLevel(p.xp);
        p.xp = (Number(p.xp) || 0) + Number(amount);
        p.level = getLevel(p.xp);
        savePlayer(p);
        if (p.level > oldLv) showLevelUp(p.level);
        updateNavbar();
    }

    function addCoins(amount) {
        const p = getPlayer();
        if (!p) return;
        p.coins = (Number(p.coins) || 0) + Number(amount);
        savePlayer(p);
        updateNavbar();
    }

    function getCoins() {
        const p = getPlayer();
        return p ? (Number(p.coins) || 0) : 0;
    }

    /* ---------- Cognitive Skills Update ---------- */
    function updateSkills(skillMap) {
        const p = getPlayer();
        if (!p) return;
        if (!p.skillScores) p.skillScores = {};

        Object.entries(skillMap).forEach(([skill, delta]) => {
            const current = Number(p.skillScores[skill]) || 0;
            // Smooth increase: diminishing returns as score gets higher
            const boost = Math.max(1, Math.round(delta * (1 - current / 150)));
            p.skillScores[skill] = Math.min(100, current + boost);
        });

        savePlayer(p);
    }

    /* ---------- Record game ---------- */
    function recordGame(gameName, score, won) {
        const p = getPlayer();
        if (!p) return;
        score = Number(score) || 0;
        p.gamesPlayed = (Number(p.gamesPlayed) || 0) + 1;
        p.totalScore = (Number(p.totalScore) || 0) + score;
        if (score > (Number(p.highestScore) || 0)) p.highestScore = score;
        if (won) p.wins = (Number(p.wins) || 0) + 1;
        if (!p.gameScores) p.gameScores = {};
        if (!p.gameScores[gameName] || score > Number(p.gameScores[gameName])) {
            p.gameScores[gameName] = score;
        }
        const oldLv = getLevel(p.xp);
        p.xp = (Number(p.xp) || 0) + 10 + (won ? 25 : 0);
        p.level = getLevel(p.xp);
        p.coins = (Number(p.coins) || 0) + 5 + (won ? 15 : 0);

        // Update streak on game play
        updateStreak(p);

        savePlayer(p);
        if (p.level > oldLv) showLevelUp(p.level);
        Leaderboard.update(p.username, p.totalScore, p.gamesPlayed);
        Achievements.checkAndNotify();
        updateNavbar();
    }

    function setAvatar(emoji) {
        const p = getPlayer();
        if (!p) return;
        p.avatar = emoji;
        savePlayer(p);
    }

    /* ---------- Level Up Animation ---------- */
    function showLevelUp(newLevel) {
        const popup = document.createElement('div');
        popup.className = 'levelup-popup';
        popup.innerHTML = `
            <div class="levelup-icon">⬆️</div>
            <div class="levelup-text">LEVEL UP!</div>
            <div class="levelup-level">Level ${newLevel}</div>
        `;
        document.body.appendChild(popup);
        SoundFX.play('win');
        setTimeout(() => popup.remove(), 3500);
    }

    /* ---------- Navbar ---------- */
    function updateNavbar() {
        const p = getPlayer();
        const loginLink = document.getElementById('nav-login-link');
        const userDisplay = document.getElementById('nav-user-display');
        const navUsername = document.getElementById('nav-username');
        const navLevel = document.getElementById('nav-level-badge');
        const navCoins = document.getElementById('nav-coins');
        if (p) {
            if (loginLink) loginLink.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'flex';
            if (navUsername) navUsername.textContent = p.username;
            if (navLevel) navLevel.textContent = 'Lv ' + getLevel(p.xp);
            if (navCoins) navCoins.textContent = '🪙 ' + (Number(p.coins) || 0);
        } else {
            if (loginLink) loginLink.style.display = '';
            if (userDisplay) userDisplay.style.display = 'none';
        }
    }

    /* ---------- Init ---------- */
    migrateOldData();
    if (!getSessionUser()) {
        const rem = localStorage.getItem(REMEMBER_KEY);
        if (rem) localStorage.setItem(SESSION_KEY, rem);
    }
    // Update streak on load
    const currentPlayer = getPlayer();
    if (currentPlayer) {
        updateStreak(currentPlayer);
        savePlayer(currentPlayer);
    }

    return {
        getPlayer, savePlayer, login, register, loginAsGuest, logout,
        isLoggedIn, getLevel, getXpForLevel, getXpProgress,
        addXp, addCoins, getCoins, recordGame, setAvatar, updateNavbar,
        hashPass, getAllUsers, updateSkills, defaultPlayer
    };
})();
