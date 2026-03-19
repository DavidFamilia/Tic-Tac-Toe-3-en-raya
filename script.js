const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');
const difficultySelect = document.getElementById('difficulty');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let gameActive = true;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function initializeGame() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    resetButton.addEventListener('click', restartGame);
    statusText.textContent = `Tu turno (X)`;
}

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    if (board[cellIndex] !== "" || !gameActive) {
        return;
    }

    const difficulty = difficultySelect.value;
    if (difficulty !== "pvp" && currentPlayer === "O") {
        return;
    }

    updateCell(this, cellIndex);
    
    if (!checkWinner()) {
        changePlayer();
    }
}

function changePlayer() {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    const difficulty = difficultySelect.value;

    if (difficulty === "pvp") {
        statusText.textContent = `Turno de ${currentPlayer}`;
    } else {
        if (currentPlayer === "O") {
            statusText.textContent = `Bot pensando...`;
            setTimeout(botMove, 600);
        } else {
            statusText.textContent = `Tu turno (X)`;
        }
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.style.color = (currentPlayer === "X") ? "#f5f5f7" : "#0095ff";
}

function checkWinner() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = currentPlayer === "X" ? "¡Ganaste! 🎉" : "El Bot ganó 🤖";
        gameActive = false;
        return true;
    }

    if (!board.includes("")) {
        statusText.textContent = "Empate 🤝";
        gameActive = false;
        return true;
    }
    return false;
}

// --- LÓGICA DEL BOT ---

function botMove() {
    if (!gameActive) return;

    let move;
    const difficulty = difficultySelect.value;

    if (difficulty === "easy") {
        move = getRandomMove();
    } else if (difficulty === "medium") {
        move = getMediumMove();
    } else {
        move = getBestMove(); // Minimax
    }

    const cell = document.querySelector(`.cell[data-index="${move}"]`);
    updateCell(cell, move);

    if (!checkWinner()) {
        currentPlayer = "X";
        statusText.textContent = `Tu turno (X)`;
    }
}

function getRandomMove() {
    let availableMoves = board.map((val, index) => val === "" ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove() {
    // 1. Intentar ganar
    let move = findWinningMove("O");
    if (move !== null) return move;

    // 2. Bloquear al jugador
    move = findWinningMove("X");
    if (move !== null) return move;

    // 3. Si no, azar
    return getRandomMove();
}

function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const values = [board[a], board[b], board[c]];
        if (values.filter(v => v === player).length === 2 && values.filter(v => v === "").length === 1) {
            return winningConditions[i][values.indexOf("")];
        }
    }
    return null;
}

// Algoritmo Minimax para dificultad Imbatible
function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    // Resultados de puntuación
    if (checkWinnerSimple("O")) return 10 - depth;
    if (checkWinnerSimple("X")) return depth - 10;
    if (!board.includes("")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerSimple(player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    
    const difficulty = difficultySelect.value;
    statusText.textContent = (difficulty === "pvp") ? "Turno de X" : "Tu turno (X)";
    
    cells.forEach(cell => {
        cell.textContent = "";
    });
}

initializeGame();