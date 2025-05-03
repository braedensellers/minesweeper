const game = document.getElementById('game');
const width = 10;
const height = 10;
const mineCount = 10;

let cells = [];
let flagCount = 0;

let seconds = 0;
let timerInterval = null;
let gameStarted = false;

function startGame() {
    stopTimer();
    document.getElementById('time-elapsed').textContent = '0';

    flagCount = 0;
    document.getElementById('flag-count').textContent = flagCount;

    game.innerHTML = '';

    cells = [];

    createBoard(width, height, mineCount);
}

function createBoard() {
    game.style.gridTemplateColumns = `repeat(${width}, 40px)`;
    game.style.gridTemplateRows = `repeat(${height}, 40px)`;

    for (let i = 0; i < width * height; i++) {
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
        mineIndices.add(Math.floor(Math.random() * width * height));
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
    const x = index % width;
    const y = Math.floor(index / width);

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                neighbors.push(ny * width + nx);
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

function revealAll() {
    cells.forEach(cell => {
        if (cell.dataset.mine === 'true') {
            cell.textContent = '💣';
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
