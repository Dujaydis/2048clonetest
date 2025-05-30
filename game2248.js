const MAX_UNDO = 20;

class Game2248 {
    constructor(size = 6) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2248')) || 0;
        this.gameBoard = document.querySelector('.game-board');
        this.previousStates = [];
        this.isDarkMode = localStorage.getItem('darkMode2248') === 'true';

        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScore();
        this.previousStates = [];

        this.gameBoard.style.setProperty('--grid-size', this.size);
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'tile';
            cell.dataset.index = i;
            this.gameBoard.appendChild(cell);
        }

        this.addRandomTile();
        this.addRandomTile();
        this.updateGrid();
    }

    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) empty.push({ x: i, y: j });
            }
        }
        if (empty.length === 0) return;
        const { x, y } = empty[Math.floor(Math.random() * empty.length)];
        this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        const tile = this.gameBoard.children[x * this.size + y];
        tile.classList.add('tile-new');
        setTimeout(() => tile.classList.remove('tile-new'), 200);
    }

    updateGrid() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                const tile = this.gameBoard.children[i * this.size + j];
                if (tile.dataset.value !== String(value)) {
                    tile.innerHTML = value ? `<div class="tile-inner">${value}</div>` : '';
                    tile.className = `tile ${value ? 'tile-' + value : ''}`;
                    tile.dataset.value = value;
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2248', this.bestScore);
        }
        document.getElementById('best-score').textContent = this.bestScore;
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.init());
        document.getElementById('undo').addEventListener('click', () => this.undo());
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode2248', this.isDarkMode);
        });

        let dragging = false;
        let chain = [];
        const getCoords = index => ({ x: Math.floor(index / this.size), y: index % this.size });

        this.gameBoard.addEventListener('pointerdown', e => {
            const tile = e.target.closest('.tile');
            if (!tile) return;
            const index = parseInt(tile.dataset.index);
            const { x, y } = getCoords(index);
            const value = this.grid[x][y];
            if (value === 0) return;
            dragging = true;
            chain = [{ x, y, tile }];
            tile.classList.add('selected');
            e.preventDefault();
        });

        this.gameBoard.addEventListener('pointermove', e => {
            if (!dragging) return;
            const tile = e.target.closest('.tile');
            if (!tile) return;
            const index = parseInt(tile.dataset.index);
            const { x, y } = getCoords(index);
            const last = chain[chain.length - 1];
            if (x === last.x && y === last.y) return;
            const value = this.grid[x][y];
            if (value === 0) return;
            if (value !== this.grid[last.x][last.y]) return;
            if (Math.abs(x - last.x) + Math.abs(y - last.y) !== 1) return;
            if (chain.some(c => c.x === x && c.y === y)) return;
            chain.push({ x, y, tile });
            tile.classList.add('selected');
        });

        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            chain.forEach(c => c.tile.classList.remove('selected'));
            if (chain.length >= 2) {
                this.mergeChain(chain);
            }
            chain = [];
        };

        this.gameBoard.addEventListener('pointerup', endDrag);
        this.gameBoard.addEventListener('pointerleave', endDrag);
    }

    mergeChain(chain) {
        this.previousStates.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        });
        if (this.previousStates.length > MAX_UNDO) this.previousStates.shift();

        const value = this.grid[chain[0].x][chain[0].y];
        const total = value * chain.length;
        const last = chain[chain.length - 1];
        chain.forEach(({ x, y }) => { this.grid[x][y] = 0; });
        this.grid[last.x][last.y] = total;
        this.score += total;
        this.addRandomTile();
        this.updateGrid();
        this.updateScore();
        if (this.isGameOver()) this.showGameState('over');
    }

    undo() {
        const prev = this.previousStates.pop();
        if (!prev) return;
        this.grid = prev.grid;
        this.score = prev.score;
        this.updateGrid();
        this.updateScore();
    }

    isGameOver() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const v = this.grid[i][j];
                if (i > 0 && this.grid[i - 1][j] === v) return false;
                if (i < this.size - 1 && this.grid[i + 1][j] === v) return false;
                if (j > 0 && this.grid[i][j - 1] === v) return false;
                if (j < this.size - 1 && this.grid[i][j + 1] === v) return false;
            }
        }
        return true;
    }

    showGameState(state) {
        const overlay = document.createElement('div');
        overlay.className = 'game-state-overlay';
        overlay.innerHTML = `
            <div class="game-state-message">
                <h2>${state === 'win' ? 'You Win!' : 'Game Over!'}</h2>
                <button class="new-game-btn">Try Again</button>
            </div>`;
        overlay.querySelector('.new-game-btn').addEventListener('click', () => {
            this.gameBoard.removeChild(overlay);
            this.init();
        });
        this.gameBoard.appendChild(overlay);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game2248();
});
