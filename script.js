const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const menu = document.getElementById('menu');
const gameOverMessage = document.getElementById('gameOverMessage');
const scoreDisplay = document.getElementById('score');
const lifeDisplay = document.getElementById('life');

const box = 20;
let snake = [];
snake[0] = { x: 10 * box, y: 10 * box };
let direction = "RIGHT";
let food = {
    x: Math.floor(Math.random() * 29 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
};
let score = 0;
let life = 3;
let gameStarted = false;
let game;
let gamePaused = false;

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', directionControl);
restartButton.addEventListener('click', restartGame);

function startGame() {
    menu.style.display = 'none';
    gameStarted = true;
    gameOverMessage.style.display = 'none';
    clearInterval(game);
    game = setInterval(draw, 100);
}

function directionControl(event) {
    if (!gamePaused) {
        if (event.keyCode == 37 && direction != "RIGHT") {
            direction = "LEFT";
        } else if (event.keyCode == 38 && direction != "DOWN") {
            direction = "UP";
        } else if (event.keyCode == 39 && direction != "LEFT") {
            direction = "RIGHT";
        } else if (event.keyCode == 40 && direction != "UP") {
            direction = "DOWN";
        }
    }
}

function draw() {
    if (gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw red border
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "red";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction == "LEFT") snakeX -= box;
    if (direction == "UP") snakeY -= box;
    if (direction == "RIGHT") snakeX += box;
    if (direction == "DOWN") snakeY += box;

    if (snakeX == food.x && snakeY == food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * 29 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        life--;
        if (life > 0) {
            resetSnake();
            gamePaused = true;
            setTimeout(() => {
                gamePaused = false;
                drawInitialGame();
            }, 1000);
        } else {
            clearInterval(game);
            gameOverMessage.style.display = 'block';
            restartButton.style.display = 'block';
        }
    } else {
        snake.unshift(newHead);
    }

    scoreDisplay.innerText = `Score: ${score}`;
    lifeDisplay.innerText = `Lives: ${life}`;
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

function resetSnake() {
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box };
    direction = "RIGHT";
}

function restartGame() {
    score = 0;
    life = 3;
    gameStarted = false;
    gamePaused = false;
    resetSnake();
    scoreDisplay.innerText = `Score: ${score}`;
    lifeDisplay.innerText = `Lives: ${life}`;
    gameOverMessage.style.display = 'none';
    restartButton.style.display = 'none';
    clearInterval(game);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    menu.style.display = 'block';
    drawInitialGame();
}

function drawInitialGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw red border
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "red";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
}

// Initial game draw to show the snake and food before game starts
drawInitialGame();
