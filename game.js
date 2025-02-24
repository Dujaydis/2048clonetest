class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameBoard = document.querySelector('.game-board');
        this.previousStates = [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.moveInProgress = false;
        
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Initialize empty grid
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScore();
        
        // Clear game board
        this.gameBoard.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'tile';
            this.gameBoard.appendChild(cell);
        }
        
        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        this.updateGrid();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            
            // Add animation class to new tile
            const tileIndex = x * this.size + y;
            const tile = this.gameBoard.children[tileIndex];
            tile.classList.add('tile-new');
            setTimeout(() => tile.classList.remove('tile-new'), 200);
        }
    }

    updateGrid() {
        const tiles = this.gameBoard.children;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                const tile = tiles[i * this.size + j];
                const currentValue = tile.dataset.value;
                
                if (currentValue !== value.toString()) {
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
            localStorage.setItem('bestScore', this.bestScore);
            document.getElementById('best-score').textContent = this.bestScore;
        }
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.init());
        document.getElementById('undo').addEventListener('click', () => this.undo());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Touch events
        let touchStartX, touchStartY;
        
        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        this.gameBoard.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            const minSwipeDistance = 50;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.handleInput({ key: 'ArrowRight' });
                    } else {
                        this.handleInput({ key: 'ArrowLeft' });
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.handleInput({ key: 'ArrowDown' });
                    } else {
                        this.handleInput({ key: 'ArrowUp' });
                    }
                }
            }

            touchStartX = null;
            touchStartY = null;
            e.preventDefault();
        }, { passive: false });

        // Add dark mode toggle button listener
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', this.isDarkMode);
        });
    }

    handleInput(e) {
        if (this.moveInProgress) return;
        this.moveInProgress = true;

        // Save current state for undo
        this.previousStates.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        });

        let moved = false;
        switch (e.key) {
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.updateScore();
            this.checkGameState();
        } else {
            this.previousStates.pop(); // Remove saved state if no move was made
        }

        setTimeout(() => {
            this.moveInProgress = false;
        }, 100);
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i];
            const newRow = this.mergeTiles(row);
            if (newRow.join(',') !== row.join(',')) {
                this.grid[i] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].slice().reverse();
            const newRow = this.mergeTiles(row);
            if (newRow.join(',') !== row.join(',')) {
                this.grid[i] = newRow.reverse();
                moved = true;
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = this.grid.map(row => row[j]);
            const newColumn = this.mergeTiles(column);
            if (newColumn.join(',') !== column.join(',')) {
                for (let i = 0; i < this.size; i++) {
                    this.grid[i][j] = newColumn[i];
                }
                moved = true;
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = this.grid.map(row => row[j]).reverse();
            const newColumn = this.mergeTiles(column);
            if (newColumn.join(',') !== column.join(',')) {
                const reversedColumn = newColumn.reverse();
                for (let i = 0; i < this.size; i++) {
                    this.grid[i][j] = reversedColumn[i];
                }
                moved = true;
            }
        }
        return moved;
    }

    mergeTiles(line) {
        let tiles = line.filter(tile => tile !== 0);
        let merged = Array(tiles.length).fill(false);
        
        for (let i = 0; i < tiles.length - 1; i++) {
            if (!merged[i] && tiles[i] === tiles[i + 1]) {
                tiles[i] *= 2;
                this.score += tiles[i];
                tiles.splice(i + 1, 1);
                merged[i] = true;
                
                // Add merge animation class
                const tileElement = this.gameBoard.children[i];
                tileElement.classList.add('tile-merged');
                setTimeout(() => tileElement.classList.remove('tile-merged'), 200);
            }
        }
        
        while (tiles.length < this.size) {
            tiles.push(0);
        }
        
        return tiles;
    }

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                // Check right neighbor
                if (j < this.size - 1 && current === this.grid[i][j + 1]) return false;
                // Check bottom neighbor
                if (i < this.size - 1 && current === this.grid[i + 1][j]) return false;
            }
        }

        return true;
    }

    undo() {
        if (this.previousStates.length > 0) {
            const previousState = this.previousStates.pop();
            this.grid = previousState.grid;
            this.score = previousState.score;
            this.updateGrid();
            this.updateScore();
        }
    }

    checkGameState() {
        // Check for 2048 tile (win condition)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    this.showGameState('win');
                    return;
                }
            }
        }

        // Check for game over
        if (this.isGameOver()) {
            this.showGameState('over');
        }
    }

    showGameState(state) {
        const overlay = document.createElement('div');
        overlay.className = 'game-state-overlay';
        overlay.innerHTML = `
            <div class="game-state-message">
                <h2>${state === 'win' ? 'You Win!' : 'Game Over!'}</h2>
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

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
}); 