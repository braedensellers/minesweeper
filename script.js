const game = document.getElementById('game');
const difficultySelect = document.getElementById('difficulty-select');

const DIFFICULTY_SETTINGS = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 32, mines: 99 }
};

let currentDifficulty = 'medium';
let cells = [];
let flagCount = 0;
let seconds = 0;
let timerInterval = null;
let gameStarted = false;

let rows, cols, mineCount;

difficultySelect.addEventListener('change', () => {
    currentDifficulty = difficultySelect.value;
    startGame();
});

function startGame() {
    stopTimer();
    seconds = 0;
    gameStarted = false;

    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    rows = settings.rows;
    cols = settings.cols;
    mineCount = settings.mines;

    document.getElementById('time-elapsed').textContent = '0';
    flagCount = 0;
    document.getElementById('flag-count').textContent = mineCount;

    game.innerHTML = '';
    cells = [];

    createBoard();
}

function createBoard() {
    game.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    game.style.gridTemplateRows = `repeat(${rows}, 40px)`;

    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        game.appendChild(cell);
        cells.push(cell);

        cell.addEventListener('click', () => revealCell(i));
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            toggleFlag(i);
        });
    }

    let mineIndices = new Set();
    while (mineIndices.size < mineCount) {
        mineIndices.add(Math.floor(Math.random() * rows * cols));
    }

    cells.forEach((cell, i) => {
        if (mineIndices.has(i)) {
            cell.dataset.mine = 'true';
        } else {
            const adjacent = getNeighbors(i).filter(n => mineIndices.has(n));
            cell.dataset.adjacent = adjacent.length;
        }
    });
}

function clearBoard() {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    const cell = cells[index];
    if (cell.classList.contains('revealed')) return;

    cell.classList.add('revealed');

    if (cell.dataset.mine === 'true') {
        stopTimer();
        cell.textContent = '💣';
        alert('Game Over!');
        revealAll();
    } else {
        const count = parseInt(cell.dataset.adjacent);
        if (count > 0) {
            cell.textContent = count;
            cell.setAttribute('data-number', count)
        } else {
            getNeighbors(index).forEach(revealCell);
        }

        checkWin();
    }
}

function getNeighbors(index) {
    const neighbors = [];
    const x = index % cols;
    const y = Math.floor(index / cols);

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                neighbors.push(ny * cols + nx);
            }
        }
    }

    return neighbors;
}

function revealCell(index) {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    const cell = cells[index];
    if (cell.classList.contains('revealed')) return;

    cell.classList.add('revealed');

    if (cell.dataset.mine === 'true') {
        stopTimer();
        cell.textContent = '💥';
        alert('Game Over!');
        revealAll(index);
    } else {
        const count = parseInt(cell.dataset.adjacent);
        if (count > 0) {
            cell.textContent = count;
            cell.setAttribute('data-number', count)
        } else {
            getNeighbors(index).forEach(revealCell);
        }

        checkWin();
    }
}

function revealAll(explodedIndex = null) {
    cells.forEach((cell, i) => {
        if (cell.dataset.mine === 'true') {
            if (i === explodedIndex) {
                cell.textContent = '💥'; // Exploded bomb
            } else {
                cell.textContent = '💣'; // Normal bomb
            }
        }
        cell.classList.add('revealed');
    });
}

function toggleFlag(index) {
    const cell = cells[index];
    if (cell.classList.contains('revealed')) return;
  
    if (cell.textContent === '🚩') {
        const flag = cell.querySelector('.flag');
        if (flag) {
            flag.classList.add('fade-out');
            flag.addEventListener('animationend', () => flag.remove());
        }
        flagCount--;
    } else {
        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.textContent = '🚩';
        cell.appendChild(flag);
        flagCount++;
    }

    document.getElementById('flag-count').textContent = mineCount - flagCount;
}

function checkWin() {
    const unrevealed = cells.filter(cell =>
        !cell.classList.contains('revealed') && cell.dataset.mine !== 'true'
    );
    if (unrevealed.length === 0) {
        stopTimer();
        alert("Victory!");
        revealAll();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('time-elapsed').textContent = seconds;
    }, 1000);
}
  
function stopTimer() {
    clearInterval(timerInterval);
}

startGame();
