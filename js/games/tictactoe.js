/* ============================================
   tictactoe.js — Tic Tac Toe vs Computer AI
   ============================================ */
const TicTacToeGame = (() => {
    let board, playerTurn, gameActive, scores;

    function init(container) {
        board = Array(9).fill('');
        playerTurn = true;
        gameActive = true;
        scores = scores || { player: 0, computer: 0, draws: 0 };
        SoundFX.play('gameStart');
        render(container);
    }

    function render(container) {
        container.innerHTML = `
      <div class="ttt-status" id="ttt-status">Your turn (X)</div>
      <div class="ttt-board" id="ttt-board">
        ${board.map((cell, i) => `<div class="ttt-cell ${cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''}" data-idx="${i}">${cell}</div>`).join('')}
      </div>
      <div style="margin-top:20px;display:flex;gap:24px;justify-content:center;color:var(--text-secondary);font-size:0.85rem;">
        <span>You: <b style="color:var(--neon-cyan);">${scores.player}</b></span>
        <span>Draws: <b>${scores.draws}</b></span>
        <span>CPU: <b style="color:var(--neon-pink);">${scores.computer}</b></span>
      </div>
    `;
        container.querySelectorAll('.ttt-cell').forEach(cell => {
            cell.addEventListener('click', () => handleClick(cell, container));
        });
    }

    function handleClick(cell, container) {
        if (!gameActive || !playerTurn) return;
        const idx = parseInt(cell.dataset.idx);
        if (board[idx]) return;

        board[idx] = 'X';
        playerTurn = false;
        SoundFX.play('click');
        render(container);

        const winner = checkWinner();
        if (winner) return endRound(container, winner);
        if (board.every(c => c)) return endRound(container, 'draw');

        setTimeout(() => {
            cpuMove();
            render(container);
            const w = checkWinner();
            if (w) return endRound(container, w);
            if (board.every(c => c)) return endRound(container, 'draw');
            playerTurn = true;
            document.getElementById('ttt-status').textContent = 'Your turn (X)';
        }, 500);
    }

    function cpuMove() {
        const winMove = findBestMove('O');
        if (winMove !== -1) { board[winMove] = 'O'; return; }
        const blockMove = findBestMove('X');
        if (blockMove !== -1) { board[blockMove] = 'O'; return; }
        if (!board[4]) { board[4] = 'O'; return; }
        const empty = board.map((c, i) => c === '' ? i : -1).filter(i => i >= 0);
        if (empty.length > 0) {
            board[empty[Math.floor(Math.random() * empty.length)]] = 'O';
        }
    }

    function findBestMove(mark) {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (const line of lines) {
            const cells = line.map(i => board[i]);
            if (cells.filter(c => c === mark).length === 2 && cells.includes('')) {
                return line[cells.indexOf('')];
            }
        }
        return -1;
    }

    function checkWinner() {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (const line of lines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
        }
        return null;
    }

    function endRound(container, result) {
        gameActive = false;
        let msg;
        if (result === 'X') { msg = '🎉 You Win!'; scores.player++; }
        else if (result === 'O') { msg = '🤖 Computer Wins!'; scores.computer++; }
        else { msg = "🤝 It's a Draw!"; scores.draws++; }

        const won = result === 'X';
        Auth.recordGame('tictactoe', won ? 30 : 5, won);
        Auth.updateSkills(GAME_SKILL_MAP.tictactoe || {});
        Analytics.recordSession('tictactoe', won ? 30 : 5, ['logic', 'analysis'], 0);
        if (won) {
            const p = Auth.getPlayer();
            if (p) { p.tttWins = (p.tttWins || 0) + 1; Auth.savePlayer(p); }
            GameUtils.confetti();
            SoundFX.play('win');
        }
        const daily = DailyChallenge.getToday();
        if (daily.id === 'tictactoe' && !DailyChallenge.hasCompletedToday()) DailyChallenge.markCompleted();

        const status = document.getElementById('ttt-status');
        if (status) { status.textContent = msg; status.style.color = won ? 'var(--neon-green)' : result === 'O' ? 'var(--neon-pink)' : 'var(--neon-gold)'; }

        setTimeout(() => init(container), 2000);
    }

    return { init };
})();
