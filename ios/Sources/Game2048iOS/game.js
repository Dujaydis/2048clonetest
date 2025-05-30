const BOARD_SIZE = 6;
const TILE_VALUES = [2, 4, 8];

class Game2248 {
  constructor() {
    this.size = BOARD_SIZE;
    this.grid = [];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
    this.maxTile = parseInt(localStorage.getItem('maxTile')) || 0;
    this.gameBoard = document.querySelector('.game-board');
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    this.init();
    this.setupEventListeners();
  }

  init() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.score = 0;
    this.updateScore();
    this.updateMaxTile();
    this.gameBoard.innerHTML = '';

    for (let i = 0; i < this.size * this.size; i++) {
      const cell = document.createElement('div');
      cell.className = 'tile';
      this.gameBoard.appendChild(cell);
    }

    for (let i = 0; i < 5; i++) {
      this.addRandomTile();
    }
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
    const r = Math.random();
    let value = 2;
    if (r < 0.4) value = 2; else if (r < 0.7) value = 4; else value = 8;
    this.grid[x][y] = value;
  }

  updateGrid() {
    const tiles = this.gameBoard.children;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const val = this.grid[i][j];
        const tile = tiles[i * this.size + j];
        tile.textContent = val ? val : '';
        tile.className = `tile ${val ? 'tile-' + val : ''}`;
      }
    }
  }

  updateScore() {
    document.getElementById('score').textContent = this.score;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore);
    }
    document.getElementById('best-score').textContent = this.bestScore;
  }

  updateMaxTile() {
    let max = 0;
    for (const row of this.grid) {
      for (const v of row) if (v > max) max = v;
    }
    this.maxTile = max;
    localStorage.setItem('maxTile', this.maxTile);
    document.getElementById('max-tile').textContent = this.maxTile;
  }

  setupEventListeners() {
    document.getElementById('new-game').addEventListener('click', () => this.init());
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', this.isDarkMode);
    });

    this.gameBoard.addEventListener('pointerdown', (e) => this.startChain(e));
    this.gameBoard.addEventListener('pointermove', (e) => this.extendChain(e));
    document.addEventListener('pointerup', () => this.endChain());
  }

  startChain(e) {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    const index = Array.prototype.indexOf.call(this.gameBoard.children, tile);
    const x = Math.floor(index / this.size);
    const y = index % this.size;
    const value = this.grid[x][y];
    if (!value) return;

    this.chain = [{ x, y }];
    this.chainValue = value;
    tile.classList.add('tile-selected');
    this.selecting = true;
    e.preventDefault();
  }

  extendChain(e) {
    if (!this.selecting) return;
    const tile = e.target.closest('.tile');
    if (!tile) return;
    const index = Array.prototype.indexOf.call(this.gameBoard.children, tile);
    const x = Math.floor(index / this.size);
    const y = index % this.size;
    if (this.grid[x][y] !== this.chainValue) return;
    const last = this.chain[this.chain.length - 1];
    if (this.chain.some(c => c.x === x && c.y === y)) return;
    if (Math.abs(x - last.x) <= 1 && Math.abs(y - last.y) <= 1) {
      this.chain.push({ x, y });
      tile.classList.add('tile-selected');
    }
    e.preventDefault();
  }

  endChain() {
    if (!this.selecting) return;
    this.selecting = false;
    const tiles = this.gameBoard.children;
    for (const c of this.chain) {
      tiles[c.x * this.size + c.y].classList.remove('tile-selected');
    }
    if (this.chain.length < 2) {
      this.chain = [];
      return;
    }

    const sum = this.chain.length * this.chainValue;
    const last = this.chain[this.chain.length - 1];
    for (let i = 0; i < this.chain.length - 1; i++) {
      const { x, y } = this.chain[i];
      this.grid[x][y] = 0;
    }
    this.grid[last.x][last.y] = sum;
    this.score += sum;

    for (let i = 1; i < this.chain.length; i++) {
      this.addRandomTile();
    }

    const prevMax = this.maxTile;
    this.updateMaxTile();
    if (this.maxTile > prevMax) {
      this.removeLowestTiles();
    }

    this.updateGrid();
    this.updateScore();
    if (!this.hasMoves()) {
      this.showGameOver();
    }
    this.chain = [];
  }

  removeLowestTiles() {
    let min = Infinity;
    for (const row of this.grid) {
      for (const v of row) if (v && v < min) min = v;
    }
    if (!isFinite(min)) return;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] === min) this.grid[i][j] = 0;
      }
    }
  }

  hasMoves() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const v = this.grid[i][j];
        if (!v) return true;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = i + dx, ny = j + dy;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
              if (this.grid[nx][ny] === v) return true;
            }
          }
        }
      }
    }
    return false;
  }

  showGameOver() {
    const overlay = document.createElement('div');
    overlay.className = 'game-state-overlay';
    overlay.innerHTML = `
      <div class="game-state-message">
        <h2>Game Over!</h2>
        <button class="new-game-btn">Try Again</button>
      </div>
    `;
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
