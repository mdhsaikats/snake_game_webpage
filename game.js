class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.box = 20;
        this.gameSpeed = 100;
        this.gameInterval = null;
        this.animationId = null;
        
        // Game state
        this.snake = [{ x: 10 * this.box, y: 10 * this.box }];
        this.direction = "RIGHT";
        this.nextDirection = "RIGHT";
        this.food = this.generateFood();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = this.getHighScore();
        this.isPaused = false;
        this.isGameOver = false;
        
        // Visual effects
        this.particles = [];
        this.foodGlow = 0;
        this.snakeTrail = [];
        
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameSpeed = parseInt(e.target.dataset.speed);
            });
        });
        
        // Button events
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showMenu());
        document.getElementById('pauseMenuButton').addEventListener('click', () => this.showMenu());
    }
    
    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        
        // Pause toggle
        if (key === ' ' || key === 'escape') {
            event.preventDefault();
            if (!this.isGameOver) {
                this.togglePause();
            }
            return;
        }
        
        if (this.isPaused || this.isGameOver) return;
        
        // Movement controls
        const movements = {
            'arrowleft': 'LEFT',
            'a': 'LEFT',
            'arrowup': 'UP',
            'w': 'UP',
            'arrowright': 'RIGHT',
            'd': 'RIGHT',
            'arrowdown': 'DOWN',
            's': 'DOWN'
        };
        
        const newDirection = movements[key];
        if (newDirection && this.isValidDirection(newDirection)) {
            this.nextDirection = newDirection;
        }
    }
    
    isValidDirection(newDirection) {
        const opposites = {
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT',
            'UP': 'DOWN',
            'DOWN': 'UP'
        };
        return opposites[this.direction] !== newDirection;
    }
    
    startGame() {
        this.hideAllScreens();
        document.getElementById('gameArea').style.display = 'flex';
        
        this.resetGame();
        this.gameLoop();
    }
    
    resetGame() {
        this.snake = [{ x: 10 * this.box, y: 10 * this.box }];
        this.direction = "RIGHT";
        this.nextDirection = "RIGHT";
        this.food = this.generateFood();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.particles = [];
        this.snakeTrail = [];
        this.updateDisplay();
    }
    
    gameLoop() {
        if (this.isGameOver) return;
        
        if (!this.isPaused) {
            this.update();
            this.render();
        }
        
        setTimeout(() => {
            this.gameLoop();
        }, this.gameSpeed);
    }
    
    update() {
        this.direction = this.nextDirection;
        this.moveSnake();
        this.checkCollisions();
        this.updateLevel();
        this.updateParticles();
        this.updateDisplay();
    }
    
    moveSnake() {
        const head = { ...this.snake[0] };
        
        // Add current head to trail
        this.snakeTrail.push({ ...head, alpha: 1 });
        if (this.snakeTrail.length > 10) {
            this.snakeTrail.shift();
        }
        
        // Update trail alpha
        this.snakeTrail.forEach((segment, index) => {
            segment.alpha = index / this.snakeTrail.length * 0.3;
        });
        
        // Move head
        switch (this.direction) {
            case 'LEFT': head.x -= this.box; break;
            case 'UP': head.y -= this.box; break;
            case 'RIGHT': head.x += this.box; break;
            case 'DOWN': head.y += this.box; break;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            this.snake.pop();
        }
    }
    
    eatFood() {
        this.score += this.level * 10;
        this.createFoodParticles();
        this.food = this.generateFood();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }
    
    checkCollisions() {
        const head = this.snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.handleCollision();
            return;
        }
        
        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.handleCollision();
                return;
            }
        }
    }
    
    handleCollision() {
        this.lives--;
        this.createExplosionParticles();
        
        if (this.lives > 0) {
            // Reset snake position but keep score
            this.snake = [{ x: 10 * this.box, y: 10 * this.box }];
            this.direction = "RIGHT";
            this.nextDirection = "RIGHT";
            this.isPaused = true;
            
            setTimeout(() => {
                this.isPaused = false;
            }, 1500);
        } else {
            this.gameOver();
        }
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // Increase speed slightly
            this.gameSpeed = Math.max(50, this.gameSpeed - 5);
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.box)) * this.box,
                y: Math.floor(Math.random() * (this.canvas.height / this.box)) * this.box
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw trail
        this.drawTrail();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
        
        // Draw particles
        this.drawParticles();
        
        // Draw border
        this.drawBorder();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.box) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.box) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawTrail() {
        this.snakeTrail.forEach(segment => {
            this.ctx.fillStyle = `rgba(0, 255, 136, ${segment.alpha})`;
            this.ctx.fillRect(segment.x, segment.y, this.box, this.box);
        });
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head with glow effect
                this.ctx.shadowColor = '#00ff88';
                this.ctx.shadowBlur = 20;
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fillRect(segment.x, segment.y, this.box, this.box);
                
                // Eyes
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#000';
                const eyeSize = 4;
                const eyeOffset = 6;
                
                if (this.direction === 'RIGHT') {
                    this.ctx.fillRect(segment.x + eyeOffset + 6, segment.y + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x + eyeOffset + 6, segment.y + 12, eyeSize, eyeSize);
                } else if (this.direction === 'LEFT') {
                    this.ctx.fillRect(segment.x + 4, segment.y + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x + 4, segment.y + 12, eyeSize, eyeSize);
                } else if (this.direction === 'UP') {
                    this.ctx.fillRect(segment.x + 4, segment.y + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x + 12, segment.y + 4, eyeSize, eyeSize);
                } else if (this.direction === 'DOWN') {
                    this.ctx.fillRect(segment.x + 4, segment.y + 12, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x + 12, segment.y + 12, eyeSize, eyeSize);
                }
            } else {
                // Body with gradient
                const gradient = this.ctx.createLinearGradient(
                    segment.x, segment.y, segment.x + this.box, segment.y + this.box
                );
                gradient.addColorStop(0, '#00ff88');
                gradient.addColorStop(1, '#00cc66');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(segment.x + 1, segment.y + 1, this.box - 2, this.box - 2);
            }
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    drawFood() {
        // Animated glow effect
        this.foodGlow += 0.1;
        const glowIntensity = Math.sin(this.foodGlow) * 10 + 15;
        
        this.ctx.shadowColor = '#ff4757';
        this.ctx.shadowBlur = glowIntensity;
        
        // Food with gradient
        const gradient = this.ctx.createRadialGradient(
            this.food.x + this.box/2, this.food.y + this.box/2, 0,
            this.food.x + this.box/2, this.food.y + this.box/2, this.box/2
        );
        gradient.addColorStop(0, '#ff6b7a');
        gradient.addColorStop(1, '#ff4757');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.food.x, this.food.y, this.box, this.box);
        
        this.ctx.shadowBlur = 0;
    }
    
    drawBorder() {
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    createFoodParticles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.food.x + this.box/2,
                y: this.food.y + this.box/2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: '#ff4757',
                size: Math.random() * 4 + 2
            });
        }
    }
    
    createExplosionParticles() {
        const head = this.snake[0];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: head.x + this.box/2,
                y: head.y + this.box/2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 40,
                maxLife: 40,
                color: '#ff4757',
                size: Math.random() * 6 + 3
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, 
                            particle.size, particle.size);
        });
    }
    
    togglePause() {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showPauseScreen();
        } else {
            this.hidePauseScreen();
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        
        // Check for new high score
        if (this.score === this.highScore && this.score > 0) {
            document.getElementById('newHighScoreIndicator').style.display = 'block';
            document.getElementById('gameOverTitle').textContent = '🏆 NEW HIGH SCORE! 🏆';
        } else {
            document.getElementById('newHighScoreIndicator').style.display = 'none';
            document.getElementById('gameOverTitle').textContent = '🎮 GAME OVER';
        }
        
        this.showGameOverScreen();
    }
    
    restartGame() {
        this.hideAllScreens();
        this.startGame();
    }
    
    showMenu() {
        this.isGameOver = true;
        this.hideAllScreens();
        document.getElementById('menu').style.display = 'block';
    }
    
    hideAllScreens() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
    }
    
    showGameOverScreen() {
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    showPauseScreen() {
        document.getElementById('pauseScreen').style.display = 'block';
    }
    
    hidePauseScreen() {
        document.getElementById('pauseScreen').style.display = 'none';
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('life').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore') || '0');
    }
    
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
}