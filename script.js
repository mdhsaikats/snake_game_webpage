const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const menu = document.getElementById('menu');
const gameOverMessage = document.getElementById('gameOverMessage');
const scoreDisplay = document.getElementById('score');
const lifeDisplay = document.getElementById('life');

const box = 20;
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = "RIGHT";
let food = generateFood();
let score = 0;
let life = 3;
let gameInterval;
let gamePaused = false;

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', directionControl);
restartButton.addEventListener('click', restartGame);

function startGame() {
    menu.style.display = 'none';
    gameOverMessage.style.display = 'none';
    restartButton.style.display = 'none';
    score = 0;
    life = 3;
    snake = [{ x: 10 * box, y: 10 * box }];
    direction = "RIGHT";
    food = generateFood();
    updateScoreAndLife();
    gameInterval = setInterval(draw, 100);
}

function directionControl(event) {
    if (event.keyCode === 37 && direction !== "RIGHT") direction = "LEFT";
    if (event.keyCode === 38 && direction !== "DOWN") direction = "UP";
    if (event.keyCode === 39 && direction !== "LEFT") direction = "RIGHT";
    if (event.keyCode === 40 && direction !== "UP") direction = "DOWN";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Update snake and food
    moveSnake();
    drawSnake();
    drawFood();

    // Collision detection
    if (checkCollision()) {
        life--;
        if (life > 0) {
            resetSnake();
            setTimeout(() => gamePaused = false, 1000);
        } else {
            gameOver();
        }
    }

    // Update score and life display
    updateScoreAndLife();
}

function moveSnake() {
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = generateFood();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "green" : "white";
        ctx.fillRect(segment.x, segment.y, box, box);
        ctx.strokeStyle = "red";
        ctx.strokeRect(segment.x, segment.y, box, box);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
}

function checkCollision() {
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snakeX === snake[i].x && snakeY === snake[i].y) {
            return true;
        }
    }

    return false;
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * 29 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box
    };
}

function resetSnake() {
    snake = [{ x: 10 * box, y: 10 * box }];
    direction = "RIGHT";
}

function updateScoreAndLife() {
    scoreDisplay.innerText = `Score: ${score}`;
    lifeDisplay.innerText = `Lives: ${life}`;
}

function gameOver() {
    clearInterval(gameInterval);
    gameOverMessage.style.display = 'block';
    restartButton.style.display = 'block';
}

function restartGame() {
    gameOverMessage.style.display = 'none';
    restartButton.style.display = 'none';
    startGame();
}
