/* ============================================
   snake.js — Classic Snake game (fixed)
   ============================================ */
const SnakeGame = (() => {
    const GRID = 20, CELL = 18;
    let snake, food, dir, nextDir, score, speed, interval, gameOver, _keyHandler;

    function init(container) {
        cleanup();
        snake = [{ x: 10, y: 10 }];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        speed = 150;
        gameOver = false;
        placeFood();
        render(container);
        setupControls();
        interval = setInterval(() => tick(container), speed);
        SoundFX.play('gameStart');
    }

    function placeFood() {
        do {
            food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        } while (snake.some(s => s.x === food.x && s.y === food.y));
    }

    function render(container) {
        const W = GRID * CELL;
        container.innerHTML = `
      <div style="margin-bottom:16px;color:var(--text-secondary);">
        Score: <span id="snake-score" style="color:var(--neon-cyan);font-weight:700;">${score}</span>
      </div>
      <canvas id="snake-canvas" class="snake-canvas" width="${W}" height="${W}"></canvas>
      <div class="snake-controls">
        <button class="snake-btn-up" onclick="SnakeGame.setDir(0,-1)">▲</button>
        <button class="snake-btn-left" onclick="SnakeGame.setDir(-1,0)">◀</button>
        <button class="snake-btn-down" onclick="SnakeGame.setDir(0,1)">▼</button>
        <button class="snake-btn-right" onclick="SnakeGame.setDir(1,0)">▶</button>
      </div>
    `;
        draw();
    }

    function draw() {
        const canvas = document.getElementById('snake-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i <= GRID; i++) {
            ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL); ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#ff00aa';
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach((s, i) => {
            const alpha = 1 - (i / snake.length) * 0.5;
            ctx.fillStyle = i === 0 ? '#00f0ff' : `rgba(0,240,255,${alpha})`;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = i === 0 ? 8 : 0;
            ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
            ctx.shadowBlur = 0;
        });
    }

    function tick(container) {
        if (gameOver) return;
        dir = { ...nextDir };
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            return endGame(container);
        }
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            return endGame(container);
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            const scoreEl = document.getElementById('snake-score');
            if (scoreEl) scoreEl.textContent = score;
            placeFood();
            if (speed > 60) {
                speed -= 5;
                clearInterval(interval);
                interval = setInterval(() => tick(container), speed);
            }
        } else {
            snake.pop();
        }
        draw();
    }

    function setupControls() {
        if (_keyHandler) document.removeEventListener('keydown', _keyHandler);
        _keyHandler = (e) => {
            const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
            const d = map[e.key];
            if (d) {
                e.preventDefault();
                if (d[0] !== -dir.x || d[1] !== -dir.y) {
                    nextDir = { x: d[0], y: d[1] };
                }
            }
        };
        document.addEventListener('keydown', _keyHandler);
    }

    function setDir(x, y) {
        if (x !== -dir.x || y !== -dir.y) {
            nextDir = { x, y };
        }
    }

    function endGame(container) {
        if (gameOver) return; // prevent double trigger
        gameOver = true;
        clearInterval(interval);
        if (_keyHandler) { document.removeEventListener('keydown', _keyHandler); _keyHandler = null; }

        Auth.recordGame('snake', score, score >= 50);
        Auth.updateSkills(GAME_SKILL_MAP.snake || {});
        Analytics.recordSession('snake', score, ['focus', 'reaction', 'visual'], 0);
        const p = Auth.getPlayer();
        if (p && score > (p.snakeBest || 0)) {
            p.snakeBest = score;
            Auth.savePlayer(p);
        }
        Achievements.checkAndNotify();
        const daily = DailyChallenge.getToday();
        if (daily.id === 'snake' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();
        if (score >= 50) { GameUtils.confetti(); SoundFX.play('win'); }

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
      <h3>💀 Game Over</h3>
      <div class="final-score">Score: ${score}</div>
      <div style="display:flex;gap:12px;">
        <button class="btn-game btn-restart" onclick="SnakeGame.init(document.querySelector('.game-area'))">Play Again</button>
        <button class="btn-game btn-back" onclick="location.hash='#games'">Back to Games</button>
      </div>
    `;
        const area = document.querySelector('.game-area');
        if (area) { area.style.position = 'relative'; area.appendChild(overlay); }
    }

    function cleanup() {
        clearInterval(interval);
        if (_keyHandler) { document.removeEventListener('keydown', _keyHandler); _keyHandler = null; }
        gameOver = true;
    }

    return { init, setDir, cleanup };
})();
