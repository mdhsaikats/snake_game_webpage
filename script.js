// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // Prevent default behavior for arrow keys and space
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    // Add touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    // Swipe left
                    game.nextDirection = game.isValidDirection('LEFT') ? 'LEFT' : game.nextDirection;
                } else {
                    // Swipe right
                    game.nextDirection = game.isValidDirection('RIGHT') ? 'RIGHT' : game.nextDirection;
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    // Swipe up
                    game.nextDirection = game.isValidDirection('UP') ? 'UP' : game.nextDirection;
                } else {
                    // Swipe down
                    game.nextDirection = game.isValidDirection('DOWN') ? 'DOWN' : game.nextDirection;
                }
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
    });
    
    // Add visibility change handler to pause game when tab is not active
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && !game.isPaused && !game.isGameOver) {
            game.togglePause();
        }
    });
    
    // Add resize handler for responsive canvas
    window.addEventListener('resize', () => {
        // Adjust canvas size for mobile if needed
        if (window.innerWidth < 900) {
            const canvas = document.getElementById('gameCanvas');
            const container = canvas.parentElement;
            const maxWidth = Math.min(window.innerWidth - 40, 800);
            const maxHeight = Math.min(window.innerHeight - 200, 600);
            
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (maxWidth * 0.75) + 'px';
        }
    });
});